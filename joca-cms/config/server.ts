import type { Core } from "@strapi/strapi";

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Server => {
  const webhookSecret = env("STRAPI_WEBHOOK_SECRET", "");

  return {
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),
    app: {
      keys: env.array("APP_KEYS"),
    },
    mcp: {
      enabled: true,
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

export default config;
