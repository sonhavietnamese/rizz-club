import Image from 'next/image'

export default function SectionChat() {
  return (
    <section className="section-panel flex flex-col gap-2">
      <div className="flex-1 overflow-y-auto rounded-lg hide-scrollbar">
        <ul className="h-[100px] flex flex-col gap-4 px-0.5">
          <li className="flex gap-4 w-full">
            <div className="flex gap-4 w-[90%]">
              <div>
                <figure className="w-15 h-15 aspect-square rounded-lg p-[2.5px] bg-[#ff00ff] bg-cover bg-center">
                  <Image
                    src="https://i.pinimg.com/1200x/6c/50/e8/6c50e8fc7cc13cfc7bc4abb312282f15.jpg"
                    alt="avatar"
                    width={60}
                    height={60}
                    className="w-full h-full object-cover rounded-[6px]"
                  />
                </figure>
              </div>
              <div className="relative w-fit h-fit p-2 bg-[#3A3A3A] text-white/80 rounded-lg">
                <figure className="absolute top-[10px] left-[-6px]">
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0.47 3.34927L5.58321 0.153515C6.24925 -0.262765 7.1132 0.216078 7.1132 1.00151V7.39302C7.1132 8.17845 6.24925 8.6573 5.58321 8.24102L0.470001 5.04526C-0.156667 4.6536 -0.156668 3.74094 0.47 3.34927Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                </figure>
                <span className="leading-[1.1]">That would be great</span>
              </div>
            </div>
          </li>

          <li className="flex gap-4 w-full">
            <div className="flex gap-4 w-[90%]">
              <div>
                <figure className="w-15 h-15 aspect-square rounded-lg p-[2.5px] bg-[#ff00ff] bg-cover bg-center">
                  <Image
                    src="https://i.pinimg.com/1200x/6c/50/e8/6c50e8fc7cc13cfc7bc4abb312282f15.jpg"
                    alt="avatar"
                    width={60}
                    height={60}
                    className="w-full h-full object-cover rounded-[6px]"
                  />
                </figure>
              </div>
              <div className="relative w-fit h-fit p-2 bg-[#3A3A3A] text-white/80 rounded-lg">
                <figure className="absolute top-[10px] left-[-6px]">
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0.47 3.34927L5.58321 0.153515C6.24925 -0.262765 7.1132 0.216078 7.1132 1.00151V7.39302C7.1132 8.17845 6.24925 8.6573 5.58321 8.24102L0.470001 5.04526C-0.156667 4.6536 -0.156668 3.74094 0.47 3.34927Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                </figure>
                <span className="leading-[1.1]">
                  Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of
                  classical Latin literature from 45 BC, making it over 2000 years old
                </span>
              </div>
            </div>
          </li>

          <li className="flex gap-4 w-full flex-row-reverse">
            <div className="flex gap-4 w-[90%] flex-row-reverse">
              <div>
                <figure className="w-15 h-15 aspect-square rounded-lg p-[2.5px] bg-[#ff00ff] bg-cover bg-center">
                  <Image
                    src="https://i.pinimg.com/1200x/6c/50/e8/6c50e8fc7cc13cfc7bc4abb312282f15.jpg"
                    alt="avatar"
                    width={60}
                    height={60}
                    className="w-full h-full object-cover rounded-[6px]"
                  />
                </figure>
              </div>
              <div className="relative w-fit h-fit p-2 bg-[#3A3A3A] text-white/80 rounded-lg">
                <figure className="absolute top-[10px] right-[-6px] scale-x-[-1]">
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0.47 3.34927L5.58321 0.153515C6.24925 -0.262765 7.1132 0.216078 7.1132 1.00151V7.39302C7.1132 8.17845 6.24925 8.6573 5.58321 8.24102L0.470001 5.04526C-0.156667 4.6536 -0.156668 3.74094 0.47 3.34927Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                </figure>
                <span className="leading-[1.1]">
                  Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of
                  classical Latin literature from 45 BC, making it over 2000 years old
                </span>
              </div>
            </div>
          </li>

          <li className="flex gap-4 w-full">
            <div className="flex gap-4 w-[90%]">
              <div>
                <figure className="w-15 h-15 aspect-square rounded-lg p-[2.5px] bg-[#ff00ff] bg-cover bg-center">
                  <Image
                    src="https://i.pinimg.com/1200x/6c/50/e8/6c50e8fc7cc13cfc7bc4abb312282f15.jpg"
                    alt="avatar"
                    width={60}
                    height={60}
                    className="w-full h-full object-cover rounded-[6px]"
                  />
                </figure>
              </div>
              <div className="relative w-fit h-fit p-2 bg-[#3A3A3A] text-white/80 rounded-lg">
                <figure className="absolute top-[10px] left-[-6px]">
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0.47 3.34927L5.58321 0.153515C6.24925 -0.262765 7.1132 0.216078 7.1132 1.00151V7.39302C7.1132 8.17845 6.24925 8.6573 5.58321 8.24102L0.470001 5.04526C-0.156667 4.6536 -0.156668 3.74094 0.47 3.34927Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                </figure>
                <span className="leading-[1.1]">
                  Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of
                  classical Latin literature from 45 BC, making it over 2000 years old
                </span>
              </div>
            </div>
          </li>

          <li className="flex gap-4 w-full">
            <div className="flex gap-4 w-[90%]">
              <div>
                <figure className="w-15 h-15 aspect-square rounded-lg p-[2.5px] bg-[#ff00ff] bg-cover bg-center">
                  <Image
                    src="https://i.pinimg.com/1200x/6c/50/e8/6c50e8fc7cc13cfc7bc4abb312282f15.jpg"
                    alt="avatar"
                    width={60}
                    height={60}
                    className="w-full h-full object-cover rounded-[6px]"
                  />
                </figure>
              </div>
              <div className="relative w-fit h-fit p-2 bg-[#3A3A3A] text-white/80 rounded-lg">
                <figure className="absolute top-[10px] left-[-6px]">
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0.47 3.34927L5.58321 0.153515C6.24925 -0.262765 7.1132 0.216078 7.1132 1.00151V7.39302C7.1132 8.17845 6.24925 8.6573 5.58321 8.24102L0.470001 5.04526C-0.156667 4.6536 -0.156668 3.74094 0.47 3.34927Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                </figure>
                <span className="leading-[1.1]">
                  Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of
                  classical Latin literature from 45 BC, making it over 2000 years old
                </span>
              </div>
            </div>
          </li>

          <li className="flex gap-4 w-full">
            <div className="flex gap-4 w-[90%]">
              <div>
                <figure className="w-15 h-15 aspect-square rounded-lg p-[2.5px] bg-[#ff00ff] bg-cover bg-center">
                  <Image
                    src="https://i.pinimg.com/1200x/6c/50/e8/6c50e8fc7cc13cfc7bc4abb312282f15.jpg"
                    alt="avatar"
                    width={60}
                    height={60}
                    className="w-full h-full object-cover rounded-[6px]"
                  />
                </figure>
              </div>
              <div className="relative w-fit h-fit p-2 bg-[#3A3A3A] text-white/80 rounded-lg">
                <figure className="absolute top-[10px] left-[-6px]">
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0.47 3.34927L5.58321 0.153515C6.24925 -0.262765 7.1132 0.216078 7.1132 1.00151V7.39302C7.1132 8.17845 6.24925 8.6573 5.58321 8.24102L0.470001 5.04526C-0.156667 4.6536 -0.156668 3.74094 0.47 3.34927Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                </figure>
                <span className="leading-[1.1]">
                  Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of
                  classical Latin literature from 45 BC, making it over 2000 years old
                </span>
              </div>
            </div>
          </li>

          <li className="flex gap-4 w-full flex-row-reverse">
            <div className="flex gap-4 w-[90%] flex-row-reverse">
              <div>
                <figure className="w-15 h-15 aspect-square rounded-lg p-[2.5px] bg-[#ff00ff] bg-cover bg-center">
                  <Image
                    src="https://i.pinimg.com/1200x/6c/50/e8/6c50e8fc7cc13cfc7bc4abb312282f15.jpg"
                    alt="avatar"
                    width={60}
                    height={60}
                    className="w-full h-full object-cover rounded-[6px]"
                  />
                </figure>
              </div>
              <div className="relative w-fit h-fit p-2 bg-[#3A3A3A] text-white/80 rounded-lg">
                <figure className="absolute top-[10px] right-[-6px] scale-x-[-1]">
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0.47 3.34927L5.58321 0.153515C6.24925 -0.262765 7.1132 0.216078 7.1132 1.00151V7.39302C7.1132 8.17845 6.24925 8.6573 5.58321 8.24102L0.470001 5.04526C-0.156667 4.6536 -0.156668 3.74094 0.47 3.34927Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                </figure>
                <span className="leading-[1.1]">
                  Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of
                  classical Latin literature from 45 BC, making it over 2000 years old
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div className="bg-[#272727] rounded-lg flex items-center justify-between">
        <input className="text-white/80 p-4 rounded-lg w-full" placeholder="What's that"></input>
        <button className="p-4 opacity-50 hover:opacity-100 ">
          <figure className="w-5 h-5">
            <svg
              className="w-full h-full"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="Iconly/Regular/Light/Send">
                <g id="Send">
                  <path
                    id="Send_2"
                    d="M15.8325 8.17463L10.109 13.9592L3.59944 9.88767C2.66675 9.30414 2.86077 7.88744 3.91572 7.57893L19.3712 3.05277C20.3373 2.76963 21.2326 3.67283 20.9456 4.642L16.3731 20.0868C16.0598 21.1432 14.6512 21.332 14.0732 20.3953L10.106 13.9602"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                  />
                </g>
              </g>
            </svg>
          </figure>
        </button>
      </div>
    </section>
  )
}
