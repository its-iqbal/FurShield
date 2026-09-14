/**
 * api/healthRecordService.js
 * All health-record-related API calls.
 */
import api from './axios.js';

const HealthRecordService = {
  /** Fetch all records for a specific pet */
  getByPet:      (petId)       => api.get(`/health-records/pet/${petId}`),

  /** Fetch a single record */
  getById:       (id)          => api.get(`/health-records/${id}`),

  /** Create a new record */
  create:        (data)        => api.post('/health-records', data),

  /** Update an existing record (vet only for clinical fields) */
  update:        (id, data)    => api.patch(`/health-records/${id}`, data),

  /** Delete a record */
  remove:        (id)          => api.delete(`/health-records/${id}`),
};

export default HealthRecordService;
