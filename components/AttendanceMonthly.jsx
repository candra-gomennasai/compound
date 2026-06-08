"use client";
import { useState } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { useTeam } from '@/hooks/useTeam';
import { useReports } from '@/hooks/useReports';
import { useHolidays } from '@/hooks/useHolidays';
import { Calendar } from 'lucide-react';
import styles from './AttendanceMonthly.module.css';

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return h + m / 60;
};

const getDaysInMonth = (monthStr, holidays = []) => {
  const [year, month] = monthStr.split('-');
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  
  for(let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month - 1, i);
    const fullDateStr = `${year}-${month}-${String(i).padStart(2, '0')}`;
    days.push({
      dateNum: i,
      dayName: dayNames[d.getDay()],
      fullDateStr,
      isWeekend: d.getDay() === 0 || d.getDay() === 6 || holidays.includes(fullDateStr)
    });
  }
  return days;
};

export default function AttendanceMonthly() {
  const { team, isLoaded: tLoaded } = useTeam();
  const { reports, isLoaded: rLoaded } = useReports();
  const { attendance, isLoaded: aLoaded } = useAttendance();
  const { holidays, isLoaded: hLoaded } = useHolidays();
  
  const [selectedMonth, setSelectedMonth] = useState(
    (() => {
      const today = new Date();
      const offset = today.getTimezoneOffset();
      return new Date(today.getTime() - (offset*60*1000)).toISOString().slice(0, 7);
    })()
  );

  const isLoaded = tLoaded && rLoaded && aLoaded && hLoaded;
  if (!isLoaded) return <div style={{ padding: 20, fontWeight: 700 }}>Memuat rekap bulanan...</div>;

  const daysList = getDaysInMonth(selectedMonth, holidays);

  // Helper untuk jam lembur per anggota per tanggal
  const getOvertimeForDate = (member, dateStr) => {
    const dailyLemburReports = reports.filter(r => {
      if (!r.date || r.workType !== 'Lembur') return false;
      const reportDate = r.date.split('T')[0];
      if (reportDate !== dateStr) return false;

      const isPic = String(r.picId) === String(member.id);
      const isMember = Array.isArray(r.memberIds) && r.memberIds.some(id => String(id) === String(member.id));
      const isMemberNameMatch = r.memberName && r.memberName.includes(member.name);

      return isPic || isMember || isMemberNameMatch;
    });

    let totalHours = 0;
    dailyLemburReports.forEach(r => {
      if (r.startTime && r.endTime) {
        const start = parseTime(r.startTime);
        const end = parseTime(r.endTime);
        let duration = end - start;
        if (duration < 0) duration += 24; 
        totalHours += Math.max(0, duration);
      }
    });
    return totalHours;
  };
  const members = team.filter(m => !m.isPic).sort((a, b) => a.name.localeCompare(b.name));

  // Kalkulasi rekap total per anggota
  const monthlyAttendanceDays = Object.keys(attendance).filter(date => date.startsWith(selectedMonth));
  const monthlyLemburReports = reports.filter(r => {
    if (!r.date) return false;
    const reportDate = r.date.split('T')[0];
    return reportDate.startsWith(selectedMonth) && r.workType === 'Lembur';
  });

  const memberStats = members.map(member => {
    let hadir = 0, cuti = 0, mangkir = 0;
    let lemburHours = 0;

    monthlyAttendanceDays.forEach(date => {
      const status = attendance[date][member.id];
      if (status === 'Hadir') hadir++;
      else if (status === 'Cuti') cuti++;
      else if (status === 'Mangkir') mangkir++;
    });

    const memberLembur = monthlyLemburReports.filter(r => {
      const isPic = String(r.picId) === String(member.id);
      const isMember = Array.isArray(r.memberIds) && r.memberIds.some(id => String(id) === String(member.id));
      const isMemberNameMatch = r.memberName && r.memberName.includes(member.name);
      return isPic || isMember || isMemberNameMatch;
    });

    memberLembur.forEach(r => {
      if (r.startTime && r.endTime) {
        const start = parseTime(r.startTime);
        const end = parseTime(r.endTime);
        let duration = end - start;
        if (duration < 0) duration += 24; 
        lemburHours += Math.max(0, duration);
      }
    });

    return { ...member, hadir, cuti, mangkir, lemburHours };
  });

  return (
    <div className={styles.wrap}>
      {/* ── Controls ── */}
      <div className={`${styles.controlsCard} card fade-up`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={20} strokeWidth={2.5} />
          <input 
            type="month" 
            className={styles.monthPicker}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className={styles.legend}>
          <span className={`${styles.legendItem} ${styles.hadir}`}>H: Hadir</span>
          <span className={`${styles.legendItem} ${styles.cuti}`}>C: Cuti</span>
          <span className={`${styles.legendItem} ${styles.mangkir}`}>M: Mangkir</span>
        </div>
      </div>

      {/* ── Matrix Table ── */}
      <div className={`${styles.tableCard} card fade-up delay-1`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th rowSpan="2" className={styles.stickyCol}>Nama Anggota</th>
                {daysList.map(d => (
                  <th key={d.dateNum} className={d.isWeekend ? styles.weekendHeader : ''}>
                    {d.dateNum}
                  </th>
                ))}
              </tr>
              <tr>
                {daysList.map(d => (
                  <th key={`day-${d.dateNum}`} className={`${styles.daySubHeader} ${d.isWeekend ? styles.weekendHeader : ''}`}>
                    {d.dayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id}>
                  <td className={styles.stickyCol}>
                    <div className={styles.memberName}>
                      <div className={styles.colorIndicator} style={{ background: member.color }} />
                      <span className={styles.nameText}>{member.name}</span>
                    </div>
                  </td>
                  
                  {daysList.map(d => {
                    const statusObj = attendance[d.fullDateStr];
                    const status = statusObj ? statusObj[member.id] : null;
                    const otHours = getOvertimeForDate(member, d.fullDateStr);
                    
                    let statusChar = '-';
                    let statusClass = '';
                    
                    if (status === 'Hadir') { statusChar = 'H'; statusClass = styles.hadir; }
                    else if (status === 'Cuti') { statusChar = 'C'; statusClass = styles.cuti; }
                    else if (status === 'Mangkir') { statusChar = 'M'; statusClass = styles.mangkir; }

                    return (
                      <td key={d.dateNum} className={`${styles.cell} ${d.isWeekend ? styles.weekendCell : ''}`}>
                        <div className={styles.cellContent}>
                          {statusChar !== '-' ? (
                            <span className={`${styles.statusIcon} ${statusClass}`}>{statusChar}</span>
                          ) : (
                            <span className={styles.emptyDash}>-</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Summary Table ── */}
      <h3 style={{ marginTop: '32px', marginBottom: '8px', fontSize: '1.2rem', fontWeight: 900 }}>Total Rekapitulasi</h3>
      <div className={`${styles.tableCard} card fade-up delay-2`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Nama Anggota</th>
                <th>Total Hadir</th>
                <th>Total Cuti</th>
                <th>Total Mangkir</th>
              </tr>
            </thead>
            <tbody>
              {memberStats.map(member => (
                <tr key={`summary-${member.id}`}>
                  <td style={{ textAlign: 'left', fontWeight: 900 }}>
                    <div className={styles.memberName}>
                      <div className={styles.colorIndicator} style={{ background: member.color }} />
                      {member.name}
                    </div>
                  </td>
                  <td>{member.hadir > 0 ? <span className={`${styles.statBadge} ${styles.hadir}`}>{member.hadir}</span> : '-'}</td>
                  <td>{member.cuti > 0 ? <span className={`${styles.statBadge} ${styles.cuti}`}>{member.cuti}</span> : '-'}</td>
                  <td>{member.mangkir > 0 ? <span className={`${styles.statBadge} ${styles.mangkir}`}>{member.mangkir}</span> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
