ADR 0003: Authentication and Data Persistence
Status: Accepted

Context: We need to handle sensitive member data and ensure election integrity while maintaining a high developer velocity.

Decision: Selected BetterAuth.js with Database Sessions and Prisma ORM.

Rationale: * BetterAuth vs Auth.js: BetterAuth is "TypeScript-first," which reduces the boilerplate code our team needs to write for session management. In addition, BetterAuth is slightly more modern with an easier setup out of the box.

* BetterAuth/Prisma vs Strapi: While Strapi in theory can double as the auth provider, it made more sense security-wise to add an abstraction layer between session data and the browser, following the decoupled architecture pattern. 

In addition, type safety for the 'User' object is also stronger (TypeScript-safe prisma schema vs users returned in JSON format) and the methods for sign-up/login/logout are already provided out of the box, creating an easier DX (compared to writing extra middleware to communicate with Strapi's REST API)

Database Sessions vs JWT (Strapi's authentication standard): We chose Database Sessions over stateless JWTs. While JWTs are faster, Database Sessions allow us to instantly revoke access (e.g., if a member's account is compromised or an admin is removed), which is a critical security requirement for election-handling software.

Prisma: Provides a type-safe client that prevents common "runtime" database errors during development.

Consequences: Every auth check requires a database hit, adding minimal latency ($<50ms$), which we accept in exchange for superior security control. In addition, there are also two 'User' types now (one in Strapi, one in Prisma) which will have to be differentiated.