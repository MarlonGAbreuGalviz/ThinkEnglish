import { createContext, useContext, useMemo } from 'react';
import * as categoryApiService from '../services/categoryApiService.js';
import * as exerciseApiService from '../services/exerciseApiService.js';
import * as levelApiService from '../services/levelApiService.js';
import { buildCategoryTree } from '../utils/contentMetrics.js';

const ContentContext = createContext(null);

const sortLevels = (levels = []) => [...levels].sort((a, b) => (a.order || 0) - (b.order || 0));

export function ContentProvider({ children }) {
  const value = useMemo(
    () => ({
      getMainCategory: categoryApiService.getMainCategory,
      updateMainCategory: categoryApiService.updateMainCategory,
      async getCategoryTree() {
        const categories = await categoryApiService.getCategoryTree();
        return buildCategoryTree(categories);
      },
      getCategoryById: categoryApiService.getCategoryById,
      createCategory: categoryApiService.createCategory,
      updateCategory: categoryApiService.updateCategory,
      deleteCategory: categoryApiService.deleteCategory,
      async getLevelsByCategory(categoryId) {
        const levels = await levelApiService.getLevelsByCategory(categoryId);
        return sortLevels(levels || []);
      },
      getLevel: levelApiService.getLevel,
      createLevel: levelApiService.createLevel,
      updateLevel: levelApiService.updateLevel,
      deleteLevel: levelApiService.deleteLevel,
      getExercisesByLevel: exerciseApiService.getExercisesByLevel,
      createExercise: exerciseApiService.createExercise,
      updateExercise: exerciseApiService.updateExercise,
      deleteExercise: exerciseApiService.deleteExercise
    }),
    []
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}
