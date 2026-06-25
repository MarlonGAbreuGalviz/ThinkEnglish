import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Modal from '../components/Modal.jsx';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { useRouter } from '../routes/RouterContext.jsx';
import { pluralize } from '../services/contentService.js';
import { flattenCategoryTree, getCategoryChildren, getCountValue } from '../utils/contentMetrics.js';
import { getCategoryNameError } from '../utils/formValidation.js';

export default function DashboardPage() {
  const { canDeleteCategories, canManageStructure, user } = useAuth();
  const { navigate } = useRouter();
  const contentApi = useContent();
  const [mainCategory, setMainCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [search, setSearch] = useState('');
  const [categoryModal, setCategoryModal] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryValidationError, setCategoryValidationError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [mainResponse, treeResponse] = await Promise.all([
        contentApi.getMainCategory(),
        contentApi.getCategoryTree()
      ]);
      setMainCategory(mainResponse);
      setCategories(flattenCategoryTree(treeResponse));
    } catch (requestError) {
      setError(requestError.message || 'No pudimos cargar la categoría principal.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const directChildren = useMemo(
    () => getCategoryChildren(categories, mainCategory?.id),
    [categories, mainCategory]
  );

  const filteredChildren = useMemo(
    () =>
      directChildren.filter((category) =>
        category.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [directChildren, search]
  );

  const openEditName = () => {
    setCategoryName(mainCategory?.name || '');
    setIsEditingName(true);
    setSuccess('');
    setCategoryValidationError('');
  };

  const handleRename = async (event) => {
    event.preventDefault();
    const rootCategories = getCategoryChildren(categories, null);
    const validationError = getCategoryNameError(categoryName, rootCategories, mainCategory.id);
    setCategoryValidationError(validationError);
    if (validationError) return;

    try {
      const updated = await contentApi.updateMainCategory({ name: categoryName.trim() });
      setMainCategory(updated || { ...mainCategory, name: categoryName.trim() });
      setIsEditingName(false);
      setSuccess('Categoría actualizada correctamente.');
      loadData();
    } catch (requestError) {
      setError(requestError.message || 'No pudimos actualizar la categoría principal.');
    }
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();
    const validationError = getCategoryNameError(
      categoryModal?.name || '',
      directChildren,
      categoryModal?.category?.id
    );
    setCategoryValidationError(validationError);
    if (validationError) return;

    try {
      if (categoryModal.mode === 'edit') {
        await contentApi.updateCategory(categoryModal.category.id, { name: categoryModal.name.trim() });
      } else {
        await contentApi.createCategory({ name: categoryModal.name.trim(), parentId: mainCategory.id });
      }
      setCategoryModal(null);
      setSuccess('Categoría guardada correctamente.');
      loadData();
    } catch (requestError) {
      setError(requestError.message || 'No pudimos guardar la categoría.');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await contentApi.deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setSuccess('Categoría eliminada correctamente.');
      loadData();
    } catch (requestError) {
      setError(requestError.message || 'No pudimos eliminar la categoría.');
    }
  };

  if (isLoading) return <LoadingState text="Cargando categoría principal..." />;
  if (error && !mainCategory) return <ErrorState message={error} onRetry={loadData} />;

  if (!mainCategory) {
    return (
      <EmptyState
        title="No hay categoría principal disponible"
        text="Cuando el backend entregue la categoría principal, aparecerá en este panel."
      />
    );
  }

  return (
    <section className="page-stack">
      {error && <ErrorState message={error} onRetry={loadData} />}
      {success && <p className="success-alert">{success}</p>}

      <section className="hero-panel main-category-panel">
        <div>
          <p className="eyebrow">Categoría principal</p>
          <h2>
            {mainCategory.name}
            <span className="principal-badge">Principal</span>
          </h2>
          <p className="hero-copy">
            Administra la estructura académica base para contenidos de inglés, sus niveles,
            videos de ejemplo y actividades asociadas.
          </p>
          <div className="summary-row">
            <StatCard label="Subcategorías" value={getCountValue(mainCategory, ['subcategoryCount', 'children'])} helper="Total disponible" />
            <StatCard label="Niveles" value={getCountValue(mainCategory, ['levelCount', 'levels'])} helper="Total disponible" />
            <StatCard label="Ejercicios" value={getCountValue(mainCategory, ['exerciseCount', 'exercises'])} helper="Total disponible" />
          </div>
        </div>

        <div className="main-actions-panel">
          <span className="role-badge">{user.role}</span>
          {canManageStructure && (
            <button className="button primary" onClick={openEditName}>
              Editar nombre
            </button>
          )}
          <button className="button secondary" onClick={() => navigate(`/categories/${mainCategory.id}`)}>
            Ver niveles
          </button>

          {isEditingName && (
            <form className="inline-form" onSubmit={handleRename}>
              <label>
                Nombre visible
                <input
                  className={categoryValidationError ? 'invalid' : ''}
                  value={categoryName}
                  maxLength={60}
                  onChange={(event) => {
                    setCategoryName(event.target.value);
                    setCategoryValidationError('');
                  }}
                  autoFocus
                />
                {categoryValidationError && <small className="field-error">{categoryValidationError}</small>}
              </label>
              <div className="action-row">
                <button className="button primary compact" type="submit">
                  Guardar
                </button>
                <button type="button" className="button ghost dark compact" onClick={() => setIsEditingName(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Estructura de contenidos</p>
            <h2>Categorías bajo la principal</h2>
          </div>
          {canManageStructure && (
            <button
              className="button primary"
              onClick={() => {
                setCategoryValidationError('');
                setCategoryModal({ mode: 'create', name: '' });
              }}
            >
              Nueva subcategoría
            </button>
          )}
        </div>

        <input
          className="search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar categoría..."
        />

        {filteredChildren.length ? (
          <div className="category-card-grid">
            {filteredChildren.map((category) => (
              <article key={category.id} className="category-card">
                <div>
                  <h3>{category.name}</h3>
                  <p>
                    {pluralize(getCountValue(category, ['levelCount', 'levels']), 'nivel', 'niveles')} ·{' '}
                    {pluralize(getCountValue(category, ['exerciseCount', 'exercises']), 'ejercicio', 'ejercicios')} ·{' '}
                    {pluralize(
                      getCountValue(category, ['subcategoryCount', 'children']),
                      'subcategoría',
                      'subcategorías',
                      'sin subcategorías'
                    )}
                  </p>
                </div>
                <div className="node-actions">
                  <button className="button secondary" onClick={() => navigate(`/categories/${category.id}`)}>
                    Ver
                  </button>
                  {canManageStructure && (
                    <button
                      className="button subtle"
                      onClick={() => {
                        setCategoryValidationError('');
                        setCategoryModal({ mode: 'edit', category, name: category.name });
                      }}
                    >
                      Editar nombre
                    </button>
                  )}
                  {canDeleteCategories && (
                    <button className="button danger" onClick={() => setCategoryToDelete(category)}>
                      Eliminar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Sin subcategorías" text="Cuando existan subcategorías, aparecerán aquí." />
        )}
      </section>

      {categoryModal && (
        <Modal title={categoryModal.mode === 'edit' ? 'Editar categoría' : 'Nueva subcategoría'} onClose={() => setCategoryModal(null)}>
          <form className="form-grid" onSubmit={handleSaveCategory}>
            <label>
              Nombre
              <input
                className={categoryValidationError ? 'invalid' : ''}
                value={categoryModal.name}
                maxLength={60}
                onChange={(event) => {
                  setCategoryValidationError('');
                  setCategoryModal((current) => ({ ...current, name: event.target.value }));
                }}
                autoFocus
              />
              {categoryValidationError && <small className="field-error">{categoryValidationError}</small>}
            </label>
            <div className="modal-actions">
              <button type="button" className="button ghost dark" onClick={() => setCategoryModal(null)}>
                Cancelar
              </button>
              <button className="button primary" type="submit">
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {categoryToDelete && (
        <Modal title="Eliminar categoría" onClose={() => setCategoryToDelete(null)}>
          <div className="confirm-box">
            <p>
              Vas a eliminar <strong>{categoryToDelete.name}</strong>. El backend validará las reglas de eliminación.
            </p>
            <div className="modal-actions">
              <button className="button ghost dark" onClick={() => setCategoryToDelete(null)}>
                Cancelar
              </button>
              <button className="button danger solid" onClick={handleDeleteCategory}>
                Confirmar eliminación
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
