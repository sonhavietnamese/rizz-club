export default function Step1() {
  return (
    <section className="relative overflow-hidden w-auto h-full aspect-525/1018 bg-[#141414] squircle rounded-[80px] ">
      <figure className="w-full h-full absolute top-0 left-0 z-0 select-none">
        <svg
          className="w-full h-full"
          width="525"
          height="1017"
          viewBox="0 0 525 1017"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_f_0_1)">
            <path
              d="M494.5 80L597.5 13L681.5 501.5L576 867L383 1109L-82 967.5L-255.5 278L45.5 105.5L-44.5 635.5L173 839L402 782.5V635.5L173 620L332.5 265L507.5 581.5L494.5 80Z"
              fill="#CE89EC"
            />
          </g>
          <g filter="url(#filter1_f_0_1)">
            <path
              d="M-109 -204L-212 -271L-296 217.5L-190.5 583L2.5 825L467.5 683.5L641 -6L340 -178.5L430 351.5L212.5 555L-16.5 498.5V351.5L212.5 336L53 -19L-122 297.5L-109 -204Z"
              fill="#CE89EC"
            />
          </g>
          <defs>
            <filter
              id="filter0_f_0_1"
              x="-556.4"
              y="-287.9"
              width="1538.8"
              height="1697.8"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="150.45"
                result="effect1_foregroundBlur_0_1"
              />
            </filter>
            <filter
              id="filter1_f_0_1"
              x="-596.9"
              y="-571.9"
              width="1538.8"
              height="1697.8"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="150.45"
                result="effect1_foregroundBlur_0_1"
              />
            </filter>
          </defs>
        </svg>
      </figure>

      <div className="w-full h-full z-10 flex flex-col justify-between relative">
        <div className="select-none -rotate-3 flex flex-col p-8 items-center justify-center text-white text-[50px] font-blur leading-none">
          <span>HELLO</span>
          <span>PARTNER</span>
        </div>

        <div className="flex flex-col justify-between p-8 gap-5">
          <div className="flex flex-col mt-20 items-center justify-center text-white text-[50px] font-blur leading-none">
            <span className="-rotate-2 select-none">YOU ARE</span>

            <div className="flex items-center justify-center w-full">
              <input className="h-14 bg-[#212121]/90 mt-5 squircle rounded-[80px] outline-none text-white text-[24px] font-bold leading-none p-4 margin-auto text-center w-full font-proxima" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center w-full justify-between select-none">
            <div className="flex items-center justify-start">
              <button className="bg-[#ffffff] rounded-[16px] outline-none text-black text-[20px] font-proxima leading-none p-3.5 py-2.5 margin-auto text-center font-bold">
                Next
              </button>
            </div>
            <div className="flex items-center justify-end">
              <button className="bg-[#ffffff] rounded-[16px] outline-none text-black text-[20px] font-proxima leading-none p-3.5 py-2.5 margin-auto text-center font-bold">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
