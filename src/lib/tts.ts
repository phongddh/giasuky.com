/**
 * GĐ5-27 — TTS / voice cloning adapter.
 * Contract với provider ngoài (ElevenLabs / Azure TTS — triển khai ở nơi khác):
 *
 *   - Env: TTS_API_URL (endpoint provider), TTS_API_KEY (secret), TTS_VOICE_ID.
 *   - Synthesize: POST {TTS_API_URL}/synthesize {text, voiceId} → {audioUrl}
 *   - Clone:      POST {TTS_API_URL}/clone {audioUrl, displayName} → {voiceId}
 *   - BẮT BUỘC: mọi lời kể tổng hợp chỉ chạy khi có consent scope `voice_clone`
 *     (high-risk — kiểm tra ở route, không ở adapter).
 *   - Sandbox không có key: trả mock (audioUrl giả + mock:true) để UI/contract
 *     có thể chạy end-to-end; không bao giờ tự chọn giọng người khác.
 */
import type { Bindings } from './types'

export function ttsAvailable(env: Bindings): boolean {
  return Boolean(env.TTS_API_URL && env.TTS_API_KEY)
}

export type SynthesizeResult = {
  audioUrl: string | null
  voiceId?: string
  mock: boolean
  note?: string
}

export type CloneResult = {
  voiceId: string | null
  status: 'PROCESSING' | 'FAILED'
  mock: boolean
  note?: string
}

export async function synthesize(
  env: Bindings,
  text: string,
  voiceId?: string
): Promise<SynthesizeResult> {
  if (!ttsAvailable(env)) {
    return {
      audioUrl: null,
      voiceId,
      mock: true,
      note: 'TTS chưa cấu hình (thiếu TTS_API_URL / TTS_API_KEY). Sandbox trả mock.'
    }
  }
  const res = await fetch(`${env.TTS_API_URL}/synthesize`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${env.TTS_API_KEY}` },
    body: JSON.stringify({ text, voiceId: voiceId || env.TTS_VOICE_ID })
  })
  if (!res.ok) throw new Error(`TTS failed: ${res.status}`)
  const body = (await res.json()) as { audioUrl?: string; voiceId?: string }
  if (!body.audioUrl) throw new Error('TTS returned no audioUrl')
  return { audioUrl: body.audioUrl, voiceId: body.voiceId, mock: false }
}

export async function cloneVoice(
  env: Bindings,
  audioUrl: string,
  displayName: string
): Promise<CloneResult> {
  if (!ttsAvailable(env)) {
    return {
      voiceId: null,
      status: 'PROCESSING',
      mock: true,
      note: 'Voice clone chưa cấu hình — sandbox trả mock, không thực sự clone giọng.'
    }
  }
  const res = await fetch(`${env.TTS_API_URL}/clone`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${env.TTS_API_KEY}` },
    body: JSON.stringify({ audioUrl, displayName })
  })
  if (!res.ok) throw new Error(`Voice clone failed: ${res.status}`)
  const body = (await res.json()) as { voiceId?: string }
  if (!body.voiceId) throw new Error('Voice clone returned no voiceId')
  return { voiceId: body.voiceId, status: 'PROCESSING', mock: false }
}
