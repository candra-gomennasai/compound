"use client";
import { useState } from 'react';
import Attendance from './Attendance';
import AttendanceMonthly from './AttendanceMonthly';

export default function AttendanceWrapper() {
  const [viewMode, setViewMode] = useState('harian'); // 'harian' | 'bulanan'

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => setViewMode('harian')}
          style={{
            padding: '8px 16px',
            background: viewMode === 'harian' ? '#00B4D8' : '#fff',
            color: '#000',
            border: '2px solid #000',
            boxShadow: viewMode === 'harian' ? 'inset 0 0 0 2px #fff, 2px 2px 0 0 #000' : '2px 2px 0 0 #000',
            fontWeight: 900,
            cursor: 'pointer',
            transform: viewMode === 'harian' ? 'translate(-2px, -2px)' : 'none',
            transition: 'all 0.1s'
          }}
        >
          Harian
        </button>
        <button 
          onClick={() => setViewMode('bulanan')}
          style={{
            padding: '8px 16px',
            background: viewMode === 'bulanan' ? '#00B4D8' : '#fff',
            color: '#000',
            border: '2px solid #000',
            boxShadow: viewMode === 'bulanan' ? 'inset 0 0 0 2px #fff, 2px 2px 0 0 #000' : '2px 2px 0 0 #000',
            fontWeight: 900,
            cursor: 'pointer',
            transform: viewMode === 'bulanan' ? 'translate(-2px, -2px)' : 'none',
            transition: 'all 0.1s'
          }}
        >
          Rekap Bulanan
        </button>
      </div>

      {viewMode === 'harian' ? <Attendance /> : <AttendanceMonthly />}
    </div>
  );
}
