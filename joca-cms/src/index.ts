import type { Core } from '@strapi/strapi';

const EVENT_CATEGORIES = ['Culture', 'Community', 'Education'] as const;

function normalizeEventCategory(category: string): string {
  const trimmed = category.trim();
  return (
    EVENT_CATEGORIES.find(
      (value) => value.toLowerCase() === trimmed.toLowerCase(),
    ) ?? trimmed
  );
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Repair enum values that break GraphQL (e.g. "Community " with trailing space).
    const rows = await strapi.db
      .connection('events')
      .select('id', 'category')
      .whereNotNull('category');

    for (const row of rows) {
      const current = String(row.category);
      const normalized = normalizeEventCategory(current);
      if (normalized !== current) {
        await strapi.db
          .connection('events')
          .where({ id: row.id })
          .update({ category: normalized });
        strapi.log.info(
          `Normalized event ${row.id} category from "${current}" to "${normalized}"`,
        );
      }
    }
  },
};
