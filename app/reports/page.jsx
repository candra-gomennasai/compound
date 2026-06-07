import ReportList from '@/components/ReportList';

export const metadata = {
  title: 'Riwayat Pekerjaan — Team Compound',
};

export default function ReportsPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 12px',
          background: '#7B2FBE', color: '#fff',
          border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,1)',
          fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: '12px'
        }}>
          📋 Semua Catatan
        </span>
        <h1>Riwayat Laporan</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
          Semua aktivitas kerja yang pernah kamu catat.
        </p>
      </div>
      <ReportList />
    </div>
  );
}
