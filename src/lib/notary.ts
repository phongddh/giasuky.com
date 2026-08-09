/**
 * GĐ5-30 — Blockchain notary adapter.
 * Nguyên tắc 4.7.1: chỉ ký SHA-256 của bản ghi lên chain, KHÔNG bao giờ đưa
 * PII lên chain. Contract với chain thật (triển khai ở nơi khác):
 *
 *   - Env: BLOCKCHAIN_RPC_URL, BLOCKCHAIN_PRIVATE_KEY (secret), BLOCKCHAIN_CHAIN
 *   - Chain hỗ trợ: 'stellar' (Stellar tx, giá thấp) hoặc 'evm-l2' (ETH L2).
 *     Khi BLOCKCHAIN_CHAIN không đặt → 'mock-ledger' (không có chain thật).
 *   - Worker/contract ngoài repo: nhận payloadHash, tạo tx ghi hash vào ledger,
 *     trả txHash + explorer URL. Code path `anchorToChain` dưới đây là contract
 *     mẫu (gọi RPC qua fetch) — chưa thể chạy trong sandbox (cần key + endpoint).
 */
import type { Bindings } from './types'

export type NotaryAnchor = {
  txHash: string
  chain: string
  explorerUrl: string
}

export function explorerUrlOf(chain: string, txHash: string): string {
  switch (chain) {
    case 'stellar':
      return `https://stellar.expert/explorer/public/tx/${txHash}`
    case 'evm-l2':
      return `https://explorer.public.zkevm.test.net/tx/${txHash}`
    default:
      return `/consent/verify?tx=${txHash}`
  }
}

/** Fallback mặc định (sandbox): txHash = hash của hash — MINH BẠCH là mock. */
function mockAnchor(payloadHash: string): NotaryAnchor {
  const txHash = '0x' + payloadHash.slice(0, 64)
  return { txHash, chain: 'mock-ledger', explorerUrl: explorerUrlOf('mock-ledger', txHash) }
}

/** Contract mẫu cho chain thật: gửi payloadHash tới RPC endpoint. Chỉ chạy khi có key. */
async function anchorToChain(env: Bindings, payloadHash: string): Promise<NotaryAnchor> {
  const chain = env.BLOCKCHAIN_CHAIN || 'evm-l2'
  const res = await fetch(`${env.BLOCKCHAIN_RPC_URL}/anchor`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ payloadHash, chain, signer: env.BLOCKCHAIN_PRIVATE_KEY?.slice(0, 8) + '…' })
  })
  if (!res.ok) throw new Error(`Notary RPC failed: ${res.status}`)
  const body = (await res.json()) as { txHash?: string }
  if (!body.txHash) throw new Error('Notary RPC returned no txHash')
  return { txHash: body.txHash, chain, explorerUrl: explorerUrlOf(chain, body.txHash) }
}

export function anchorConsent(env: Bindings, payloadHash: string): Promise<NotaryAnchor> {
  if (env.BLOCKCHAIN_RPC_URL && env.BLOCKCHAIN_PRIVATE_KEY) {
    return anchorToChain(env, payloadHash)
  }
  return Promise.resolve(mockAnchor(payloadHash))
}
