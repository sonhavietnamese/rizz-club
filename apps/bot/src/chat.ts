import { chatRef } from '@/firebase'
import { sleep } from '@/lib/async'
import { displayName } from '@/traders'
import { wallets, type BotWallet } from '@/wallets'
import { get, limitToFirst, orderByKey, push, query, remove } from 'firebase/database'

export const CHAT_LIMIT = 50

export type ChatMessage = {
  address: `0x${string}`
  name: string
  avatar: string
  message: string
  t: number
  signature: `0x${string}`
}

const AVATARS = [
  'https://i.pinimg.com/1200x/6c/50/e8/6c50e8fc7cc13cfc7bc4abb312282f15.jpg',
  'https://i.pinimg.com/1200x/a5/65/6c/a5656c180fedac78f1f913abc7253015.jpg',
  'https://i.pinimg.com/736x/d8/bd/f8/d8bdf86d816411cc2501754d2e202afe.jpg',
] as const

const LINES = [
  'gm, we printing today?',
  'btc looking heavy into the open',
  'fading the first spike',
  'volume just died on the ask',
  'holding the down side for now',
  'who is still long here',
  'not me, already flipped',
  'wait for the next candle close',
  'this spread is criminal',
  'leaderboard is cooked already',
  'lock in, 30s left',
  'do not fade this wick',
  'ok now it is moving',
  'adding a bit more size',
  'send it',
  'gg if this holds the high',
  'size in on yes',
  'no looking cheap after that wick',
  'someone just lifted the ask',
  'I am out, too choppy',
  'this candle is disgusting',
  'fill was instant, love it',
  'need one more push',
  'watching the book, not the tape',
]

export type SimulateChatOptions = {
  count?: number
  intervalMs?: number
  dryRun?: boolean
  signal?: AbortSignal
}

function pick<T>(items: readonly T[]) {
  const item = items[Math.floor(Math.random() * items.length)]
  if (item === undefined) throw new Error('Cannot pick from an empty list')
  return item
}

export async function buildChatMessage(wallet: BotWallet, text = pick(LINES)): Promise<ChatMessage> {
  const t = Date.now()
  const signature = await wallet.account.signMessage({
    message: `${t}:${text}`,
  })

  return {
    address: wallet.address,
    name: displayName(wallet),
    avatar: AVATARS[wallet.index % AVATARS.length] ?? pick(AVATARS),
    message: text,
    t,
    signature,
  }
}

export async function trimChat(limit = CHAT_LIMIT) {
  const snapshot = await get(chatRef)
  const overflow = snapshot.size - limit
  if (overflow <= 0) return 0

  const oldest = await get(query(chatRef, orderByKey(), limitToFirst(overflow)))
  const removals: Promise<void>[] = []
  oldest.forEach((child) => {
    removals.push(remove(child.ref))
  })
  await Promise.all(removals)
  return overflow
}

export async function publishChat(message: ChatMessage) {
  const entry = await push(chatRef, message)
  const removed = await trimChat()
  return { key: entry.key, removed }
}

export async function simulateChat({
  count,
  intervalMs = 1_500,
  dryRun = false,
  signal,
}: SimulateChatOptions = {}) {
  const roster = wallets()
  if (roster.length === 0) {
    throw new Error('No generated wallets. Run `bun run generate-wallets` first.')
  }

  let sent = 0

  while (count === undefined || sent < count) {
    if (signal?.aborted) break

    const wallet = pick(roster)
    const payload = await buildChatMessage(wallet)

    if (dryRun) {
      console.log(`  dry  ${payload.name}  ${payload.address}  ${payload.message}`)
    } else {
      const { key, removed } = await publishChat(payload)
      console.log(
        `  ${payload.name.padEnd(4, ' ')}  ${payload.address}  ${payload.message}${removed ? `  trimmed ${removed}` : ''}${key ? `  ${key}` : ''}`,
      )
    }

    sent += 1
    if (count !== undefined && sent >= count) break

    const wait = intervalMs + Math.floor(Math.random() * intervalMs)
    await sleep(wait, signal)
  }

  return sent
}
