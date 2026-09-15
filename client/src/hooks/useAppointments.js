/**
 * hooks/useAppointments.js
 * Manages appointment list state: fetching, booking, and status updates.
 */
import { useState, useEffect, useCallback } from 'react';
import AppointmentService from '../api/appointmentService.js';

export default function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [pagination,   setPagination]   = useState({ page: 1, totalPages: 1, total: 0 });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAppointments = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await AppointmentService.getMine({ limit: 20, ...params });
      setAppointments(data.data);
      if (data.meta) setPagination(data.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ── Book ──────────────────────────────────────────────────────────────────
  const bookAppointment = useCallback(async (payload) => {
    const { data } = await AppointmentService.create(payload);
    setAppointments((prev) => [data.data, ...prev]);
    return data.data;
  }, []);

  // ── Update status ─────────────────────────────────────────────────────────
  const updateStatus = useCallback(async (id, payload) => {
    const { data } = await AppointmentService.updateStatus(id, payload);
    setAppointments((prev) =>
      prev.map((a) => (a._id === id ? data.data : a))
    );
    return data.data;
  }, []);

  // ── Computed filters ──────────────────────────────────────────────────────
  const upcoming   = appointments.filter((a) => ['pending', 'confirmed', 'rescheduled'].includes(a.status));
  const past       = appointments.filter((a) => a.status === 'completed');
  const cancelled  = appointments.filter((a) => a.status === 'cancelled');

  return {
    appointments,
    upcoming,
    past,
    cancelled,
    loading,
    error,
    pagination,
    fetchAppointments,
    bookAppointment,
    updateStatus,
  };
}
