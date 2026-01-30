ADR 0001: Frontend Framework Selection
Status: Accepted

Context: The Jamaican Ottawa Community Association (JOCA) needs a high-performance web platform that supports both public-facing content (SEO-sensitive) and an interactive member portal (Auth-heavy).

Decision: We chose Next.js (React) as our primary frontend framework.

Rationale: Next.js allows us to use Server Components for fast SEO-optimized page loads of JOCA history and events. With support & documentation for many auth libraries (BetterAuth.js. Auth.js), it was an easy choice for our authentication requirements. In addition, Next.js was a good framework in terms of achieving a balance between learning and developing using what we as a team were familiar with.

Consequences: The team must manage a more complex deployment lifecycle compared to a simple SPA, but we gain integrated API routes, reducing the need for a separate backend server for basic logic.
