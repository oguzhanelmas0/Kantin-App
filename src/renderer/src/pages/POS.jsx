import { useState, useRef, useEffect, useCallback } from 'react'
import { Scan, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import AccountModal from '../components/AccountModal'

export default function POS() {
  const [cart, setCart] = useState([])
  const [barcodeInput, setBarcodeInput] = useState('')
  const [toast, setToast] = useState(null)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [saleSuccess, setSaleSuccess] = useState(null)
  const inputRef = useRef(null)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Always keep barcode input focused
  useEffect(() => {
    const focusInput = () => inputRef.current?.focus()
    document.addEventListener('click', focusInput)
    focusInput()
    return () => document.removeEventListener('click', focusInput)
  }, [])

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  async function handleBarcodeSubmit(e) {
    e.preventDefault()
    const barcode = barcodeInput.trim()
    if (!barcode) return
    setBarcodeInput('')

    const product = await window.api.products.getByBarcode(barcode)
    if (!product) {
      showToast(`Barkod bulunamadı: ${barcode}`, 'error')
      return
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    showToast(`${product.name} sepete eklendi`)
    inputRef.current?.focus()
  }

  function changeQty(id, delta) {
    setCart((prev) => {
      return prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    })
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  function clearCart() {
    setCart([])
    inputRef.current?.focus()
  }

  async function handleNakit() {
    if (cart.length === 0) return
    await window.api.sales.make({ items: cart, total, paymentType: 'nakit', accountId: null })
    setCart([])
    setSaleSuccess({ type: 'nakit', total })
    setTimeout(() => setSaleSuccess(null), 2000)
    inputRef.current?.focus()
  }

  async function handleHesapConfirm(account) {
    setShowAccountModal(false)
    await window.api.sales.make({ items: cart, total, paymentType: 'hesap', accountId: account.id })
    setCart([])
    setSaleSuccess({ type: 'hesap', total, accountName: account.name })
    setTimeout(() => setSaleSuccess(null), 2500)
    inputRef.current?.focus()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            borderRadius: 8,
            background: toast.type === 'error' ? '#ef4444' : '#16a34a',
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
            zIndex: 999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Sale success overlay */}
      {saleSuccess && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(22,163,74,0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 998,
            color: 'white'
          }}
        >
          <div style={{ fontSize: 64 }}>✓</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Satış Tamamlandı</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>{saleSuccess.total.toFixed(2)} ₺</div>
          {saleSuccess.accountName && (
            <div style={{ fontSize: 16, marginTop: 8, opacity: 0.9 }}>{saleSuccess.accountName} hesabından düşüldü</div>
          )}
        </div>
      )}

      {/* Barcode input */}
      <div
        style={{
          padding: '12px 16px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <form onSubmit={handleBarcodeSubmit}>
          <div style={{ position: 'relative' }}>
            <Scan
              size={20}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Barkod okutun veya girin..."
              autoFocus
              style={{
                width: '100%',
                padding: '11px 14px 11px 44px',
                fontSize: 16,
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                outline: 'none',
                background: '#f8fafc',
                transition: 'border-color 0.15s'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>
        </form>
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Cart items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {cart.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#94a3b8'
              }}
            >
              <ShoppingBag size={48} strokeWidth={1} />
              <p style={{ marginTop: 12, fontSize: 15 }}>Sepet boş</p>
              <p style={{ margin: 0, fontSize: 13 }}>Barkod okutarak ürün ekleyin</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'white',
                    borderRadius: 10,
                    padding: '12px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                  }}
                >
                  {/* Name */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                    <div style={{ color: '#64748b', fontSize: 13 }}>
                      {item.price.toFixed(2)} ₺ × {item.quantity}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b'
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ width: 24, textAlign: 'center', fontWeight: 700 }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b'
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Item total */}
                  <div
                    style={{
                      width: 80,
                      textAlign: 'right',
                      fontWeight: 700,
                      fontSize: 15,
                      color: '#111827'
                    }}
                  >
                    {(item.price * item.quantity).toFixed(2)} ₺
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      marginLeft: 12,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      padding: 4
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel - Total & Payment */}
        <div
          style={{
            width: 280,
            background: 'white',
            borderLeft: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            padding: 16
          }}
        >
          {/* Item count */}
          <div style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>
            {cart.reduce((s, i) => s + i.quantity, 0)} ürün
          </div>

          {/* Total */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
              textAlign: 'center'
            }}
          >
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>TOPLAM</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#111827' }}>
              {total.toFixed(2)} ₺
            </div>
          </div>

          {/* Payment buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            <button
              onClick={handleNakit}
              disabled={cart.length === 0}
              style={{
                padding: '14px 0',
                borderRadius: 10,
                border: 'none',
                background: cart.length === 0 ? '#d1fae5' : '#16a34a',
                color: cart.length === 0 ? '#6ee7b7' : 'white',
                fontWeight: 700,
                fontSize: 16,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s'
              }}
            >
              Nakit Öde
            </button>

            <button
              onClick={() => setShowAccountModal(true)}
              disabled={cart.length === 0}
              style={{
                padding: '14px 0',
                borderRadius: 10,
                border: 'none',
                background: cart.length === 0 ? '#dbeafe' : '#2563eb',
                color: cart.length === 0 ? '#93c5fd' : 'white',
                fontWeight: 700,
                fontSize: 16,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s'
              }}
            >
              Hesaptan Düş
            </button>

            <div style={{ flex: 1 }} />

            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              style={{
                padding: '10px 0',
                borderRadius: 10,
                border: '1px solid #fecaca',
                background: 'white',
                color: cart.length === 0 ? '#fca5a5' : '#ef4444',
                fontWeight: 600,
                fontSize: 14,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Sepeti Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Account modal */}
      {showAccountModal && (
        <AccountModal
          total={total}
          onConfirm={handleHesapConfirm}
          onCancel={() => {
            setShowAccountModal(false)
            inputRef.current?.focus()
          }}
        />
      )}
    </div>
  )
}
