import api from './axios.js';

const ProductService = {
  getAll:    (params = {}) => api.get('/products',         { params }),
  getById:   (id)          => api.get(`/products/${id}`),
  create:    (data)        => api.post('/products',          data),
  update:    (id, data)    => api.patch(`/products/${id}`,   data),
  remove:    (id)          => api.delete(`/products/${id}`),
  addReview: (id, data)    => api.post(`/products/${id}/reviews`, data),
};
export default ProductService;
