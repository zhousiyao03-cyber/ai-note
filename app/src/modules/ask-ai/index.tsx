import { useState } from 'react'
import { useParams } from 'react-router'
import { Send, X, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'
import { useAskAI } from '@/hooks/use-queries'
import type { AskAIMessage } from '@/types'

const EMPTY_MESSAGES: AskAIMessage[] = []

export function AskAIPanel() {
  const { id: fileId } = useParams<{ id: string }>()
  const [input, setInput] = useState('')
  const sidebarOpen = useAppStore((s) => s.askAiPanelOpen)
  const toggleSidebar = useAppStore((s) => s.toggleAskAiPanel)
  const messages = useAppStore((s) => s.chatMessages[fileId ?? ''] ?? EMPTY_MESSAGES)
  const addMessage = useAppStore((s) => s.addMessage)
  const askAI = useAskAI()
  const { t } = useTranslation()

  if (!sidebarOpen || !fileId) return null

  const handleSend = async () => {
    const question = input.trim()
    if (!question) return

    const userMsg: AskAIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
    }
    addMessage(fileId, userMsg)
    setInput('')

    const reply = await askAI.mutateAsync({ fileId, question })
    addMessage(fileId, reply)
  }

  return (
    <>
      {/* Mobile: full-screen overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={toggleSidebar}
      />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l bg-background md:static md:z-auto md:w-80 md:max-w-none">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">{t('askAi.title')}</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('askAi.emptyMsg')}
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'ml-8 bg-primary text-primary-foreground'
                  : 'mr-8 bg-muted text-foreground'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {askAI.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t('askAi.thinking')}
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('askAi.placeholder')}
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              disabled={askAI.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || askAI.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </aside>
    </>
  )
}
