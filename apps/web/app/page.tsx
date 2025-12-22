'use client'

import { useConnect } from 'wagmi'

export default function Page() {
  const { connectors, connect, status, error } = useConnect()

  // const handleLogin = async () => {
  //   // wepin is guaranteed to be non-null here because button is disabled during initialization

  //   const status = await wepin.getStatus()
  //   console.log(status)
  // }

  // const handleOpenWidget = async () => {
  //   wepin.loginWithUI()
  // }

  return (
    <main className="w-full h-screen flex items-center justify-center gap-4">
      {/* <button onClick={handleLogin}>get status</button>

      <button onClick={handleOpenWidget}>open widget</button> */}

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>status: {status}</div>
        <div style={{ color: 'red' }}>{error?.message}</div>
      </div>
    </main>
  )
}
