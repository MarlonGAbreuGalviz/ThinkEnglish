export function getCategoryChildren(categories = [], parentId = null) {
  return categories.filter((category) => category.parentId === parentId);
}

export function flattenCategoryTree(tree) {
  const roots = Array.isArray(tree) ? tree : tree ? [tree] : [];
  const result = [];

  const visit = (category) => {
    const { children = [], ...rest } = category;
    result.push(rest);
    children.forEach(visit);
  };

  roots.forEach(visit);
  return result;
}

export function buildCategoryTree(tree) {
  const categories = flattenCategoryTree(tree);
  const categoryMap = new Map(
    categories.map((category) => [String(category.id), { ...category, children: [] }])
  );
  const roots = [];

  categoryMap.forEach((category) => {
    const parent = category.parentId == null ? null : categoryMap.get(String(category.parentId));
    if (parent) {
      parent.children.push(category);
    } else {
      roots.push(category);
    }
  });

  return roots;
}

export function getCountValue(category, keys) {
  const counts = category?.counts || {};
  for (const key of keys) {
    if (typeof category?.[key] === 'number') return category[key];
    if (Array.isArray(category?.[key])) return category[key].length;
    if (typeof counts?.[key] === 'number') return counts[key];
  }
  return 0;
}
