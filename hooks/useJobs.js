"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const addJob = async (job) => {
    const tempId = Date.now();
    const newJob = { ...job, id: tempId };
    setJobs((prev) => [newJob, ...prev]);

    try {
      const { data, error } = await supabase
        .from('job_categories')
        .insert([{
          name: job.name,
          color: job.color,
          description: job.description
        }])
        .select()
        .single();

      if (error) throw error;

      setJobs((prev) => prev.map(j => j.id === tempId ? data : j));
    } catch (err) {
      console.error('Error adding job:', err);
      setJobs((prev) => prev.filter(j => j.id !== tempId));
    }
  };

  const deleteJob = async (id) => {
    const previousJobs = [...jobs];
    setJobs((prev) => prev.filter(j => j.id !== id));

    try {
      const { error } = await supabase
        .from('job_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting job:', err);
      setJobs(previousJobs);
    }
  };

  const updateJob = async (id, dataToUpdate) => {
    const previousJobs = [...jobs];
    setJobs((prev) => prev.map(j => j.id === id ? { ...j, ...dataToUpdate } : j));

    try {
      const payload = {};
      if (dataToUpdate.name !== undefined) payload.name = dataToUpdate.name;
      if (dataToUpdate.color !== undefined) payload.color = dataToUpdate.color;
      if (dataToUpdate.description !== undefined) payload.description = dataToUpdate.description;

      const { error } = await supabase
        .from('job_categories')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating job:', err);
      setJobs(previousJobs);
    }
  };

  return { jobs, addJob, deleteJob, updateJob, isLoaded };
}
