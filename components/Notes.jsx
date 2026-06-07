"use client";
import { useState } from 'react';
import { SafePortal } from '@/components/SafePortal';
import { useNotes } from '@/hooks/useNotes';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { StickyNote, Plus, X, Clock3, Trash2, Pencil } from 'lucide-react';
import styles from './Notes.module.css';

const NOTE_COLORS = [
  '#FFD60A', '#06D6A0', '#FF6B35', '#FF3D9A',
  '#0096FF', '#7B2FBE', '#FF4747', '#FAFAFA',
];

function NoteModal({ note = null, onClose, onSave }) {
  const isEdit = !!note;
  const [title, setTitle] = useState(note?.title || '');
  const [text, setText] = useState(note?.text || '');
  const [selectedColor, setSelectedColor] = useState(note?.color || NOTE_COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !text.trim()) return;
    onSave({ title: title.trim() || 'Tanpa Judul', text: text.trim(), color: selectedColor });
    onClose();
  };

  return (
    <SafePortal>
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
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
        <div className={`${styles.modal} fade-up`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StickyNote size={18} strokeWidth={2.5} />
            <span>{isEdit ? 'Edit Catatan' : 'Buat Pengingat Baru'}</span>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form className={styles.modalBody} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Judul catatan..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ fontWeight: 900, fontSize: '1.05rem', borderBottom: 'none', boxShadow: 'none' }}
              />
              <textarea
                placeholder="Isi pengingat atau hal yang perlu dicatat..."
                value={text}
                onChange={e => setText(e.target.value)}
                style={{ minHeight: '120px', borderTop: '2px solid var(--black)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--black)' }}>
                  Warna Catatan
                </p>
                <div className={styles.colorPicker}>
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.colorBtn} ${selectedColor === c ? styles.active : ''}`}
                      style={{ background: c }}
                      onClick={() => setSelectedColor(c)}
                      aria-label={`Pilih warna ${c}`}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={16} strokeWidth={3} />
                {isEdit ? 'Simpan Perubahan' : 'Simpan Catatan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    </SafePortal>
  );
}

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, isLoaded } = useNotes();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editNote, setEditNote] = useState(null); // note object being edited

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(notes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotes = notes.slice(startIndex, startIndex + itemsPerPage);

  if (!isLoaded) return <div style={{ padding: 20, fontWeight: 700 }}>Memuat catatan...</div>;

  return (
    <>
      <div className={styles.wrap}>
        {/* ── Floating Action Button (FAB) ── */}
        <button
          className={styles.fab}
          onClick={() => setIsFormOpen(true)}
          aria-label="Tambah catatan baru"
        >
          <Plus size={28} strokeWidth={3} />
        </button>

        {/* ── Daftar Catatan ── */}
        {notes.length === 0 ? (
          <div className={`${styles.emptyState} card fade-up delay-1`}>
            <StickyNote size={48} strokeWidth={1.5} />
            <div>
              <h3>Belum Ada Catatan</h3>
              <p>Buat pengingat baru dengan menekan tombol + di kanan bawah.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className={styles.notesGrid}>
              {paginatedNotes.map((note, idx) => {
                const isDarkBg = ['#7B2FBE', '#FF4747', '#0096FF', '#FF3D9A'].includes(note.color);
                const textColor = isDarkBg ? '#fff' : '#000';
                return (
                  <div
                    key={note.id}
                    className={`${styles.noteCard} card fade-up`}
                    style={{ background: note.color, color: textColor, animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}
                  >
                    <div className={styles.noteHeader}>
                      <h3 className={styles.noteTitle}>{note.title}</h3>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => setEditNote(note)}
                          className={styles.deleteBtn}
                          style={{ color: textColor }}
                          aria-label="Edit catatan"
                        >
                          <Pencil size={15} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className={styles.deleteBtn}
                          style={{ color: textColor }}
                          aria-label="Hapus catatan"
                        >
                          <X size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </div>

                    <p className={styles.noteText}>{note.text}</p>

                    <div className={styles.noteFooter} style={{ borderTopColor: isDarkBg ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)' }}>
                      <Clock3 size={12} strokeWidth={2.5} />
                      {format(new Date(note.date), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  Sebelumnya
                </button>
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Berikutnya
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal Tambah ── */}
      {isFormOpen && (
        <NoteModal
          onClose={() => setIsFormOpen(false)}
          onSave={(data) => {
            addNote(data);
            setCurrentPage(1);
          }}
        />
      )}

      {/* ── Modal Edit ── */}
      {editNote && (
        <NoteModal
          note={editNote}
          onClose={() => setEditNote(null)}
          onSave={(data) => updateNote(editNote.id, data)}
        />
      )}
    </>
  );
}
