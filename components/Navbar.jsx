"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PlusSquare, ListChecks, Briefcase, Users, Menu, X, StickyNote, ClipboardList, Moon, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';
import { createClient } from '@/lib/supabase/client';

const NAV_GROUPS = [
  {
    label: 'Menu Utama',
    items: [
      { href: '/',           label: 'Dashboard', icon: LayoutDashboard, color: { bg: '#FFD60A', fg: '#000' } },
      { href: '/add',        label: 'Tambah',    icon: PlusSquare,      color: { bg: '#06D6A0', fg: '#000' } },
      { href: '/reports',    label: 'Riwayat',   icon: ListChecks,      color: { bg: '#7B2FBE', fg: '#fff' } },
      { href: '/notes',      label: 'Catatan',   icon: StickyNote,      color: { bg: '#FFD60A', fg: '#000' } },
    ],
  },
  {
    label: 'Kehadiran & Waktu',
    items: [
      { href: '/attendance', label: 'Absensi',   icon: ClipboardList,   color: { bg: '#00B4D8', fg: '#000' } },
      { href: '/overtime',   label: 'Lembur',    icon: Moon,            color: { bg: '#FF6B35', fg: '#000' } },
    ],
  },
  {
    label: 'Data Master',
    items: [
      { href: '/jobs',       label: 'Pekerjaan', icon: Briefcase,       color: { bg: '#FFD60A', fg: '#000' } },
      { href: '/team',       label: 'Tim',        icon: Users,           color: { bg: '#FF3D9A', fg: '#fff' } },
    ],
  },
];

// Flat list for mobile (preserves original index-based coloring)
const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  const handleLogout = async () => {
    const { supabase } = await import('@/lib/supabase/client');
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Jangan tampilkan navbar di halaman login (letakkan di bawah semua hooks)
  if (pathname === '/login') return null;

  const activeStyle = (color) => ({
    background: color.bg,
    color: color.fg,
    borderColor: '#000',
    boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
  });

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <nav className={styles.navbar}>
        {/* ── Desktop Brand ── */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className={styles.brandName}>Team Compound</p>
          </div>
        </div>

        {/* ── Desktop Nav Groups ── */}
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label}>
            <div className={styles.sectionLabel} style={gi > 0 ? { marginTop: '16px' } : {}}>
              {group.label}
            </div>
            <ul className={styles.navList}>
              {group.items.map(({ href, label, icon: Icon, color }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                      style={isActive ? activeStyle(color) : {}}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* ── Desktop Logout ── */}
        <div className={styles.desktopLogout} style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '2px solid var(--black)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px',
              background: 'none', border: '2px solid transparent',
              fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700,
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FF4747'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <LogOut size={18} strokeWidth={2} />
            <span>Keluar</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile Header ── */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileBrand}>
          <div className={styles.brandIcon} style={{ width: 34, height: 34, flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className={styles.mobileBrandText}>
            <span className={styles.brandName}>Team Compound</span>
          </div>
        </div>
        <button className={styles.hamburgerBtn} onClick={() => setIsMobileMenuOpen(true)} aria-label="Buka menu">
          <Menu size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Mobile Overlay Menu ── */}
      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay}>
          <div className={styles.mobileOverlayHeader}>
            <span className={styles.brandName}>Menu</span>
            <button className={styles.closeBtn} onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} strokeWidth={2.5} />
            </button>
          </div>
          <div className={styles.mobileMenuContent}>
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className={styles.mobileSectionLabel}>{group.label}</p>
                {group.items.map(({ href, label, icon: Icon, color }) => {
                  const isActive = pathname === href;
                  return (
                    <Link key={href} href={href}
                      className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ''}`}
                      style={isActive ? activeStyle(color) : {}}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
            {/* Mobile logout */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', padding: '16px',
                background: '#FF4747', color: '#fff',
                border: '2px solid #000', fontFamily: 'inherit',
                fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase',
                cursor: 'pointer', marginTop: '8px',
              }}
            >
              <LogOut size={20} strokeWidth={2.5} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
