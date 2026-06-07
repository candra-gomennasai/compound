'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      setError('Email atau password salah. Coba lagi.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      overflowY: 'auto',
      background: '#FAFAFA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
      zIndex: 100,
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `repeating-linear-gradient(
          0deg, transparent, transparent 39px,
          rgba(0,0,0,0.04) 39px, rgba(0,0,0,0.04) 40px
        ), repeating-linear-gradient(
          90deg, transparent, transparent 39px,
          rgba(0,0,0,0.04) 39px, rgba(0,0,0,0.04) 40px
        )`,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '420px',
        display: 'flex', flexDirection: 'column', gap: '0',
      }}>
        {/* Header card */}
        <div style={{
          background: '#FFD60A',
          border: '2px solid #000',
          borderBottom: 'none',
          padding: '32px 32px 24px',
          boxShadow: '4px 4px 0 0 #000',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: 44, height: 44,
              background: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.1 }}>Team Compound</div>
            </div>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem', margin: 0, lineHeight: 1.1 }}>
            Selamat Datang
          </h1>
          <p style={{ margin: '6px 0 0', fontWeight: 600, fontSize: '0.85rem', color: '#333' }}>
            Masuk untuk mengakses sistem laporan harian
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#fff',
          border: '2px solid #000',
          padding: '28px 32px',
          boxShadow: '4px 4px 0 0 #000',
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Error message */}
            {error && (
              <div style={{
                background: '#FF4747', color: '#fff',
                padding: '10px 14px',
                fontSize: '0.82rem', fontWeight: 700,
                border: '2px solid #000',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                required
                autoFocus
                style={{
                  padding: '12px 14px',
                  border: '2px solid #000',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: '#FAFAFA',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.boxShadow = '2px 2px 0 0 #FFD60A'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  padding: '12px 14px',
                  border: '2px solid #000',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: '#FAFAFA',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.boxShadow = '2px 2px 0 0 #FFD60A'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '4px',
                padding: '14px',
                background: loading ? '#ccc' : '#FFD60A',
                color: '#000',
                border: '2px solid #000',
                boxShadow: loading ? 'none' : '3px 3px 0 0 #000',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseDown={e => { if (!loading) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '1px 1px 0 0 #000'; }}}
              onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 0 #000'; }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Masuk...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                  Masuk ke Sistem
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.72rem', fontWeight: 700, color: '#999' }}>
          Hanya untuk staf Team Compound yang berwenang
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
