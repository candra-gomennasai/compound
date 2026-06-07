"use client";
import { SafePortal } from '@/components/SafePortal';
import { X } from 'lucide-react';
import styles from './HolidayModal.module.css';

const OVERLAY_STYLE = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(255,255,255,0.18)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};

export default function HolidayModal({ isOpen, onClose, selectedMonth, daysList, holidays, toggleHoliday }) {
  if (!isOpen) return null;

  return (
    <SafePortal>
      <div style={OVERLAY_STYLE} onClick={onClose}>
      <div className={`${styles.modal} fade-up`} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Atur Hari Libur Spesial</h2>
            <p className={styles.subtitle}>Bulan: {selectedMonth}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className={styles.content}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>
            Pilih tanggal di bawah ini yang ditetapkan sebagai libur resmi perusahaan. Lembur di tanggal yang dicentang akan dihitung dengan tarif hari libur.
          </p>
          <div className={styles.grid}>
            {daysList.map(d => {
              const isChecked = holidays.includes(d.fullDateStr);
              const isWeekendVisual = d.dayName === 'Sab' || d.dayName === 'Min';
              return (
                <label
                  key={d.dateNum}
                  className={`${styles.dayCard} ${isChecked ? styles.checked : ''} ${isWeekendVisual && !isChecked ? styles.weekendDefault : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleHoliday(d.fullDateStr)}
                    className={styles.checkbox}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className={styles.dayNum}>{d.dateNum}</span>
                    <span className={styles.dayName}>{d.dayName}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className={styles.footer}>
          <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Selesai
          </button>
        </div>
      </div>
      </div>
    </SafePortal>
  );
}

