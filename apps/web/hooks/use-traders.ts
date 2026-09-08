'use client'

import { getFirebaseDatabase } from '@/lib/firebase'
import {
  ANONYMOUS_FIELD,
  TRADERS_PATH,
  onlineTraderCount,
  parseTraders,
  traderIdentity,
  traderKey,
  type TradersSnapshot,
} from '@/lib/traders'
import { increment, onDisconnect, onValue, ref, update } from 'firebase/database'
import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

type TradersStatus = 'loading' | 'live' | 'error'
type TraderIdentity = { address: string; name: string }

const emptySnapshot: TradersSnapshot = { traders: [], anonymous: 0 }

function traderRefFor(address: string) {
  return ref(getFirebaseDatabase(), `${TRADERS_PATH}/${traderKey(address)}`)
}

async function setTraderOnline(identity: TraderIdentity) {
  await update(traderRefFor(identity.address), {
    address: identity.address,
    name: identity.name,
    status: 'online',
  })
}

async function setTraderOffline(address: string) {
  await update(traderRefFor(address), { status: 'offline' })
}

async function bumpAnonymous(delta: 1 | -1) {
  await update(ref(getFirebaseDatabase(), TRADERS_PATH), {
    [ANONYMOUS_FIELD]: increment(delta),
  })
}

export function useTraderPresence() {
  const { ready, authenticated, user } = usePrivy()
  const address = user?.wallet?.address || user?.id || ''
  const name = user ? traderIdentity(user).name : ''

  useEffect(() => {
    if (!ready) return

    const db = getFirebaseDatabase()
    let cancelled = false
    let joined = false
    let released = false

    if (authenticated && address) {
      const traderRef = traderRefFor(address)
      const disconnect = onDisconnect(traderRef)
      const identity = { address, name: name || address }

      const leave = async () => {
        if (!joined || released) return
        released = true
        await disconnect.cancel()
        await setTraderOffline(address)
      }

      void setTraderOnline(identity)
        .then(async () => {
          joined = true
          if (cancelled) {
            await leave()
            return
          }
          await disconnect.update({ status: 'offline' })
        })
        .catch((error) => {
          console.error('Failed to mark trader online:', error)
        })

      return () => {
        cancelled = true
        void leave()
      }
    }

    const anonymousRef = ref(db, `${TRADERS_PATH}/${ANONYMOUS_FIELD}`)
    const disconnect = onDisconnect(anonymousRef)

    const leave = async () => {
      if (!joined || released) return
      released = true
      await disconnect.cancel()
      await bumpAnonymous(-1)
    }

    void bumpAnonymous(1)
      .then(async () => {
        joined = true
        if (cancelled) {
          await leave()
          return
        }
        await disconnect.set(increment(-1))
      })
      .catch((error) => {
        console.error('Failed to track anonymous trader:', error)
      })

    return () => {
      cancelled = true
      void leave()
    }
  }, [address, authenticated, name, ready])
}

export function useTraders() {
  const [snapshot, setSnapshot] = useState<TradersSnapshot>(emptySnapshot)
  const [status, setStatus] = useState<TradersStatus>('loading')

  useEffect(() => {
    const unsubscribe = onValue(
      ref(getFirebaseDatabase(), TRADERS_PATH),
      (next) => {
        setSnapshot(parseTraders(next.val()))
        setStatus('live')
      },
      () => {
        setStatus('error')
      },
    )

    return unsubscribe
  }, [])

  return {
    traders: snapshot.traders,
    anonymous: snapshot.anonymous,
    online: onlineTraderCount(snapshot),
    status,
  }
}
