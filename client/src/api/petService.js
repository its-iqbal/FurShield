/**
 * api/petService.js
 * All pet-related API calls, using the configured axios instance.
 */
import api from './axios.js';

const PetService = {
  /** Fetch all pets belonging to the logged-in owner */
  getMyPets: () => api.get('/pets'),

  /** Fetch a single pet by id */
  getPetById: (id) => api.get(`/pets/${id}`),

  /** Create a new pet */
  addPet: (data) => api.post('/pets', data),

  /** Partially update a pet */
  updatePet: (id, data) => api.patch(`/pets/${id}`, data),

  /** Soft-delete a pet */
  deletePet: (id) => api.delete(`/pets/${id}`),

  /** Append image URLs to a pet's gallery */
  addImages: (id, urls) => api.post(`/pets/${id}/images`, { urls }),

  /** Append document URLs (X-rays, certs) to a pet's record */
  addDocuments: (id, urls) => api.post(`/pets/${id}/documents`, { urls }),
};

export default PetService;
