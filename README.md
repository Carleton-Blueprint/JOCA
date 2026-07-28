<div align="center">

# 🇯🇲 JOCA

### **Jamaican Ottawa Community Association**

_A vibrant organization celebrating Jamaican culture and strengthening community ties in Ottawa_

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Strapi](https://img.shields.io/badge/Strapi-5-4945FF?style=for-the-badge&logo=strapi)](https://strapi.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

<img src="joca-app/public/logo.png" alt="JOCA Logo" width="200"/>

[🌐 Website](https://joca-bay.vercel.app) • [📧 Contact](mailto:jamaicanottawaassnn@yahoo.ca)

---

</div>

## Our Mission

> _Promoting **unity**, **cultural awareness**, and **empowerment** within the Jamaican and wider Caribbean community in Ottawa._

We aim to **preserve and share Jamaican heritage** while fostering collaboration, education, and social engagement across generations. JOCA is dedicated to celebrating Jamaican culture, supporting our community, and strengthening the connection between Jamaica and the Ottawa region.

---

## Tech Stack

| Category           | Technology                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| **Frontend**       | Next.js 16 (App Router) • React • TypeScript • Tailwind CSS • shadcn/ui    |
| **CMS**            | Strapi 5 • GraphQL (server-side `fetch` from Next.js)                      |
| **Database**       | Supabase (Postgres) • Prisma ORM                                           |
| **Authentication** | Better Auth (email/password, sessions, email verification)                 |
| **Payments**       | Stripe (subscriptions via `@better-auth/stripe`)                           |
| **Email**          | Resend                                                                     |
| **Deployment**     | Vercel (`joca-app`) • Strapi Cloud (`joca-cms`) • Supabase (app database)  |

---

## Repository layout

```text
JOCA/
├── joca-app/     # Next.js website
├── joca-cms/     # Strapi CMS
└── docs/         # ADRs and deploy guide
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [HANDOFF.md](HANDOFF.md) | Client ownership, service runbooks, acceptance checklist |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Local setup and production deploy |
| [AGENTS.md](AGENTS.md) | Notes for coding agents (Supabase posture, etc.) |
| [joca-app/.env.example](joca-app/.env.example) | Frontend environment variables |
| [joca-cms/.env.example](joca-cms/.env.example) | CMS environment variables |

---

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
