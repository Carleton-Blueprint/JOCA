ADR 0005: Hosting and Deployment Infrastructure
Status: Accepted

Context: The project needs a reliable, "zero-maintenance" infrastructure that a student-led team can hand over to the JOCA board easily.

Decision: Vercel for the frontend; Strapi Cloud for the CMS.

Rationale: * Vercel: Offers the best "Preview Branch" features, allowing our team to test features in a live environment before merging to the main site. Usually the most common deployment option for Next.js applications.

Strapi Cloud: Unlike self-hosting on a VPS (like DigitalOcean), Strapi Cloud handles all Node.js security patches and Database backups automatically. This prevents "technical debt" for the JOCA board once the Blueprint team graduates.

Consequences: Strapi Cloud has a higher monthly cost than a raw VPS, but the "Zero-DevOps" trade-off is worth it for a client with no in-house technical staff.