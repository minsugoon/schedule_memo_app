'use client'

import { IconLoader2 } from '@tabler/icons-react'

export default function LoadingOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.3)',
      }}
    >
      <IconLoader2
        size={32}
        color="white"
        className="loading-spinner"
      />
    </div>
  )
}
