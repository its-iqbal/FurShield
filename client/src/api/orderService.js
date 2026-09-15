import api from './axios.js';

const OrderService = {
  getCart:      ()            => api.get('/orders/cart'),
  addToCart:    (data)        => api.post('/orders/cart',         data),
  updateItem:   (id, data)    => api.patch(`/orders/cart/${id}`,  data),
  removeItem:   (id)          => api.delete(`/orders/cart/${id}`),
  clearCart:    ()            => api.delete('/orders/cart'),
  placeOrder:   (data)        => api.post('/orders/place',        data),
  getMyOrders:  (params = {}) => api.get('/orders/my',            { params }),
  getById:      (id)          => api.get(`/orders/${id}`),
};
export default OrderService;
