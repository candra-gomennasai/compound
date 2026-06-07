"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const addNote = async (note) => {
    const tempId = Date.now();
    const newNote = { id: tempId, date: new Date().toISOString(), ...note };
    setNotes((prev) => [newNote, ...prev]);

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: note.title,
          text: note.text,
          color: note.color,
          date: note.date || new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      setNotes((prev) => prev.map(n => n.id === tempId ? data : n));
    } catch (err) {
      console.error('Error adding note:', err);
      setNotes((prev) => prev.filter(n => n.id !== tempId));
    }
  };

  const updateNote = async (id, dataToUpdate) => {
    const previousNotes = [...notes];
    setNotes((prev) => prev.map(n => n.id === id ? { ...n, ...dataToUpdate } : n));

    try {
      const payload = {};
      if (dataToUpdate.title !== undefined) payload.title = dataToUpdate.title;
      if (dataToUpdate.text !== undefined) payload.text = dataToUpdate.text;
      if (dataToUpdate.color !== undefined) payload.color = dataToUpdate.color;
      if (dataToUpdate.date !== undefined) payload.date = dataToUpdate.date;

      const { error } = await supabase
        .from('notes')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating note:', err);
      setNotes(previousNotes);
    }
  };

  const deleteNote = async (id) => {
    const previousNotes = [...notes];
    setNotes((prev) => prev.filter(n => n.id !== id));

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting note:', err);
      setNotes(previousNotes);
    }
  };

  return { notes, addNote, updateNote, deleteNote, isLoaded };
}
