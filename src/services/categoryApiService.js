import { apiClient } from './apiClient.js';
import { testDataApi } from '../data/testData.js';
import { isTestSession } from './sessionService.js';

export function getMainCategory() {
  if (isTestSession()) return Promise.resolve(testDataApi.getMainCategory());
  return apiClient.get('/categories/main');
}

export function updateMainCategory(data) {
  if (isTestSession()) return Promise.resolve(testDataApi.updateMainCategory(data));
  return apiClient.put('/categories/main', data);
}

export function getCategoryTree() {
  if (isTestSession()) return Promise.resolve(testDataApi.getCategoryTree());
  return apiClient.get('/categories/tree');
}

export function getCategoryById(id) {
  if (isTestSession()) return Promise.resolve(testDataApi.getCategoryById(id));
  return apiClient.get(`/categories/${id}`);
}

export function createCategory(data) {
  if (isTestSession()) return Promise.resolve(testDataApi.createCategory(data));
  return apiClient.post('/categories', data);
}

export function updateCategory(id, data) {
  if (isTestSession()) return Promise.resolve(testDataApi.updateCategory(id, data));
  return apiClient.put(`/categories/${id}`, data);
}

export function deleteCategory(id) {
  if (isTestSession()) return Promise.resolve(testDataApi.deleteCategory(id));
  return apiClient.delete(`/categories/${id}`);
}
