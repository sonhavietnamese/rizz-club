'use client'

export default function Step1() {
  return (
    <section className="relative overflow-hidden w-auto h-full aspect-525/1018 bg-[#141414] squircle rounded-[150px]">
      <div className="w-full h-full z-10 flex flex-col relative">
        <div className="select-none -rotate-2 flex flex-col p-12 pb-0 items-center justify-center text-white text-[50px] font-blur leading-none">
          <span>ALL SET</span>
        </div>

        <div className="w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="border border-[#343434] bg-[#1A1A1A] w-[300px] h-[500px] squircle rounded-[80px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center flex-col">
            <div className="w-[140px] aspect-square bg-amber-50 rounded-full mt-10"></div>
            <span className="font-blur text-[20px] text-white mt-5">
              You're an EPIC KOL!
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
