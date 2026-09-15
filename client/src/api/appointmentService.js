/**
 * api/appointmentService.js
 * All appointment-related API calls.
 */
import api from './axios.js';

const AppointmentService = {
  /** Book a new appointment */
  create:      (data)            => api.post('/appointments', data),

  /** Get all appointments for the current user (paginated) */
  getMine:     (params = {})     => api.get('/appointments/my', { params }),

  /** Get a single appointment by id */
  getById:     (id)              => api.get(`/appointments/${id}`),

  /** Update appointment status (confirm/cancel/reschedule/complete) */
  updateStatus:(id, data)        => api.patch(`/appointments/${id}/status`, data),

  /** Auto-suggest vets by condition keyword and/or city */
  suggestVets: (params = {})     => api.get('/appointments/suggest-vets', { params }),

  /** Full vet directory search with pagination */
  searchVets:  (params = {})     => api.get('/users/vets', { params }),
};

export default AppointmentService;
