"use client";
import { useState } from 'react';
import { useReports } from '@/hooks/useReports';
import { useJobs } from '@/hooks/useJobs';
import SearchableSelect from '@/components/SearchableSelect';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Clock3, AlertTriangle } from 'lucide-react';
import listStyles from '@/components/ReportList.module.css';

export default function IssuesPage() {
  const { reports, isLoaded: rLoaded } = useReports();
  const { jobs, isLoaded: jLoaded } = useJobs();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [filterMode, setFilterMode] = useState('single');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  if (!rLoaded || !jLoaded) return <div style={{ padding: 20 }}>Loading...</div>;

  const jobOptions = jobs.map(j => ({ id: j.id, label: j.name, color: j.color }));
  
  // Filter issues based on category and date
  const displayIssues = reports.filter(r => {
    if (r.condition !== 'Kendala') return false;
    if (selectedCategory && String(r.categoryId) !== String(selectedCategory)) return false;
    
    if (filterMode === 'single') {
      if (startDate && r.date && r.date.split('T')[0] !== startDate) return false;
    } else {
      if (startDate && r.date && r.date.split('T')[0] < startDate) return false;
      if (endDate && r.date && r.date.split('T')[0] > endDate) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(displayIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIssues = displayIssues.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 12px',
          background: '#FF4747', color: '#fff',
          border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,1)',
          fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: '12px'
        }}>
          <AlertTriangle size={12} strokeWidth={3} /> Laporan Kendala
        </span>
        <h1>Pencarian Kendala</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
          Pilih kategori pekerjaan untuk melihat riwayat kendala yang pernah terjadi.
        </p>
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ maxWidth: '400px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 800 }}>Filter Kategori Pekerjaan</label>
          <SearchableSelect 
            options={jobOptions}
            value={selectedCategory}
            onChange={val => { setSelectedCategory(val); setCurrentPage(1); }}
            placeholder="Semua Kategori (Tampilkan Semua)"
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}>
            <input type="radio" name="filterMode" value="single" checked={filterMode === 'single'} onChange={() => { setFilterMode('single'); setCurrentPage(1); }} />
            Satu Tanggal
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}>
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

      {displayIssues.length === 0 ? (
        <div className={`${listStyles.empty} card`}>
          <AlertTriangle size={40} color="var(--text-muted)" strokeWidth={1.5} />
          <h3>Tidak Ada Kendala</h3>
          <p>Belum ada riwayat kendala tercatat {selectedCategory ? 'pada kategori ini' : ''}.</p>
        </div>
      ) : (
        <div className={listStyles.grid}>
          {paginatedIssues.map(report => (
            <div key={report.id} className={`${listStyles.reportCard} card fade-up`} style={{ borderLeft: '6px solid #FF4747' }}>
              <div className={listStyles.cardInner}>
                <h3 className={listStyles.title}>{report.title}</h3>
                <p className={listStyles.desc} style={{ color: '#000', fontWeight: 600 }}>{report.description || 'Tidak ada deskripsi spesifik.'}</p>
                
                <div className={listStyles.metaRow} style={{ marginTop: '12px' }}>
                  <span className={listStyles.metaChip} style={{ background: '#FFD60A' }}>{report.categoryName}</span>
                  {report.memberName && <span className={listStyles.metaChipOutline}>{report.memberName}</span>}
                </div>
                
                <div className={listStyles.cardFooter} style={{ borderTop: `2px solid #FF4747`, marginTop: '12px', paddingTop: '12px' }}>
                  <span className={listStyles.meta}>
                    <Clock3 size={12} strokeWidth={2.5} />
                    {report.startTime ? `${report.startTime}${report.endTime ? ' - ' + report.endTime : ''}` : '—'}
                  </span>
                  <span className={listStyles.meta}>
                    {format(new Date(report.date), 'd MMM yyyy', { locale: idLocale })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
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
    </div>
  );
}
