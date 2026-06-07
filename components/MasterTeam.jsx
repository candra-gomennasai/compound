"use client";
import { useState } from 'react';
import { SafePortal } from '@/components/SafePortal';
import { useTeam } from '@/hooks/useTeam';
import { Trash2, Users, Plus, X, Mail, Shield, Pencil } from 'lucide-react';
import styles from './MasterTeam.module.css';

const MEMBER_COLORS = ['#FFD60A','#06D6A0','#FF4747','#FF6B35','#7B2FBE','#FF3D9A','#0096FF'];
const EMPTY = { name: '', role: '', email: '', color: '#FFD60A', isPic: false };

const OVERLAY = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(255,255,255,0.18)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  overflowY: 'auto',
};

function Avatar({ name, color, size = 48 }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size,
      background: color,
      border: '2px solid #000',
      boxShadow: '2px 2px 0 0 rgba(0,0,0,1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 900, color: '#000', flexShrink: 0,
    }}>
      {initials || '?'}
    </div>
  );
}

function MemberModal({ initialData = EMPTY, onClose, onSave, title }) {
  const [form, setForm] = useState(initialData);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <SafePortal>
      <div style={OVERLAY} onClick={onClose}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: '520px', padding: '24px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {form.name
              ? <Avatar name={form.name} color={form.color} size={36} />
              : <div style={{ width: 36, height: 36, background: form.color, border: '2px solid #000' }} />
            }
            <span style={{ fontWeight: 900, fontSize: '1.05rem' }}>{title}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className={styles.formGrid}>
            <div className="form-group">
              <label>Nama Lengkap *</label>
              <input type="text" placeholder="cth: Budi Santoso"
                value={form.name} onChange={e => set('name', e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label>Jabatan / Peran *</label>
              <input type="text" placeholder="cth: Teknisi Listrik"
                value={form.role} onChange={e => set('role', e.target.value)} required />
            </div>
          </div>

          {/* Color picker */}
          <div className={styles.colorGroup}>
            <label>Warna Avatar</label>
            <div className={styles.colorPills}>
              {MEMBER_COLORS.map(c => (
                <button key={c} type="button"
                  onClick={() => set('color', c)}
                  className={styles.colorDot}
                  style={{ background: c, boxShadow: form.color === c ? '0 0 0 3px #000' : 'none' }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose}
              className="btn"
              style={{ flex: 1, background: 'var(--gray-200)', color: '#000', border: '2px solid #000' }}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary"
              style={{ flex: 2, margin: 0, background: form.isPic ? '#FF3D9A' : 'var(--yellow)', color: form.isPic ? '#fff' : '#000' }}>
              {form.isPic ? 'Simpan PIC' : 'Simpan Anggota'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </SafePortal>
  );
}

export default function MasterTeam() {
  const { team, addMember, deleteMember, updateMember, isLoaded } = useTeam();
  const [modal, setModal] = useState(null); // null | { mode: 'add-member' | 'add-pic' | 'edit', data?: member }

  if (!isLoaded) {
    return (
      <div className={styles.grid}>
        {[1,2,3,4].map(i => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
      </div>
    );
  }

  return (
    <>
      <div className={styles.wrap}>
        {/* Summary bar */}
        <div className={`${styles.summaryBar} card`}>
          <div className={styles.summaryLeft}>
            <Users size={20} strokeWidth={2.5} />
            <span className={styles.summaryCount}>{team.length} Anggota Tim</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setModal({ mode: 'add-member', data: { ...EMPTY, isPic: false } })}
              className="btn btn-outline" style={{ padding: '10px 20px', flex: 1 }}>
              <Plus size={15} strokeWidth={3} /> Tambah Anggota
            </button>
            <button onClick={() => setModal({ mode: 'add-pic', data: { ...EMPTY, isPic: true, color: '#FF4747' } })}
              className="btn btn-primary" style={{ padding: '10px 20px', background: '#FF3D9A', color: '#fff', flex: 1 }}>
              <Plus size={15} strokeWidth={3} /> Tambah PIC
            </button>
          </div>
        </div>

        {/* Avatar row */}
        {team.length > 0 && (
          <div className={styles.avatarRow}>
            {team.map(m => (
              <div key={m.id} title={m.name}>
                <Avatar name={m.name} color={m.color} size={40} />
              </div>
            ))}
          </div>
        )}

        {/* Team list */}
        {team.length === 0 ? (
          <div className={`${styles.empty} card`}>
            <Users size={36} color="var(--text-muted)" strokeWidth={1.5} />
            <p>Belum ada anggota tim. Tambah sekarang!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {team.map((member, i) => (
              <div key={member.id} className={`${styles.memberCard} card fade-up`}
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className={styles.memberTop}>
                  <Avatar name={member.name} color={member.color} size={52} />
                  <div className={styles.memberInfo}>
                    <h3 className={styles.memberName}>{member.name}</h3>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <div className={styles.roleBadge} style={{ background: member.color + '33', color: 'var(--black)', border: `1px solid ${member.color}` }}>
                        {member.role}
                      </div>
                      {member.isPic && (
                        <div className={styles.roleBadge} style={{ background: '#FF474722', color: '#FF4747', border: '1px solid #FF4747' }}>
                          PIC
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setModal({ mode: 'edit', data: { ...member } })} className={styles.deleteBtn} title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteMember(member.id)} className={styles.deleteBtn} title="Hapus">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Modal */}
      {modal && (
        <MemberModal
          initialData={modal.data}
          title={modal.mode === 'edit' ? 'Edit Anggota' : modal.mode === 'add-pic' ? 'Tambah PIC' : 'Tambah Anggota'}
          onClose={() => setModal(null)}
          onSave={(form) => {
            if (modal.mode === 'edit') {
              updateMember ? updateMember(modal.data.id, form) : null;
            } else {
              addMember(form);
            }
          }}
        />
      )}
    </>
  );
}
