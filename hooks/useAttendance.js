"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useAttendance() {
  const [attendance, setAttendance] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  const loadAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*');

      if (error) throw error;

      // Map rows back to the nested object structure: { [date]: { [memberId]: status } }
      const formattedData = {};
      data.forEach(row => {
        if (!formattedData[row.date]) {
          formattedData[row.date] = {};
        }
        formattedData[row.date][row.member_id] = row.status;
      });

      setAttendance(formattedData);
    } catch (err) {
      console.error("Failed to load attendance:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // Update status kehadiran untuk member tertentu pada tanggal tertentu
  const updateAttendance = async (date, memberId, status) => {
    const previousAttendance = { ...attendance };
    setAttendance(prev => {
      const newAttendance = {
        ...prev,
        [date]: {
          ...(prev[date] || {}),
          [memberId]: status
        }
      };
      return newAttendance;
    });

    try {
      // Cek apakah sudah ada record untuk tanggal dan member ini
      const { data: existing, error: checkError } = await supabase
        .from('attendance')
        .select('id')
        .eq('date', date)
        .eq('member_id', memberId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError; // PGRST116 = No rows found
      }

      if (existing) {
        // Update
        const { error } = await supabase
          .from('attendance')
          .update({ status })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('attendance')
          .insert([{ date, member_id: memberId, status }]);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Failed to update attendance:', err);
      // Revert optimistic update
      setAttendance(previousAttendance);
    }
  };

  return { attendance, updateAttendance, isLoaded };
}
