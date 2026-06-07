import Overtime from '@/components/Overtime';

export const metadata = {
  title: 'Rekap Lembur — Team Compound',
};

export default function OvertimePage() {
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
          🌙 Laporan Ekstra
        </span>
        <h1>Rekap Lembur Bulanan</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
          Rincian jam lembur harian setiap anggota tim dalam bentuk matriks kalender.
        </p>
      </div>
      <Overtime />
    </div>
  );
}
