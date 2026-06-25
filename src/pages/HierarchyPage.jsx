import { useEffect, useState } from 'react';
import CategoryTree from '../components/CategoryTree.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { getCategoryNameError } from '../utils/formValidation.js';

function findSiblings(categories, category) {
  if (!category?.parentId) return categories;
  for (const item of categories) {
    if (String(item.id) === String(category.parentId)) return item.children || [];
    const nested = findSiblings(item.children || [], category);
    if (nested.length) return nested;
  }
  return [];
}

export default function HierarchyPage() {
  const { canManageStructure } = useAuth();
  const contentApi = useContent();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const loadTree = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await contentApi.getCategoryTree();
      setCategories(Array.isArray(response) ? response : response ? [response] : []);
    } catch (requestError) {
      setError(requestError.message || 'No pudimos cargar la jerarquía de categorías.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  const openEdit = (category) => {
    setSuccess('');
    setName(category.name);
    setNameError('');
    setModal({ type: 'edit', category });
  };

  const openCreate = (category) => {
    setSuccess('');
    setName('');
    setNameError('');
    setModal({ type: 'create', category });
  };

  const openDelete = (category) => {
    setSuccess('');
    setModal({ type: 'delete', category });
  };

  const closeModal = () => {
    setModal(null);
    setName('');
    setNameError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const siblings = modal.type === 'create' ? modal.category.children || [] : findSiblings(categories, modal.category);
    const validationError = getCategoryNameError(name, siblings, modal.type === 'edit' ? modal.category.id : null);
    setNameError(validationError);
    if (validationError) return;

    try {
      if (modal.type === 'edit') {
        const isMain = Boolean(modal.category.isMain || modal.category.isPrincipal || modal.category.esPrincipal);
        if (isMain) {
          await contentApi.updateMainCategory({ name: name.trim() });
        } else {
          await contentApi.updateCategory(modal.category.id, { name: name.trim() });
        }
        setSuccess('Categoría actualizada correctamente.');
      } else {
        await contentApi.createCategory({ name: name.trim(), parentId: modal.category.id });
        setSuccess('Subcategoría creada correctamente.');
      }
      closeModal();
      loadTree();
    } catch (requestError) {
      setError(requestError.message || 'No pudimos guardar la categoría.');
    }
  };

  const confirmDelete = async () => {
    try {
      await contentApi.deleteCategory(modal.category.id);
      setSuccess('Categoría eliminada correctamente.');
      closeModal();
      loadTree();
    } catch (requestError) {
      setError(requestError.message || 'No pudimos eliminar la categoría.');
    }
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Mapa de contenidos</p>
          <h2>Jerarquía de categorías</h2>
          <p>Explora la estructura principal, subcategorías, niveles y ejercicios disponibles.</p>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadTree} />}
      {success && <p className="success-alert">{success}</p>}

      <div className="tree-shell hierarchy-shell">
        {isLoading ? (
          <LoadingState text="Cargando jerarquía..." />
        ) : categories.length ? (
          <CategoryTree categories={categories} onEdit={openEdit} onDelete={openDelete} onCreateChild={openCreate} />
        ) : (
          <EmptyState
            title="Sin categorías disponibles"
            text="Cuando el backend entregue la estructura, aparecerá en este panel."
          />
        )}
      </div>

      {!canManageStructure && (
        <p className="permission-note">
          Tu rol permite ver y mantener ejercicios, pero no modificar la estructura de categorías.
        </p>
      )}

      {modal?.type !== 'delete' && modal && (
        <Modal title={modal.type === 'edit' ? 'Editar categoría' : 'Nueva subcategoría'} onClose={closeModal}>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              {modal.type === 'edit' ? 'Nombre visible' : 'Nombre'}
              <input
                className={nameError ? 'invalid' : ''}
                value={name}
                maxLength={60}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError('');
                }}
                autoFocus
              />
              {nameError && <small className="field-error">{nameError}</small>}
            </label>
            <div className="modal-actions">
              <button type="button" className="button ghost dark" onClick={closeModal}>
                Cancelar
              </button>
              <button className="button primary" type="submit">
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title="Eliminar categoría" onClose={closeModal}>
          <div className="confirm-box">
            <p>
              Vas a eliminar <strong>{modal.category.name}</strong>. El backend validará las reglas de eliminación.
            </p>
            <div className="modal-actions">
              <button className="button ghost dark" onClick={closeModal}>
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
