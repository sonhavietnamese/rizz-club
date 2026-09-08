'use client'

import { ABILITY_FRONT_COLOR, type AbilityCard } from '@/lib/ability'
import Image from 'next/image'

export default function AbilityCardFace({ card, revealed }: { card: AbilityCard; revealed: boolean }) {
  if (revealed) {
    return <span className="block h-full w-full rounded-[10px]" style={{ backgroundColor: ABILITY_FRONT_COLOR }} />
  }

  return (
    <Image
      draggable={false}
      src={card.image}
      alt=""
      width={376}
      height={536}
      className="h-full w-full object-cover"
    />
  )
}
