import MasterJobs from '@/components/MasterJobs';

export const metadata = {
  title: 'Master Kategori Pekerjaan — Team Compound',
};

export default function JobsPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 12px',
          background: '#FFD60A', color: '#000',
          border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,1)',
          fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: '12px'
        }}>
          🏷️ Data Master
        </span>
        <h1>Kategori Pekerjaan</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
          Kelola kategori pekerjaan tim. Nama tugas diisi saat menambah laporan harian.
        </p>
      </div>
      <MasterJobs />
    </div>
  );
}
