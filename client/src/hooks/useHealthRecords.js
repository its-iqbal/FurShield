/**
 * hooks/useHealthRecords.js
 * Manages health record state for a specific pet:
 * fetching, creating, updating, deleting, and active record selection.
 */
import { useState, useEffect, useCallback } from 'react';
import HealthRecordService from '../api/healthRecordService.js';

export default function useHealthRecords(petId) {
  const [records,       setRecords]       = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [activeRecord,  setActiveRecord]  = useState(null);

  // ── Fetch all records for the given pet ───────────────────────────────────
  const fetchRecords = useCallback(async () => {
    if (!petId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await HealthRecordService.getByPet(petId);
      setRecords(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load health records.');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ── Create ────────────────────────────────────────────────────────────────
  const createRecord = useCallback(async (payload) => {
    const { data } = await HealthRecordService.create({ ...payload, petId });
    setRecords((prev) => [data.data, ...prev]);
    return data.data;
  }, [petId]);

  // ── Update ────────────────────────────────────────────────────────────────
  const updateRecord = useCallback(async (id, payload) => {
    const { data } = await HealthRecordService.update(id, payload);
    setRecords((prev) => prev.map((r) => (r._id === id ? data.data : r)));
    if (activeRecord?._id === id) setActiveRecord(data.data);
    return data.data;
  }, [activeRecord]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteRecord = useCallback(async (id) => {
    await HealthRecordService.remove(id);
    setRecords((prev) => prev.filter((r) => r._id !== id));
    if (activeRecord?._id === id) setActiveRecord(null);
  }, [activeRecord]);

  // ── Computed: group by year for timeline rendering ────────────────────────
  const recordsByYear = records.reduce((acc, r) => {
    const year = new Date(r.visitDate).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(r);
    return acc;
  }, {});

  const sortedYears = Object.keys(recordsByYear)
    .map(Number)
    .sort((a, b) => b - a); // newest year first

  // ── Upcoming vaccinations (next due within 90 days) ───────────────────────
  const upcomingVaccinations = records.flatMap((r) =>
    (r.vaccinations ?? [])
      .filter((v) => {
        if (!v.nextDueDate) return false;
        const diff = new Date(v.nextDueDate) - Date.now();
        return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000; // within 90 days
      })
      .map((v) => ({ ...v, recordId: r._id, petId: r.pet }))
  );

  return {
    records,
    loading,
    error,
    activeRecord,
    setActiveRecord,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    recordsByYear,
    sortedYears,
    upcomingVaccinations,
  };
}
