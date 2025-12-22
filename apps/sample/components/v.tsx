import React, { useContext, useState } from 'react'
import { WepinContext } from '@/lib/wepin'

const WidgetView: React.FC = () => {
  const { accountDetails, openWidget, logout, send } = useContext(WepinContext)!

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAccountIdx, setSelectedAccountIdx] = useState<number>()
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')

  const openSendDialog = () => {
    if (!accountDetails || accountDetails.length === 0) {
      alert('No account details found.')
      return
    }
    setSelectedAccountIdx(0)
    setIsDialogOpen(true)
  }

  const handleSend = () => {
    if (!selectedAccountIdx || !accountDetails) {
      alert('No account selected.')
      return
    }
    const account = accountDetails[selectedAccountIdx]
    if (!account) {
      alert('No account selected.')
      return
    }

    if (!toAddress || !amount) {
      send({ account })
    } else {
      send({ account, txData: { toAddress, amount } })
    }
    setIsDialogOpen(false)
    // 입력 필드 초기화
    setToAddress('')
    setAmount('')
  }

  return (
    <div className="action-section">
      <h3 className="action-title">Widget Methods</h3>
      <div className="actions-group">
        <button onClick={openWidget} className="button-primary">
          Open Wepin Widget
        </button>
        <button onClick={logout} className="button-danger">
          Log Out
        </button>
        <button onClick={openSendDialog} className="button-primary">
          Send
        </button>
      </div>

      {isDialogOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Send Transaction</h3>
            <div className="form-group">
              <label htmlFor="account">Select Account:</label>
              <select
                id="account"
                value={selectedAccountIdx}
                onChange={(e) => setSelectedAccountIdx(Number(e.target.value))}
              >
                {accountDetails?.map((acc, idx) => (
                  <option key={idx} value={idx}>
                    {acc.network}: {acc.address}
                    {acc.contract && ` (contract: ${acc.contract})`}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="toAddress">To Address:</label>
              <input
                id="toAddress"
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount:</label>
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSend} className="button-primary">
                Send
              </button>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="button-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WidgetView
