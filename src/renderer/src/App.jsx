import { createContext, useContext, useState } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import POS from './pages/POS'
import Products from './pages/Products'
import Accounts from './pages/Accounts'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

// Admin context
export const AdminContext = createContext({
  adminUnlocked: false,
  setAdminUnlocked: () => {}
})

export function useAdmin() {
  return useContext(AdminContext)
}

// Admin koruması: kilitliyse /pos'a yönlendir
function AdminGuard({ children }) {
  const { adminUnlocked } = useAdmin()
  if (!adminUnlocked) return <Navigate to="/pos" replace />
  return children
}

function App() {
  const [adminUnlocked, setAdminUnlocked] = useState(false)

  return (
    <AdminContext.Provider value={{ adminUnlocked, setAdminUnlocked }}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/pos" replace />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route
              path="/admin/products"
              element={<AdminGuard><Products /></AdminGuard>}
            />
            <Route
              path="/admin/reports"
              element={<AdminGuard><Reports /></AdminGuard>}
            />
            <Route
              path="/admin/settings"
              element={<AdminGuard><Settings /></AdminGuard>}
            />
          </Routes>
        </Layout>
      </Router>
    </AdminContext.Provider>
  )
}

export default App
