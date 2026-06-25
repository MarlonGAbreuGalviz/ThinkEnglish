import { apiClient } from './apiClient.js';
import { testDataApi } from '../data/testData.js';
import { isTestSession } from './sessionService.js';

export function getLevelsByCategory(categoryId) {
  if (isTestSession()) return Promise.resolve(testDataApi.getLevelsByCategory(categoryId));
  return apiClient.get(`/categories/${categoryId}/levels`);
}

export function getLevel(id) {
  if (isTestSession()) return Promise.resolve(testDataApi.getLevel(id));
  return apiClient.get(`/levels/${id}`);
}

function buildLevelFormData(data) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('categoryId', data.categoryId);
  if (data.exampleVideo) {
    formData.append('exampleVideo', data.exampleVideo);
  }
  return formData;
}

export function createLevel(data) {
  if (isTestSession()) return Promise.resolve(testDataApi.createLevel(data));
  return apiClient.postForm('/levels', buildLevelFormData(data));
}

export function updateLevel(id, data) {
  if (isTestSession()) return Promise.resolve(testDataApi.updateLevel(id, data));
  return apiClient.putForm(`/levels/${id}`, buildLevelFormData(data));
}

export function deleteLevel(id) {
  if (isTestSession()) return Promise.resolve(testDataApi.deleteLevel(id));
  return apiClient.delete(`/levels/${id}`);
}
