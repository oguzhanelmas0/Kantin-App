import { useState } from 'react'
import { AlertTriangle, Trash2, Lock, Eye, EyeOff } from 'lucide-react'

export default function Settings() {
  const [resetStep, setResetStep] = useState(0) // 0=idle, 1=first confirm, 2=second confirm
  const [resetDone, setResetDone] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function handleReset() {
    await window.api.settings.reset()
    setResetStep(0)
    setResetDone(true)
    setTimeout(() => setResetDone(false), 3000)
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)

    const stored = await window.api.admin.getPassword()
    if (currentPw !== stored) {
      setPwError('Mevcut şifre yanlış.')
      setCurrentPw('')
      return
    }
    if (newPw.length < 4) {
      setPwError('Yeni şifre en az 4 karakter olmalı.')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('Yeni şifreler eşleşmiyor.')
      return
    }

    await window.api.admin.setPassword(newPw)
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    setPwSuccess(true)
    setTimeout(() => setPwSuccess(false), 3000)
  }

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none'
  }

  return (
    <div style={{ height: '100%', background: '#f8fafc', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Ayarlar</h2>
      </div>

      <div style={{ padding: 24, maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* App info */}
        <div style={{ background: 'white', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Uygulama Bilgileri</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Uygulama', 'Kantin Yönetim Sistemi'],
              ['Versiyon', '1.0.0'],
              ['Veritabanı', 'SQLite (Yerel)']
            ].map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>{key}</span>
                <span style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Şifre değiştir */}
        <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={16} color="#374151" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Yönetici Şifresi</span>
          </div>

          <form onSubmit={handleChangePassword} style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  Mevcut Şifre
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={currentPw}
                  onChange={(e) => { setCurrentPw(e.target.value); setPwError('') }}
                  placeholder="Mevcut şifrenizi girin"
                  style={{ ...inputStyle, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: 32, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  Yeni Şifre
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={(e) => { setNewPw(e.target.value); setPwError('') }}
                  placeholder="En az 4 karakter"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  Yeni Şifre Tekrar
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={(e) => { setConfirmPw(e.target.value); setPwError('') }}
                  placeholder="Yeni şifreyi tekrar girin"
                  style={inputStyle}
                />
              </div>

              {pwError && (
                <div style={{ color: '#ef4444', fontSize: 13 }}>{pwError}</div>
              )}
              {pwSuccess && (
                <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, color: '#16a34a', fontSize: 14 }}>
                  Şifre başarıyla güncellendi.
                </div>
              )}

              <button
                type="submit"
                style={{
                  padding: '9px 18px', background: '#1e293b', color: 'white',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14
                }}
              >
                Şifreyi Güncelle
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #fee2e2' }}>
          <div style={{ padding: '14px 20px', background: '#fef2f2', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="#dc2626" />
            <span style={{ fontWeight: 700, color: '#dc2626', fontSize: 15 }}>Tehlikeli Bölge</span>
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Sistemi Sıfırla</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                Tüm ürünler, hesaplar, satış geçmişi ve bakiye kayıtları <strong>kalıcı olarak silinir</strong>.
                Yönetici şifresi korunur. Bu işlem geri alınamaz.
              </div>
            </div>

            {resetDone && (
              <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, color: '#16a34a', fontSize: 14, marginBottom: 12 }}>
                Sistem sıfırlandı. Tüm veriler silindi.
              </div>
            )}

            {resetStep === 0 && (
              <button
                onClick={() => setResetStep(1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 18px', background: 'white', color: '#dc2626',
                  border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14
                }}
              >
                <Trash2 size={15} />
                Sistemi Sıfırla
              </button>
            )}

            {resetStep === 1 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#dc2626' }}>Emin misin?</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
                  Tüm verileri silmek istediğinden emin misin? Bu işlem geri alınamaz.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setResetStep(0)} style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                    İptal
                  </button>
                  <button onClick={() => setResetStep(2)} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                    Evet, devam et
                  </button>
                </div>
              </div>
            )}

            {resetStep === 2 && (
              <div style={{ background: '#fef2f2', border: '2px solid #dc2626', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#dc2626', fontSize: 15 }}>Son uyarı!</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
                  Tüm veriler <strong>kalıcı olarak</strong> silinecek. Gerçekten emin misin?
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setResetStep(0)} style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                    İptal
                  </button>
                  <button onClick={handleReset} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: '#7f1d1d', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                    Evet, tüm verileri sil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
