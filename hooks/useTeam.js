"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useTeam() {
  const [team, setTeam] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fungsi untuk memuat data dari Supabase
  const loadTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map is_pic to isPic for compatibility with existing components
      const formattedData = data.map(member => ({
        ...member,
        isPic: member.is_pic,
      }));
      setTeam(formattedData);
    } catch (err) {
      console.error('Error loading team:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const addMember = async (member) => {
    // Generate temporary ID for optimistic UI update
    const tempId = Date.now();
    const newMember = { ...member, id: tempId };
    setTeam((prev) => [newMember, ...prev]);

    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          name: member.name,
          role: member.role,
          email: member.email,
          color: member.color,
          is_pic: member.isPic || false
        }])
        .select()
        .single();

      if (error) throw error;

      // Update state with actual ID from DB
      setTeam((prev) => prev.map(m => m.id === tempId ? { ...data, isPic: data.is_pic } : m));
    } catch (err) {
      console.error('Error adding team member:', err);
      // Revert optimistic update
      setTeam((prev) => prev.filter(m => m.id !== tempId));
    }
  };

  const deleteMember = async (id) => {
    // Optimistic UI update
    const previousTeam = [...team];
    setTeam((prev) => prev.filter(m => m.id !== id));

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting team member:', err);
      // Revert
      setTeam(previousTeam);
    }
  };

  const updateMember = async (id, dataToUpdate) => {
    // Optimistic UI update
    const previousTeam = [...team];
    setTeam((prev) => prev.map(m => m.id === id ? { ...m, ...dataToUpdate } : m));

    try {
      const payload = {};
      if (dataToUpdate.name !== undefined) payload.name = dataToUpdate.name;
      if (dataToUpdate.role !== undefined) payload.role = dataToUpdate.role;
      if (dataToUpdate.email !== undefined) payload.email = dataToUpdate.email;
      if (dataToUpdate.color !== undefined) payload.color = dataToUpdate.color;
      if (dataToUpdate.isPic !== undefined) payload.is_pic = dataToUpdate.isPic;

      const { error } = await supabase
        .from('team_members')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating team member:', err);
      // Revert
      setTeam(previousTeam);
    }
  };

  return { team, addMember, deleteMember, updateMember, isLoaded };
}
