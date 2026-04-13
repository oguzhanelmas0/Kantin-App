import { useState, useEffect } from 'react'
import { Lock, X, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginModal({ onSuccess, onCancel }) {
  const [hasPassword, setHasPassword] = useState(null) // null = yükleniyor
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    window.api.admin.getPassword().then((pw) => {
      setHasPassword(pw !== null)
    })
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    const stored = await window.api.admin.getPassword()
    if (password === stored) {
      onSuccess()
    } else {
      setError('Yanlış şifre.')
      setPassword('')
    }
  }

  async function handleSetPassword(e) {
    e.preventDefault()
    if (newPassword.length < 4) {
      setError('Şifre en az 4 karakter olmalı.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    await window.api.admin.setPassword(newPassword)
    onSuccess()
  }

  if (hasPassword === null) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 14,
          padding: 32,
          width: 380,
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}
          >
            <Lock size={20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Yönetici Paneli</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {hasPassword ? 'Şifrenizi girin' : 'İlk kez şifre belirleyin'}
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Şifre giriş formu */}
        {hasPassword ? (
          <form onSubmit={handleLogin}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  Şifre
                </label>
                <input
                  autoFocus
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Yönetici şifresi"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 32,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: 2
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>}

              <button
                type="submit"
                style={{
                  padding: '11px 0',
                  background: '#1e293b',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: 4
                }}
              >
                Giriş Yap
              </button>
            </div>
          </form>
        ) : (
          /* İlk kez şifre belirleme formu */
          <form onSubmit={handleSetPassword}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  padding: '10px 14px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#1d4ed8'
                }}
              >
                İlk kez giriş yapıyorsunuz. Yönetici şifresi belirleyin.
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  Yeni Şifre
                </label>
                <input
                  autoFocus
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                  placeholder="En az 4 karakter"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 32,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: 2
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  Şifre Tekrar
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  placeholder="Şifreyi tekrar girin"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>}

              <button
                type="submit"
                style={{
                  padding: '11px 0',
                  background: '#1e293b',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: 4
                }}
              >
                Şifreyi Belirle ve Giriş Yap
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
