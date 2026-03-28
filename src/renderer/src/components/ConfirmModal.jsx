import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Evet', confirmColor = '#ef4444' }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 28,
          width: 400,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h3>
        </div>

        <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>{message}</p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: confirmColor,
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
