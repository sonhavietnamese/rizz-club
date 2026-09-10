import { useHeartRate } from '@/hooks/use-heart-rate'
import { useTrading } from '@/hooks/use-trading'
import { formatShares } from '@/lib/format'
import { NO_COLOR, YES_COLOR } from '@/lib/outcome'
import BpmReadout from './bpm-readout'
import IslandButton from './island-button'

export default function PaneTradingZone({
  heartRate,
  reduceMotion,
  onBack,
}: {
  heartRate: ReturnType<typeof useHeartRate>
  reduceMotion: boolean
  onBack: () => void
}) {
  const {
    status,
    tradingOutcome,
    isClaiming,
    isLoadingPositions,
    isLoadingMarket,
    canTrade,
    canTakeProfit,
    canClaim,
    yesPosition,
    noPosition,
    isTakingProfit,
    placeTrade,
    takeProfit,
    claimRewards,
  } = useTrading()

  const statusTone =
    status?.tone === 'error' ? 'text-[#F87171]' : status?.tone === 'success' ? 'text-white' : 'text-white/70'
  const detail =
    status?.message ??
    (isLoadingMarket ? 'Loading live market...' : isLoadingPositions ? 'Syncing positions...' : '5 tUSDC per trade')

  return (
    <div className="flex h-full w-full gap-2">
      <div className="absolute w-[400px] h-[100px] top-[-80px] left-1/2 -translate-x-1/2 z-0">
        <figure className="w-full h-full">
          <svg
            className="w-full h-auto"
            width="366"
            height="81"
            viewBox="0 0 366 81"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="path-1-outside-1_2205_11733"
              maskUnits="userSpaceOnUse"
              x="-0.43988"
              y="0"
              width="366"
              height="81"
              fill="black"
            >
              <rect fill="white" x="-0.43988" width="366" height="81" />
              <path d="M182.578 8C206.903 8.00002 225.694 11.1155 241.44 16.3174C257.195 21.5224 269.296 28.6238 280.188 35.7783C301.766 49.9517 318.1 63.6944 352.703 70.5732L363.596 72.7393H1.56012L12.4537 70.5732C47.0562 63.6943 63.3907 49.9517 84.9683 35.7783C95.8604 28.6238 107.961 21.5223 123.716 16.3174C139.462 11.1155 158.252 8.00003 182.578 8ZM299.501 64.8564C299.857 65.0675 300.216 65.2774 300.576 65.4873C299.855 65.0674 299.142 64.6451 298.435 64.2207L299.501 64.8564Z" />
            </mask>
            <path
              d="M182.578 8C206.903 8.00002 225.694 11.1155 241.44 16.3174C257.195 21.5224 269.296 28.6238 280.188 35.7783C301.766 49.9517 318.1 63.6944 352.703 70.5732L363.596 72.7393H1.56012L12.4537 70.5732C47.0562 63.6943 63.3907 49.9517 84.9683 35.7783C95.8604 28.6238 107.961 21.5223 123.716 16.3174C139.462 11.1155 158.252 8.00003 182.578 8ZM299.501 64.8564C299.857 65.0675 300.216 65.2774 300.576 65.4873C299.855 65.0674 299.142 64.6451 298.435 64.2207L299.501 64.8564Z"
              fill="#1A1A1A"
            />
            <path
              d="M182.578 8V0H182.578L182.578 8ZM241.44 16.3174L243.95 8.7212L243.95 8.72119L241.44 16.3174ZM280.188 35.7783L284.58 29.0918V29.0918L280.188 35.7783ZM352.703 70.5732L354.263 62.7268L354.263 62.7268L352.703 70.5732ZM363.596 72.7393V80.7393L365.156 64.8929L363.596 72.7393ZM1.56012 72.7393L-1.5974e-05 64.8929L1.56012 80.7393V72.7393ZM12.4537 70.5732L10.8938 62.7268L10.8935 62.7268L12.4537 70.5732ZM84.9683 35.7783L80.5762 29.0918L80.5762 29.0918L84.9683 35.7783ZM123.716 16.3174L121.207 8.72118L121.207 8.72119L123.716 16.3174ZM299.501 64.8564L295.401 71.7264L295.414 71.7339L295.426 71.7413L299.501 64.8564ZM298.435 64.2207L302.534 57.3508L294.318 71.0798L298.435 64.2207ZM182.578 8V16C206.201 16 224.126 19.0226 238.93 23.9136L241.44 16.3174L243.95 8.72119C227.263 3.2084 207.606 2.14577e-05 182.578 0V8ZM241.44 16.3174L238.93 23.9136C253.739 28.806 265.175 35.4881 275.796 42.4648L280.188 35.7783L284.58 29.0918C273.417 21.7595 260.65 14.2387 243.95 8.7212L241.44 16.3174ZM280.188 35.7783L275.796 42.4648C296.937 56.3516 314.685 71.172 351.143 78.4197L352.703 70.5732L354.263 62.7268C321.515 56.2167 306.594 43.5518 284.58 29.0918L280.188 35.7783ZM352.703 70.5732L351.143 78.4196L362.036 80.5857L363.596 72.7393L365.156 64.8929L354.263 62.7268L352.703 70.5732ZM363.596 72.7393V64.7393H1.56012V72.7393V80.7393H363.596V72.7393ZM1.56012 72.7393L3.12026 80.5857L14.0138 78.4196L12.4537 70.5732L10.8935 62.7268L-1.5974e-05 64.8929L1.56012 72.7393ZM12.4537 70.5732L14.0135 78.4197C50.4714 71.1719 68.2191 56.3516 89.3604 42.4648L84.9683 35.7783L80.5762 29.0918C58.5623 43.5518 43.6411 56.2167 10.8938 62.7268L12.4537 70.5732ZM84.9683 35.7783L89.3604 42.4648C99.9818 35.4881 111.417 28.806 126.226 23.9136L123.716 16.3174L121.207 8.72119C104.506 14.2387 91.739 21.7595 80.5762 29.0918L84.9683 35.7783ZM123.716 16.3174L126.226 23.9136C141.031 19.0226 158.955 16 182.578 16L182.578 8L182.578 0C157.55 2.95639e-05 137.894 3.20846 121.207 8.72118L123.716 16.3174ZM299.501 64.8564L295.426 71.7413C295.803 71.9645 296.178 72.184 296.547 72.3988L300.576 65.4873L304.605 58.5758C304.253 58.3709 303.911 58.1705 303.575 57.9716L299.501 64.8564ZM300.576 65.4873L304.605 58.5758C303.915 58.1741 303.232 57.7693 302.552 57.3616L298.435 64.2207L294.318 71.0798C295.053 71.5209 295.796 71.9608 296.547 72.3988L300.576 65.4873ZM298.435 64.2207L294.336 71.0906L295.401 71.7264L299.501 64.8564L303.6 57.9865L302.534 57.3508L298.435 64.2207Z"
              fill="#121314"
              mask="url(#path-1-outside-1_2205_11733)"
            />
          </svg>
        </figure>

        <div className="absolute flex justify-center items-center w-full h-full top-0 left-0 z-0">
          <svg width="289" height="56" viewBox="0 0 289 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M144.207 0C191.437 4.15888e-05 215.211 12.0681 236.618 26.0205C252.511 36.379 266.65 47.391 288.414 55.2939H267.119C253.642 48.3116 242.948 40.3964 231.93 33.2148C211.624 19.9805 189.454 8.58793 144.207 8.58789C98.9603 8.58795 76.7909 19.9806 56.4854 33.2148C45.4665 40.3964 34.7724 48.3115 21.2949 55.2939H0C21.7637 47.391 35.9026 36.3791 51.7959 26.0205C73.2034 12.068 96.977 5.71828e-05 144.207 0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      <div className="flex w-full h-full flex-1 justify-center relative z-30 bg-[#1a1a1a] rounded-2xl">
        {/* <div className="flex shrink-0 items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-sans text-xs tabular-nums text-white/80">
              <span style={{ color: YES_COLOR }}>YES {formatShares(yesPosition)}</span>
              <span className="text-white/35"> · </span>
              <span style={{ color: NO_COLOR }}>NO {formatShares(noPosition)}</span>
            </p>
            <p className={`mt-1 truncate font-sans text-[11px] ${statusTone}`} aria-live="polite">
              {detail}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <IslandButton
              onClick={() => void takeProfit()}
              disabled={!canTakeProfit}
              busy={isTakingProfit}
              className="bg-white text-black"
            >
              {isTakingProfit ? 'Selling' : 'TP'}
            </IslandButton>
            <IslandButton
              onClick={() => void claimRewards()}
              disabled={!canClaim}
              busy={isClaiming}
              className="bg-white/15 text-white"
            >
              {isClaiming ? 'Claiming' : 'Claim'}
            </IslandButton>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-2">
          <button
            type="button"
            onClick={() => void placeTrade('YES')}
            disabled={!canTrade}
            className="flex flex-1 flex-col items-center justify-center rounded-xl bg-[#7C5CFF] text-white transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="font-abc-gravity-italic text-[42px] leading-none">UP</span>
            <span className="mt-2 font-sans text-xs text-white/70">
              {tradingOutcome === 'YES' ? 'Buying...' : 'Buy YES'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => void placeTrade('NO')}
            disabled={!canTrade}
            className="flex flex-1 flex-col items-center justify-center rounded-xl bg-[#FF6A3D] text-white transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="font-abc-gravity-italic text-[42px] leading-none">DOWN</span>
            <span className="mt-2 font-sans text-xs text-white/70">
              {tradingOutcome === 'NO' ? 'Buying...' : 'Buy NO'}
            </span>
          </button>
        </div> */}

        <div className="absolute w-1 h-1 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="absolute top-0 h-[180px] w-[514px] flex justify-end left-[-620px] -translate-y-1/2 p-2">
            <figure className="h-full">
              <svg
                className="h-full w-auto"
                width="393"
                height="156"
                viewBox="0 0 393 156"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.0183006 10.3692C-0.325012 4.70809 4.19475 0 9.86625 0H287.879C302.293 0 315.592 7.7554 322.691 20.3005L391.034 141.075C394.806 147.741 389.991 156 382.331 156H63.2945C47.922 156 33.8769 147.21 27.8285 133.077C21.1922 117.571 13.0708 96.9921 8.97974 80.5C3.51896 58.4863 1.00357 26.616 0.0183006 10.3692Z"
                  fill="url(#paint0_linear_2201_11639)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_2201_11639"
                    x1="-0.520264"
                    y1="78"
                    x2="399.48"
                    y2="78"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#222222" stop-opacity="0" />
                    <stop offset="0.519231" stop-color="#222222" />
                  </linearGradient>
                </defs>
              </svg>
            </figure>
          </div>

          <div className="absolute top-0 h-[180px] w-[514px] right-[-620px] -translate-y-1/2 p-2">
            <figure className="h-full">
              <svg
                className="h-full w-auto"
                width="393"
                height="156"
                viewBox="0 0 393 156"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2202_11698)">
                  <path
                    d="M392.327 10.3692C392.671 4.70809 388.151 0 382.479 0H104.467C90.0527 0 76.7532 7.7554 69.6543 20.3005L1.31145 141.075C-2.46081 147.741 2.35504 156 10.0147 156H329.051C344.424 156 358.469 147.21 364.517 133.077C371.153 117.571 379.275 96.9921 383.366 80.5C388.827 58.4863 391.342 26.616 392.327 10.3692Z"
                    fill="url(#paint0_linear_2202_11698)"
                  />
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear_2202_11698"
                    x1="0"
                    y1="78"
                    x2="392.345"
                    y2="78"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#222222" />
                    <stop offset="1" stop-color="#222222" stop-opacity="0" />
                  </linearGradient>
                  <clipPath id="clip0_2202_11698">
                    <rect width="393" height="156" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </figure>
          </div>
        </div>

        <div className="flex items-center flex-col w-[384px] pb-2">
          <div className="relative min-w-[384px] h-fit flex items-center justify-between gap-2">
            <div className="absolute h-[86%] w-[65%] bg-[#222222] z-0 left-1/2 -translate-x-1/2"></div>

            <figure className="z-10">
              <svg width="128" height="106" viewBox="0 0 128 106" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M68.5372 4C82.5094 4 95.0595 12.548 100.176 25.5498L122.733 82.874C126.347 92.0593 119.576 102 109.705 102H69.2628C57.005 102 45.6959 95.4014 39.6641 84.7305L5.83893 24.8887C0.563802 15.556 7.30598 4 18.0264 4H68.5372Z"
                  fill="#222222"
                  stroke="#1A1A1A"
                  strokeWidth="8"
                />
              </svg>
            </figure>

            <figure className="z-10">
              <svg width="128" height="106" viewBox="0 0 128 106" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M59.1855 4C45.2133 4 32.6633 12.548 27.5469 25.5498L4.98926 82.874C1.37524 92.0593 8.14682 102 18.0176 102H58.46C70.7177 102 82.0268 95.4014 88.0586 84.7305L121.884 24.8887C127.159 15.556 120.417 4 109.696 4H59.1855Z"
                  fill="#222222"
                  stroke="#1A1A1A"
                  strokeWidth="8"
                />
              </svg>
            </figure>
          </div>

          <div className="h-full">
            <figure className="z-10 h-full">
              <svg
                className="h-full w-auto"
                width="224"
                height="58"
                viewBox="0 0 224 58"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M91.2256 0H10.0151C2.28769 0 -2.51977 8.39075 1.38815 15.0572L23.664 53.0572C25.4588 56.1189 28.742 58 32.291 58L91.2256 58H151.893L191.5 58C195.049 58 198.332 56.1189 200.127 53.0572L222.403 15.0572C226.311 8.39075 221.503 0 213.776 0H151.893H91.2256Z"
                  fill="#222222"
                />
              </svg>
            </figure>
          </div>
        </div>
      </div>
    </div>
  )
}
