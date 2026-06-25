export function pluralize(count, singular, plural, emptyLabel = null) {
  if (count === 0 && emptyLabel) {
    return emptyLabel;
  }
  return `${count} ${count === 1 ? singular : plural}`;
}

export function trimExcerpt(text, maxLength = 110) {
  const value = text || '';
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
