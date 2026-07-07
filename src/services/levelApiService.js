import { apiClient } from './apiClient.js';

export function getLevelsByCategory(categoryId) {
  return apiClient.get(`/categories/${categoryId}/levels`);
}

export function getLevel(id) {
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
  return apiClient.postForm('/levels', buildLevelFormData(data));
}

export function updateLevel(id, data) {
  return apiClient.putForm(`/levels/${id}`, buildLevelFormData(data));
}

export function deleteLevel(id) {
  return apiClient.delete(`/levels/${id}`);
}