"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReports } from '@/hooks/useReports';
import { useJobs } from '@/hooks/useJobs';
import { useTeam } from '@/hooks/useTeam';
import { CheckCircle2, Clock3, ListTodo, Send, User, Briefcase } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';
import styles from './ReportForm.module.css';

const STATUS_OPTIONS = [
  { value: 'To Do',       label: 'Belum Mulai',  icon: ListTodo,     bg: '#7B2FBE', color: '#fff' },
  { value: 'In Progress', label: 'Sedang Jalan',  icon: Clock3,       bg: '#FF6B35', color: '#000' },
  { value: 'Done',        label: 'Selesai',       icon: CheckCircle2, bg: '#06D6A0', color: '#000' },
];

export default function ReportForm({ initialData = null, onSave = null, onCancel = null }) {
  const { addReport } = useReports();
  const { jobs }  = useJobs();
  const { team }  = useTeam();
  const router = useRouter();

  const [formData, setFormData] = useState(initialData ? {
    ...initialData,
    title:       initialData.title ?? '',
    description: initialData.description ?? '',
    startTime:   initialData.startTime ?? '',
    endTime:     initialData.endTime ?? '',
    categoryName: initialData.categoryName ?? '',
    memberName:  initialData.memberName ?? '',
    date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
    workType: initialData.workType || 'Reguler',
    picId: initialData.picId || '',
    memberIds: initialData.memberIds || (initialData.memberId ? [String(initialData.memberId)] : [])
  } : {
    title: '', description: '', startTime: '', endTime: '', status: 'In Progress',
    categoryId: '', picId: '', memberIds: [], workType: 'Reguler',
    date: (() => {
      const today = new Date();
      const offset = today.getTimezoneOffset();
      return new Date(today.getTime() - (offset*60*1000)).toISOString().split('T')[0];
    })()
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const selectedJob    = jobs.find(j => String(j.id) === String(formData.categoryId));
  const selectedMembers = team.filter(m => Array.isArray(formData.memberIds) && formData.memberIds.some(id => String(id) === String(m.id)));

  // Map jobs → SearchableSelect options
  const jobOptions = jobs.map(j => ({
    id: j.id,
    label: j.name,
    sub: j.category,
    color: j.color,
  }));

  // Map team → SearchableSelect options for members
  const memberOptions = team.filter(m => !m.isPic).map(m => ({
    id: m.id,
    label: m.name,
    sub: m.role,
    color: m.color,
  }));

  // Map team → SearchableSelect options for PIC
  const picOptions = team.filter(m => m.isPic).map(m => ({
    id: m.id,
    label: m.name,
    sub: m.role,
    color: m.color,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    // If date is "YYYY-MM-DD", append time or just save it. 
    // We'll append 'T12:00:00.000Z' to ensure it parses back safely without timezone shift issues.
    const isoDate = formData.date ? `${formData.date}T12:00:00.000Z` : new Date().toISOString();

    const finalData = {
      ...formData,
      date: isoDate,
      categoryName: selectedJob?.name  || '',
      picName:      team.find(t => String(t.id) === String(formData.picId))?.name || '',
      memberName:   selectedMembers.map(m => m.name).join(', ') || '',
    };
    if (onSave) {
      onSave(finalData);
    } else {
      addReport(finalData);
      router.push('/reports');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} card`}>

      {/* Title */}
      <div className="form-group">
        <label htmlFor="title">Nama Tugas / Kegiatan</label>
        <input id="title" type="text" placeholder="cth: Potong rumput taman depan, Perbaikan atap rumah A1, Angkut sampah ke TPS..."
          value={formData.title} onChange={e => set('title', e.target.value)} required />
      </div>

      <div className="form-group">
        <label htmlFor="desc">Keterangan</label>
        <textarea id="desc" placeholder="Detail pekerjaan, hasil, atau info penting lainnya. Jika ada kendala, tulis di menu Catatan Pengingat."
          rows={3} value={formData.description} onChange={e => set('description', e.target.value)} />
      </div>

      {/* Kategori / PIC / Anggota — 3-column grid */}
      <div className={styles.row}>
        <div className={styles.selectGroup}>
          <label className={styles.selectLabel}>
            <Briefcase size={13} /> Kategori Pekerjaan
          </label>
          <SearchableSelect
            options={jobOptions}
            value={formData.categoryId}
            onChange={id => set('categoryId', id)}
            placeholder="Cari & pilih kategori..."
            emptyText="Kategori tidak ditemukan. Tambah di Master Kategori Pekerjaan."
          />
          <div className={styles.chipsRow}>
            {selectedJob && (
              <span className={styles.selectionChip} style={{ background: selectedJob.color }}>
                {selectedJob.name}
              </span>
            )}
          </div>
        </div>

        <div className={styles.selectGroup}>
          <label className={styles.selectLabel}>
            <User size={13} /> Penanggung Jawab (PIC)
          </label>
          <SearchableSelect
            options={picOptions}
            value={formData.picId}
            onChange={id => set('picId', id)}
            placeholder="Pilih PIC..."
            emptyText="Belum ada PIC terdaftar."
          />
          <div className={styles.chipsRow}>
            {formData.picId && (() => {
              const m = team.find(t => String(t.id) === String(formData.picId));
              if (!m) return null;
              return (
                <span className={styles.selectionChip} style={{ background: m.color, color: '#fff' }}>
                  🌟 {m.name}
                </span>
              );
            })()}
          </div>
        </div>

        <div className={styles.selectGroup}>
          <label className={styles.selectLabel}>
            <User size={13} /> Dikerjakan Oleh
          </label>
          <SearchableSelect
            isMulti={true}
            options={memberOptions}
            value={formData.memberIds}
            onChange={ids => set('memberIds', ids)}
            placeholder="Cari & pilih anggota tim..."
            emptyText="Anggota tidak ditemukan. Tambah di halaman Master Tim."
          />
          <div className={styles.chipsRow}>
            {selectedMembers.map(m => (
              <span key={m.id} className={styles.selectionChip}
                style={{ background: m.color, color: '#000', fontSize: '11px', padding: '2px 8px' }}>
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Date & Time — 3-column grid */}
      <div className={styles.timeRow}>
        <div className="form-group">
          <label htmlFor="date">Tanggal</label>
          <input id="date" type="date"
            value={formData.date || ''} onChange={e => set('date', e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="startTime">Jam Mulai</label>
          <input id="startTime" type="time"
            value={formData.startTime || ''} onChange={e => set('startTime', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="endTime">Jam Selesai</label>
          <input id="endTime" type="time"
            value={formData.endTime || ''} onChange={e => set('endTime', e.target.value)} />
        </div>
      </div>

      {/* Work Type */}
      <div className={styles.radioRow}>
        <label className={styles.radioLabel}>
          <input type="radio" name="workType" value="Reguler"
            checked={formData.workType === 'Reguler'}
            onChange={() => set('workType', 'Reguler')} />
          Jam Reguler
        </label>
        <label className={styles.radioLabel}>
          <input type="radio" name="workType" value="Lembur"
            checked={formData.workType === 'Lembur'}
            onChange={() => set('workType', 'Lembur')} />
          Lembur
        </label>
      </div>

      {/* Status pills */}
      <div className={styles.statusGroup}>
        <p className={styles.statusLabel}>Status</p>
        <div className={styles.statusPills}>
          {STATUS_OPTIONS.map(({ value, label, icon: Icon, bg, color }) => {
            const isActive = formData.status === value;
            return (
              <button key={value} type="button" onClick={() => set('status', value)}
                className={styles.pill}
                style={isActive
                  ? { background: bg, color, borderColor: '#000', boxShadow: '2px 2px 0 0 rgba(0,0,0,1)', transform: 'translate(1px,1px)' }
                  : {}
                }>
                <Icon size={14} strokeWidth={2.5} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.submitRow}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={`btn ${styles.cancelBtn}`}>
            Batal
          </button>
        )}
        <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={submitting} style={{ flex: 2, margin: 0 }}>
          <Send size={15} strokeWidth={2.5} />
          {submitting ? 'Menyimpan...' : 'Simpan Laporan'}
        </button>
      </div>
    </form>
  );
}
