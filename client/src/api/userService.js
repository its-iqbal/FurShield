import api from './axios.js';

const UserService = {
  getProfile:      ()       => api.get('/users/profile'),
  updateProfile:   (data)   => api.patch('/users/profile', data),
  changePassword:  (data)   => api.patch('/users/change-password', data),
  deleteAccount:   ()       => api.delete('/users/me'),
  // Vet-specific
  getVets:         (params = {}) => api.get('/users/vets', { params }),
  getVetById:      (id)     => api.get(`/users/vets/${id}`),
  // Shelter-specific
  getShelters:     (params = {}) => api.get('/users/shelters', { params }),
};
export default UserService;
