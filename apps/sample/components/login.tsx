import React, { useContext } from 'react'
import { WepinContext } from '@/lib/wepin'
import RegisterView from './register'
import WidgetView from './v'

const LoggedInView: React.FC = () => {
  const { registrationNeeded } = useContext(WepinContext)!

  return (
    <div className="content">
      <div className="main-content">
        {registrationNeeded ? (
          <RegisterView />
        ) : (
          <>
            <WidgetView />
            {/* <EvmProviderView /> */}
          </>
        )}
      </div>
    </div>
  )
}

export default LoggedInView
