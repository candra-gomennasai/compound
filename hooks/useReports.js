"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useReports() {
  const [reports, setReports] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map snake_case from DB to camelCase for UI
      const formattedData = data.map(report => ({
        id: report.id,
        title: report.title,
        description: report.description ?? '',
        startTime: report.start_time ?? '',
        endTime: report.end_time ?? '',
        status: report.status,
        categoryId: report.category_id,
        categoryName: report.category_name ?? '',
        picId: report.pic_id,
        memberIds: report.member_ids ?? [],
        memberName: report.member_name ?? '',
        date: report.date,
        workType: report.work_type ?? 'Reguler',
        createdAt: report.created_at
      }));

      setReports(formattedData);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const addReport = async (report) => {
    const tempId = Date.now();
    const newReport = { 
      id: tempId, 
      date: new Date().toISOString(), 
      ...report 
    };
    setReports((prev) => [newReport, ...prev]);

    try {
      const payload = {
        title: report.title,
        description: report.description,
        start_time: report.startTime,
        end_time: report.endTime,
        status: report.status,
        category_id: report.categoryId,
        category_name: report.categoryName,
        pic_id: report.picId,
        member_ids: report.memberIds,
        member_name: report.memberName,
        date: report.date || new Date().toISOString(),
        work_type: report.workType
      };

      const { data, error } = await supabase
        .from('daily_reports')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // Update with exact data from DB
      setReports((prev) => prev.map(r => r.id === tempId ? {
        id: data.id,
        title: data.title,
        description: data.description ?? '',
        startTime: data.start_time ?? '',
        endTime: data.end_time ?? '',
        status: data.status,
        categoryId: data.category_id,
        categoryName: data.category_name ?? '',
        picId: data.pic_id,
        memberIds: data.member_ids ?? [],
        memberName: data.member_name ?? '',
        date: data.date,
        workType: data.work_type ?? 'Reguler',
        createdAt: data.created_at
      } : r));
    } catch (err) {
      console.error('Error adding report:', err);
      setReports((prev) => prev.filter(r => r.id !== tempId));
    }
  };

  const updateReport = async (id, dataToUpdate) => {
    const previousReports = [...reports];
    setReports((prev) => prev.map(r => r.id === id ? { ...r, ...dataToUpdate } : r));

    try {
      const payload = {};
      if (dataToUpdate.title !== undefined) payload.title = dataToUpdate.title;
      if (dataToUpdate.description !== undefined) payload.description = dataToUpdate.description;
      if (dataToUpdate.startTime !== undefined) payload.start_time = dataToUpdate.startTime;
      if (dataToUpdate.endTime !== undefined) payload.end_time = dataToUpdate.endTime;
      if (dataToUpdate.status !== undefined) payload.status = dataToUpdate.status;
      if (dataToUpdate.categoryId !== undefined) payload.category_id = dataToUpdate.categoryId;
      if (dataToUpdate.categoryName !== undefined) payload.category_name = dataToUpdate.categoryName;
      if (dataToUpdate.picId !== undefined) payload.pic_id = dataToUpdate.picId;
      if (dataToUpdate.memberIds !== undefined) payload.member_ids = dataToUpdate.memberIds;
      if (dataToUpdate.memberName !== undefined) payload.member_name = dataToUpdate.memberName;
      if (dataToUpdate.date !== undefined) payload.date = dataToUpdate.date;
      if (dataToUpdate.workType !== undefined) payload.work_type = dataToUpdate.workType;

      const { error } = await supabase
        .from('daily_reports')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating report:', err);
      setReports(previousReports);
    }
  };

  const deleteReport = async (id) => {
    const previousReports = [...reports];
    setReports((prev) => prev.filter(r => r.id !== id));

    try {
      const { error } = await supabase
        .from('daily_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting report:', err);
      setReports(previousReports);
    }
  };

  return { reports, addReport, updateReport, deleteReport, isLoaded };
}
