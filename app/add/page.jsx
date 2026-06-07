import ReportForm from '@/components/ReportForm';

export const metadata = {
  title: 'Tambah Laporan — Team Compound',
};

export default function AddReportPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 12px',
          background: '#06D6A0', color: '#000',
          border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,1)',
          fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: '12px'
        }}>
          ✏️ Catat Aktivitas
        </span>
        <h1>Tambah Laporan Harian</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
          Catat kegiatan harian tim GA — perbaikan, pengadaan, kebersihan, kendaraan, dan lainnya.
        </p>
      </div>
      <ReportForm />
    </div>
  );
}
