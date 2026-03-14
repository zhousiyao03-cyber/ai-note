# Backend Implementation Plan: Vercel Free + Supabase Free + Inngest Free

## Context

ai-note 前端完整但后端只有 stub。需要用全免费方案实现完整后端：

- **Supabase Free**: Auth + PostgreSQL (500MB) + Storage (1GB) + RLS
- **Vercel Free**: Next.js API Routes (10s timeout)
- **Inngest Free**: 后台转录任务 (25K steps/月)

现有 `server/` 目录将被删除，所有 API 通过 Next.js Route Handlers 实现。

## Architecture

```
Browser → Next.js API Routes (Vercel) → Supabase (DB + Auth + Storage)
                                      → Inngest (background transcription)
```

### Upload Flow

```
Browser                    Next.js API              Supabase Storage
  |                           |                          |
  |-- POST /upload-init ----->|                          |
  |                           |-- create file row ------>|
  |                           |-- createSignedUploadUrl->|
  |<-- { file_id, url } ------|                          |
  |                           |                          |
  |-- PUT (direct upload) -------------------------------->|
  |                           |                          |
  |-- POST /upload-complete ->|                          |
  |                           |-- verify object exists ->|
  |                           |-- send Inngest event     |
  |<-- { file } --------------|                          |
```

音频文件直传 Supabase Storage，不经过 Vercel 函数，节省带宽和执行时间。

## Schema Adaptation

基于现有 `docs/schema.sql` 做以下调整：

### 移除的表

- `users` → 用 Supabase `auth.users`
- `refresh_tokens` → Supabase Auth 内部管理
- `password_reset_tokens` → Supabase Auth 内部管理

### 新增 `profiles` 表

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar_url text,
  plan plan_t not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### FK 引用变更

所有 `user_id uuid references users(id)` → `user_id uuid references auth.users(id)`

### Auto-create Profile Trigger

```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

### RLS Policies

每个表启用 RLS，策略模式统一：

```sql
-- profiles
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- files
alter table files enable row level security;
create policy "Users can view own files" on files for select using (auth.uid() = user_id);
create policy "Users can insert own files" on files for insert with check (auth.uid() = user_id);
create policy "Users can update own files" on files for update using (auth.uid() = user_id);
create policy "Users can delete own files" on files for delete using (auth.uid() = user_id);

-- transcriptions (通过 file 关联)
alter table transcriptions enable row level security;
create policy "Users can view own transcriptions" on transcriptions for select
  using (exists (select 1 from files where files.id = file_id and files.user_id = auth.uid()));

-- 其他表同理...
```

### Supabase Storage Bucket

创建 `audio-files` 私有 bucket，策略：
- 认证用户可上传到 `{user_id}/` 路径前缀
- 认证用户可读取自己路径下的文件

---

## Phase 1: Foundation (Auth + DB + File/Tag CRUD)

### 目标

用户可以注册、登录、管理文件（CRUD + 回收站）和标签。

### 新增文件

#### Supabase 基础设施

| File | Purpose |
|------|---------|
| `app/src/lib/supabase/client.ts` | Browser Supabase client (`createBrowserClient` from `@supabase/ssr`) |
| `app/src/lib/supabase/server.ts` | Server Supabase client (`createServerClient` with cookies) |
| `app/src/lib/supabase/admin.ts` | Service-role client (bypass RLS, admin ops) |
| `app/src/lib/supabase/middleware.ts` | `updateSession` helper for cookie refresh |
| `app/src/middleware.ts` | Next.js middleware，调用 `updateSession` |

#### API 工具

| File | Purpose |
|------|---------|
| `app/src/lib/api-helpers.ts` | `envelope()`, `errorResponse()`, `requireAuth()`, snake/camel DTO 转换 |
| `app/src/lib/inngest.ts` | Inngest client: `new Inngest({ id: "ai-note" })` |
| `app/src/app/api/v1/inngest/route.ts` | Inngest serve endpoint |

#### Auth API Routes

| File | Method | Purpose |
|------|--------|---------|
| `app/src/app/api/v1/auth/register/route.ts` | POST | `supabase.auth.signUp()` + 返回 profile |
| `app/src/app/api/v1/auth/login/route.ts` | POST | `supabase.auth.signInWithPassword()` |
| `app/src/app/api/v1/auth/logout/route.ts` | POST | `supabase.auth.signOut()` |
| `app/src/app/api/v1/auth/forgot-password/route.ts` | POST | `supabase.auth.resetPasswordForEmail()` |
| `app/src/app/api/v1/auth/reset-password/route.ts` | POST | `supabase.auth.updateUser({ password })` |
| `app/src/app/api/v1/auth/change-password/route.ts` | POST | 验证旧密码 + 更新新密码 |

#### User API Routes

| File | Method | Purpose |
|------|--------|---------|
| `app/src/app/api/v1/me/route.ts` | GET, PATCH | 读取/更新 profile (name, avatar_url, email) |

#### File API Routes

| File | Method | Purpose |
|------|--------|---------|
| `app/src/app/api/v1/files/route.ts` | GET | 文件列表 (search, status, sort, cursor pagination, tag filter) |
| `app/src/app/api/v1/files/[fileId]/route.ts` | GET, PATCH, DELETE | 单文件读取/重命名/软删除 |
| `app/src/app/api/v1/files/[fileId]/restore/route.ts` | POST | 从回收站恢复 |
| `app/src/app/api/v1/files/[fileId]/permanent/route.ts` | DELETE | 硬删除 (含 Storage 文件) |
| `app/src/app/api/v1/trash/files/route.ts` | GET | 回收站文件列表 |

#### Tag API Routes

| File | Method | Purpose |
|------|--------|---------|
| `app/src/app/api/v1/tags/route.ts` | GET, POST | 标签列表 / 创建 |
| `app/src/app/api/v1/tags/[tagId]/route.ts` | DELETE | 删除标签 |
| `app/src/app/api/v1/files/[fileId]/tags/[tagId]/route.ts` | POST, DELETE | 标签绑定/解绑 |

### 修改文件

| File | Change |
|------|--------|
| `app/src/services/api.ts` | 所有 mock → `fetch('/api/v1/...')` 真实调用 |
| `app/src/lib/auth.ts` | localStorage token → Supabase session check |
| `app/src/hooks/use-auth.ts` | mock auth → Supabase auth calls |
| `app/src/components/providers.tsx` | 添加 SupabaseProvider |
| `app/src/components/route-guard.tsx` | localStorage check → Supabase session check |
| `app/src/types/index.ts` | 对齐字段名 (添加 progress, mimeType, errorMessage 等) |
| `app/package.json` | 添加 `@supabase/supabase-js`, `@supabase/ssr`, `inngest` |

### 删除文件

| Path | Reason |
|------|--------|
| `app/src/services/mock-data.ts` | 被真实数据库替代 |
| `server/` | 整个目录删除，被 Next.js API routes 替代 |

### DB Migration

| File | Purpose |
|------|---------|
| `supabase/migrations/001_initial_schema.sql` | 适配后的完整 schema + RLS + triggers |

---

## Phase 2: Storage + Upload + Transcription Worker

### 目标

用户可以上传音频文件到 Supabase Storage，并通过 Inngest 后台任务触发转录。

### 新增文件

| File | Method | Purpose |
|------|--------|---------|
| `app/src/app/api/v1/files/upload-init/route.ts` | POST | 创建 file 记录 + Supabase Storage presigned URL |
| `app/src/app/api/v1/files/upload-complete/route.ts` | POST | 验证上传 + 触发 auto-transcribe (Inngest event) |
| `app/src/app/api/v1/files/[fileId]/status/route.ts` | GET | 转录状态轮询 `{ status, progress, error_message }` |
| `app/src/app/api/v1/files/[fileId]/transcribe/route.ts` | POST | 手动触发转录 (检查 quota → send Inngest event) |
| `app/src/app/api/v1/files/[fileId]/transcription/route.ts` | GET, PATCH | 读取/保存转录内容 (含 speakers + segments) |
| `app/src/lib/inngest/functions/transcribe.ts` | — | Inngest 后台函数 (4 steps) |

### Inngest 转录函数 (4 steps)

```
Step 1: update-status     → files.status = 'transcribing'
Step 2: get-audio-url     → 获取 Storage signed URL
Step 3: call-stt-provider → 调用 OpenAI Whisper API
Step 4: store-transcript  → 写入 transcriptions + speakers + segments + usage_record
```

### 修改文件

| File | Change |
|------|--------|
| `app/src/services/api.ts` | 实现真实上传流程 (init → PUT → complete) + 转录相关调用 |
| `app/src/types/index.ts` | AudioFile 添加 progress, mimeType, language, errorMessage |
| `app/src/app/api/v1/inngest/route.ts` | 注册 transcribe function |
| `app/package.json` | 添加 `openai` |

---

## Phase 3: Ask AI + Preferences

### 目标

用户可以与转录内容聊天，并管理应用偏好设置。

### 新增文件

| File | Method | Purpose |
|------|--------|---------|
| `app/src/app/api/v1/me/preferences/route.ts` | GET, PATCH | 偏好设置 CRUD |
| `app/src/app/api/v1/files/[fileId]/ask-ai/messages/route.ts` | GET, POST, DELETE | AI 聊天 |

### Ask AI POST 流程

1. 验证文件归属
2. 检查 AI 问题 quota (`usage_records`)
3. 插入 user message
4. 加载 transcript summary + segments + 最近 10 条聊天
5. 调用 LLM (GPT-4o-mini, 通常 2-5s，在 Vercel 10s 超时内)
6. 插入 assistant message
7. 增加 `usage_record` (ask_ai_question)
8. 返回双方消息 + `remaining_questions`

### 修改文件

| File | Change |
|------|--------|
| `app/src/services/api.ts` | 添加 askAI, getAskAIMessages, clearAskAIMessages, preferences 调用 |
| `app/src/hooks/use-queries.ts` | 添加 useAskAIMessages, useClearAskAIMessages hooks |
| `app/src/stores/app-store.ts` | chat messages 数据源从 Zustand → API (Zustand 仅做 optimistic update) |

---

## Phase 4: Billing (Stripe)

### 目标

Stripe Checkout 升级计划 + 订阅管理 + 用量统计。

### 新增文件

| File | Method | Purpose |
|------|--------|---------|
| `app/src/app/api/v1/billing/plans/route.ts` | GET | 静态计划定义 (无需 auth) |
| `app/src/app/api/v1/billing/subscription/route.ts` | GET | 当前订阅状态 |
| `app/src/app/api/v1/billing/usage/route.ts` | GET | 当月用量统计 |
| `app/src/app/api/v1/billing/checkout-session/route.ts` | POST | 创建 Stripe Checkout Session |
| `app/src/app/api/v1/billing/customer-portal/route.ts` | POST | Stripe Customer Portal URL |
| `app/src/app/api/v1/billing/webhooks/stripe/route.ts` | POST | Stripe webhook (验签 + 更新订阅状态) |

### Stripe Webhook 注意事项

Next.js Route Handler 中需要用 `request.text()` 获取 raw body 再做签名验证：

```typescript
const body = await request.text()
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
```

### 修改文件

| File | Change |
|------|--------|
| `app/src/services/api.ts` | 添加 billing 相关调用 |
| `app/package.json` | 添加 `stripe` |

---

## Key Patterns

### Auth in Route Handlers

```typescript
export async function GET(request: NextRequest) {
  const { user, supabase } = await requireAuth(request)
  if (!user) return errorResponse('unauthorized', 'Not authenticated', 401)

  const { data, error } = await supabase.from('files').select('*').eq('user_id', user.id)
  if (error) return errorResponse('db_error', error.message, 500)

  return NextResponse.json(envelope(transformRows(data)))
}
```

### Response Envelope

```json
{ "data": {}, "meta": {}, "error": null }
{ "data": null, "meta": {}, "error": { "code": "...", "message": "..." } }
```

### DTO Transform

DB snake_case → frontend camelCase，在 Route Handler 中转换。
保持前端字段名尽量不变以减少 UI 改动：`duration_sec → duration`, `size_bytes → size`

### RLS + Application Auth

双重保护：RLS 做 safety net，应用层做显式 `user_id` 检查以提供更好的错误信息。

---

## Dependencies

```
Phase 1: @supabase/supabase-js, @supabase/ssr, inngest
Phase 2: openai (Whisper STT)
Phase 3: openai (reuse)
Phase 4: stripe
```

---

## Free Tier Limits & Risks

| 限制 | 额度 | 风险评估 |
|------|------|---------|
| Supabase DB | 500MB | 纯文本数据，足够数千用户 |
| Supabase Storage | 1GB | 音频文件大，需限制文件大小或前端压缩 |
| Supabase MAU | 50K | MVP 足够 |
| Vercel Function Timeout | 10s | Ask AI (GPT-4o-mini 2-5s) 可接受，转录用 Inngest 绕过 |
| Vercel Bandwidth | 100GB | 音频走 Supabase Storage，不占 Vercel 带宽 |
| Inngest Steps | 25K/月 | 每次转录 ~4 steps → ~6,250 次/月 |

---

## Verification

每个 Phase 完成后：

1. `pnpm build` — 确认无类型错误
2. 手动测试完整流程
3. Vercel preview deployment 验证生产环境
