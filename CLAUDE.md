# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JOCA (Jamaican Ottawa Community Association) is a dual-application system:
- **joca-app**: Next.js 16 frontend (App Router, React 19, TypeScript)
- **joca-cms**: Strapi 5 headless CMS backend

The frontend consumes content from Strapi via GraphQL using Apollo Client. Authentication is handled separately in the frontend using Better Auth with Prisma.

## Architecture

### Frontend (joca-app)
- **Database**: PostgreSQL via Prisma ORM with custom output path (`src/generated/prisma`)
- **Authentication**: Better Auth with Prisma adapter (email/password enabled)
- **Content Management**: Apollo Client fetching from Strapi GraphQL endpoint
- **Styling**: Tailwind CSS 4 with shadcn/ui components (Radix UI primitives)
- **Path Alias**: `@/*` maps to `src/*`

### CMS (joca-cms)
- **Content Types**:
  - **Events**: title, date, time, location, category (Culture/Community/Education), description
  - **Elections**: title, date, time, location, category (Executive/Committee/Referendum), voting dates, ballotUrl, many-to-many relation with members
  - **Members**: firstName, lastName, phoneNumber, one-to-one with users-permissions, many-to-many with elections
- **GraphQL Plugin**: Enabled for frontend consumption
- **Database**: PostgreSQL (shared or separate from frontend)

### Data Flow
1. Content creators manage events/elections/members in Strapi CMS (localhost:1337)
2. Frontend queries Strapi GraphQL endpoint (`http://localhost:1337/graphql`)
3. Apollo Client wraps the entire app in `ApolloProvider`
4. User authentication handled separately via Better Auth + Prisma (not Strapi users-permissions)

## Development Commands

### Frontend (joca-app)
```bash
cd joca-app
pnpm install          # Installs deps and runs prisma generate via postinstall
pnpm dev              # Start dev server (localhost:3000) with Turbopack
pnpm build            # Production build with Turbopack
pnpm start            # Serve production build
pnpm lint             # Run ESLint
```

**Database commands:**
```bash
pnpm prisma generate  # Regenerate Prisma client (outputs to src/generated/prisma)
pnpm prisma db push   # Push schema changes to database (no migration files)
pnpm prisma migrate dev --name <name>  # Create and apply migration
pnpm prisma studio    # Open Prisma Studio to view/edit data
```

### CMS (joca-cms)
```bash
cd joca-cms
pnpm install          # Install dependencies
pnpm dev              # Start Strapi in development mode (localhost:1337)
pnpm develop          # Alias for dev
pnpm build            # Build Strapi admin panel
pnpm start            # Start production server
```

## Key Files & Locations

### Frontend Structure
- `src/app/` - Next.js App Router pages and API routes
  - `api/auth/[...all]/` - Better Auth API route handler
  - `apollo.tsx` - Apollo Client setup (hardcoded GraphQL endpoint)
  - `layout.tsx` - Root layout with ApolloWrapper, ThemeProvider, Header, Footer
- `src/components/` - Shared UI components (Header, Footer, theme-provider, ui/)
- `src/lib/` - Core utilities
  - `auth.ts` - Better Auth server config with Prisma adapter
  - `auth-client.ts` - Better Auth client instance
  - `prisma.ts` - Prisma client singleton with pg adapter
  - `utils.ts` - Utility functions (cn helper, etc.)
- `src/generated/prisma/` - Auto-generated Prisma Client code
- `prisma/schema.prisma` - Database schema (User, Session, Account, Verification models)

### CMS Structure
- `src/api/` - Strapi content types, controllers, routes, services
  - `event/content-types/event/schema.json` - Event schema
  - `election/content-types/election/schema.json` - Election schema
  - `member/content-types/member/schema.json` - Member schema
- `config/` - Strapi configuration files (admin, api, database, plugins, server, middlewares)
- `src/extensions/` - Custom Strapi plugins and extensions

## Environment Variables

### Frontend (.env in joca-app)
```
DATABASE_URL="postgresql://user:password@host:5432/database"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secret-key"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

Note: Strapi GraphQL URL is currently hardcoded in `src/app/apollo.tsx` as `http://localhost:1337/graphql`. Should be moved to environment variable.

### CMS (.env in joca-cms)
```
HOST=0.0.0.0
PORT=1337
DATABASE_URL="postgresql://user:password@host:5432/database"
APP_KEYS="key1,key2,key3,key4"
API_TOKEN_SALT="random-string"
ADMIN_JWT_SECRET="random-string"
TRANSFER_TOKEN_SALT="random-string"
JWT_SECRET="random-string"
```

## Important Conventions

### Database Changes
- When modifying `prisma/schema.prisma`, always run `pnpm prisma generate` to update the client
- Prisma Client is generated to `src/generated/prisma/` (not default `node_modules/.prisma`)
- Import Prisma Client from `@/generated/prisma/client`, not `@prisma/client`
- For schema changes, prefer `prisma migrate dev` over `prisma db push` for production workflows

### Strapi Content Types
- Schema changes require restarting Strapi dev server
- GraphQL types auto-update when content types change
- Member <-> Election relationship is many-to-many via `candidates` field
- All content types have draft/publish enabled

### Authentication Flow
- Better Auth handles user registration/login (NOT Strapi users-permissions)
- Prisma stores User, Session, Account, Verification tables in frontend database
- Strapi users-permissions plugin exists but is separate from frontend auth
- Member content type can link to Strapi users via one-to-one relation (currently unused in frontend auth)

### Styling
- Components use Tailwind CSS 4 with custom utility classes
- UI components follow shadcn/ui patterns with Radix UI primitives
- Theme switching handled by `next-themes` in `ThemeProvider`

### Code Style
- TypeScript strict mode enabled
- 2-space indentation (no semicolons in imports shown, but present in code)
- Use PascalCase for components, camelCase for functions/variables
- Prefer named exports for utilities, default exports for pages/components

## Common Workflows

### Adding a new Strapi content type:
1. Create content type in Strapi admin UI (localhost:1337/admin) or manually in `src/api/`
2. Configure fields and relationships in schema.json
3. Enable GraphQL plugin access in Strapi settings
4. Restart Strapi dev server
5. Query new type from frontend via Apollo Client

### Adding a new page route:
1. Create folder/file in `joca-app/src/app/` (App Router conventions)
2. Use Server Components by default, add `"use client"` only when needed
3. Import shadcn/ui components from `@/components/ui/`
4. Fetch data with Apollo `useQuery` (client) or fetch API (server)

### Modifying authentication:
1. Update Better Auth config in `src/lib/auth.ts` (server)
2. Use auth client from `src/lib/auth-client.ts` in client components
3. Prisma schema changes require `prisma generate` and potentially migrations
4. Better Auth API route is at `/api/auth/[...all]`

## Package Manager

Always use `pnpm` for dependency management. Both projects have `pnpm-lock.yaml` files.
