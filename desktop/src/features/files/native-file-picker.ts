import { open } from '@tauri-apps/plugin-dialog'
import { readFile } from '@tauri-apps/plugin-fs'

import { isTauriEnvironment } from '../../lib/platform'

const AUDIO_EXTENSIONS = ['wav', 'mp3', 'm4a', 'ogg', 'flac', 'webm']

function getFileName(path: string) {
  const normalized = path.replace(/\\/g, '/')
  const parts = normalized.split('/')
  return parts[parts.length - 1] || 'audio-file'
}

function inferMimeType(fileName: string) {
  const lower = fileName.toLowerCase()

  if (lower.endsWith('.wav')) return 'audio/wav'
  if (lower.endsWith('.mp3')) return 'audio/mpeg'
  if (lower.endsWith('.m4a')) return 'audio/x-m4a'
  if (lower.endsWith('.ogg')) return 'audio/ogg'
  if (lower.endsWith('.flac')) return 'audio/flac'
  if (lower.endsWith('.webm')) return 'audio/webm'
  return 'application/octet-stream'
}

export async function pickNativeAudioFiles() {
  if (!isTauriEnvironment()) return null

  const selected = await open({
    multiple: true,
    filters: [
      {
        name: 'Audio',
        extensions: AUDIO_EXTENSIONS,
      },
    ],
  })

  if (!selected) return []

  const paths = Array.isArray(selected) ? selected : [selected]

  return Promise.all(
    paths.map(async (path) => {
      const fileName = getFileName(path)
      const buffer = await readFile(path)
      return new File([buffer], fileName, {
        type: inferMimeType(fileName),
      })
    }),
  )
}
