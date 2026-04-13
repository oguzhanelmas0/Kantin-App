import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ barcode: '', name: '', price: '', purchasePrice: '', stock: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [error, setError] = useState('')

  async function loadProducts() {
    const data = await window.api.products.getAll()
    setProducts(data)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search)
  )

  function openAdd() {
    setForm({ barcode: '', name: '', price: '', purchasePrice: '', stock: '' })
    setEditingId(null)
    setError('')
    setShowForm(true)
  }

  function openEdit(product) {
    setForm({
      barcode: product.barcode,
      name: product.name,
      price: String(product.price),
      purchasePrice: String(product.purchase_price || ''),
      stock: String(product.stock || '')
    })
    setEditingId(product.id)
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const price = parseFloat(form.price)
    const purchasePrice = form.purchasePrice !== '' ? parseFloat(form.purchasePrice) : 0
    const stock = form.stock !== '' ? parseInt(form.stock) : 0

    if (!form.barcode.trim() || !form.name.trim() || isNaN(price) || price <= 0) {
      setError('Lütfen barkod, isim ve satış fiyatını doğru doldurun.')
      return
    }
    if (isNaN(purchasePrice) || purchasePrice < 0) {
      setError('Alış fiyatı geçersiz.')
      return
    }
    if (isNaN(stock) || stock < 0) {
      setError('Stok adedi geçersiz.')
      return
    }

    try {
      if (editingId) {
        await window.api.products.update({
          id: editingId,
          name: form.name.trim(),
          price,
          purchasePrice,
          stock
        })
      } else {
        await window.api.products.add({
          barcode: form.barcode.trim(),
          name: form.name.trim(),
          price,
          purchasePrice,
          stock
        })
      }
      await loadProducts()
      closeForm()
    } catch (err) {
      setError('Bu barkod zaten kayıtlı.')
    }
  }

  async function handleDelete(id) {
    await window.api.products.delete(id)
    setDeleteTarget(null)
    await loadProducts()
  }

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none'
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 4
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, flex: 1 }}>Ürünler</h2>

        <div style={{ position: 'relative', width: 240 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Ürün veya barkod ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px 8px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%' }}
          />
        </div>

        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', background: '#2563eb', color: 'white',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14
          }}
        >
          <Plus size={16} />
          Yeni Ürün
        </button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>
            {products.length === 0 ? 'Henüz ürün eklenmedi.' : 'Arama sonucu bulunamadı.'}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 110px 110px 80px 88px',
                padding: '10px 16px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: 12,
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <div>Barkod</div>
              <div>Ürün Adı</div>
              <div style={{ textAlign: 'right' }}>Alış Fiyatı</div>
              <div style={{ textAlign: 'right' }}>Satış Fiyatı</div>
              <div style={{ textAlign: 'right' }}>Stok</div>
              <div />
            </div>

            {filtered.map((product, idx) => (
              <div
                key={product.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 110px 110px 80px 88px',
                  padding: '13px 16px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#64748b' }}>
                  {product.barcode}
                </div>
                <div style={{ fontWeight: 500 }}>{product.name}</div>
                <div style={{ textAlign: 'right', fontSize: 13, color: '#64748b' }}>
                  {(product.purchase_price || 0).toFixed(2)} ₺
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700 }}>
                  {product.price.toFixed(2)} ₺
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    fontWeight: 600,
                    color: (product.stock || 0) === 0 ? '#ef4444' : (product.stock || 0) <= 5 ? '#f59e0b' : '#16a34a'
                  }}
                >
                  {product.stock || 0}
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => openEdit(product)}
                    style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b' }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(product)}
                    style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #fecaca', background: 'white', cursor: 'pointer', color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit form modal */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={closeForm}
        >
          <div
            style={{ background: 'white', borderRadius: 12, padding: 28, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, flex: 1 }}>
                {editingId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h3>
              <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Barkod</label>
                  <input
                    autoFocus
                    type="text"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    disabled={!!editingId}
                    placeholder="Barkodu girin veya okutun"
                    style={{ ...inputStyle, background: editingId ? '#f9fafb' : 'white' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Ürün Adı</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ürün adını girin"
                    style={inputStyle}
                  />
                </div>

                {/* Fiyat satırı */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Alış Fiyatı (₺)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.purchasePrice}
                      onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Satış Fiyatı (₺)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Stok Adedi</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>

                {error && <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>}

                <button
                  type="submit"
                  style={{
                    padding: '10px 0', background: '#2563eb', color: 'white',
                    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
                    cursor: 'pointer', marginTop: 4
                  }}
                >
                  {editingId ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmModal
          title="Ürünü Sil"
          message={`"${deleteTarget.name}" ürününü silmek istediğinize emin misiniz?`}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
