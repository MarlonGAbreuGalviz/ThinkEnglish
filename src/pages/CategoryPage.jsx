import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ExerciseModal from '../components/ExerciseModal.jsx';
import LevelModal from '../components/LevelModal.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { useRouter } from '../routes/RouterContext.jsx';
import { pluralize, trimExcerpt } from '../services/contentService.js';
import { getCountValue } from '../utils/contentMetrics.js';
import { getCategoryNameError } from '../utils/formValidation.js';

function findCategoryPath(categories, categoryId, trail = []) {
  for (const category of categories) {
    const nextTrail = [...trail, category];
    if (String(category.id) === String(categoryId)) {
      return nextTrail;
    }
    const childPath = findCategoryPath(category.children || [], categoryId, nextTrail);
    if (childPath.length) {
      return childPath;
    }
  }
  return [];
}

function findCategorySiblings(categories, category) {
  if (!category?.parentId) return categories;
  for (const item of categories) {
    if (String(item.id) === String(category.parentId)) return item.children || [];
    const nestedResult = findCategorySiblings(item.children || [], category);
    if (nestedResult.length) return nestedResult;
  }
  return [];
}

export default function CategoryPage({ categoryId }) {
  const { navigate } = useRouter();
  const { canManageExercises, canManageStructure, canManageLevels, canDeleteExercises, user } = useAuth();
  const contentApi = useContent();
  const [category, setCategory] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exerciseModal, setExerciseModal] = useState(null);
  const [levelModal, setLevelModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryNameError, setCategoryNameError] = useState('');

  const loadCategory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [categoryResponse, levelsResponse, treeResponse] = await Promise.all([
        contentApi.getCategoryById(categoryId),
        contentApi.getLevelsByCategory(categoryId),
        contentApi.getCategoryTree()
      ]);
      const nextLevels = levelsResponse || [];
      setCategory(categoryResponse);
      setLevels(nextLevels);
      setCategoryTree(Array.isArray(treeResponse) ? treeResponse : treeResponse ? [treeResponse] : []);
      setSelectedLevelId((current) => {
        if (nextLevels.some((level) => String(level.id) === String(current))) {
          return current;
        }
        return nextLevels[0]?.id || '';
      });
    } catch (requestError) {
      setError(requestError.message || 'No pudimos cargar la categoría seleccionada.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExercises = async (levelId) => {
    if (!levelId) {
      setExercises([]);
      return;
    }

    setIsLoadingExercises(true);
    try {
      const response = await contentApi.getExercisesByLevel(levelId);
      setExercises(response || []);
    } catch (requestError) {
      setError(requestError.message || 'No pudimos cargar los ejercicios del nivel.');
      setExercises([]);
    } finally {
      setIsLoadingExercises(false);
    }
  };

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  useEffect(() => {
    loadExercises(selectedLevelId);
  }, [selectedLevelId]);

  useEffect(() => {
    if (!selectedLevelId) return;
    let isCurrent = true;
    contentApi
      .getLevel(selectedLevelId)
      .then((levelDetails) => {
        if (!isCurrent || !levelDetails) return;
        setLevels((current) =>
          current.map((level) => (String(level.id) === String(levelDetails.id) ? { ...level, ...levelDetails } : level))
        );
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message || 'No pudimos cargar el video del nivel.');
      });
    return () => {
      isCurrent = false;
    };
  }, [selectedLevelId]);

  const selectedLevel = useMemo(
    () => levels.find((level) => String(level.id) === String(selectedLevelId)) || null,
    [levels, selectedLevelId]
  );

  const breadcrumb = useMemo(() => {
    const path = findCategoryPath(categoryTree, categoryId);
    return path.length ? path : category ? [category] : [];
  }, [categoryTree, categoryId, category]);

  const isMainCategory = Boolean(category?.isMain || category?.isPrincipal || category?.esPrincipal);
  const childCount = getCountValue(category, ['subcategoryCount', 'children']);

  const openCategoryEdit = () => {
    setCategoryName(category.name);
    setIsEditingCategory(true);
    setSuccess('');
    setCategoryNameError('');
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();
    const siblings = findCategorySiblings(categoryTree, category);
    const validationError = getCategoryNameError(categoryName, siblings, category.id);
    setCategoryNameError(validationError);
    if (validationError) return;

    try {
      const updated = isMainCategory
        ? await contentApi.updateMainCategory({ name: categoryName.trim() })
        : await contentApi.updateCategory(category.id, { name: categoryName.trim() });
      setCategory(updated || { ...category, name: categoryName.trim() });
      setIsEditingCategory(false);
      setSuccess('Categoría actualizada correctamente.');
      loadCategory();
    } catch (requestError) {
      setError(requestError.message || 'No pudimos actualizar la categoría.');
    }
  };

  const handleSaveLevel = async (payload) => {
    try {
      const savedLevel = payload.id
        ? await contentApi.updateLevel(payload.id, payload)
        : await contentApi.createLevel(payload);
      setLevelModal(null);
      setSuccess('Nivel guardado correctamente.');
      await loadCategory();
      if (savedLevel?.id) {
        setSelectedLevelId(savedLevel.id);
      }
    } catch (requestError) {
      setError(requestError.message || 'No pudimos guardar el nivel.');
      throw requestError;
    }
  };

  const openLevelEdit = async () => {
    if (!selectedLevel) return;
    setError('');
    try {
      const levelDetails = await contentApi.getLevel(selectedLevel.id);
      setLevelModal({ level: levelDetails || selectedLevel });
    } catch (requestError) {
      setError(requestError.message || 'No pudimos cargar los datos actuales del nivel.');
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.type === 'level') {
        await contentApi.deleteLevel(deleteTarget.item.id);
        setSuccess('Nivel eliminado correctamente.');
        setDeleteTarget(null);
        await loadCategory();
      } else {
        await contentApi.deleteExercise(deleteTarget.item.id);
        setSuccess('Ejercicio eliminado correctamente.');
        setDeleteTarget(null);
        loadExercises(selectedLevelId);
      }
    } catch (requestError) {
      setError(requestError.message || 'No pudimos eliminar el elemento seleccionado.');
    }
  };

  const handleSaveExercise = async (payload) => {
    try {
      if (payload.id) {
        await contentApi.updateExercise(payload.id, {
          title: payload.title,
          statement: payload.statement,
          score: payload.score,
          levelId: payload.levelId
        });
      } else {
        await contentApi.createExercise({
          title: payload.title,
          statement: payload.statement,
          score: payload.score,
          levelId: payload.levelId
        });
      }
      setExerciseModal(null);
      setSuccess('Ejercicio guardado correctamente.');
      if (String(payload.levelId) !== String(selectedLevelId)) {
        setSelectedLevelId(payload.levelId);
      } else {
        loadExercises(selectedLevelId);
      }
    } catch (requestError) {
      setError(requestError.message || 'No pudimos guardar el ejercicio.');
      throw requestError;
    }
  };

  if (isLoading) return <LoadingState text="Cargando categoría..." />;
  if (error && !category) return <ErrorState message={error} onRetry={loadCategory} />;

  if (!category) {
    return (
      <EmptyState
        title="Categoría no disponible"
        text="Vuelve a la jerarquía para seleccionar una categoría existente."
        actionLabel="Volver a jerarquía"
        onAction={() => navigate('/categories/tree')}
      />
    );
  }

  return (
    <section className="page-stack">
      <div className="breadcrumb">
        {breadcrumb.map((item, index) => (
          <span key={item.id}>
            {index > 0 && <span className="breadcrumb-separator">&gt;</span>}
            {item.name}
          </span>
        ))}
      </div>

      {error && <ErrorState message={error} onRetry={loadCategory} />}
      {success && <p className="success-alert">{success}</p>}

      <div className="section-heading">
        <div>
          <p className="eyebrow">Categoría seleccionada</p>
          <h2>
            {category.name}
            {isMainCategory && <span className="principal-badge">Principal</span>}
          </h2>
          <p>
            {pluralize(levels.length, 'nivel', 'niveles')} ·{' '}
            {pluralize(childCount, 'subcategoría', 'subcategorías', 'sin subcategorías')}
          </p>
        </div>
        <div className="action-row">
          {canManageStructure && (
            <button className="button primary" onClick={openCategoryEdit}>
              Editar nombre
            </button>
          )}
          <button className="button secondary" onClick={() => navigate('/categories/tree')}>
            Volver a jerarquía
          </button>
        </div>
      </div>

      {isEditingCategory && (
        <form className="inline-form inline-form-wide" onSubmit={handleSaveCategory}>
          <label>
            Nombre visible
            <input
              className={categoryNameError ? 'invalid' : ''}
              value={categoryName}
              maxLength={60}
              onChange={(event) => {
                setCategoryName(event.target.value);
                setCategoryNameError('');
              }}
              autoFocus
            />
            {categoryNameError && <small className="field-error">{categoryNameError}</small>}
          </label>
          <div className="action-row">
            <button className="button primary compact" type="submit">
              Guardar
            </button>
            <button type="button" className="button ghost dark compact" onClick={() => setIsEditingCategory(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="category-layout">
        <aside className="levels-panel">
          <div className="panel-heading">
            <h3>Niveles</h3>
            {canManageLevels && (
              <button className="button primary compact" onClick={() => setLevelModal({ level: null })}>
                Nuevo nivel
              </button>
            )}
          </div>

          {levels.length ? (
            <div className="level-list">
              {levels.map((level) => (
                <button
                  key={level.id}
                  className={String(selectedLevelId) === String(level.id) ? 'level-item active' : 'level-item'}
                  onClick={() => setSelectedLevelId(level.id)}
                >
                  <span>{level.name}</span>
                  <small>{pluralize(getCountValue(level, ['exerciseCount', 'exercises']), 'ejercicio', 'ejercicios')}</small>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin niveles" text="Crea un nivel para comenzar a organizar ejercicios." />
          )}
        </aside>

        <section className="card exercise-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Rol activo: {user.role}</p>
              <h3>{selectedLevel?.name || 'Selecciona un nivel'}</h3>
            </div>
            <div className="action-row">
              {canManageLevels && (
                <>
                  <button className="button subtle" onClick={openLevelEdit} disabled={!selectedLevel}>
                    Editar nivel
                  </button>
                  <button
                    className="button danger"
                    onClick={() => setDeleteTarget({ type: 'level', item: selectedLevel })}
                    disabled={!selectedLevel}
                  >
                    Eliminar nivel
                  </button>
                </>
              )}
              {canManageExercises && (
                <button
                  className="button primary"
                  onClick={() => setExerciseModal({ exercise: null })}
                  disabled={!selectedLevel}
                >
                  Nuevo ejercicio
                </button>
              )}
            </div>
          </div>

          {selectedLevel && (
            <div className="level-video-panel">
              <p className="eyebrow">Video de ejemplo</p>
              {selectedLevel.exampleVideoUrl ? (
                <>
                  <video controls preload="metadata" src={selectedLevel.exampleVideoUrl}>
                    Tu navegador no puede reproducir este video.
                  </video>
                  <a href={selectedLevel.exampleVideoUrl} target="_blank" rel="noreferrer">
                    Abrir video en otra pestaña
                  </a>
                </>
              ) : (
                <p className="helper-text">Este nivel aún no tiene un video disponible.</p>
              )}
            </div>
          )}

          {isLoadingExercises ? (
            <LoadingState text="Cargando ejercicios..." />
          ) : exercises.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Puntaje</th>
                    <th>Enunciado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((exercise) => (
                    <tr key={exercise.id}>
                      <td>
                        <strong>{exercise.title}</strong>
                      </td>
                      <td>{exercise.score}</td>
                      <td>{trimExcerpt(exercise.statement)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="button subtle"
                            onClick={() => setExerciseModal({ exercise })}
                            disabled={!canManageExercises}
                          >
                            Editar
                          </button>
                          {canDeleteExercises && (
                            <button className="button danger" onClick={() => setDeleteTarget({ type: 'exercise', item: exercise })}>
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Sin ejercicios en este nivel"
              text="Agrega una actividad para completar el flujo de contenidos."
            />
          )}
        </section>
      </div>

      {exerciseModal && (
        <ExerciseModal
          levels={levels}
          selectedLevelId={selectedLevel?.id}
          exercise={exerciseModal.exercise}
          onClose={() => setExerciseModal(null)}
          onSave={handleSaveExercise}
        />
      )}

      {levelModal && (
        <LevelModal
          categoryId={category.id}
          level={levelModal.level}
          onClose={() => setLevelModal(null)}
          onSave={handleSaveLevel}
        />
      )}

      {deleteTarget && (
        <Modal title={deleteTarget.type === 'level' ? 'Eliminar nivel' : 'Eliminar ejercicio'} onClose={() => setDeleteTarget(null)}>
          <div className="confirm-box">
            <p>
              Vas a eliminar <strong>{deleteTarget.item.name || deleteTarget.item.title}</strong>. Esta acción será validada por el backend.
            </p>
            <div className="modal-actions">
              <button className="button ghost dark" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button className="button danger solid" onClick={confirmDelete}>
                Confirmar eliminación
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
