ADR 0002: Content Management System Selection
Status: Accepted

Context: Non-technical JOCA board members need to update event details, election candidate bios, and news without touching code.

Decision: Selected Strapi CMS (Headless) over PayloadCMS.

Rationale: Strapi offers a more mature, ready-made Admin UI that requires zero custom code for basic content entry. Its built-in GraphQL support (for easily fetching event/election data) and robust Role-Based Access Control (RBAC) allow us to differentiate between Admins and Members out of the box.

Consequences: We have to manage a separate Node.js instance for the CMS (using only older active LTS or maintenance LTS versions), increasing deployment complexity compared to a code-based CMS like Payload.