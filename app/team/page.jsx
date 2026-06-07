import MasterTeam from '@/components/MasterTeam';

export const metadata = {
  title: 'Master Anggota Tim — Team Compound',
};

export default function TeamPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 12px',
          background: '#FF3D9A', color: '#fff',
          border: '2px solid #000', boxShadow: '2px 2px 0 0 rgba(0,0,0,1)',
          fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: '12px'
        }}>
          👥 Data Master
        </span>
        <h1>Anggota Tim</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
          Kelola daftar karyawan dan anggota tim yang terlibat dalam proyek.
        </p>
      </div>
      <MasterTeam />
    </div>
  );
}
