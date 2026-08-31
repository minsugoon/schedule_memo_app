'use client'

import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      setVisible(false)
    }, 800)

    return () => clearTimeout(holdTimer)
  }, [])

  useEffect(() => {
    if (visible) return

    const fadeTimer = setTimeout(() => {
      onFinish()
    }, 400)

    return () => clearTimeout(fadeTimer)
  }, [visible, onFinish])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--btn-bg)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div style={{ fontSize: '52px', lineHeight: 1 }}>📋</div>
      <div
        style={{
          marginTop: '16px',
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--btn-text)',
        }}
      >
        할 일 메모장
      </div>
      <div
        style={{
          marginTop: '6px',
          fontSize: '13px',
          color: 'var(--btn-text)',
          opacity: 0.75,
        }}
      >
        일정과 메모를 한 곳에
      </div>
    </div>
  )
}
