import { apiClient } from './apiClient.js';

export function getExercisesByLevel(levelId) {
  return apiClient.get(`/levels/${levelId}/exercises`);
}

export function createExercise(data) {
  return apiClient.post('/exercises', data);
}

export function updateExercise(id, data) {
  return apiClient.put(`/exercises/${id}`, data);
}

export function deleteExercise(id) {
  return apiClient.delete(`/exercises/${id}`);
}