"use client";
import { useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { useTeam } from '@/hooks/useTeam';
import { Trash2, Tag, Plus, X, Pencil } from 'lucide-react';
import styles from './MasterJobs.module.css';

const NEO_COLORS = [
  '#FF4747', '#FF6B35', '#FFD60A', '#06D6A0', '#0096FF', '#7B2FBE', '#FF3D9A',
  '#00B4D8', '#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0', '#4895EF',
  '#560BAD', '#F8961E', '#F9844A', '#F9C74F', '#90BE6D', '#43AA8B', '#4D908E',
  '#277DA1', '#E85D04', '#DC2F02', '#D00000', '#9D0208', '#6A040F', '#03071E'
];

const EMPTY = { name: '', description: '' };

function JobModal({ job = null, onClose, onSave, existingColors = [] }) {
  const isEdit = !!job;
  const [form, setForm] = useState({
    name: job?.name || '',
    description: job?.description || '',
    color: job?.color || '#FFD60A',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="card fade-up"
        style={{ width: '100%', maxWidth: '520px', padding: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, background: form.color, border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={14} strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.05rem' }}>
              {isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Nama Kategori *</label>
            <input
              type="text"
              placeholder="cth: Perawatan Taman, Kebersihan Outdoor..."
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Deskripsi (opsional)</label>
            <input
              type="text"
              placeholder="cth: Potong rumput, pangkas dahan pohon, siram tanaman..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Color picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>
              Warna Kategori
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {NEO_COLORS.map(c => {
                const isUsed = existingColors.includes(c);
                const isSelected = form.color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => !isUsed && set('color', c)}
                    title={isUsed ? 'Warna sudah dipakai kategori lain' : c}
                    style={{
                      width: 28, height: 28,
                      background: isUsed ? '#e5e7eb' : c,
                      border: isSelected ? '3px solid #000' : '2px solid rgba(0,0,0,0.2)',
                      cursor: isUsed ? 'not-allowed' : 'pointer',
                      transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.1s',
                      opacity: isUsed ? 0.35 : 1,
                      position: 'relative',
                    }}
                  >
                    {isUsed && (
                      <span style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 900, color: '#9ca3af',
                        pointerEvents: 'none',
                      }}>✕</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '6px' }}>
              Warna abu-abu ✕ sudah digunakan kategori lain.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose}
              className="btn"
              style={{ flex: 1, background: 'var(--gray-200)', color: '#000', border: '2px solid #000' }}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, margin: 0 }}>
              {isEdit ? 'Simpan Perubahan' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MasterJobs() {
  const { jobs, addJob, deleteJob, updateJob, isLoaded: jobsLoaded } = useJobs();
  const { isLoaded: teamLoaded } = useTeam();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editJob, setEditJob] = useState(null);

  if (!jobsLoaded || !teamLoaded) {
    return (
      <div className={styles.grid}>
        {[1,2,3,4].map(i => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
      </div>
    );
  }

  const handleAdd = (form) => {
    const usedColors = jobs.map(j => j.color);
    const available = NEO_COLORS.filter(c => !usedColors.includes(c));
    const colorToAssign = form.color || (
      available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`
    );
    addJob({ ...form, color: colorToAssign });
  };

  return (
    <>
      <div className={styles.wrap}>
        <button onClick={() => setShowAddModal(true)} className={`btn btn-primary ${styles.addBtn}`}>
          <Plus size={16} strokeWidth={3} />
          Tambah Kategori
        </button>

        {jobs.length === 0 ? (
          <div className={`${styles.empty} card`}>
            <Tag size={36} color="var(--text-muted)" strokeWidth={1.5} />
            <p>Belum ada kategori pekerjaan. Tambah sekarang!</p>
            <p className={styles.emptyHint}>Kategori digunakan untuk mengelompokkan laporan tugas.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {jobs.map((job, i) => (
              <div key={job.id} className={`${styles.jobCard} card fade-up`}
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className={styles.cardTop}>
                  <div className={styles.colorBadge} style={{ background: job.color }}>
                    <Tag size={14} strokeWidth={2.5} />
                  </div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.jobName}>{job.name}</h3>
                    {job.description && (
                      <p className={styles.categoryDesc}>{job.description}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setEditJob(job)} className={styles.deleteBtn} title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteJob(job.id)} className={styles.deleteBtn} title="Hapus">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className={styles.accentLine} style={{ background: job.color }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      {showAddModal && (
        <JobModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          existingColors={jobs.map(j => j.color)}
        />
      )}

      {/* Modal Edit */}
      {editJob && (
        <JobModal
          job={editJob}
          onClose={() => setEditJob(null)}
          onSave={(data) => updateJob(editJob.id, data)}
          existingColors={jobs.filter(j => j.id !== editJob.id).map(j => j.color)}
        />
      )}
    </>
  );
}
