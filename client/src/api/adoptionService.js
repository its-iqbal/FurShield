import api from './axios.js';

const AdoptionService = {
  getListings:     (params = {})  => api.get('/adoptions',              { params }),
  getListingById:  (id)           => api.get(`/adoptions/${id}`),
  createListing:   (data)         => api.post('/adoptions',               data),
  updateListing:   (id, data)     => api.patch(`/adoptions/${id}`,        data),
  removeListing:   (id)           => api.delete(`/adoptions/${id}`),
  // Interests
  submitInterest:  (listingId, data) => api.post(`/adoption-interests/${listingId}`, data),
  getMyInterests:  ()             => api.get('/adoption-interests/my'),
  getShelterInterests: ()         => api.get('/adoption-interests/shelter'),
  updateInterest:  (id, data)     => api.patch(`/adoption-interests/${id}`, data),
};
export default AdoptionService;
