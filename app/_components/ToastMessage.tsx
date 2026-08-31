'use client'

import { useEffect } from 'react'

interface ToastMessageProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export default function ToastMessage({ message, type, onClose }: ToastMessageProps) {
  useEffect(() => {
    const duration = type === 'success' ? 2000 : 3000
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [type, onClose])

  const colors = type === 'success'
    ? { background: '#E8F5E9', color: '#2E7D32' }
    : { background: '#FCEBEB', color: '#A32D2D' }

  return (
    <div
      className="toast-message"
      style={{
        background: colors.background,
        color: colors.color,
      }}
    >
      {message}
    </div>
  )
}
