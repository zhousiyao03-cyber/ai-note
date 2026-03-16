const ACCEPTED_FORMATS = [
  'audio/wav',
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/flac',
  'audio/webm',
  'audio/x-m4a',
]

const ACCEPTED_EXTENSIONS = ['.wav', '.mp3', '.m4a', '.ogg', '.flac', '.webm']

export function isValidAudioFile(file: File) {
  if (ACCEPTED_FORMATS.includes(file.type)) return true
  return ACCEPTED_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension))
}
