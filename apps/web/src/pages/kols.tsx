import avatar from '@/assets/sample-avatar.png'
import badge01 from '@/assets/badge-01.png'
import cover01 from '@/assets/cover-01.png'
import texture03 from '@/assets/texture-03.png'
import texture04 from '@/assets/texture-04.png'
import texture05 from '@/assets/texture-05.png'
import logoX from '@/assets/logo-x.png'
import logoDribbble from '@/assets/logo-dribbble.png'
import logoThreads from '@/assets/logo-threads.png'
import ads01 from '@/assets/ads-01.png'

const SOCIALS = [
  {
    id: 1,
    name: 'X',
    logo: logoX,
    color: '#000000',
  },
  {
    id: 2,
    name: 'Dribbble',
    logo: logoDribbble,
    color: '#EA4C89',
  },
  {
    id: 3,
    name: 'Threads',
    logo: logoThreads,
    color: '#000000',
  },
]

const CHATS = [
  {
    id: 1,
    username: 'birdy',
    message: 'ggs',
  },
  {
    id: 2,
    username: 'coping_bozo',
    message:
      'briefly for like 5mins, when they saw birdy wins they was nah *** this not him',
  },
  {
    id: 3,
    username: 'decimal',
    message: 'thanks for the motivation i g',
  },
]

const PRODUCTS = [
  {
    id: 1,
    name: 'Epione Chair',
    image: '/products/01.png',
  },
  {
    id: 2,
    name: 'Epione Chair',
    image: '/products/02.png',
  },
  {
    id: 3,
    name: 'Epione Chair',
    image: '/products/03.png',
  },
]

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
            <figure className="w-[160px] aspect-square mt-3 -rotate-3">
              <img
                src={avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </figure>
            <span className="text-white text-[24px] font-proxima">
              @sonhavietnamese
            </span>
            <div className="flex gap-2 text-white/50 font-proxima leading-none items-center -mt-2">
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
          <div className="w-full overflow-hidden rounded-[30px] bg-[#212121] mt-5 relative">
            <div className="h-full w-full">
              <img src={ads01} alt="ads-01" className="w-full h-auto" />
            </div>

            <button className="absolute bottom-4 right-4 bg-[#CE89EC] text-white font-proxima text-[18px] leading-none font-bold px-4 py-2 rounded-[14px]">
              Explore
            </button>
          </div>
        </section>

        <section className="px-6 mt-10">
          <div className="px-2">
            <span className="text-white font-blur text-[24px]">Socials</span>
          </div>
          <div className="w-full mt-5 grid grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="w-full h-full bg-[#212121] rounded-[30px] hover:rotate-10 transition-all duration-300"
              >
                <figure className="w-full aspect-square rounded-[30px] overflow-hidden bg-[#212121] p-10">
                  <img
                    src={SOCIALS[index].logo}
                    alt={SOCIALS[index].name}
                    className="w-full h-full object-cover"
                  />
                </figure>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 mt-10">
          <div className="px-2">
            <span className="text-white font-blur text-[24px]">Products</span>
          </div>
          <div className="w-full mt-5">
            <div className="flex gap-5 overflow-x-auto disabled-scroll pb-2">
              {PRODUCTS.map((product, index) => (
                <div
                  key={index}
                  className="min-w-[300px] rotate-2 hover:rotate-0 transition-all duration-300 max-w-[320px] w-[80vw] rounded-[42px] bg-[#212121] p-4 flex flex-col gap-3 last:mb-0 flex-shrink-0"
                >
                  <div className="flex flex-col gap-3">
                    <figure className="w-full aspect-square rounded-[30px] overflow-hidden bg-[#D9D9D9]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </figure>
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
              {CHATS.map((chat, index) => (
                <div
                  key={index}
                  className="flex gap-1.5 flex-col font-proxima text-[18px] leading-none last:mb-20"
                >
                  <span className="text-white/50 text-[18px]">
                    @{chat.username}
                  </span>
                  <span className="text-white text-[18px]">{chat.message}</span>
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
            <div className="w-full bg-[#212121] rounded-[30px]">
              <div className="p-7 font-proxima text-[20px] leading-none text-white flex flex-col gap-6">
                <span className="text-[24px] font-bold text-white font-proxima">
                  Does Epione Chair will drop new model in Jan 2026?
                </span>
                <div className="flex flex-col gap-3 w-full">
                  <span className="text-[24px] font-bold">Yes</span>
                  <div className="grid grid-cols-[1fr_80px] w-full gap-2">
                    <div
                      id="progress"
                      className="h-[16px] bg-[#807A7E] rounded-[30px] w-[80%] self-center overflow-hidden"
                    >
                      <img
                        src={texture03}
                        alt="texture-03"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-right font-proxima text-[24px] opacity-50">
                      80%
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <span className="text-[24px] font-bold">No</span>
                  <div className="grid grid-cols-[1fr_80px] w-full gap-2">
                    <div
                      id="progress"
                      className="h-[16px] bg-[#807A7E] rounded-[30px] w-[20%] self-center overflow-hidden"
                    >
                      <img
                        src={texture04}
                        alt="texture-03"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-right font-proxima text-[24px] opacity-50">
                      20%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 mt-10">
          <div className="px-2">
            <span className="text-white font-blur text-[24px]">Lixi</span>
          </div>
          <div className="w-full mt-5">
            <div className="w-full h-[220px] bg-[#212121] rounded-[30px] overflow-hidden relative">
              <img
                src={texture05}
                alt="texture-05"
                className="w-full h-full object-cover absolute top-0 left-0 z-0"
              />

              <div className="w-full h-full z-10 relative p-6 leading-none">
                <span className="font-blur text-[40px] text-white">
                  1000 $VERY
                </span>

                <button className="absolute bottom-5 right-5 bg-[#141414] text-white font-proxima text-[24px] leading-none font-bold px-6 py-3 rounded-[20px]">
                  Grab
                </button>

                <div className="absolute bottom-5 left-5 font-proxima text-[26px] leading-none text-white/80">
                  <span>24/100</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full h-[24px]"></div>
      </section>
    </main>
  )
}
