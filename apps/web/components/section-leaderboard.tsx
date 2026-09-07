import Image from 'next/image'
import markPurple from '@/public/mark-purple.png'
import markOrange from '@/public/mark-orange.png'

type LeaderboardItem = {
  id: number
  avatar: string
  name: string
  bpm: number
  price: number
  side: 'up' | 'down'
  shares: number
  profit: number
}

const LEADERBOARD_ITEMS: LeaderboardItem[] = [
  {
    id: 1,
    avatar: 'https://i.pinimg.com/736x/d8/bd/f8/d8bdf86d816411cc2501754d2e202afe.jpg',
    name: 'wwww',
    bpm: 120,
    price: 12.3,
    shares: 100,
    side: 'up',
    profit: 12.3,
  },
  {
    id: 2,
    avatar: 'https://i.pinimg.com/736x/d8/bd/f8/d8bdf86d816411cc2501754d2e202afe.jpg',
    name: 'wwww',
    bpm: 120,
    price: 12.3,
    shares: 100,
    side: 'down',
    profit: 12.3,
  },
  {
    id: 3,
    avatar: 'https://i.pinimg.com/736x/d8/bd/f8/d8bdf86d816411cc2501754d2e202afe.jpg',
    name: 'wwww',
    bpm: 120,
    price: 12.3,
    shares: 100,
    side: 'up',
    profit: 12.3,
  },
  {
    id: 4,
    avatar: 'https://i.pinimg.com/736x/d8/bd/f8/d8bdf86d816411cc2501754d2e202afe.jpg',
    name: 'wwww',
    bpm: 120,
    price: 12.3,
    shares: 100,
    side: 'down',
    profit: 12.3,
  },
  {
    id: 5,
    avatar: 'https://i.pinimg.com/736x/d8/bd/f8/d8bdf86d816411cc2501754d2e202afe.jpg',
    name: 'wwww',
    bpm: 120,
    price: 12.3,
    shares: 100,
    side: 'up',
    profit: 12.3,
  },
]

export default function SectionLeaderboard() {
  return (
    <section className="section-panel flex flex-col gap-2 select-none">
      <div className="flex-1 overflow-y-auto rounded-lg hide-scrollbar">
        <ul className="h-[100px] flex flex-col gap-2">
          {LEADERBOARD_ITEMS.map((item) => (
            <li key={item.id} className="flex gap-[10px] w-full p-2 bg-background rounded-lg relative">
              <div>
                <figure className="w-18 h-18 aspect-square rounded p-[2px] bg-[#ff00ff] bg-cover bg-center">
                  <Image
                    draggable={false}
                    src="https://i.pinimg.com/736x/d8/bd/f8/d8bdf86d816411cc2501754d2e202afe.jpg"
                    alt="avatar"
                    width={60}
                    height={60}
                    className="w-full h-full object-cover rounded-sm"
                  />
                </figure>
              </div>

              <div className="gap-2 items-start flex flex-col py-1">
                <div className="font-sans text-lg font-medium text-white/90">{item.name}</div>
                <div className="flex items-center gap-1 justify-center mt-2">
                  <figure className="w-3 h-3">
                    <svg
                      className="w-full h-full"
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0.5 6.60254H3.22727L4.59091 0.102539L6.40909 10.1025L7.77273 5.60254H10.5"
                        stroke="#6A7374"
                        strokeLinecap="round"
                      />
                    </svg>
                  </figure>
                  <span className="font-sans text-xs font-medium text-[#6A7374]">{item.bpm} BPM</span>
                </div>
              </div>

              <div className="py-1 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute top-2 right-2.5 z-10">
                <span className="font-sans text-[#B6BDBC] text-sm font-semibold">
                  {item.shares} {item.side === 'up' ? 'UP' : 'DOWN'} @ {item.price}¢
                </span>
              </div>

              <div className="py-1.5 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute bottom-2 right-2 z-10">
                <span className="font-sans text-[#2DD530] font-semibold">+${item.profit}</span>
              </div>

              <figure className="h-full w-auto absolute top-0 right-0 rounded-tr-lg rounded-br-lg overflow-hidden z-0">
                <Image
                  draggable={false}
                  src={item.side === 'up' ? markPurple : markOrange}
                  alt="mark"
                  width={200}
                  height={70}
                  className="w-full h-full"
                />
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
