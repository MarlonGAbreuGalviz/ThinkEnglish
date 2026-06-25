import { useAuth } from '../context/AuthContext.jsx';
import { useRouter } from '../routes/RouterContext.jsx';
import { pluralize } from '../services/contentService.js';
import { getCountValue } from '../utils/contentMetrics.js';

export default function CategoryTree({ categories = [], onEdit, onDelete, onCreateChild }) {
  const { canDeleteCategories, canManageStructure } = useAuth();
  const { navigate } = useRouter();

  if (!categories.length) {
    return null;
  }

  return (
    <div className="hierarchy-tree">
      {categories.map((category) => {
        const isMain = Boolean(category.isMain || category.isPrincipal || category.esPrincipal);
        const levelCount = getCountValue(category, ['levelCount', 'levels']);
        const exerciseCount = getCountValue(category, ['exerciseCount', 'exercises']);
        const subcategoryCount = getCountValue(category, ['subcategoryCount', 'children']);

        return (
          <article key={category.id} className="hierarchy-node">
            <div className={isMain ? 'hierarchy-card is-main' : 'hierarchy-card'}>
              <div className="hierarchy-main">
                <div>
                  <h3>
                    {category.name}
                    {isMain && <span className="principal-badge">Principal</span>}
                  </h3>
                  <p>
                    {pluralize(subcategoryCount, 'subcategoría', 'subcategorías', 'sin subcategorías')} ·{' '}
                    {pluralize(levelCount, 'nivel', 'niveles')} ·{' '}
                    {pluralize(exerciseCount, 'ejercicio', 'ejercicios')}
                  </p>
                </div>
              </div>

              <div className="hierarchy-actions">
                <button className="button secondary" onClick={() => navigate(`/categories/${category.id}`)}>
                  Ver
                </button>
                {canManageStructure && (
                  <>
                    <button className="button subtle" onClick={() => onEdit(category)}>
                      Editar nombre
                    </button>
                    <button className="button subtle" onClick={() => onCreateChild(category)}>
                      Nueva subcategoría
                    </button>
                  </>
                )}
                {!isMain && canDeleteCategories && (
                  <button className="button danger" onClick={() => onDelete(category)}>
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            {category.children?.length ? (
              <div className="hierarchy-children">
                <CategoryTree
                  categories={category.children}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCreateChild={onCreateChild}
                />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
