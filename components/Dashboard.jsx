"use client";
import { useState } from 'react';
import { useReports } from '@/hooks/useReports';
import { useJobs } from '@/hooks/useJobs';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { CheckCircle2, Clock3, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import styles from './Dashboard.module.css';

// Fun color palette for bar chart days
const BAR_COLORS = ['#FF4747','#FF6B35','#FFD60A','#06D6A0','#0096FF','#7B2FBE','#FF3D9A'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const fullDate = payload[0].payload.dateStr || label;
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{fullDate}</p>
        <p className={styles.tooltipValue}>{payload[0].value} tugas selesai</p>
      </div>
    );
  }
  return null;
};

const STAT_CARDS = [
  { key: 'total',    label: 'Total Tugas',     color: '#FFD60A', textColor: '#000' },
  { key: 'done',     label: 'Selesai',         color: '#06D6A0', textColor: '#000' },
  { key: 'progress', label: 'Sedang Berjalan', color: '#FF6B35', textColor: '#000' },
  { key: 'todo',     label: 'Belum Mulai',     color: '#7B2FBE', textColor: '#fff' },
];

export default function Dashboard() {
  const { reports, isLoaded: rLoaded } = useReports();
  const { jobs, isLoaded: jLoaded } = useJobs();
  const [timeframe, setTimeframe] = useState('7d');
  const isLoaded = rLoaded && jLoaded;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';
  const today = format(now, "EEEE, d MMMM yyyy", { locale: idLocale });

  if (!isLoaded) {
    return (
      <div className={styles.wrap}>
        <div className={`skeleton ${styles.skeletonHero}`} />
        <div className={styles.statsGrid}>
          {[1,2,3].map(i => <div key={i} className={`skeleton ${styles.skeletonStat}`} />)}
        </div>
        <div className={`skeleton ${styles.skeletonChart}`} />
      </div>
    );
  }

  let chartData = [];
  if (timeframe === '7d') {
    chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(now, 6 - i);
      return { dateObj: d, dateStr: format(d, 'dd MMM', { locale: idLocale }), label: format(d, 'EEE', { locale: idLocale }), tasksCompleted: 0 };
    });
  } else if (timeframe === '1m') {
    chartData = Array.from({ length: 30 }).map((_, i) => {
      const d = subDays(now, 29 - i);
      return { dateObj: d, dateStr: format(d, 'dd MMM', { locale: idLocale }), label: (29 - i) % 5 === 0 ? format(d, 'dd MMM', { locale: idLocale }) : '', tasksCompleted: 0 };
    });
  } else if (timeframe === '3m') {
    chartData = Array.from({ length: 12 }).map((_, i) => {
      const start = startOfWeek(subWeeks(now, 11 - i), { weekStartsOn: 1 });
      const end = endOfWeek(start, { weekStartsOn: 1 });
      return { dateObj: start, dateStr: `${format(start, 'dd MMM')} - ${format(end, 'dd MMM')}`, label: format(start, 'dd MMM', { locale: idLocale }), tasksCompleted: 0 };
    });
  } else if (timeframe === '6m') {
    chartData = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(now, 5 - i);
      return { dateObj: d, dateStr: format(d, 'MMMM yyyy', { locale: idLocale }), label: format(d, 'MMM', { locale: idLocale }), tasksCompleted: 0 };
    });
  } else if (timeframe === '1y') {
    chartData = Array.from({ length: 12 }).map((_, i) => {
      const d = subMonths(now, 11 - i);
      return { dateObj: d, dateStr: format(d, 'MMMM yyyy', { locale: idLocale }), label: format(d, 'MMM', { locale: idLocale }), tasksCompleted: 0 };
    });
  }

  reports.forEach(r => {
    if (r.status === 'Done' && r.date) {
      const rDate = new Date(r.date);
      let bucket = null;
      if (timeframe === '7d' || timeframe === '1m') {
        bucket = chartData.find(b => format(b.dateObj, 'yyyy-MM-dd') === format(rDate, 'yyyy-MM-dd'));
      } else if (timeframe === '3m') {
        bucket = chartData.find(b => rDate >= b.dateObj && rDate <= endOfWeek(b.dateObj, { weekStartsOn: 1 }));
      } else {
        bucket = chartData.find(b => format(b.dateObj, 'yyyy-MM') === format(rDate, 'yyyy-MM'));
      }
      if (bucket) bucket.tasksCompleted += 1;
    }
  });

  const total      = reports.length;
  const done       = reports.filter(r => r.status === 'Done').length;
  const inProgress = reports.filter(r => r.status === 'In Progress').length;
  const todo       = reports.filter(r => r.status === 'To Do').length;
  const pct        = total === 0 ? 0 : Math.round((done / total) * 100);

  const statValues = { total, done, progress: inProgress, todo };

  const categoryStats = jobs.map(job => {
    const jobReports = reports.filter(r => String(r.categoryId) === String(job.id) || r.categoryName === job.name);
    return {
      key: job.id,
      label: job.name,
      color: job.color || '#FFD60A',
      total: jobReports.length,
    };
  });

  const pieData = categoryStats.filter(c => c.total > 0).map(c => ({
    name: c.label,
    value: c.total,
    color: c.color
  }));

  return (
    <div className={styles.wrap}>

      {/* ── Hero ── */}
      <header className={`${styles.hero} card fade-up`}>
        <div className={styles.heroLeft}>
          <span className={styles.heroBadge}>📋 Laporan Harian GA</span>
          <h1 className={styles.heroTitle}>Dashboard</h1>
          <p className={styles.heroSub}>{greeting} 👋 — <span style={{ textTransform: 'capitalize' }}>{today}</span></p>
        </div>
        <Link href="/add" className={`btn btn-primary ${styles.heroBtn}`}>
          <Plus size={16} strokeWidth={3} />
          Tambah Laporan
        </Link>
      </header>

      {/* ── Stat cards ── */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map(({ key, label, color, textColor }, i) => (
          <div
            key={key}
            className={`${styles.statCard} card fade-up delay-${i + 1}`}
            style={{ background: color }}
          >
            <p className={styles.statLabel} style={{ color: textColor }}>{label}</p>
            <p className={styles.statValue} style={{ color: textColor }}>{statValues[key]}</p>
            {key === 'done' && <p className={styles.statSub} style={{ color: textColor }}>{pct}% dari total</p>}
          </div>
        ))}
      </div>

      {/* ── Category Breakdown ── */}
      <div className={`${styles.chartCard} card fade-up delay-2`}>
        <div className={styles.chartHeader}>
          <div>
            <p className={styles.sectionLabel}>Distribusi per Kategori</p>
            <p className={styles.chartSub}>Pekerjaan berdasarkan kategori</p>
          </div>
        </div>
        {pieData.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  stroke="#000"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: 0, border: '2px solid #000', boxShadow: '2px 2px 0 0 #000', fontWeight: 700 }}
                  itemStyle={{ color: '#000' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ 
              width: '100%', 
              maxHeight: '130px', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px',
              paddingTop: '16px',
              paddingRight: '8px',
              borderTop: '2px solid var(--black)',
              marginTop: '8px'
            }}>
              {pieData.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 900 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '14px', height: '14px', background: entry.color, border: '2px solid var(--black)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2 }}>
                      {entry.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--black)' }}>{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: 700 }}>Belum ada data laporan</p>
          </div>
        )}
      </div>




      {/* ── Chart — Line Chart ── */}
      <div className={`${styles.chartCard} card fade-up delay-3`}>
        <div className={styles.chartHeader}>
          <div>
            <p className={styles.sectionLabel}>Tren Penyelesaian Tugas</p>
            <p className={styles.chartSub}>Perkembangan tugas selesai dari waktu ke waktu</p>
          </div>
          <TrendingUp size={18} color="var(--orange)" strokeWidth={2.5} />
        </div>
        
        <div className={styles.filterRow}>
          {['7d', '1m', '3m', '6m', '1y'].map(val => (
            <button 
              key={val}
              className={`${styles.filterBtn} ${timeframe === val ? styles.active : ''}`}
              onClick={() => setTimeframe(val)}
            >
              {val === '7d' ? '7 Hari' : val === '1m' ? '1 Bulan' : val === '3m' ? '3 Bulan' : val === '6m' ? '6 Bulan' : '1 Tahun'}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-200)" strokeWidth={1} />
            <XAxis dataKey="label" axisLine={false} tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }} dy={8} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }} dx={-4} width={24} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--gray-200)', strokeWidth: 2, strokeDasharray: '4 4' }} />
            <Line 
              type="monotone" 
              dataKey="tasksCompleted" 
              stroke="var(--black)" 
              strokeWidth={3} 
              dot={{ fill: 'var(--yellow)', stroke: 'var(--black)', strokeWidth: 2, r: 4 }} 
              activeDot={{ r: 6, fill: 'var(--orange)' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>


    </div>
  );
}
