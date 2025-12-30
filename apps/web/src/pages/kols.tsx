import avatar from '@/assets/sample-avatar.png'
import badge01 from '@/assets/badge-01.png'
import cover01 from '@/assets/cover-01.png'
import texture03 from '@/assets/texture-03.png'
import texture04 from '@/assets/texture-04.png'

export default function Kols() {
  return (
    <main className="w-screen h-screen flex items-center justify-center bg-[#E3E3E3] p-6">
      <section className="bg-[#141414] squircle rounded-[100px] relative overflow-hidden z-1 h-full w-[520px] overflow-y-auto disabled-scroll">
        <div className="bg-white h-[260px] w-full relative">
          <img
            src={cover01}
            alt="cover-01"
            className="w-full h-full object-cover absolute top-0 left-0 z-0"
          />
          <figure className="w-full absolute bottom-0 left-0">
            <svg
              width="525"
              height="132"
              viewBox="0 0 525 132"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M262.5 0C318.121 0 390.491 8.80981 445.153 16.8867C472.389 20.9111 486.007 22.9231 497.119 30.1074C506.64 36.2629 514.82 45.7403 519.518 56.0586C525 68.1015 525 82.4009 525 110.999V128.9C525 129.95 524.999 130.983 524.999 132H0.000976562C0.00078393 130.983 0 129.95 0 128.9V111C0 82.4015 -0.000270652 68.1015 5.48242 56.0586C10.1801 45.7403 18.36 36.2629 27.8809 30.1074C38.9931 22.9231 52.6112 20.9111 79.8467 16.8867C134.509 8.8098 206.879 0 262.5 0Z"
                fill="#141414"
              />
            </svg>
          </figure>

          <div className="absolute z-10 left-1/2 -translate-x-1/2 top-[30px] flex flex-col items-center gap-2">
            <figure className="w-[160px] aspect-square ">
              <img
                src={avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </figure>
            <span className="text-white text-[24px] font-proxima">
              @sonhavietnamese
            </span>
            <div className="flex gap-2 text-white/50 font-proxima leading-none items-center">
              <div>
                <span>3,321 followers</span>
              </div>
              |
              <div className="w-auto h-5">
                <img src={badge01} alt="badge-01" className="w-auto h-full" />
              </div>
            </div>
          </div>
        </div>

        <section className="px-6 mt-5">
          <div className="px-2">
            <span className="text-white font-blur text-[24px]">Attention!</span>
          </div>
          <div className="w-full rounded-[30px] bg-[#212121] mt-5 p-6 h-[200px] overflow-y-auto relative">
            <div className="h-full w-full overflow-y-auto disabled-scroll space-y-4"></div>
          </div>
        </section>

        <section className="px-6 mt-10">
          <div className="px-2">
            <span className="text-white font-blur text-[24px]">Products</span>
          </div>
          <div className="w-full mt-5">
            <div className="flex gap-5 overflow-x-auto disabled-scroll pb-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="min-w-[300px] rotate-2 hover:rotate-0 transition-all duration-300 max-w-[320px] w-[80vw] rounded-[42px] bg-[#212121] p-4 flex flex-col gap-3 last:mb-0 flex-shrink-0"
                >
                  <div className="flex flex-col gap-3">
                    <figure className="w-full aspect-square rounded-[30px] overflow-hidden bg-[#D9D9D9]"></figure>
                  </div>

                  <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-4">
                      <button className="flex gap-1 items-center justify-center">
                        <div className="w-5 aspect-square">
                          <svg
                            className="w-full h-full"
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.82883 15.4644C2.39816 10.9978 4.07016 5.89243 8.75949 4.38176C11.2262 3.58576 13.9488 4.0551 15.9995 5.59776C17.9395 4.09776 20.7622 3.5911 23.2262 4.38176C27.9155 5.89243 29.5982 10.9978 28.1688 15.4644C25.9422 22.5444 15.9995 27.9978 15.9995 27.9978C15.9995 27.9978 6.13016 22.6271 3.82883 15.4644Z"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M21.333 8.93311C22.7597 9.39444 23.7677 10.6678 23.889 12.1624"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-white text-[15px]">3</span>
                      </button>
                      <button className="flex gap-1 items-center justify-center">
                        <div className="w-5 aspect-square">
                          <svg
                            className="w-full h-full"
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M15.323 3.71826H10.3377C6.23766 3.71826 3.66699 6.62093 3.66699 10.7303V21.8156C3.66699 25.9249 6.22566 28.8276 10.3377 28.8276H22.103C26.2163 28.8276 28.775 25.9249 28.775 21.8156V16.4449"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M11.7699 14.561L21.7338 4.59699C22.9752 3.35699 24.9872 3.35699 26.2285 4.59699L27.8512 6.21966C29.0925 7.46099 29.0925 9.47432 27.8512 10.7143L17.8392 20.7263C17.2965 21.269 16.5605 21.5743 15.7925 21.5743H10.7979L10.9232 16.5343C10.9419 15.793 11.2445 15.0863 11.7699 14.561Z"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M20.2197 6.13623L26.3077 12.2242"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-white text-[15px]">3</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 mt-10">
          <div className="px-2">
            <span className="text-white font-blur text-[24px]">Chat</span>
          </div>
          <div className="w-full rounded-[30px] bg-[#212121] mt-5 p-6 h-[400px] overflow-y-auto relative">
            <div className="h-full w-full overflow-y-auto disabled-scroll space-y-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="flex gap-1.5 flex-col font-proxima text-[18px] leading-none last:mb-20"
                >
                  <span className="text-white/50 text-[18px]">
                    @sonhavietnamese
                  </span>
                  <span className="text-white text-[18px]">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    Voluptate sequi saepe iure hic ipsa porro suscipit esse
                    deserunt? Ex cumque voluptate saepe nemo aut distinctio
                    facere explicabo doloribus atque ipsam?
                  </span>
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 w-full p-5 z-10 bg-[#212121]">
              <input
                placeholder="Drop your message"
                className="h-14 bg-[#171717]/90  squircle rounded-[80px] outline-none text-white text-[20px] leading-none p-4 px-6 w-full font-proxima"
              />
            </div>
          </div>
        </section>

        <section className="px-6 mt-10">
          <div className="px-2">
            <span className="text-white font-blur text-[24px]">
              Will it be?
            </span>
          </div>
          <div className="w-full mt-5">
            <div className="w-full h-[200px] bg-[#212121] rounded-[30px]">
              <div className="p-7 font-proxima text-[20px] leading-none text-white flex flex-col gap-6">
                <div className="flex flex-col gap-3 w-full">
                  <span className="text-[24px] font-bold">Option 1</span>
                  <div className="grid grid-cols-[1fr_80px] w-full gap-2">
                    <div
                      id="progress"
                      className="h-[16px] bg-[#807A7E] rounded-[30px] w-[37%] self-center overflow-hidden"
                    >
                      <img
                        src={texture03}
                        alt="texture-03"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-right font-proxima text-[24px] opacity-50">
                      37%
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <span className="text-[24px] font-bold">Option 2</span>
                  <div className="grid grid-cols-[1fr_80px] w-full gap-2">
                    <div
                      id="progress"
                      className="h-[16px] bg-[#807A7E] rounded-[30px] w-[63%] self-center overflow-hidden"
                    >
                      <img
                        src={texture04}
                        alt="texture-03"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-right font-proxima text-[24px] opacity-50">
                      63%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full h-[24px]"></div>

        {/* <aside className="flex items-center justify-between p-6 absolute bottom-0 right-0 w-full">
          <div className="p-3 w-fit px-4 relative overflow-hidden rounded-full z-10">
            <img
              src={texture01}
              alt="texture-01"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover z-0"
            />
            <div className="h-[24px] w-auto z-10 relative">
              <svg
                className="w-full h-full"
                width="70"
                height="29"
                viewBox="0 0 70 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M60.3227 6.39448L59.2714 16.7355C59.1488 17.9408 59.4327 18.9312 60.0854 19.4462C60.5037 19.7451 60.9855 20.0505 63.2694 20.2827C65.5533 20.5149 67.4802 21.7363 67.2544 23.9568C67.0158 26.3041 65.7384 27.5203 61.9953 27.1398L54.763 26.4045C51.6544 26.0884 50.6231 24.253 50.9392 21.1443L52.5194 5.60113C52.7645 3.19036 54.1634 1.40966 56.6376 1.66121C59.2387 1.92565 60.6323 3.34928 60.3227 6.39448Z"
                  fill="white"
                />
                <path
                  d="M48.7948 13.2035C48.7948 21.1392 43.2535 26.5438 36.0702 26.5438C29.0922 26.5438 23.4141 20.934 23.4141 13.8192C23.4141 9.98812 24.5087 6.63594 26.4926 4.30994C28.8186 1.57347 32.0339 0 36.2755 0C43.0482 0 48.7948 5.67817 48.7948 13.2035ZM30.4605 12.8614C30.4605 17.7186 32.7865 20.1131 35.9334 20.1131C39.354 20.1131 41.68 17.3766 41.68 13.2719C41.68 9.9197 39.9697 6.22547 35.865 6.22547C32.7865 6.22547 30.4605 8.92773 30.4605 12.8614Z"
                  fill="white"
                />
                <path
                  d="M21.6499 3.93453C21.7671 5.07636 21.559 5.54646 19.3081 8.59809C17.898 10.4736 17.2084 11.2496 17.3387 12.5183C17.3973 13.0892 17.5697 13.5202 17.8691 13.9382C24.0393 22.2152 24.3826 22.4364 24.5193 23.7685C24.6951 25.4813 23.3842 26.4492 21.7983 26.612C19.0072 26.8985 17.5839 26.1472 16.3231 24.4817C12.7833 19.9732 12.4206 19.5617 11.5959 19.6464C10.3272 19.7766 9.70927 21.2503 9.93067 23.4071C10.2563 26.5789 8.79412 27.947 6.44701 28.1879C3.02151 28.5395 2.24704 25.9908 1.93447 22.9459L0.552249 8.85677C0.233164 5.74844 1.40251 4.02581 4.00335 3.75882C6.41389 3.51137 7.34274 4.44167 8.0586 6.41951C8.42956 7.53529 8.76795 8.3339 9.52918 8.25576C10.7979 8.12552 12.3819 4.82184 13.5724 3.93038C14.8199 2.96897 15.8592 2.47765 16.8742 2.37346C18.1429 2.24322 21.422 1.7143 21.6499 3.93453Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>

          <figure className="absolute bottom-0 left-0 w-full z-0">
            <svg
              width="520"
              height="236"
              viewBox="0 0 520 236"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <foreignObject x="0" y="0" width="0" height="0">
                <div
                  style={{
                    backdropFilter: 'blur(3.5px)',
                    clipPath: 'url(#bgblur_0_289_697_clip_path)',
                    height: '100%',
                    width: '100%',
                  }}
                ></div>
              </foreignObject>
              <rect
                x="-3"
                width="523"
                height="236"
                fill="url(#paint0_linear_289_697)"
              />
              <defs>
                <clipPath
                  id="bgblur_0_289_697_clip_path"
                  transform="translate(0 0)"
                >
                  <rect x="-3" width="523" height="236" />
                </clipPath>
                <linearGradient
                  id="paint0_linear_289_697"
                  x1="258.5"
                  y1="0"
                  x2="258.5"
                  y2="236"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#141414" stopOpacity="0" />
                  <stop offset="1" stopColor="#141414" />
                </linearGradient>
              </defs>
            </svg>
          </figure>

          <button className="p-3 bg-[#807A7E] rounded-full w-fit z-10">
            <svg
              width="31"
              height="31"
              viewBox="0 0 31 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M27.9506 18.5941H22.7215C20.8016 18.5929 19.2453 17.0378 19.2441 15.1178C19.2441 13.1978 20.8016 11.6428 22.7215 11.6416H27.9506"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23.3133 15.0388H22.9107"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.0077 3.875H21.1722C24.9156 3.875 27.9504 6.90978 27.9504 10.6532V19.9236C27.9504 23.667 24.9156 26.7018 21.1722 26.7018H10.0077C6.26428 26.7018 3.22949 23.667 3.22949 19.9236V10.6532C3.22949 6.90978 6.26428 3.875 10.0077 3.875Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.08789 9.73703H16.0615"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </aside> */}
      </section>
    </main>
  )
}
