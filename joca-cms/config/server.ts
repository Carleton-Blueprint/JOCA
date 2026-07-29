export default ({ env }) => {
  const webhookSecret = env('STRAPI_WEBHOOK_SECRET', '');

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
      keys: env.array('APP_KEYS'),
    },
    ...(webhookSecret
      ? {
          webhooks: {
            defaultHeaders: {
              Authorization: `Bearer ${webhookSecret}`,
            },
          },
        }
      : {}),
  };
};
