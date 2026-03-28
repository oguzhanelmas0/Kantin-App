import { NavLink } from 'react-router-dom'
import {
  ShoppingCart,
  Package,
  Users,
  BarChart2,
  Settings
} from 'lucide-react'

const navItems = [
  { to: '/pos', icon: ShoppingCart, label: 'Satış' },
  { to: '/products', icon: Package, label: 'Ürünler' },
  { to: '/accounts', icon: Users, label: 'Hesaplar' },
  { to: '/reports', icon: BarChart2, label: 'Raporlar' },
  { to: '/settings', icon: Settings, label: 'Ayarlar' }
]

export default function Layout({ children }) {
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

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
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
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}
