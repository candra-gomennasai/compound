"use client";
import { useReports } from '@/hooks/useReports';
import { useTeam } from '@/hooks/useTeam';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Trash2, CheckCircle2, Clock3, ListTodo, AlertCircle, PlusCircle, Timer, Download, Share2 } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import ReportForm from '@/components/ReportForm';
import LemburModal from '@/components/LemburModal';
import { useState } from 'react';
import { SafePortal } from '@/components/SafePortal';
import styles from './ReportList.module.css';


// Colorful accent bars cycling through the palette
const ACCENT_COLORS = ['#FFD60A','#06D6A0','#FF4747','#FF6B35','#7B2FBE','#FF3D9A','#0096FF'];

const STATUS_MAP = {
  'Done':        { badgeClass: 'badge-done',     icon: CheckCircle2, label: 'Selesai' },
  'In Progress': { badgeClass: 'badge-progress', icon: Clock3,       label: 'Sedang Jalan' },
  'To Do':       { badgeClass: 'badge-todo',     icon: ListTodo,     label: 'Belum Mulai' },
  'Failed':      { badgeClass: 'badge-done',     icon: CheckCircle2, label: 'Selesai' }, // fallback legacy
};
export default function ReportList() {
  const { reports, deleteReport, updateReport, isLoaded } = useReports();
  const { team } = useTeam();
  const [editId, setEditId] = useState(null);
  const [lemburReportId, setLemburReportId] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [filterMode, setFilterMode] = useState('single');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    return new Date(today.getTime() - (offset*60*1000)).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    return new Date(today.getTime() - (offset*60*1000)).toISOString().split('T')[0];
  });

  if (!isLoaded) {
    return (
      <div className={styles.grid}>
        {[1,2,3,4].map(i => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
      </div>
    );
  }

  const filteredReports = reports.filter(r => {
    const reportDateStr = r.date.split('T')[0];
    if (filterMode === 'single') {
      return reportDateStr === startDate;
    } else {
      if (startDate && endDate) return reportDateStr >= startDate && reportDateStr <= endDate;
      if (startDate) return reportDateStr >= startDate;
      if (endDate) return reportDateStr <= endDate;
      return true; // Fallback
    }
  });

  const exportToExcel = () => {
    // Sort chronological: oldest date first, earliest time first
    const sortedForExport = [...filteredReports].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      
      const startCompare = (a.startTime || '').localeCompare(b.startTime || '');
      if (startCompare !== 0) return startCompare;
      
      return (a.endTime || '').localeCompare(b.endTime || '');
    });

    const dataToExport = sortedForExport.map((r, i) => {
      const picName = r.picId ? team.find(t => String(t.id) === String(r.picId))?.name : '';
      const memberNames = Array.isArray(r.memberIds) 
        ? r.memberIds.map(id => team.find(t => String(t.id) === String(id))?.name).filter(Boolean).join(', ')
        : '';
        
      return {
        'No': i + 1,
        'Tanggal': r.date ? format(new Date(r.date), 'dd MMM yyyy', { locale: idLocale }) : '',
        'Jam Mulai': r.startTime,
        'Jam Selesai': r.endTime,
        'Pekerjaan': r.title,
        'Keterangan': r.description,
        'Kategori': r.categoryName,
        'Status': STATUS_MAP[r.status]?.label || r.status,
        'Jenis Kerja': r.workType || 'Reguler',
        'Penanggung Jawab (PIC)': picName,
        'Anggota': memberNames,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Harian");
    
    // Auto-adjust column widths roughly
    const columnWidths = [
      { wch: 5 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, 
      { wch: 30 }, { wch: 40 }, { wch: 25 }, { wch: 15 }, 
      { wch: 15 }, { wch: 25 }, { wch: 30 }
    ];
    worksheet['!cols'] = columnWidths;

    const fileName = filterMode === 'single' 
      ? `Laporan Harian - ${startDate}.xlsx` 
      : `Laporan Harian - ${startDate} sd ${endDate}.xlsx`;
      
    XLSX.writeFile(workbook, fileName);
  };

  const copyToWA = () => {
    // Sort chronological for WA too
    const sortedForWA = [...filteredReports].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      
      const startCompare = (a.startTime || '').localeCompare(b.startTime || '');
      if (startCompare !== 0) return startCompare;
      
      return (a.endTime || '').localeCompare(b.endTime || '');
    });

    let text = `*Laporan Harian Team Compound*\n`;
    
    if (filterMode === 'single') {
      text += `📅 *Tanggal:* ${startDate}\n`;
    } else {
      text += `📅 *Rentang:* ${startDate} s/d ${endDate}\n`;
    }
    
    text += `✅ *Total Pekerjaan:* ${sortedForWA.length}\n\n`;

    sortedForWA.forEach((r, i) => {
      const statusIcon = r.status === 'Done' || r.status === 'Failed' ? '✅' : '⏳';
      const picName = r.picId ? team.find(t => String(t.id) === String(r.picId))?.name : '';
      const memberNames = Array.isArray(r.memberIds) 
        ? r.memberIds.map(id => team.find(t => String(t.id) === String(id))?.name).filter(Boolean).join(', ')
        : '';
      
      let names = memberNames;

      text += `${i + 1}. *${r.startTime} - ${r.endTime}*\n`;
      text += `${statusIcon} ${r.title}\n`;
      if (names) {
        text += `👷 ${names}\n`;
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      alert("Teks laporan (versi singkat) berhasil disalin! Silakan Paste (Tempel) di WhatsApp.");
    });
  };

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  if (filteredReports.length === 0) {
    return (
      <>
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, fontSize: '0.85rem' }}>
              <input type="radio" name="filterMode" value="single" checked={filterMode === 'single'} onChange={() => { setFilterMode('single'); setCurrentPage(1); }} />
              Satu Tanggal
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, fontSize: '0.85rem' }}>
              <input type="radio" name="filterMode" value="range" checked={filterMode === 'range'} onChange={() => { setFilterMode('range'); setCurrentPage(1); }} />
              Rentang Tanggal
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {filterMode === 'single' ? (
              <input 
                type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                style={{ padding: '8px 12px', border: '2px solid black', fontFamily: 'inherit', fontWeight: 700 }}
              />
            ) : (
              <>
                <input 
                  type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '8px 12px', border: '2px solid black', fontFamily: 'inherit', fontWeight: 700 }}
                />
                <span style={{ fontWeight: 900 }}>-</span>
                <input 
                  type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '8px 12px', border: '2px solid black', fontFamily: 'inherit', fontWeight: 700 }}
                />
              </>
            )}
          </div>
        </div>
        <div className={`${styles.empty} card`}>
          <AlertCircle size={40} color="var(--text-muted)" strokeWidth={1.5} />
          <h3>Belum ada laporan</h3>
          <p>{filterMode === 'single' ? `Tidak ada pekerjaan pada tanggal ${startDate}.` : `Tidak ada pekerjaan dari tanggal ${startDate} hingga ${endDate}.`}</p>
          <Link href="/add" className="btn btn-primary" style={{ marginTop: '12px' }}>
            <PlusCircle size={15} />
            Tambah Sekarang
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, fontSize: '0.85rem' }}>
            <input type="radio" name="filterMode2" value="single" checked={filterMode === 'single'} onChange={() => { setFilterMode('single'); setCurrentPage(1); }} />
            Satu Tanggal
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, fontSize: '0.85rem' }}>
            <input type="radio" name="filterMode2" value="range" checked={filterMode === 'range'} onChange={() => { setFilterMode('range'); setCurrentPage(1); }} />
            Rentang Tanggal
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {filterMode === 'single' ? (
            <input 
              type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 12px', border: '2px solid black', fontFamily: 'inherit', fontWeight: 700 }}
            />
          ) : (
            <>
              <input 
                type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                style={{ padding: '8px 12px', border: '2px solid black', fontFamily: 'inherit', fontWeight: 700 }}
              />
              <span style={{ fontWeight: 900 }}>-</span>
              <input 
                type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
                style={{ padding: '8px 12px', border: '2px solid black', fontFamily: 'inherit', fontWeight: 700 }}
              />
            </>
          )}
        </div>
        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
            Total Pekerjaan: <span style={{ color: 'var(--black)', background: 'var(--yellow)', padding: '2px 8px', border: '1px solid var(--black)' }}>{filteredReports.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={copyToWA} className="btn" style={{ background: '#25D366', color: 'white', padding: '6px 12px', fontSize: '0.75rem', border: '2px solid black' }}>
              <Share2 size={14} /> Salin WA
            </button>
            <button onClick={exportToExcel} className="btn" style={{ background: '#107c41', color: 'white', padding: '6px 12px', fontSize: '0.75rem' }}>
              <Download size={14} /> Export Excel
            </button>
          </div>
        </div>
      </div>
      <div className={styles.grid}>
        {paginatedReports.map((report, i) => {
        const status = STATUS_MAP[report.status] || STATUS_MAP['To Do'];
        const Icon = status.icon;
        const accentColor = ACCENT_COLORS[i % ACCENT_COLORS.length];

        return (
          <div key={report.id} className={`${styles.reportCard} card fade-up`}
            style={{ animationDelay: `${i * 0.04}s` }}>

            {/* Colorful top accent bar */}
            <div className={styles.accentBar} style={{ background: accentColor }} />

            <div className={styles.cardInner}>
              <div className={styles.cardHeader}>
                <span className={`badge ${status.badgeClass}`}>
                  <Icon size={10} strokeWidth={2.5} />
                  {status.label}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setLemburReportId(report.id)}
                    className={styles.lemburBtn}
                    title="Tambah Lembur"
                  >
                    <Timer size={13} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setEditId(report.id)} className={styles.deleteBtn} title="Edit" style={{ color: '#000' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button onClick={() => deleteReport(report.id)} className={styles.deleteBtn} title="Hapus">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className={styles.title}>{report.title}</h3>
              {report.description && <p className={styles.desc}>{report.description}</p>}

              <div className={styles.metaSection}>
                {report.categoryName && (
                  <div className={styles.metaRow}>
                    <span className={styles.metaChip} style={{ background: accentColor }}>
                      {report.categoryName}
                    </span>
                  </div>
                )}
                {(report.picId || (report.memberIds && report.memberIds.length > 0)) && (() => {
                  const picName = report.picId ? team.find(t => String(t.id) === String(report.picId))?.name : null;
                  const memberNames = Array.isArray(report.memberIds) 
                    ? report.memberIds.map(id => team.find(t => String(t.id) === String(id))?.name).filter(Boolean)
                    : [];

                  return (
                    <div className={styles.metaRow}>
                      {picName && (
                        <span className={styles.picChip}>⭐ {picName}</span>
                      )}
                      {memberNames.length > 0 && memberNames.map((n, idx) => (
                        <span key={idx} className={styles.memberChip}>{n}</span>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* lemburPeriods display */}
              {Array.isArray(report.lemburPeriods) && report.lemburPeriods.length > 0 && (
                <div className={styles.lemburPeriodList}>
                  {report.lemburPeriods.map((p, idx) => (
                    <span key={idx} className={styles.lemburPeriodChip}>
                      <Timer size={11} strokeWidth={2.5} />
                      {p.startTime} – {p.endTime}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.cardFooter} style={{ borderTop: `2px solid ${accentColor}` }}>
                <span className={styles.meta}>
                  <Clock3 size={12} strokeWidth={2.5} />
                  {report.startTime ? `${report.startTime}${report.endTime ? ' - ' + report.endTime : ''}` : '—'}
                </span>
                <span className={styles.meta}>
                  {format(new Date(report.date), 'd MMM yyyy', { locale: idLocale })}
                </span>
                {report.workType === 'Lembur' && (
                  <span className={styles.lemburBadge}>LEMBUR</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      </div>
      
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Sebelumnya
          </button>
          <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>
            Halaman {currentPage} dari {totalPages}
          </span>
          <button 
            className="btn btn-outline" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Berikutnya
          </button>
        </div>
      )}

      {/* Lembur Modal */}
      <LemburModal
        isOpen={!!lemburReportId}
        onClose={() => setLemburReportId(null)}
        report={reports.find(r => r.id === lemburReportId) || null}
        onSave={(data) => {
          updateReport(lemburReportId, data);
        }}
      />

      {editId && (() => {
        const editReport = reports.find(r => r.id === editId);
        return editReport ? (
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
                padding: '16px',
                overflowY: 'auto',
              }}
              onClick={() => setEditId(null)}
            >
              <div style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}>
                <ReportForm
                  initialData={editReport}
                  onSave={(data) => { updateReport(editId, data); setEditId(null); }}
                  onCancel={() => setEditId(null)}
                />
              </div>
            </div>
          </SafePortal>
        ) : null;
      })()}
    </>
  );
}
