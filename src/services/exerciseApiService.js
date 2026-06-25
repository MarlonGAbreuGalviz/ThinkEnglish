import { apiClient } from './apiClient.js';
import { testDataApi } from '../data/testData.js';
import { isTestSession } from './sessionService.js';

export function getExercisesByLevel(levelId) {
  if (isTestSession()) return Promise.resolve(testDataApi.getExercisesByLevel(levelId));
  return apiClient.get(`/levels/${levelId}/exercises`);
}

export function createExercise(data) {
  if (isTestSession()) return Promise.resolve(testDataApi.createExercise(data));
  return apiClient.post('/exercises', data);
}

export function updateExercise(id, data) {
  if (isTestSession()) return Promise.resolve(testDataApi.updateExercise(id, data));
  return apiClient.put(`/exercises/${id}`, data);
}

export function deleteExercise(id) {
  if (isTestSession()) return Promise.resolve(testDataApi.deleteExercise(id));
  return apiClient.delete(`/exercises/${id}`);
}
