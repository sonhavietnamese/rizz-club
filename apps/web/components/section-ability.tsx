import Image from 'next/image'

const CARDS = [
  {
    id: 1,
    image: '/card-001.png',
  },
  {
    id: 2,
    image: '/card-002.png',
  },
  {
    id: 3,
    image: '/card-003.png',
  },
  {
    id: 4,
    image: '/card-004.png',
  },
]

export default function SectionAbility() {
  return (
    <section className="section-panel h-[180px] flex-none p-4">
      <ul className="w-full h-full flex gap-4 overflow-x-auto hide-scrollbar rounded-lg">
        {CARDS.map((card) => (
          <li key={card.id}>
            <figure className="aspect-[368/528] h-full">
              <Image
                src={card.image}
                alt={card.id.toString()}
                width={368}
                height={528}
                className="w-full h-full object-cover"
              />
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
