import texture01 from '@/assets/texture-01.png'

export default function Fans() {
  return (
    <main className="w-screen h-screen flex items-center justify-center p-6">
      <section className="relative overflow-hidden w-auto h-full aspect-525/1018 bg-[#141414] squircle rounded-[100px]">
        <div className="flex items-center justify-between p-6 absolute w-full bg-transparent">
          <div className="flex items-center gap-2 z-10">
            <div className="rounded-full bg-[#807A7E] flex items-center justify-center gap-1 p-2 pr-3 w-fit">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 17.8476C17.6392 17.8476 20.2481 17.1242 20.5 14.2205C20.5 11.3188 18.6812 11.5054 18.6812 7.94511C18.6812 5.16414 16.0452 2 12 2C7.95477 2 5.31885 5.16414 5.31885 7.94511C5.31885 11.5054 3.5 11.3188 3.5 14.2205C3.75295 17.1352 6.36177 17.8476 12 17.8476Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.3889 20.8574C13.0247 22.3721 10.8967 22.3901 9.51953 20.8574"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-white text-[16px] font-proxima leading-none">
                3
              </span>
            </div>
            <div className="rounded-full bg-[#807A7E] flex items-center justify-center gap-1 p-2 w-fit">
              <svg
                width="27"
                height="27"
                viewBox="0 0 27 27"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M13.5 3.09375C19.2465 3.09375 23.9062 7.75237 23.9062 13.5C23.9062 19.2465 19.2465 23.9062 13.5 23.9062C7.75237 23.9062 3.09375 19.2465 3.09375 13.5C3.09375 7.7535 7.7535 3.09375 13.5 3.09375Z"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M17.9315 13.5146H17.9416"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M13.4217 13.5146H13.4318"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M8.91095 13.5146H8.92108"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="z-10">
            <div className="w-[60px] aspect-square">
              <svg
                className="w-full h-full"
                width="76"
                height="76"
                viewBox="0 0 76 76"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M37.8828 2.12695C42.9314 2.12697 47.3941 4.62087 50.1133 8.43555C54.6791 7.72845 59.5149 9.13115 63.0371 12.6533C66.6068 16.2231 67.9991 21.1418 67.2246 25.7617C70.9532 28.4902 73.3809 32.9016 73.3809 37.8828C73.3808 42.9317 70.8863 47.3942 67.0713 50.1133C67.7785 54.6791 66.3767 59.5149 62.8545 63.0371C59.2841 66.6073 54.3646 67.9989 49.7441 67.2236C47.0157 70.952 42.6061 73.3809 37.625 73.3809C32.5759 73.3808 28.1126 70.8866 25.3936 67.0713C20.828 67.7781 15.9927 66.3765 12.4707 62.8545C8.90056 59.2842 7.508 54.3646 8.2832 49.7441C4.55516 47.0156 2.12695 42.6058 2.12695 37.625C2.12697 32.5762 4.62061 28.1127 8.43555 25.3936C7.72877 20.828 9.13138 15.9927 12.6533 12.4707C16.2231 8.90111 21.1418 7.5078 25.7617 8.28223C28.4903 4.554 32.9019 2.12695 37.8828 2.12695Z"
                  stroke="white"
                  stroke-width="4.25397"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M37.8828 4.25391C42.7002 4.25391 46.9 6.89792 49.1106 10.8139C53.4027 9.67683 58.1673 10.7912 61.5331 14.1569C64.9396 17.5635 66.0396 22.4028 64.8336 26.7349C68.6726 28.9659 71.2539 33.1228 71.2539 37.8828C71.2539 42.7003 68.6098 46.9 64.6937 49.1106C65.8308 53.4027 64.7167 58.1673 61.3509 61.5331C57.9443 64.9396 53.105 66.0396 48.7728 64.8336C46.5418 68.6726 42.385 71.2539 37.6251 71.2539C32.8075 71.2539 28.6076 68.6098 26.3971 64.6937C22.105 65.8307 17.3405 64.7166 13.9747 61.3509C10.5682 57.9443 9.4681 53.105 10.6741 48.7728C6.83514 46.5418 4.25391 42.385 4.25391 37.6251C4.25391 32.8075 6.89796 28.6077 10.814 26.3971C9.677 22.105 10.7912 17.3405 14.1569 13.9747C17.5634 10.5683 22.4028 9.46805 26.7349 10.6739C28.9659 6.83504 33.1228 4.25391 37.8828 4.25391Z"
                  fill="#F5F5F5"
                  stroke="#0188FB"
                  stroke-width="2.12698"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-dasharray="3.94 3.94"
                />
                <path
                  d="M28.1055 20.812C28.9878 20.6697 32.6983 20.2273 34.7656 23.7202C35.6066 25.1412 35.9185 26.7246 36.0508 28.1167C36.1172 28.8158 36.1401 29.4838 36.1562 30.0688C36.1627 30.303 36.1684 30.5199 36.1748 30.7202C36.9772 30.6987 38.0201 30.6853 38.9326 30.7065C38.9216 29.89 39.0107 28.8905 39.2178 27.8784C39.5327 26.3397 40.146 24.6114 41.2246 23.353C42.5122 21.8509 44.3398 21.608 45.8662 21.7896C47.3877 21.9706 48.7955 22.5864 49.5322 23.0669C51.3315 24.2403 55.0271 28.6716 52.0693 40.353C52.5272 40.9605 53.1462 41.7702 53.6826 42.6138C54.3114 43.6027 54.9331 44.7952 55.0244 45.9351C55.0902 46.7574 55.0963 48.2025 54.5078 49.6567C53.9042 51.148 52.6914 52.601 50.4326 53.3882C48.3211 54.124 44.4535 54.7683 40.5273 55.0356C36.6165 55.3019 32.4549 55.2089 29.7988 54.3667C26.9874 53.4753 24.7358 52.5887 23.1836 50.981C21.5919 49.3322 20.8497 47.0574 20.6934 43.6812C20.5425 40.4224 20.3575 37.0678 20.5039 33.9087C20.6504 30.7487 21.1297 27.7077 22.3506 25.0728C23.0738 23.512 23.9844 22.5061 25.0225 21.8579C26.0456 21.2191 27.1275 20.9697 28.1055 20.812Z"
                  fill="#1E1F2B"
                  stroke="#0077DC"
                  stroke-width="1.76189"
                />
                <path
                  d="M46.1084 37.6636C46.7074 37.7023 47.2874 37.77 47.7169 37.8774C48.5064 38.0747 49.1727 38.5446 49.0514 39.4544C48.9301 40.3643 48.0202 40.8496 46.7464 40.9102C46.5185 40.9211 46.2614 40.9338 45.9874 40.9447C45.9925 40.929 45.9974 40.9132 46.0022 40.8971C46.1291 40.4698 46.1745 39.8675 46.2381 39.2679L46.2427 39.2219C46.2877 38.7453 46.2489 38.2436 46.1471 37.813C46.1351 37.7623 46.1222 37.7124 46.1084 37.6636Z"
                  fill="white"
                />
                <path
                  d="M43.2406 37.6753C43.2185 37.9037 43.1998 38.1585 43.184 38.4274C43.1381 39.2083 43.1166 40.1128 43.1097 40.8457C42.8025 40.7906 42.5313 40.7134 42.3184 40.6069C41.3913 40.1434 40.6806 39.3331 41.1659 38.6659C41.564 38.1185 42.1662 37.7858 43.2406 37.6753Z"
                  fill="white"
                />
                <path
                  d="M33.5809 45.429C34.1551 45.7032 34.5866 45.9293 34.7964 46.0056C35.1583 46.1372 36.484 46.4828 38.2215 46.5781C38.2468 47.4992 38.1717 50.1202 38.1061 52.0255C36.3639 52.0198 34.7763 51.9116 33.4487 51.7011C33.4209 50.5507 33.3668 47.9895 33.4619 47.704C33.5428 47.4613 33.573 46.274 33.5809 45.429Z"
                  fill="white"
                />
                <path
                  d="M43.1785 46.0019C43.1924 46.4333 43.2208 46.9255 43.2739 47.229C43.3808 47.8384 43.2739 48.9353 43.2739 49.6666C43.2739 49.9055 43.3201 50.9725 43.3288 51.7712C41.811 51.9172 40.3271 52.0003 38.9279 52.0208C38.9282 51.1952 38.9817 50.1495 38.9817 49.8271C38.9817 49.5464 38.948 47.7173 38.9731 46.6022C40.2694 46.6135 41.7315 46.4687 43.1671 46.0056C43.171 46.0044 43.1747 46.0031 43.1785 46.0019Z"
                  fill="white"
                />
                <path
                  d="M47.5342 44.3928C47.6113 44.985 47.7165 46.1852 47.7165 46.3696C47.7165 46.6122 47.9591 48.7958 48.0198 49.0991C48.0579 49.2897 48.0983 50.1165 48.1238 50.7564C47.2031 51.1416 46.0125 51.4711 44.5016 51.6468C44.3545 51.6639 44.2076 51.6803 44.0609 51.6963C43.9992 50.593 43.9683 48.2871 43.9683 47.7774V45.7419C45.9846 45.0624 45.263 45.1479 46.6246 44.6105C46.8507 44.5212 47.1686 44.4352 47.5342 44.3928Z"
                  fill="white"
                />
                <path
                  d="M28.6093 44.0039C30.0766 44.0039 31.64 44.5606 32.8458 45.0909C32.8185 46.173 32.7584 47.8129 32.6733 48.068C32.5885 48.3225 32.621 50.262 32.6575 51.557C32.2689 51.4761 31.909 51.3847 31.5815 51.2828C30.3424 50.8973 29.1033 50.4617 28.1025 49.9422C28.1471 48.8423 28.3407 46.5313 28.3903 46.0224L28.5867 44.004C28.5942 44.004 28.6017 44.0039 28.6093 44.0039Z"
                  fill="white"
                />
                <path
                  d="M48.2813 44.3753C49.001 44.4276 49.7822 44.6952 50.3854 45.399C51.55 46.7577 51.1133 48.1893 50.7494 48.7352C50.5669 49.1431 49.9934 49.8017 48.8711 50.4025C48.8385 50.0682 48.8083 49.7339 48.8083 49.6451C48.8083 49.4631 48.6264 47.0369 48.505 46.6122C48.4206 46.3166 48.33 45.1415 48.2813 44.3753Z"
                  fill="white"
                />
                <path
                  d="M27.7829 44.0812C27.7515 44.533 27.727 45.0786 27.7524 45.4093C27.7996 46.0261 27.587 47.1076 27.5162 47.8354C27.4968 48.035 27.4532 48.8183 27.3991 49.5354C26.5739 48.9985 26.019 48.3777 25.9404 47.6434C25.7798 46.145 25.9497 44.4578 27.7829 44.0812Z"
                  fill="white"
                />
                <path
                  d="M29.5163 37.9431C29.4757 38.515 29.4392 39.1715 29.4252 39.7729C29.4154 40.1919 29.4165 40.5854 29.4349 40.9054C28.8324 40.8889 28.3704 40.8508 28.1847 40.7889C27.4568 40.5462 26.8493 39.6787 27.1535 38.9691C27.3258 38.5671 28.0963 38.0021 29.5163 37.9431Z"
                  fill="white"
                />
                <path
                  d="M32.493 37.926C33.3193 37.8819 34.8028 37.9287 35.3423 38.4232C36.0702 39.0904 35.9488 40.1823 34.9177 40.5462C34.5159 40.688 33.5156 40.7929 32.4011 40.8539C32.4874 40.3546 32.5527 39.8378 32.5747 39.3357C32.5963 38.8437 32.5764 38.3631 32.493 37.926Z"
                  fill="white"
                />
                <path
                  d="M40.5587 42.4268C40.4721 41.8202 39.5882 41.0923 38.4964 41.0923C37.1013 41.2136 36.0701 42.0022 36.434 43.4579C36.803 44.9338 38.3751 44.6711 39.103 44.6104C39.8309 44.5498 40.7407 43.7006 40.5587 42.4268Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>

          <figure className="absolute bottom-0 left-0 w-full z-0 rotate-180">
            <svg
              width="520"
              height="336"
              viewBox="0 0 520 336"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <foreignObject x="0" y="0" width="0" height="0">
                <div
                  style={{
                    backdropFilter: 'blur(10px)',
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
        </div>

        <section className="overflow-y-auto h-full disabled-scroll pt-24">
          <div className="w-full">
            <div className="w-full overflow-x-auto disabled-scroll">
              <ul className="flex flex-row gap-2 py-2 px-6 w-full">
                {Array.from({ length: 10 }).map((_, index) => (
                  <li
                    key={index}
                    className="w-20 min-w-20 aspect-square rounded-3xl bg-[#807A7E] shrink-0"
                  ></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full px-6 mt-3 flex flex-col gap-3 flex-1 h-0">
            <div className="flex-1 h-0  flex flex-col gap-3">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="w-full rounded-[30px] bg-[#212121] p-4 flex flex-col gap-3 last:mb-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 aspect-square rounded-full bg-[#807A7E]"></div>
                    <div className="flex flex-col leading-none text-white font-proxima gap-1">
                      <span className="text-[18px] font-bold">ngochuyen</span>
                      <span className="text-white/50">2s ago</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="leading-none text-white/90 font-proxima text-[15px] px-1">
                      <span>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Iste eos itaque explicabo corrupti esse hic error ex
                        option.
                      </span>
                    </div>

                    <figure className="w-full aspect-video rounded-[30px] overflow-hidden bg-[#D9D9D9]"></figure>
                  </div>

                  <div className="flex items-center justify-between">
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

                    <div className="flex items-center gap-1">
                      <button className="w-5 aspect-square">
                        <svg
                          className="w-full h-full"
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M21.2525 16.0177H21.2645"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15.9077 16.0177H15.9197"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10.562 16.0177H10.574"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex items-center justify-between p-6 absolute bottom-0 right-0 w-full">
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
        </aside>
      </section>
    </main>
  )
}
