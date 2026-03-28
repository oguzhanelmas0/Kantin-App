import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, X, TrendingUp, TrendingDown, ChevronRight, ArrowLeft } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBalanceForm, setShowBalanceForm] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [newName, setNewName] = useState('')
  const [balanceForm, setBalanceForm] = useState({ amount: '', type: 'deposit', description: '' })
  const [error, setError] = useState('')

  async function loadAccounts() {
    const data = await window.api.accounts.getAll()
    setAccounts(data)
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  async function openAccount(account) {
    setSelectedAccount(account)
    const tx = await window.api.accounts.getTransactions(account.id)
    setTransactions(tx)
  }

  async function refreshAccount(id) {
    const data = await window.api.accounts.getAll()
    setAccounts(data)
    const updated = data.find((a) => a.id === id)
    if (updated) {
      setSelectedAccount(updated)
      const tx = await window.api.accounts.getTransactions(id)
      setTransactions(tx)
    }
  }

  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAddAccount(e) {
    e.preventDefault()
    if (!newName.trim()) return
    await window.api.accounts.add({ name: newName.trim() })
    setNewName('')
    setShowAddForm(false)
    await loadAccounts()
  }

  async function handleBalanceUpdate(e) {
    e.preventDefault()
    const amount = parseFloat(balanceForm.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Geçerli bir tutar girin.')
      return
    }
    const finalAmount = balanceForm.type === 'deposit' ? amount : -amount
    await window.api.accounts.updateBalance({
      accountId: selectedAccount.id,
      amount: finalAmount,
      type: balanceForm.type,
      description: balanceForm.description || (balanceForm.type === 'deposit' ? 'Para yükleme' : 'Para çekme')
    })
    setBalanceForm({ amount: '', type: 'deposit', description: '' })
    setShowBalanceForm(false)
    setError('')
    await refreshAccount(selectedAccount.id)
  }

  async function handleDelete(id) {
    await window.api.accounts.delete(id)
    setDeleteTarget(null)
    if (selectedAccount?.id === id) setSelectedAccount(null)
    await loadAccounts()
  }

  function formatDate(str) {
    return new Date(str).toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  function txLabel(type) {
    switch (type) {
      case 'deposit': return 'Para Yükleme'
      case 'withdrawal': return 'Para Çekme'
      case 'sale': return 'Satış'
      default: return type
    }
  }

  // Detail view
  if (selectedAccount) {
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
          <button
            onClick={() => setSelectedAccount(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{selectedAccount.name}</h2>
            <div style={{ fontSize: 13, color: selectedAccount.balance < 0 ? '#ef4444' : '#16a34a', fontWeight: 600 }}>
              Bakiye: {selectedAccount.balance >= 0 ? '+' : ''}{selectedAccount.balance.toFixed(2)} ₺
            </div>
          </div>
          <button
            onClick={() => { setBalanceForm({ amount: '', type: 'deposit', description: '' }); setShowBalanceForm(true); setError('') }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}
          >
            Para İşlemi
          </button>
          <button
            onClick={() => setDeleteTarget(selectedAccount)}
            style={{
              padding: '8px 12px',
              background: 'white',
              border: '1px solid #fecaca',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#ef4444'
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Transactions */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>
              Henüz işlem yok.
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {transactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '13px 16px',
                    borderBottom: idx < transactions.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: tx.amount > 0 ? '#dcfce7' : '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      flexShrink: 0
                    }}
                  >
                    {tx.amount > 0
                      ? <TrendingUp size={16} color="#16a34a" />
                      : <TrendingDown size={16} color="#ef4444" />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{tx.description || txLabel(tx.type)}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{formatDate(tx.created_at)}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: tx.amount > 0 ? '#16a34a' : '#ef4444' }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} ₺
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Balance form modal */}
        {showBalanceForm && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
            onClick={() => setShowBalanceForm(false)}
          >
            <div
              style={{ background: 'white', borderRadius: 12, padding: 28, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, flex: 1 }}>Para İşlemi</h3>
                <button onClick={() => setShowBalanceForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleBalanceUpdate}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Type toggle */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['deposit', 'withdrawal'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBalanceForm({ ...balanceForm, type: t })}
                        style={{
                          flex: 1,
                          padding: '8px 0',
                          borderRadius: 8,
                          border: '2px solid',
                          borderColor: balanceForm.type === t ? (t === 'deposit' ? '#16a34a' : '#ef4444') : '#e5e7eb',
                          background: balanceForm.type === t ? (t === 'deposit' ? '#f0fdf4' : '#fef2f2') : 'white',
                          color: balanceForm.type === t ? (t === 'deposit' ? '#16a34a' : '#ef4444') : '#6b7280',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: 14
                        }}
                      >
                        {t === 'deposit' ? 'Para Yükle' : 'Para Çek'}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Tutar (₺)</label>
                    <input
                      autoFocus
                      type="number"
                      step="0.01"
                      min="0"
                      value={balanceForm.amount}
                      onChange={(e) => setBalanceForm({ ...balanceForm, amount: e.target.value })}
                      placeholder="0.00"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Açıklama (opsiyonel)</label>
                    <input
                      type="text"
                      value={balanceForm.description}
                      onChange={(e) => setBalanceForm({ ...balanceForm, description: e.target.value })}
                      placeholder="İşlem açıklaması"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
                    />
                  </div>

                  {error && <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>}

                  <button
                    type="submit"
                    style={{
                      padding: '10px 0',
                      background: balanceForm.type === 'deposit' ? '#16a34a' : '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: 4
                    }}
                  >
                    {balanceForm.type === 'deposit' ? 'Para Yükle' : 'Para Çek'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteTarget && (
          <ConfirmModal
            title="Hesabı Sil"
            message={`"${deleteTarget.name}" hesabını ve tüm işlem geçmişini silmek istediğinize emin misiniz?`}
            onConfirm={() => handleDelete(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </div>
    )
  }

  // List view
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
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, flex: 1 }}>Hesaplar</h2>

        <div style={{ position: 'relative', width: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Hesap ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px 8px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%' }}
          />
        </div>

        <button
          onClick={() => { setNewName(''); setShowAddForm(true) }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14
          }}
        >
          <Plus size={16} />
          Yeni Hesap
        </button>
      </div>

      {/* Account list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>
            {accounts.length === 0 ? 'Henüz hesap eklenmedi.' : 'Arama sonucu bulunamadı.'}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {filtered.map((account, idx) => (
              <button
                key={account.id}
                onClick={() => openAccount(account)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  border: 'none',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                  background: 'white',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                    fontWeight: 700,
                    color: '#2563eb',
                    fontSize: 16,
                    flexShrink: 0
                  }}
                >
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{account.name}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: account.balance < 0 ? '#ef4444' : account.balance === 0 ? '#6b7280' : '#16a34a', marginRight: 8 }}>
                  {account.balance >= 0 ? '+' : ''}{account.balance.toFixed(2)} ₺
                </div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add account modal */}
      {showAddForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowAddForm(false)}
        >
          <div
            style={{ background: 'white', borderRadius: 12, padding: 28, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, flex: 1 }}>Yeni Hesap Oluştur</h3>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAccount}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Ad Soyad</label>
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Hesap sahibinin adı"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', marginBottom: 16 }}
              />
              <button
                type="submit"
                style={{ width: '100%', padding: '10px 0', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
              >
                Oluştur
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
