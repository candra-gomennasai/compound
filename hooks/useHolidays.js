"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useHolidays() {
  const [holidays, setHolidays] = useState([]); // Array of 'YYYY-MM-DD' strings
  const [isLoaded, setIsLoaded] = useState(false);

  const loadHolidays = async () => {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.dates) {
        setHolidays(data.dates);
      }
    } catch (err) {
      console.error('Failed to load holidays:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const toggleHoliday = async (dateStr) => {
    const previousHolidays = [...holidays];
    let updated;
    if (holidays.includes(dateStr)) {
      updated = holidays.filter(d => d !== dateStr);
    } else {
      updated = [...holidays, dateStr];
    }
    setHolidays(updated);

    try {
      const { error } = await supabase
        .from('holidays')
        .upsert({
          id: 1,
          dates: updated
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update holidays:', err);
      setHolidays(previousHolidays);
    }
  };

  return { holidays, toggleHoliday, isLoaded };
}
