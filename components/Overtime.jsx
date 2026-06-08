"use client";
import { useState } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { useReports } from '@/hooks/useReports';
import { useSettings } from '@/hooks/useSettings';
import { useHolidays } from '@/hooks/useHolidays';
import { Calendar, DollarSign, Umbrella, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import HolidayModal from './HolidayModal';
import styles from './Overtime.module.css';

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return h + m / 60;
};

// d.getDay() => 0: Sunday, 6: Saturday
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
      // Sabtu, Minggu, atau Hari Libur Custom dihitung sebagai Weekend untuk tarif lembur
      isWeekend: d.getDay() === 0 || d.getDay() === 6 || holidays.includes(fullDateStr)
    });
  }
  return days;
};

const getDepnakerIndex = (hours, isWeekend) => {
  let index = 0;
  
  if (isWeekend) {
    if (hours <= 7) {
      index = hours * 2;
    } else if (hours <= 8) {
      index = (7 * 2) + ((hours - 7) * 3);
    } else {
      index = (7 * 2) + (1 * 3) + ((hours - 8) * 4);
    }
  } else {
    if (hours <= 1) {
      index = hours * 1.5;
    } else {
      index = (1 * 1.5) + ((hours - 1) * 2);
    }
  }
  return index;
};

const formatRupiah = (number) => {
  const num = Number(number);
  if (isNaN(num)) return 'Rp0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};

export default function Overtime() {
  const { team, isLoaded: tLoaded } = useTeam();
  const { reports, isLoaded: rLoaded } = useReports();
  const { settings, updateSettings, isLoaded: sLoaded } = useSettings();
  const { holidays, toggleHoliday, isLoaded: hLoaded } = useHolidays();
  
  const [selectedMonth, setSelectedMonth] = useState(
    (() => {
      const today = new Date();
      const offset = today.getTimezoneOffset();
      return new Date(today.getTime() - (offset*60*1000)).toISOString().slice(0, 7);
    })()
  );

  const [editSalary, setEditSalary] = useState('');
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);

  const isLoaded = tLoaded && rLoaded && sLoaded && hLoaded;
  if (!isLoaded) return <div style={{ padding: 20, fontWeight: 700 }}>Memuat data lembur...</div>;

  const daysList = getDaysInMonth(selectedMonth, holidays);

  // Helper untuk jam lembur per anggota per tanggal
  const getOvertimeForDate = (member, dateStr) => {
    let totalHours = 0;

    reports.forEach(r => {
      if (!r.date) return;
      const reportDate = r.date.split('T')[0];
      if (reportDate !== dateStr) return;

      const isPic = String(r.picId) === String(member.id);
      const isMember = Array.isArray(r.memberIds) && r.memberIds.some(id => String(id) === String(member.id));
      const isMemberNameMatch = r.memberName && r.memberName.includes(member.name);
      const isAssigned = isPic || isMember || isMemberNameMatch;

      // ── Cara lama: workType === 'Lembur' → hanya untuk anggota yang ditugaskan ──
      if (isAssigned && r.workType === 'Lembur' && r.startTime && r.endTime) {
        const start = parseTime(r.startTime);
        const end = parseTime(r.endTime);
        let duration = end - start;
        if (duration < 0) duration += 24;
        totalHours += Math.max(0, duration);
      }

      // ── Cara baru: lemburPeriods → cek semua laporan, tidak harus ditugaskan ──
      if (Array.isArray(r.lemburPeriods)) {
        r.lemburPeriods.forEach(p => {
          if (!p.startTime || !p.endTime) return;

          const hasSpecificMembers = Array.isArray(p.lemburMemberIds) && p.lemburMemberIds.length > 0;

          if (hasSpecificMembers) {
            // Hanya hitung jika anggota ini dipilih secara eksplisit
            const isSelected = p.lemburMemberIds.some(id => String(id) === String(member.id));
            if (!isSelected) return;
          } else {
            // Tidak ada pilihan spesifik → hanya anggota yang ditugaskan di tugas itu
            if (!isAssigned) return;
          }

          const start = parseTime(p.startTime);
          const end = parseTime(p.endTime);
          let duration = end - start;
          if (duration < 0) duration += 24;
          totalHours += Math.max(0, duration);
        });
      }
    });

    // Aturan perusahaan: jika total lembur > 7 jam dalam sehari, dipotong 1 jam istirahat
    if (totalHours > 7) {
      totalHours = Math.max(0, totalHours - 1);
    }

    return totalHours;
  };

  const members = team.filter(m => !m.isPic).sort((a, b) => a.name.localeCompare(b.name));

  // Kalkulasi rekap total lembur per anggota
  const monthlyLemburReports = reports.filter(r => {
    if (!r.date) return false;
    const reportDate = r.date.split('T')[0];
    return reportDate.startsWith(selectedMonth) && r.workType === 'Lembur';
  });

  const memberStats = members.map(member => {
    let weekdayHours = 0;
    let weekendHours = 0;
    let totalIndex = 0;

    daysList.forEach(d => {
      const otHours = getOvertimeForDate(member, d.fullDateStr);
      if (otHours > 0) {
        if (d.isWeekend) {
          weekendHours += otHours;
        } else {
          weekdayHours += otHours;
        }
        totalIndex += getDepnakerIndex(otHours, d.isWeekend);
      }
    });

    const hourlyRate = settings.baseSalary / 173;
    const totalPay = totalIndex * hourlyRate;

    return { ...member, weekdayHours, weekendHours, totalHours: weekdayHours + weekendHours, totalIndex, totalPay };
  });

  const exportToExcel = () => {
    const dataToExport = memberStats.map((m, i) => {
      const row = {
        'No': i + 1,
        'Nama Anggota': m.name,
      };

      daysList.forEach(d => {
        const otHours = getOvertimeForDate(m, d.fullDateStr);
        row[`Tgl ${d.dateNum}`] = otHours > 0 ? otHours : 0;
      });

      row['Jam Hari Kerja'] = m.weekdayHours;
      row['Jam Hari Libur'] = m.weekendHours;
      row['Total Jam'] = m.totalHours;
      row['Total Indeks'] = m.totalIndex;
      row['Estimasi Gaji (Rp)'] = m.totalPay;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Lembur");
    
    const fileName = `Rekap_Lembur_${selectedMonth}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className={styles.wrap}>

      {/* ── Controls ── */}
      <div className={`${styles.controlsCard} card fade-up`}>

        {/* Bulan */}
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Bulan</span>
          <div className={styles.controlRow}>
            <Calendar size={16} strokeWidth={2.5} />
            <input
              type="month"
              className={styles.monthPicker}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.divider} />

        {/* UMR */}
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>
            Gaji Pokok / UMR &nbsp;
            <span style={{ fontWeight: 600, color: 'var(--green)', textTransform: 'none' }}>
              (aktif: {formatRupiah(settings.baseSalary)})
            </span>
          </span>
          <div className={styles.controlRow}>
            <DollarSign size={16} strokeWidth={2.5} />
            <input
              type="number"
              className={styles.salaryInput}
              placeholder="Masukkan nominal..."
              value={editSalary}
              onChange={e => setEditSalary(e.target.value)}
            />
            <button
              className={styles.saveBtn}
              onClick={() => {
                if (editSalary && !isNaN(editSalary)) {
                  updateSettings({ baseSalary: Number(editSalary) });
                  setEditSalary('');
                }
              }}
            >
              Simpan
            </button>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Atur Libur */}
        <button
          className={styles.holidayBtn}
          onClick={() => setIsHolidayModalOpen(true)}
        >
          <Umbrella size={16} strokeWidth={2.5} />
          Atur Libur
        </button>

      </div>

      <HolidayModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        selectedMonth={selectedMonth}
        daysList={daysList}
        holidays={holidays}
        toggleHoliday={toggleHoliday}
      />

      {/* ── Matrix Table ── */}
      <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className={styles.sectionTitle}>Matriks Lembur</span>
          <span className={styles.sectionPill}>{selectedMonth}</span>
        </div>
        <button onClick={exportToExcel} className="btn" style={{ background: '#107c41', color: 'white', padding: '6px 12px', fontSize: '0.75rem' }}>
          <Download size={14} /> Export Excel
        </button>
      </div>

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
                    const otHours = getOvertimeForDate(member, d.fullDateStr);
                    return (
                      <td key={d.dateNum} className={`${d.isWeekend ? styles.weekendCell : ''}`}>
                        <div className={styles.cellContent}>
                          {otHours > 0 ? (
                            <span className={styles.otBadge}>
                              {otHours % 1 === 0 ? otHours : otHours.toFixed(1)}j
                            </span>
                          ) : (
                            <span className={styles.emptyDash}>–</span>
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
      <div className={styles.sectionHeader} style={{ marginTop: '12px' }}>
        <span className={styles.sectionTitle}>Estimasi Upah Lembur</span>
        <span className={styles.sectionPill} style={{ background: '#d1fae5', borderColor: '#059669', color: '#047857' }}>
          Standar Depnaker
        </span>
      </div>

      <div className={`${styles.tableCard} card fade-up delay-2`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', paddingLeft: '16px' }}>Nama Anggota</th>
                <th>Hari Biasa<br /><span style={{ fontWeight: 600, fontSize: '0.65rem' }}>(jam)</span></th>
                <th>Libur / Sabtu<br /><span style={{ fontWeight: 600, fontSize: '0.65rem' }}>(jam)</span></th>
                <th>Total Jam</th>
                <th>Index<br /><span style={{ fontWeight: 600, fontSize: '0.65rem' }}>(pengali)</span></th>
                <th className={styles.summaryHeader}>Estimasi Upah (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {memberStats.map(member => (
                <tr key={`summary-${member.id}`}>
                  <td className={styles.summaryNameCell}>
                    <div className={styles.memberName}>
                      <div className={styles.colorIndicator} style={{ background: member.color }} />
                      {member.name}
                    </div>
                  </td>
                  <td>
                    {member.weekdayHours > 0
                      ? <span className={styles.statBadge} style={{ background: '#f3f4f6', color: '#374151' }}>
                          {member.weekdayHours % 1 === 0 ? member.weekdayHours : member.weekdayHours.toFixed(1)}
                        </span>
                      : <span style={{ color: 'var(--gray-200)' }}>–</span>}
                  </td>
                  <td>
                    {member.weekendHours > 0
                      ? <span className={styles.statBadge} style={{ background: '#fee2e2', color: '#b91c1c' }}>
                          {member.weekendHours % 1 === 0 ? member.weekendHours : member.weekendHours.toFixed(1)}
                        </span>
                      : <span style={{ color: 'var(--gray-200)' }}>–</span>}
                  </td>
                  <td>
                    {member.totalHours > 0
                      ? <span className={`${styles.statBadge} ${styles.lembur}`}>
                          {member.totalHours % 1 === 0 ? member.totalHours : member.totalHours.toFixed(1)} Jam
                        </span>
                      : <span style={{ color: 'var(--gray-200)' }}>–</span>}
                  </td>
                  <td>
                    {member.totalIndex > 0
                      ? <span className={styles.statBadge} style={{ background: '#111', color: '#fff', border: 'none' }}
                          title="Total jam setelah dikali rumus Depnaker (1.5x, 2x, 3x, dst)">
                          {member.totalIndex % 1 === 0 ? member.totalIndex : member.totalIndex.toFixed(1)} Jam
                        </span>
                      : <span style={{ color: 'var(--gray-200)' }}>–</span>}
                  </td>
                  <td className={styles.payCell}>
                    {member.totalPay > 0 ? formatRupiah(member.totalPay) : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

