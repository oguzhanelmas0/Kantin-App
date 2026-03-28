import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, ShoppingBag, Wallet, Award } from 'lucide-react'

function today() {
  return new Date().toISOString().split('T')[0]
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const PRESETS = [
  { label: 'Bugün', start: today(), end: today() },
  { label: 'Bu Hafta', start: daysAgo(6), end: today() },
  { label: 'Bu Ay', start: daysAgo(29), end: today() }
]

export default function Reports() {
  const [preset, setPreset] = useState(0)
  const [customStart, setCustomStart] = useState(today())
  const [customEnd, setCustomEnd] = useState(today())
  const [useCustom, setUseCustom] = useState(false)
  const [data, setData] = useState(null)
  const [expandedSale, setExpandedSale] = useState(null)
  const [saleItems, setSaleItems] = useState({})

  async function load() {
    const start = useCustom ? customStart : PRESETS[preset].start
    const end = useCustom ? customEnd : PRESETS[preset].end
    const result = await window.api.reports.get({ startDate: start, endDate: end })
    setData(result)
  }

  useEffect(() => {
    load()
  }, [preset, useCustom, customStart, customEnd])

  async function toggleSale(saleId) {
    if (expandedSale === saleId) {
      setExpandedSale(null)
      return
    }
    setExpandedSale(saleId)
    if (!saleItems[saleId]) {
      const items = await window.api.sales.getItems(saleId)
      setSaleItems((prev) => ({ ...prev, [saleId]: items }))
    }
  }

  function formatDate(str) {
    return new Date(str).toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const statCards = data
    ? [
        { icon: ShoppingBag, label: 'Toplam Satış', value: data.summary.total_sales, color: '#3b82f6', bg: '#eff6ff', unit: '' },
        { icon: TrendingUp, label: 'Toplam Ciro', value: data.summary.total_revenue.toFixed(2), color: '#16a34a', bg: '#f0fdf4', unit: ' ₺' },
        { icon: Wallet, label: 'Nakit', value: data.summary.nakit_revenue.toFixed(2), color: '#0891b2', bg: '#ecfeff', unit: ' ₺' },
        { icon: Wallet, label: 'Hesaptan', value: data.summary.hesap_revenue.toFixed(2), color: '#7c3aed', bg: '#f5f3ff', unit: ' ₺' },
        { icon: TrendingUp, label: 'Kantin Toplam', value: data.kantinBalance.toFixed(2), color: '#dc2626', bg: '#fef2f2', unit: ' ₺' }
      ]
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc', overflowY: 'auto' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, flex: 1 }}>Raporlar</h2>

        {/* Preset buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => { setPreset(i); setUseCustom(false) }}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: '1px solid',
                borderColor: !useCustom && preset === i ? '#2563eb' : '#e5e7eb',
                background: !useCustom && preset === i ? '#2563eb' : 'white',
                color: !useCustom && preset === i ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: !useCustom && preset === i ? 600 : 400
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={14} color="#64748b" />
          <input
            type="date"
            value={customStart}
            onChange={(e) => { setCustomStart(e.target.value); setUseCustom(true) }}
            style={{ padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}
          />
          <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => { setCustomEnd(e.target.value); setUseCustom(true) }}
            style={{ padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}
          />
        </div>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Stat cards */}
        {data && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {statCards.map(({ icon: Icon, label, value, color, bg, unit }) => (
              <div
                key={label}
                style={{
                  flex: '1 1 160px',
                  background: 'white',
                  borderRadius: 10,
                  padding: 16,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={color} />
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
                  {value}{unit}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top products */}
        {data && data.topProducts.length > 0 && (
          <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={16} color="#f59e0b" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>En Çok Satan Ürünler</span>
            </div>
            {data.topProducts.map((p, i) => (
              <div
                key={p.product_name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '11px 16px',
                  borderBottom: i < data.topProducts.length - 1 ? '1px solid #f8fafc' : 'none'
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: i === 0 ? '#fef3c7' : '#f1f5f9',
                    color: i === 0 ? '#d97706' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    marginRight: 12,
                    flexShrink: 0
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, fontWeight: 500 }}>{p.product_name}</div>
                <div style={{ color: '#64748b', fontSize: 13, marginRight: 16 }}>{p.total_quantity} adet</div>
                <div style={{ fontWeight: 700 }}>{p.total_revenue.toFixed(2)} ₺</div>
              </div>
            ))}
          </div>
        )}

        {/* Sales list */}
        {data && (
          <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 15 }}>
              Satış Listesi ({data.sales.length})
            </div>
            {data.sales.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Bu dönemde satış yok.</div>
            ) : (
              data.sales.map((sale, idx) => (
                <div key={sale.id}>
                  <button
                    onClick={() => toggleSale(sale.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: 'none',
                      borderBottom: expandedSale !== sale.id && idx < data.sales.length - 1 ? '1px solid #f8fafc' : 'none',
                      background: 'white',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>{formatDate(sale.created_at)}</div>
                      {sale.payment_type === 'hesap' && sale.account_name && (
                        <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 1 }}>{sale.account_name}</div>
                      )}
                    </div>
                    <div
                      style={{
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: sale.payment_type === 'nakit' ? '#ecfdf5' : '#f5f3ff',
                        color: sale.payment_type === 'nakit' ? '#16a34a' : '#7c3aed',
                        marginRight: 12
                      }}
                    >
                      {sale.payment_type === 'nakit' ? 'Nakit' : 'Hesap'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{sale.total.toFixed(2)} ₺</div>
                  </button>

                  {/* Expanded items */}
                  {expandedSale === sale.id && saleItems[sale.id] && (
                    <div style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9', padding: '8px 16px 12px 52px' }}>
                      {saleItems[sale.id].map((item) => (
                        <div key={item.id} style={{ display: 'flex', fontSize: 13, color: '#374151', padding: '3px 0' }}>
                          <span style={{ flex: 1 }}>{item.product_name}</span>
                          <span style={{ color: '#64748b' }}>×{item.quantity}</span>
                          <span style={{ width: 70, textAlign: 'right' }}>{(item.product_price * item.quantity).toFixed(2)} ₺</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
