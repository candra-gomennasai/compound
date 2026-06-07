"use client";
import { useState } from 'react';
import { SafePortal } from '@/components/SafePortal';
import { useTeam } from '@/hooks/useTeam';
import { Clock, X, Plus, User } from 'lucide-react';
import styles from './LemburModal.module.css';

export default function LemburModal({ isOpen, onClose, onSave, report }) {
  const { team } = useTeam();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  if (!isOpen || !report) return null;

  // Tampilkan semua anggota tim (bukan hanya yang ada di tugas ini)
  const memberList = team.filter(m => !m.isPic);

  const toggleMember = (id) => {
    setSelectedMemberIds(prev =>
      prev.includes(String(id))
        ? prev.filter(x => x !== String(id))
        : [...prev, String(id)]
    );
  };

  const handleSave = () => {
    if (!startTime || !endTime) return;
    const newPeriod = {
      startTime,
      endTime,
      // Simpan ID + nama anggota yang lembur
      lemburMemberIds: selectedMemberIds,
      lemburMemberNames: team
        .filter(m => selectedMemberIds.includes(String(m.id)))
        .map(m => m.name),
    };
    const existing = Array.isArray(report.lemburPeriods) ? report.lemburPeriods : [];
    onSave({ lemburPeriods: [...existing, newPeriod] });
    setStartTime('');
    setEndTime('');
    setSelectedMemberIds([]);
    onClose();
  };

  const handleRemovePeriod = (idx) => {
    const existing = Array.isArray(report.lemburPeriods) ? report.lemburPeriods : [];
    const updated = existing.filter((_, i) => i !== idx);
    onSave({ lemburPeriods: updated });
  };

  return (
    <SafePortal>
      <div
        style={{
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
        }}
        onClick={onClose}
      >
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} strokeWidth={2.5} />
            <div>
              <div className={styles.title}>Tambah Jam Lembur</div>
              <div className={styles.subtitle} title={report.title}>
                {report.title?.length > 40 ? report.title.slice(0, 40) + '...' : report.title}
              </div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Existing lembur periods */}
          {Array.isArray(report.lemburPeriods) && report.lemburPeriods.length > 0 && (
            <div className={styles.existingList}>
              <p className={styles.sectionLabel}>Lembur Tercatat</p>
              {report.lemburPeriods.map((p, idx) => (
                <div key={idx} className={styles.periodRow}>
                  <Clock size={13} strokeWidth={2.5} />
                  <span className={styles.periodTime}>{p.startTime} – {p.endTime}</span>
                  {p.lemburMemberNames?.length > 0 && (
                    <span className={styles.periodMembers}>
                      {p.lemburMemberNames.join(', ')}
                    </span>
                  )}
                  <button className={styles.removeBtn} onClick={() => handleRemovePeriod(idx)}>
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New lembur period input */}
          <p className={styles.sectionLabel}>Tambah Periode Lembur Baru</p>

          {/* Time row */}
          <div className={styles.timeRow}>
            <div className={styles.timeGroup}>
              <label className={styles.timeLabel}>Jam Mulai</label>
              <input
                type="time"
                className={styles.timeInput}
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <span className={styles.dash}>–</span>
            <div className={styles.timeGroup}>
              <label className={styles.timeLabel}>Jam Selesai</label>
              <input
                type="time"
                className={styles.timeInput}
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Member selection */}
          <div>
            <label className={styles.timeLabel} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
              <User size={12} strokeWidth={2.5} />
              Yang Lembur (pilih anggota)
            </label>
            <div className={styles.memberGrid}>
              {memberList.map(m => {
                const active = selectedMemberIds.includes(String(m.id));
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`${styles.memberChip} ${active ? styles.memberActive : ''}`}
                    style={active ? { borderColor: m.color, background: m.color + '22' } : {}}
                    onClick={() => toggleMember(m.id)}
                  >
                    <span
                      className={styles.memberDot}
                      style={{ background: m.color }}
                    />
                    {m.name}
                  </button>
                );
              })}
            </div>
            {selectedMemberIds.length === 0 && (
              <p className={styles.memberHint}>Jika tidak dipilih, semua anggota tugas dianggap lembur.</p>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Batal</button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!startTime || !endTime}
          >
            <Plus size={16} strokeWidth={3} />
            Simpan Lembur
          </button>
        </div>
      </div>
    </div>
    </SafePortal>
  );
}
