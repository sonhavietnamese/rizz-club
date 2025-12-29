import sampleAva from '@/assets/sample-avatar.png'

export default function Step1() {
  return (
    <>
      <div className="w-full h-full z-10 flex flex-col relative">
        <div className="select-none -rotate-2 flex flex-col p-12 pb-0 items-center justify-center text-white text-[80px] font-blur leading-none">
          <span>ALL SET</span>
        </div>

        <div className="w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="border border-[#343434] bg-[#1A1A1A] w-[300px] h-[300px] squircle rounded-[80px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center flex-col">
            <div className="w-[140px] aspect-square rounded-full mt-10 -rotate-8">
              <img
                src={sampleAva}
                alt="sample-avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-blur text-[20px] text-white mt-5">
              You're an EPIC KOL!
            </span>
          </div>

          <div className="w-full p-5 absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 items-center justify-center">
            <button className="bg-[#212121] rounded-[16px] outline-none text-[#ffffff]/60 text-[20px] font-proxima leading-none p-3.5 py-2.5 margin-auto text-center font-bold">
              Copy link
            </button>
            <button className="bg-[#ffffff] rounded-[16px] outline-none text-black text-[20px] font-proxima leading-none p-3.5 py-2.5 margin-auto text-center font-bold">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
