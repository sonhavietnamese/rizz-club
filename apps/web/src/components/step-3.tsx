'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useRegisterStore } from '@/stores/register'

interface Item {
  id: number
  name: string
  selected: boolean
  description: string
}

export default function Step3() {
  const { setStep } = useRegisterStore()
  const [items, setItems] = useState<Item[]>([
    {
      id: 1,
      name: 'Chat',
      selected: true,
      description: 'Chat with your audience',
    },

    {
      id: 2,
      name: 'Prediction',
      selected: true,
      description: 'Predict the outcome of a event',
    },

    {
      id: 3,
      name: 'Lixi',
      selected: true,
      description: 'Lixi with your audience',
    },
  ])

  const handleItemClick = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    )
  }

  const onBackClick = () => {
    setStep(2)
  }

  const onNextClick = () => {
    setStep(4)
  }

  return (
    <>
      <div className="w-full h-full z-10 flex flex-col relative">
        <div className="select-none -rotate-2 flex flex-col p-12 pb-0 items-center justify-center text-white text-[60px] font-blur leading-none">
          <span>PICK YOUR</span>
          <span>ENGAGEMENT</span>
          <span>SET</span>

          <span className="text-[20px] font-proxima text-[#D2D2D2]/80 text-center mt-10 rotate-2 w-[90%]">
            Your audience can interact with your content through this
          </span>
        </div>

        <div className="flex flex-col justify-between p-8 gap-5 mt-10">
          <ul className="space-y-5 font-proxima text-white text-[26px] leading-none">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center px-10 w-full h-[100px] bg-[#212121] rounded-4xl justify-between"
              >
                <div>
                  <span>{item.name}</span>
                </div>

                <button onClick={() => handleItemClick(item.id)}>
                  <motion.div
                    animate={{
                      backgroundColor: item.selected ? '#B178CA' : '#555555',
                    }}
                    className="w-[58px] rounded-full h-[30px] p-1 relative"
                  >
                    <motion.div
                      animate={{
                        left: item.selected ? '29px' : '4px',
                      }}
                      className="h-[24px] bg-[#F1ECF0] aspect-square rounded-full absolute top-1/2 left-1 -translate-y-1/2 "
                    ></motion.div>
                  </motion.div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center w-full justify-between select-none p-5 absolute bottom-0 left-0 right-0">
          <div className="flex items-center justify-start">
            <button
              onClick={onBackClick}
              className="bg-[#ffffff] rounded-[16px] outline-none text-black text-[20px] font-proxima leading-none p-3.5 py-2.5 margin-auto text-center font-bold"
            >
              Back
            </button>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={onNextClick}
              className="bg-[#ffffff] rounded-[16px] outline-none text-black text-[20px] font-proxima leading-none p-3.5 py-2.5 margin-auto text-center font-bold"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
