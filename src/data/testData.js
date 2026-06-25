export const testAccounts = [
  {
    email: 'admin@duoc.cl',
    password: 'Admin123!',
    user: {
      id: 'test-admin',
      name: 'Administrador',
      lastName: 'ThinkEnglish',
      email: 'admin@duoc.cl',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  },
  {
    email: 'docente@profesor.duoc.cl',
    password: 'Docente123!',
    user: {
      id: 'test-teacher',
      name: 'Docente',
      lastName: 'ThinkEnglish',
      email: 'docente@profesor.duoc.cl',
      role: 'DOCENTE',
      status: 'ACTIVE'
    }
  }
];

let categories = [
  {
    id: 'test-category-main',
    name: 'Inglés',
    parentId: null,
    isMain: true
  }
];

let levels = [
  {
    id: 'test-level-basic',
    name: 'Nivel 1 · Básico',
    order: 1,
    categoryId: 'test-category-main',
    exampleVideoUrl: ''
  }
];

let exercises = [];

const copy = (value) => structuredClone(value);
const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function withCategoryCounts(category) {
  const categoryLevels = levels.filter((level) => level.categoryId === category.id);
  const levelIds = new Set(categoryLevels.map((level) => level.id));
  return {
    ...category,
    subcategoryCount: categories.filter((item) => item.parentId === category.id).length,
    levelCount: categoryLevels.length,
    exerciseCount: exercises.filter((exercise) => levelIds.has(exercise.levelId)).length
  };
}

export function authenticateTestAccount({ email, password }) {
  const account = testAccounts.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!account) return null;
  if (account.password !== password) throw new Error('El correo o la contraseña no son correctos.');
  return {
    token: `test-session-${account.user.role.toLowerCase()}`,
    user: copy(account.user),
    expiresIn: 8 * 60 * 60
  };
}

export const testDataApi = {
  getMainCategory() {
    return copy(withCategoryCounts(categories.find((category) => category.isMain)));
  },
  updateMainCategory(data) {
    categories = categories.map((category) => (category.isMain ? { ...category, name: data.name } : category));
    return this.getMainCategory();
  },
  getCategoryTree() {
    return copy(categories.map(withCategoryCounts));
  },
  getCategoryById(id) {
    const category = categories.find((item) => String(item.id) === String(id));
    return category ? copy(withCategoryCounts(category)) : null;
  },
  createCategory(data) {
    const category = { id: createId('test-category'), name: data.name, parentId: data.parentId, isMain: false };
    categories.push(category);
    return copy(category);
  },
  updateCategory(id, data) {
    categories = categories.map((category) =>
      String(category.id) === String(id) ? { ...category, name: data.name } : category
    );
    return this.getCategoryById(id);
  },
  deleteCategory(id) {
    categories = categories.filter((category) => String(category.id) !== String(id));
    return { ok: true };
  },
  getLevelsByCategory(categoryId) {
    return copy(levels.filter((level) => String(level.categoryId) === String(categoryId)));
  },
  getLevel(id) {
    const level = levels.find((item) => String(item.id) === String(id));
    return level ? copy(level) : null;
  },
  createLevel(data) {
    const level = {
      id: createId('test-level'),
      name: data.name,
      order: levels.filter((item) => item.categoryId === data.categoryId).length + 1,
      categoryId: data.categoryId,
      exampleVideoUrl: data.exampleVideo ? URL.createObjectURL(data.exampleVideo) : ''
    };
    levels.push(level);
    return copy(level);
  },
  updateLevel(id, data) {
    levels = levels.map((level) =>
      String(level.id) === String(id)
        ? {
            ...level,
            name: data.name,
            categoryId: data.categoryId,
            exampleVideoUrl: data.exampleVideo ? URL.createObjectURL(data.exampleVideo) : level.exampleVideoUrl
          }
        : level
    );
    return this.getLevel(id);
  },
  deleteLevel(id) {
    levels = levels.filter((level) => String(level.id) !== String(id));
    exercises = exercises.filter((exercise) => String(exercise.levelId) !== String(id));
    return { ok: true };
  },
  getExercisesByLevel(levelId) {
    return copy(exercises.filter((exercise) => String(exercise.levelId) === String(levelId)));
  },
  createExercise(data) {
    const exercise = { id: createId('test-exercise'), ...data };
    exercises.push(exercise);
    return copy(exercise);
  },
  updateExercise(id, data) {
    exercises = exercises.map((exercise) =>
      String(exercise.id) === String(id) ? { ...exercise, ...data } : exercise
    );
    return copy(exercises.find((exercise) => String(exercise.id) === String(id)));
  },
  deleteExercise(id) {
    exercises = exercises.filter((exercise) => String(exercise.id) !== String(id));
    return { ok: true };
  }
};
