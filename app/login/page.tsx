'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [altHover, setAltHover] = useState(false)

  async function handleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleSignInWithDifferentAccount() {
    const supabase = createClient()
    await supabase.auth.signOut()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
  }

  return (
    <div id="app" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', padding: '0 var(--pad-h)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>할 일 메모장</h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>로그인하여 일정을 관리하세요</p>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button onClick={handleLogin} className="login-btn">
            Google로 로그인
          </button>
          <button
            onClick={handleSignInWithDifferentAccount}
            onMouseEnter={() => setAltHover(true)}
            onMouseLeave={() => setAltHover(false)}
            style={{
              background: 'none',
              border: 'none',
              color: altHover ? 'var(--text2)' : 'var(--text3)',
              fontSize: '13px',
              cursor: 'pointer',
              marginTop: '10px',
              textDecoration: 'underline',
              padding: '4px 0',
            }}
          >
            다른 계정으로 로그인하기
          </button>
        </div>
      </div>
    </div>
  )
}
