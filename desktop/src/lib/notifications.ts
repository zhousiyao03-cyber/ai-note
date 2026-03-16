import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification'

function isTauriEnvironment() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export async function notifyUploadCompleted(fileName: string) {
  if (!isTauriEnvironment()) return

  let permissionGranted = await isPermissionGranted()
  if (!permissionGranted) {
    const permission = await requestPermission()
    permissionGranted = permission === 'granted'
  }

  if (!permissionGranted) return

  sendNotification({
    title: 'Plaud Desktop',
    body: `${fileName} upload finished and is now queued for processing.`,
  })
}
