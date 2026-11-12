import type { Tone } from '@/types'

export interface ToneStyle {
  bg: string
  text: string
  border: string
  dot: string
  solid: string
}

export const TONES: Record<Tone, ToneStyle> = {
  brand: { bg: '#dff7fb', text: '#06768d', border: '#b9eef7', dot: '#15c8e9', solid: '#15c8e9' },
  ok: { bg: '#e1f7ec', text: '#0c7a54', border: '#bfeed7', dot: '#10b981', solid: '#10b981' },
  warn: { bg: '#fff1d8', text: '#965f00', border: '#fde0a8', dot: '#f59e0b', solid: '#f59e0b' },
  bad: { bg: '#ffe6e6', text: '#b53838', border: '#fccaca', dot: '#ef4444', solid: '#ef4444' },
  info: { bg: '#e4eeff', text: '#3564ca', border: '#c6d9fb', dot: '#3b82f6', solid: '#3b82f6' },
  violet: { bg: '#ece9ff', text: '#6455d3', border: '#d6d0fb', dot: '#7c6cf0', solid: '#7c6cf0' },
  neutral: { bg: '#eef2f5', text: '#5d6b7a', border: '#e0e7ec', dot: '#8794a3', solid: '#8794a3' },
}
