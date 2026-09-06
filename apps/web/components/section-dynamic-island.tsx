'use client'

import { useEffect, useRef } from 'react'

const PLAYBACK_RATE = 0.5

export default function SectionDynamicIsland() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const applyRate = () => {
      video.defaultPlaybackRate = PLAYBACK_RATE
      if (video.playbackRate !== PLAYBACK_RATE) {
        video.playbackRate = PLAYBACK_RATE
      }
    }

    applyRate()

    const events = ['loadedmetadata', 'canplay', 'play', 'playing', 'seeked'] as const
    for (const event of events) {
      video.addEventListener(event, applyRate)
    }

    void video
      .play()
      .then(applyRate)
      .catch(() => {})

    return () => {
      for (const event of events) {
        video.removeEventListener(event, applyRate)
      }
    }
  }, [])

  return (
    <section className="section-panel relative h-[180px] flex-none overflow-hidden p-0">
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover motion-reduce:hidden object-bottom"
        src="https://v1.pinimg.com/videos/iht/expMp4/45/05/57/45055796afda511e5c057fa25102cae2_720w.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
      <button className="px-8 bg-black rounded-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 py-5 cursor-pointer">
        <span className="text-white font-abc-gravity-italic text-[28px]">START TRADING</span>
      </button>
    </section>
  )
}
