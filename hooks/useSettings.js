"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

const DEFAULT_SETTINGS = {
  baseSalary: 4500000
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'base_salary')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({ baseSalary: data.value });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    const previousSettings = { ...settings };
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          key: 'base_salary',
          value: updated.baseSalary
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update settings:', err);
      setSettings(previousSettings);
    }
  };

  return { settings, updateSettings, isLoaded };
}
