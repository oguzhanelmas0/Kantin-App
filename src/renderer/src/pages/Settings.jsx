import { useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'

export default function Settings() {
  const [step, setStep] = useState(0) // 0=idle, 1=first confirm, 2=second confirm
  const [done, setDone] = useState(false)

  async function handleReset() {
    await window.api.settings.reset()
    setStep(0)
    setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  return (
    <div style={{ height: '100%', background: '#f8fafc', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Ayarlar</h2>
      </div>

      <div style={{ padding: 24, maxWidth: 560 }}>
        {/* App info */}
        <div style={{ background: 'white', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
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

        {/* Danger zone */}
        <div
          style={{
            background: 'white',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid #fee2e2'
          }}
        >
          <div style={{ padding: '14px 20px', background: '#fef2f2', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="#dc2626" />
            <span style={{ fontWeight: 700, color: '#dc2626', fontSize: 15 }}>Tehlikeli Bölge</span>
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Sistemi Sıfırla</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                Tüm ürünler, hesaplar, satış geçmişi ve bakiye kayıtları <strong>kalıcı olarak silinir</strong>.
                Bu işlem geri alınamaz.
              </div>
            </div>

            {done && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  color: '#16a34a',
                  fontSize: 14,
                  marginBottom: 12
                }}
              >
                Sistem sıfırlandı. Tüm veriler silindi.
              </div>
            )}

            {step === 0 && (
              <button
                onClick={() => setStep(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  background: 'white',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                <Trash2 size={15} />
                Sistemi Sıfırla
              </button>
            )}

            {step === 1 && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  padding: 16
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#dc2626' }}>Emin misin?</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
                  Tüm verileri silmek istediğinden emin misin? Bu işlem geri alınamaz.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setStep(0)}
                    style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                  >
                    Evet, devam et
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '2px solid #dc2626',
                  borderRadius: 10,
                  padding: 16
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#dc2626', fontSize: 15 }}>
                  Son uyarı!
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
                  Tüm veriler <strong>kalıcı olarak</strong> silinecek. Gerçekten emin misin?
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setStep(0)}
                    style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleReset}
                    style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: '#7f1d1d', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
                  >
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
