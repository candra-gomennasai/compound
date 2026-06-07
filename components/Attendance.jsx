"use client";
import { useState } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { useTeam } from '@/hooks/useTeam';
import { useReports } from '@/hooks/useReports';
import { Clock, CheckSquare, Calendar, Users } from 'lucide-react';
import styles from './Attendance.module.css';

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return h + m / 60;
};

export default function Attendance() {
  const { team, isLoaded: tLoaded } = useTeam();
  const { reports, isLoaded: rLoaded } = useReports();
  const { attendance, updateAttendance, isLoaded: aLoaded } = useAttendance();
  
  const [selectedDate, setSelectedDate] = useState(
    (() => {
      const today = new Date();
      const offset = today.getTimezoneOffset();
      return new Date(today.getTime() - (offset*60*1000)).toISOString().split('T')[0];
    })()
  );

  const isLoaded = tLoaded && rLoaded && aLoaded;

  if (!isLoaded) return <div style={{ padding: 20, fontWeight: 700 }}>Memuat data absensi...</div>;

  // Mendapatkan data absensi untuk hari yang dipilih (atau default kosong)
  const todayAttendance = attendance[selectedDate] || {};

  // Fungsi kalkulasi lembur otomatis dari laporan tugas
  const calculateOvertime = (member) => {
    let totalOvertimeHours = 0;
    const timeRanges = [];

    // Filter laporan pada tanggal ini yang bertipe 'Lembur'
    const dailyLemburReports = reports.filter(r => {
      if (!r.date) return false;
      const reportDate = r.date.split('T')[0];
      if (reportDate !== selectedDate) return false;
      if (r.workType !== 'Lembur') return false;

      // Cek apakah member ini terlibat di laporan tersebut
      const isPic = String(r.picId) === String(member.id);
      const isMember = Array.isArray(r.memberIds) && r.memberIds.some(id => String(id) === String(member.id));
      const isMemberNameMatch = Array.isArray(r.memberName) ? r.memberName.some(name => name === member.name) : r.memberName === member.name;

      return isPic || isMember || isMemberNameMatch;
    });

    dailyLemburReports.forEach(r => {
      if (r.startTime && r.endTime) {
        const start = parseTime(r.startTime);
        const end = parseTime(r.endTime);
        let duration = end - start;
        // Jika lewat tengah malam (misal 22:00 s.d 02:00)
        if (duration < 0) duration += 24; 
        
        totalOvertimeHours += Math.max(0, duration);
        timeRanges.push(`${r.startTime} - ${r.endTime}`);
      }
    });

    return { total: totalOvertimeHours, ranges: timeRanges };
  };

  // Status buttons
  const STATUSES = [
    { id: 'Hadir',   label: 'Hadir' },
    { id: 'Cuti',    label: 'Cuti' },
    { id: 'Mangkir', label: 'Mangkir' },
    { id: 'Libur',   label: 'Libur' }
  ];

  let totalHadir = 0;
  let totalLembur = 0;

  const memberRows = team
    .filter(member => !member.isPic)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(member => {
      const status = todayAttendance[member.id] || 'Mangkir';
      if (status === 'Hadir') totalHadir++;
      
      const overtime = calculateOvertime(member);
      if (overtime.total > 0) totalLembur++;

      return { ...member, status, overtime };
    });

  return (
    <div className={styles.wrap}>
      
      {/* ── Controls & Stats ── */}
      <div className={`${styles.controlsCard} card fade-up`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={20} strokeWidth={2.5} />
          <input 
            type="date" 
            className={styles.datePicker}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        
        <div className={styles.statsRow}>
          <span className={styles.statBadge}>
            <CheckSquare size={14} color="#06D6A0" strokeWidth={3} />
            {totalHadir} / {memberRows.length} Hadir
          </span>
          <span className={styles.statBadge}>
            <Clock size={14} color="#FF6B35" strokeWidth={3} />
            {totalLembur} Lembur
          </span>
        </div>
      </div>

      {/* ── Attendance List ── */}
      <div className={`${styles.listCard} card fade-up delay-1`}>
        <div className={styles.listHeader}>
          <div>Nama Anggota</div>
          <div>Status Kehadiran</div>
          <div style={{ textAlign: 'center' }}>Jam Lembur</div>
        </div>

        <div>
          {memberRows.map((member, idx) => (
            <div key={member.id} className={styles.listItem} style={{ animationDelay: `${idx * 0.05}s` }}>
              
              {/* Member Info */}
              <div className={styles.memberInfo}>
                <div className={styles.colorIndicator} style={{ background: member.color }} />
                <div>
                  <div className={styles.memberName}>
                    {member.name} {member.isPic && '🌟'}
                  </div>
                  <div className={styles.memberRole}>{member.role}</div>
                </div>
              </div>

              {/* Status Selector */}
              <div className={styles.statusGroup}>
                {STATUSES.map(s => {
                  const isActive = member.status === s.id;
                  const activeClass = isActive ? styles[`active${s.id}`] : '';
                  return (
                    <button
                      key={s.id}
                      className={`${styles.statusBtn} ${activeClass}`}
                      onClick={() => updateAttendance(selectedDate, member.id, s.id)}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* Overtime Info (Auto-Calculated) */}
              <div className={styles.overtimeCol}>
                {member.overtime.total > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span className={styles.overtimeBadge} title="Dihitung otomatis dari Laporan Tugas (Work Type = Lembur)">
                      <Clock size={12} strokeWidth={3} />
                      {member.overtime.total % 1 === 0 ? member.overtime.total : member.overtime.total.toFixed(1)} Jam
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                      {member.overtime.ranges.join(', ')}
                    </span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--gray-200)', fontWeight: 800 }}>—</span>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
