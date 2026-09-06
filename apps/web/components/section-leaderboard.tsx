import Image from 'next/image'

export default function SectionLeaderboard() {
  return (
    <section className="section-panel flex flex-col gap-2 select-none">
      <div className="flex-1 overflow-y-auto rounded-lg hide-scrollbar">
        <ul className="h-[100px] flex flex-col gap-2">
          <li className="flex gap-[10px] w-full p-2 bg-background rounded-lg relative">
            <div>
              <figure className="w-15 h-15 aspect-square rounded p-[2px] bg-[#ff00ff] bg-cover bg-center">
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
              <div className="font-sans text-lg font-medium text-white/90">sonhavietnamese</div>
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
                <span className="font-sans text-xs font-medium text-[#6A7374]">120 BPM</span>
              </div>
            </div>

            <div className="py-1 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute top-2 right-2.5 z-10">
              <span className="font-sans text-[#B6BDBC] text-sm font-semibold">12,3 UP @ 12,4¢</span>
            </div>

            <div className="py-1.5 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute bottom-2 right-2 z-10">
              <span className="font-sans text-[#2DD530] font-semibold">+$12,3</span>
            </div>

            <figure className="h-full w-auto absolute top-0 right-0 rounded-tr-lg rounded-br-lg overflow-hidden z-0">
              <Image
                draggable={false}
                src="/mark-purple.png"
                alt="purple"
                width={200}
                height={70}
                className="w-full h-full"
              />
            </figure>
          </li>

          <li className="flex gap-[10px] w-full p-2 bg-background rounded-lg relative">
            <div>
              <figure className="w-15 h-15 aspect-square rounded p-[2px] bg-[#ff00ff] bg-cover bg-center">
                <Image
                  draggable={false}
                  src="https://i.pinimg.com/1200x/6d/bf/16/6dbf16b9b548101a7ad1ad27c84ff7bd.jpg"
                  alt="avatar"
                  width={60}
                  height={60}
                  className="w-full h-full object-cover rounded-sm"
                />
              </figure>
            </div>

            <div className="gap-2 items-start flex flex-col py-1">
              <div className="font-sans text-lg font-medium text-white/90">sonhavietnamese</div>
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
                <span className="font-sans text-xs font-medium text-[#6A7374]">120 BPM</span>
              </div>
            </div>

            <div className="py-1 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute top-2 right-2.5 z-10">
              <span className="font-sans text-[#B6BDBC] text-sm font-semibold">12,3 UP @ 12,4¢</span>
            </div>

            <div className="py-1.5 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute bottom-2 right-2 z-10">
              <span className="font-sans text-[#2DD530] font-semibold">+$12,3</span>
            </div>

            <figure className="h-full w-auto absolute top-0 right-0 rounded-tr-lg rounded-br-lg overflow-hidden z-0">
              <Image
                draggable={false}
                src="/mark-orange.png"
                alt="orange"
                width={200}
                height={70}
                className="w-full h-full"
              />
            </figure>
          </li>

          <li className="flex gap-[10px] w-full p-2 bg-background rounded-lg relative">
            <div>
              <figure className="w-15 h-15 aspect-square rounded p-[2px] bg-[#ff00ff] bg-cover bg-center">
                <Image
                  draggable={false}
                  src="https://i.pinimg.com/1200x/6d/bf/16/6dbf16b9b548101a7ad1ad27c84ff7bd.jpg"
                  alt="avatar"
                  width={60}
                  height={60}
                  className="w-full h-full object-cover rounded-sm"
                />
              </figure>
            </div>

            <div className="gap-2 items-start flex flex-col py-1">
              <div className="font-sans text-lg font-medium text-white/90">sonhavietnamese</div>
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
                <span className="font-sans text-xs font-medium text-[#6A7374]">120 BPM</span>
              </div>
            </div>

            <div className="py-1 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute top-2 right-2.5 z-10">
              <span className="font-sans text-[#B6BDBC] text-sm font-semibold">12,3 UP @ 12,4¢</span>
            </div>

            <div className="py-1.5 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute bottom-2 right-2 z-10">
              <span className="font-sans text-[#2DD530] font-semibold">+$12,3</span>
            </div>

            <figure className="h-full w-auto absolute top-0 right-0 rounded-tr-lg rounded-br-lg overflow-hidden z-0">
              <Image
                draggable={false}
                src="/mark-orange.png"
                alt="orange"
                width={200}
                height={70}
                className="w-full h-full"
              />
            </figure>
          </li>

          <li className="flex gap-[10px] w-full p-2 bg-background rounded-lg relative">
            <div>
              <figure className="w-15 h-15 aspect-square rounded p-[2px] bg-[#ff00ff] bg-cover bg-center">
                <Image
                  draggable={false}
                  src="https://i.pinimg.com/1200x/6d/bf/16/6dbf16b9b548101a7ad1ad27c84ff7bd.jpg"
                  alt="avatar"
                  width={60}
                  height={60}
                  className="w-full h-full object-cover rounded-sm"
                />
              </figure>
            </div>

            <div className="gap-2 items-start flex flex-col py-1">
              <div className="font-sans text-lg font-medium text-white/90">sonhavietnamese</div>
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
                <span className="font-sans text-xs font-medium text-[#6A7374]">120 BPM</span>
              </div>
            </div>

            <div className="py-1 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute top-2 right-2.5 z-10">
              <span className="font-sans text-[#B6BDBC] text-sm font-semibold">12,3 UP @ 12,4¢</span>
            </div>

            <div className="py-1.5 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute bottom-2 right-2 z-10">
              <span className="font-sans text-[#2DD530] font-semibold">+$12,3</span>
            </div>

            <figure className="h-full w-auto absolute top-0 right-0 rounded-tr-lg rounded-br-lg overflow-hidden z-0">
              <Image
                draggable={false}
                src="/mark-orange.png"
                alt="orange"
                width={200}
                height={70}
                className="w-full h-full"
              />
            </figure>
          </li>

          <li className="flex gap-[10px] w-full p-2 bg-background rounded-lg relative">
            <div>
              <figure className="w-15 h-15 aspect-square rounded p-[2px] bg-[#ff00ff] bg-cover bg-center">
                <Image
                  draggable={false}
                  src="https://i.pinimg.com/1200x/6d/bf/16/6dbf16b9b548101a7ad1ad27c84ff7bd.jpg"
                  alt="avatar"
                  width={60}
                  height={60}
                  className="w-full h-full object-cover rounded-sm"
                />
              </figure>
            </div>

            <div className="gap-2 items-start flex flex-col py-1">
              <div className="font-sans text-lg font-medium text-white/90">sonhavietnamese</div>
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
                <span className="font-sans text-xs font-medium text-[#6A7374]">120 BPM</span>
              </div>
            </div>

            <div className="py-1 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute top-2 right-2.5 z-10">
              <span className="font-sans text-[#B6BDBC] text-sm font-semibold">12,3 UP @ 12,4¢</span>
            </div>

            <div className="py-1.5 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute bottom-2 right-2 z-10">
              <span className="font-sans text-[#2DD530] font-semibold">+$12,3</span>
            </div>

            <figure className="h-full w-auto absolute top-0 right-0 rounded-tr-lg rounded-br-lg overflow-hidden z-0">
              <Image
                draggable={false}
                src="/mark-orange.png"
                alt="orange"
                width={200}
                height={70}
                className="w-full h-full"
              />
            </figure>
          </li>

          <li className="flex gap-[10px] w-full p-2 bg-background rounded-lg relative">
            <div>
              <figure className="w-15 h-15 aspect-square rounded p-[2px] bg-[#ff00ff] bg-cover bg-center">
                <Image
                  draggable={false}
                  src="https://i.pinimg.com/1200x/6d/bf/16/6dbf16b9b548101a7ad1ad27c84ff7bd.jpg"
                  alt="avatar"
                  width={60}
                  height={60}
                  className="w-full h-full object-cover rounded-sm"
                />
              </figure>
            </div>

            <div className="gap-2 items-start flex flex-col py-1">
              <div className="font-sans text-lg font-medium text-white/90">sonhavietnamese</div>
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
                <span className="font-sans text-xs font-medium text-[#6A7374]">120 BPM</span>
              </div>
            </div>

            <div className="py-1 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute top-2 right-2.5 z-10">
              <span className="font-sans text-[#B6BDBC] text-sm font-semibold">12,3 UP @ 12,4¢</span>
            </div>

            <div className="py-1.5 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute bottom-2 right-2 z-10">
              <span className="font-sans text-[#2DD530] font-semibold">+$12,3</span>
            </div>

            <figure className="h-full w-auto absolute top-0 right-0 rounded-tr-lg rounded-br-lg overflow-hidden z-0">
              <Image
                draggable={false}
                src="/mark-orange.png"
                alt="orange"
                width={200}
                height={70}
                className="w-full h-full"
              />
            </figure>
          </li>

          <li className="flex gap-[10px] w-full p-2 bg-background rounded-lg relative">
            <div>
              <figure className="w-15 h-15 aspect-square rounded p-[2px] bg-[#ff00ff] bg-cover bg-center">
                <Image
                  draggable={false}
                  src="https://i.pinimg.com/1200x/6d/bf/16/6dbf16b9b548101a7ad1ad27c84ff7bd.jpg"
                  alt="avatar"
                  width={60}
                  height={60}
                  className="w-full h-full object-cover rounded-sm"
                />
              </figure>
            </div>

            <div className="gap-2 items-start flex flex-col py-1">
              <div className="font-sans text-lg font-medium text-white/90">sonhavietnamese</div>
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
                <span className="font-sans text-xs font-medium text-[#6A7374]">120 BPM</span>
              </div>
            </div>

            <div className="py-1 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute top-2 right-2.5 z-10">
              <span className="font-sans text-[#B6BDBC] text-sm font-semibold">12,3 UP @ 12,4¢</span>
            </div>

            <div className="py-1.5 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute bottom-2 right-2 z-10">
              <span className="font-sans text-[#2DD530] font-semibold">+$12,3</span>
            </div>

            <figure className="h-full w-auto absolute top-0 right-0 rounded-tr-lg rounded-br-lg overflow-hidden z-0">
              <Image
                draggable={false}
                src="/mark-orange.png"
                alt="orange"
                width={200}
                height={70}
                className="w-full h-full"
              />
            </figure>
          </li>

          <li className="flex gap-[10px] w-full p-2 bg-background rounded-lg relative">
            <div>
              <figure className="w-15 h-15 aspect-square rounded p-[2px] bg-[#ff00ff] bg-cover bg-center">
                <Image
                  draggable={false}
                  src="https://i.pinimg.com/1200x/6d/bf/16/6dbf16b9b548101a7ad1ad27c84ff7bd.jpg"
                  alt="avatar"
                  width={60}
                  height={60}
                  className="w-full h-full object-cover rounded-sm"
                />
              </figure>
            </div>

            <div className="gap-2 items-start flex flex-col py-1">
              <div className="font-sans text-lg font-medium text-white/90">sonhavietnamese</div>
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
                <span className="font-sans text-xs font-medium text-[#6A7374]">120 BPM</span>
              </div>
            </div>

            <div className="py-1 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute top-2 right-2.5 z-10">
              <span className="font-sans text-[#B6BDBC] text-sm font-semibold">12,3 UP @ 12,4¢</span>
            </div>

            <div className="py-1.5 px-2 bg-[#222426]/40 backdrop-blur-sm w-fit h-fit rounded-lg absolute bottom-2 right-2 z-10">
              <span className="font-sans text-[#2DD530] font-semibold">+$12,3</span>
            </div>

            <figure className="h-full w-auto absolute top-0 right-0 rounded-tr-lg rounded-br-lg overflow-hidden z-0">
              <Image
                draggable={false}
                src="/mark-orange.png"
                alt="orange"
                width={200}
                height={70}
                className="w-full h-full"
              />
            </figure>
          </li>
        </ul>
      </div>
    </section>
  )
}
