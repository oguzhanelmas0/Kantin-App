import { useState, useEffect } from 'react'
import { Search, X, AlertCircle } from 'lucide-react'

export default function AccountModal({ total, onConfirm, onCancel }) {
  const [accounts, setAccounts] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    window.api.accounts.getAll().then(setAccounts)
  }, [])

  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  function formatBalance(bal) {
    const color = bal < 0 ? '#ef4444' : bal === 0 ? '#6b7280' : '#16a34a'
    return (
      <span style={{ color, fontWeight: 600 }}>
        {bal >= 0 ? '+' : ''}{bal.toFixed(2)} ₺
      </span>
    )
  }

  function handleSelect(account) {
    setSelected(account)
    setConfirming(true)
  }

  if (confirming && selected) {
    const newBalance = selected.balance - total
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 28,
            width: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Emin misin?</h3>

          <div
            style={{
              background: '#f8fafc',
              borderRadius: 8,
              padding: 16,
              marginBottom: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Hesap</span>
              <span style={{ fontWeight: 600 }}>{selected.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Mevcut Bakiye</span>
              {formatBalance(selected.balance)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Ödenecek Tutar</span>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>-{total.toFixed(2)} ₺</span>
            </div>
            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: 8,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ color: '#6b7280', fontSize: 14 }}>Yeni Bakiye</span>
              {formatBalance(newBalance)}
            </div>
          </div>

          {newBalance < 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fef2f2',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                color: '#dc2626',
                fontSize: 13
              }}
            >
              <AlertCircle size={16} />
              Bakiye yetersiz — hesap borçlu olacak.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setConfirming(false)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              Geri
            </button>
            <button
              onClick={() => onConfirm(selected)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 8,
                border: 'none',
                background: '#2563eb',
                color: 'white',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              Onayla
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          width: 480,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hesap Seç</h3>
            <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 13 }}>
              Toplam: <strong style={{ color: '#111' }}>{total.toFixed(2)} ₺</strong>
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
            />
            <input
              autoFocus
              type="text"
              placeholder="İsimle ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Account list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
              Hesap bulunamadı
            </div>
          ) : (
            filtered.map((account) => (
              <button
                key={account.id}
                onClick={() => handleSelect(account)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  border: 'none',
                  borderBottom: '1px solid #f8fafc',
                  background: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{account.name}</div>
                </div>
                <div>{formatBalance(account.balance)}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
