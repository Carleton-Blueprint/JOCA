const EVENT_CATEGORIES = ['Culture', 'Community', 'Education'] as const;

function normalizeEventCategory(category: unknown): unknown {
  if (typeof category !== 'string') return category;

  const trimmed = category.trim();
  return (
    EVENT_CATEGORIES.find(
      (value) => value.toLowerCase() === trimmed.toLowerCase(),
    ) ?? trimmed
  );
}

export default {
  beforeCreate(event) {
    const { data } = event.params;
    if (data?.category !== undefined) {
      data.category = normalizeEventCategory(data.category);
    }
  },

  beforeUpdate(event) {
    const { data } = event.params;
    if (data?.category !== undefined) {
      data.category = normalizeEventCategory(data.category);
    }
  },
};
