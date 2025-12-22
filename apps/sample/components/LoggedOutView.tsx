import React, { useContext } from 'react'
import { useWepin } from '@/lib/wepin'

const LoggedOutView: React.FC = () => {
  const { loginWithUI, loginWithOAuth } = useWepin()

  return (
    <div className="content centered-content">
      <div className="welcome-card">
        <h2 className="section-title">Welcome to the Wepin React Demo</h2>
        <p className="welcome-message">
          Please sign in to view your account and manage your transactions.
        </p>
        <div className="actions-group">
          <button onClick={loginWithUI} className="button-primary">
            Sign In with Wepin Widget
          </button>
          <button onClick={loginWithOAuth} className="button-secondary">
            Sign In with Google (Without Wepin Widget)
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoggedOutView
