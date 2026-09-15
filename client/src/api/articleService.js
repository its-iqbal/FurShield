import api from './axios.js';

const ArticleService = {
  getAll:   (params = {}) => api.get('/care-articles',       { params }),
  getById:  (id)          => api.get(`/care-articles/${id}`),
  create:   (data)        => api.post('/care-articles',        data),
  update:   (id, data)    => api.patch(`/care-articles/${id}`, data),
  remove:   (id)          => api.delete(`/care-articles/${id}`),
  like:     (id)          => api.post(`/care-articles/${id}/like`),
};
export default ArticleService;
