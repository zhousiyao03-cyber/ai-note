import { useEffect, useRef, useCallback, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { useAppStore } from '@/stores/app-store'

interface UseAudioPlayerOptions {
  url: string
}

export function useAudioPlayer({ url }: UseAudioPlayerOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const playbackRate = useAppStore((s) => s.playbackRate)
  const volume = useAppStore((s) => s.volume)

  useEffect(() => {
    if (!containerRef.current || !url) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'hsl(var(--muted-foreground) / 0.3)',
      progressColor: 'hsl(var(--primary))',
      cursorColor: 'hsl(var(--primary))',
      cursorWidth: 1,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 48,
      normalize: true,
    })

    ws.load(url)

    ws.on('ready', () => {
      setDuration(ws.getDuration())
      setIsReady(true)
      ws.setVolume(volume)
      ws.setPlaybackRate(playbackRate)
    })

    ws.on('timeupdate', (time) => {
      setCurrentTime(time)
    })

    ws.on('play', () => setIsPlaying(true))
    ws.on('pause', () => setIsPlaying(false))
    ws.on('finish', () => setIsPlaying(false))

    wavesurferRef.current = ws

    return () => {
      ws.destroy()
      wavesurferRef.current = null
      setIsReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.setPlaybackRate(playbackRate)
    }
  }, [playbackRate, isReady])

  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.setVolume(volume)
    }
  }, [volume, isReady])

  const togglePlay = useCallback(() => {
    wavesurferRef.current?.playPause()
  }, [])

  const seek = useCallback((time: number) => {
    const ws = wavesurferRef.current
    if (ws && duration > 0) {
      ws.seekTo(time / duration)
    }
  }, [duration])

  const skip = useCallback((seconds: number) => {
    const ws = wavesurferRef.current
    if (ws) {
      ws.skip(seconds)
    }
  }, [])

  return {
    containerRef,
    isPlaying,
    isReady,
    currentTime,
    duration,
    togglePlay,
    seek,
    skip,
  }
}
