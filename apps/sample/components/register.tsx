import React, { useContext } from 'react'
import { WepinContext } from '@/lib/wepin'

const RegisterView: React.FC = () => {
  const { registerWepin, logout } = useContext(WepinContext)!

  return (
    <>
      <button onClick={registerWepin} className="button-primary">
        Register with Wepin
      </button>
      <button onClick={logout} className="button-danger">
        Log Out
      </button>
    </>
  )
}

export default RegisterView
