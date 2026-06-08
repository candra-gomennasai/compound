import AttendanceWrapper from '@/components/AttendanceWrapper';

export const metadata = {
  title: 'Absensi — Team Compound',
};

export default function AttendancePage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 12px',
          background: '#00B4D8', color: '#000',
          border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,1)',
          fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: '12px'
        }}>
          ⏱️ Kehadiran Tim
        </span>
        <h1>Rekapitulasi Absensi</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
          Kelola status kehadiran harian anggota tim (Hadir, Cuti, Mangkir).
        </p>
      </div>
      <AttendanceWrapper />
    </div>
  );
}
