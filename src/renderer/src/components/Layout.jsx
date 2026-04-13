import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, Users, Package, BarChart2, Settings, Lock, Unlock, Shield } from 'lucide-react'
import { useAdmin } from '../App'
import AdminLoginModal from './AdminLoginModal'

const publicNavItems = [
  { to: '/pos', icon: ShoppingCart, label: 'Satış' },
  { to: '/accounts', icon: Users, label: 'Hesaplar' }
]

const adminNavItems = [
  { to: '/admin/products', icon: Package, label: 'Ürünler' },
  { to: '/admin/reports', icon: BarChart2, label: 'Raporlar' },
  { to: '/admin/settings', icon: Settings, label: 'Ayarlar' }
]

export default function Layout({ children }) {
  const { adminUnlocked, setAdminUnlocked } = useAdmin()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const navigate = useNavigate()

  function handleAdminClick() {
    if (adminUnlocked) {
      navigate('/admin/products')
    } else {
      setShowLoginModal(true)
    }
  }

  function handleLoginSuccess() {
    setShowLoginModal(false)
    setAdminUnlocked(true)
    navigate('/admin/products')
  }

  function handleLock() {
    setAdminUnlocked(false)
    navigate('/pos')
  }

  const navLinkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    color: isActive ? '#f8fafc' : '#94a3b8',
    background: isActive ? '#3b82f6' : 'transparent',
    fontWeight: isActive ? 600 : 400,
    fontSize: 14,
    transition: 'all 0.15s'
  })

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 200,
          minWidth: 200,
          background: '#1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 0'
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '12px 20px 24px',
            borderBottom: '1px solid #334155',
            marginBottom: 8
          }}
        >
          <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 18 }}>Kantin</div>
          <div style={{ color: '#64748b', fontSize: 12 }}>Yönetim Sistemi</div>
        </div>

        {/* Public nav */}
        <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {publicNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div style={{ margin: '12px 12px 4px', borderTop: '1px solid #334155' }} />

        {/* Admin section */}
        {adminUnlocked ? (
          <nav style={{ padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {/* Admin label */}
            <div style={{ padding: '4px 12px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Yönetici
            </div>

            {adminNavItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => navLinkStyle(isActive)}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}

            {/* Lock button */}
            <div style={{ flex: 1 }} />
            <button
              onClick={handleLock}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: '#64748b',
                fontSize: 14,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.background = '#334155' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' }}
            >
              <Lock size={18} />
              Kilitle
            </button>
          </nav>
        ) : (
          <div style={{ padding: '4px 12px', flex: 1 }}>
            <button
              onClick={handleAdminClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                fontSize: 14,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.background = '#334155' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent' }}
            >
              <Shield size={18} />
              Yönetici Paneli
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {/* Admin login modal */}
      {showLoginModal && (
        <AdminLoginModal
          onSuccess={handleLoginSuccess}
          onCancel={() => setShowLoginModal(false)}
        />
      )}
    </div>
  )
}
