import Image from 'next/image'

type ChatItem = {
  id: number
  avatar: string
  name: string
  message: string
  side: 'left' | 'right'
}

const AVATARS = [
  'https://i.pinimg.com/1200x/6c/50/e8/6c50e8fc7cc13cfc7bc4abb312282f15.jpg',
  'https://i.pinimg.com/1200x/a5/65/6c/a5656c180fedac78f1f913abc7253015.jpg',
  'https://i.pinimg.com/736x/d8/bd/f8/d8bdf86d816411cc2501754d2e202afe.jpg',
] as const

const CHAT_ITEMS: ChatItem[] = [
  { id: 1, avatar: AVATARS[0], name: 'nova', message: 'gm, we printing today?', side: 'left' },
  { id: 2, avatar: AVATARS[1], name: 'kira', message: 'btc looking heavy into the open', side: 'left' },
  { id: 3, avatar: AVATARS[2], name: 'you', message: 'fading the first spike', side: 'right' },
  { id: 4, avatar: AVATARS[0], name: 'jax', message: 'That would be great', side: 'left' },
  { id: 5, avatar: AVATARS[1], name: 'mira', message: 'volume just died on the ask', side: 'left' },
  { id: 6, avatar: AVATARS[2], name: 'you', message: 'holding the down side for now', side: 'right' },
  { id: 7, avatar: AVATARS[0], name: 'leo', message: 'who is still long here', side: 'left' },
  { id: 8, avatar: AVATARS[1], name: 'sage', message: 'not me, already flipped', side: 'left' },
  {
    id: 9,
    avatar: AVATARS[0],
    name: 'rex',
    message: 'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    side: 'left',
  },
  { id: 10, avatar: AVATARS[2], name: 'you', message: 'wait for the next candle close', side: 'right' },
  { id: 11, avatar: AVATARS[1], name: 'nina', message: 'this spread is criminal', side: 'left' },
  { id: 12, avatar: AVATARS[0], name: 'otto', message: 'leaderboard is cooked already', side: 'left' },
  { id: 13, avatar: AVATARS[1], name: 'ivy', message: 'sonha just printed +$12', side: 'left' },
  { id: 14, avatar: AVATARS[2], name: 'you', message: 'yeah I saw that, insane fill', side: 'right' },
  { id: 15, avatar: AVATARS[0], name: 'zed', message: 'lock in, 30s left', side: 'left' },
  { id: 16, avatar: AVATARS[1], name: 'aria', message: 'do not fade this wick', side: 'left' },
  { id: 17, avatar: AVATARS[0], name: 'kai', message: 'ok now it is moving', side: 'left' },
  { id: 18, avatar: AVATARS[2], name: 'you', message: 'adding a bit more size', side: 'right' },
  { id: 19, avatar: AVATARS[1], name: 'lux', message: 'send it', side: 'left' },
  { id: 20, avatar: AVATARS[0], name: 'rio', message: 'gg if this holds the high', side: 'left' },
]

function BubbleTail({ side }: { side: ChatItem['side'] }) {
  return (
    <figure className={side === 'left' ? 'absolute top-[10px] left-[-6px]' : 'absolute top-[10px] right-[-6px] scale-x-[-1]'}>
      <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0.47 3.34927L5.58321 0.153515C6.24925 -0.262765 7.1132 0.216078 7.1132 1.00151V7.39302C7.1132 8.17845 6.24925 8.6573 5.58321 8.24102L0.470001 5.04526C-0.156667 4.6536 -0.156668 3.74094 0.47 3.34927Z"
          fill="#3A3A3A"
        />
      </svg>
    </figure>
  )
}

function ChatRow({ item }: { item: ChatItem }) {
  const isRight = item.side === 'right'

  return (
    <li className={`flex w-full gap-4 ${isRight ? 'flex-row-reverse' : ''}`}>
      <div className={`flex w-[90%] gap-4 ${isRight ? 'flex-row-reverse' : ''}`}>
        <figure className="aspect-square h-15 w-15 rounded-lg bg-[#ff00ff] p-[2px]">
          <Image
            src={item.avatar}
            alt={item.name}
            width={60}
            height={60}
            className="h-full w-full rounded-[6px] object-cover"
          />
        </figure>
        <div className="relative h-fit w-fit rounded-lg bg-[#3A3A3A] p-2 text-white/80">
          <BubbleTail side={item.side} />
          <span className="leading-[1.1]">{item.message}</span>
        </div>
      </div>
    </li>
  )
}

export default function SectionChat() {
  return (
    <section className="section-panel flex flex-col gap-2">
      <div className="flex-1 overflow-y-auto rounded-lg hide-scrollbar">
        <ul className="flex h-[100px] flex-col gap-4 px-0.5">
          {CHAT_ITEMS.map((item) => (
            <ChatRow key={item.id} item={item} />
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-[#272727]">
        <input className="w-full rounded-lg p-4 text-white/80" placeholder="What's that" />
        <button type="button" className="p-4 opacity-50 hover:opacity-100">
          <figure className="h-5 w-5">
            <svg
              className="h-full w-full"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.8325 8.17463L10.109 13.9592L3.59944 9.88767C2.66675 9.30414 2.86077 7.88744 3.91572 7.57893L19.3712 3.05277C20.3373 2.76963 21.2326 3.67283 20.9456 4.642L16.3731 20.0868C16.0598 21.1432 14.6512 21.332 14.0732 20.3953L10.106 13.9602"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
            </svg>
          </figure>
        </button>
      </div>
    </section>
  )
}
