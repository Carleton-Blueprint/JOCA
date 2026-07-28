# instant-nav rig: JOCA (joca-app)

- BUILD: `bunx cross-env EXPOSE_TESTING_API=1 STRIPE_WEBHOOK_SECRET=<set> bun run build:e2e` then `bun run start` (never `next dev`)
- EXPOSE: `process.env.EXPOSE_TESTING_API === '1'` wired in `next.config.ts` → `experimental.exposeTestingApiInProductionBuild`
- RUN: `cross-env EXPOSE_TESTING_API=1 STRIPE_WEBHOOK_SECRET=<set> bun run test:e2e` against `BASE_URL` default `http://127.0.0.1:3000` (Playwright `webServer` starts the app when unset)
- TEST USER: public routes only for now (no login fixture). Elections instant-nav tests deferred until a paid-member e2e account + `storageState` helper exists.
- DRIFT: Strapi up/down (empty events list vs populated), auth session cookies, subscription status, email verification state, `STRIPE_WEBHOOK_SECRET` missing at build time
- LOOP: local `build:e2e` → `start` → `playwright test`; fully agent-drivable on one machine when env vars are set
- LIVENESS: n/a (local build && start — artifact is the freshly built `.next`)
- WALLS: `STRIPE_WEBHOOK_SECRET` must be non-empty for production build (`auth.ts` throws if missing outside dev). Set a placeholder for e2e builds. Strapi may be down at build time — cached reads return `[]`.
