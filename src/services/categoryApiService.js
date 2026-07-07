import { apiClient } from './apiClient.js';

export function getMainCategory() {
  return apiClient.get('/categories/main');
}

export function updateMainCategory(data) {
  return apiClient.put('/categories/main', data);
}

export function getCategoryTree() {
  return apiClient.get('/categories/tree');
}

export function getCategoryById(id) {
  return apiClient.get(`/categories/${id}`);
}

export function createCategory(data) {
  return apiClient.post('/categories', data);
}

export function updateCategory(id, data) {
  return apiClient.put(`/categories/${id}`, data);
}

export function deleteCategory(id) {
  return apiClient.delete(`/categories/${id}`);
}