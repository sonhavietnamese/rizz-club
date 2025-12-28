import video from '@/assets/1228.mp4'
import { motion } from 'motion/react'

interface BackgroundVideoProps {
  show: boolean
}

export default function BackgroundVideo({ show }: BackgroundVideoProps) {
  return (
    <motion.video
      animate={{
        opacity: show ? 1 : 0,
      }}
      draggable={false}
      src={video}
      className="w-full h-full object-cover absolute top-0 left-0 z-0"
      autoPlay
      muted
      loop
    />
  )
}
