# Documentation Index

This folder holds the detailed operating docs for Vanaila CMS. Keep the root `README.md` production-focused and move implementation details here.

## Current Operating Docs

- [Admin usage guide](./admin-usage.md) - admin modules, publishing workflows, media library, analytics, audit, and team management.
- [Deployment handoff](./deployment-handoff.md) - production environment variables, build checks, database/media cutover, and handoff checklist.
- [Technical reference](./technical-reference.md) - architecture, content model, API notes, SEO behavior, and important commands.
- [Client reuse playbook](./client-reuse-playbook.md) - how to turn this repo into a new client starter without losing admin workflows.
- [Supabase + Hostinger setup](./supabase-hostinger-setup.md) - concrete Supabase Postgres, Supabase Storage, and Hostinger deployment flow.
- [Security hardening notes](./security-hardening.md) - implemented protections and pre-launch recommendations.
- [Source audit and gzip plan](./src-audit-gzip-plan.md) - current large-source-file audit and refactor plan.

## Supporting References

- [Client bootstrap example](./client-bootstrap.example.json) - sample config for `npm run bootstrap:client -- --config`.
- [Historical scope baseline](./scope-of-work.md) - original project scope only; not the current feature contract.
- [Live import payloads](./live-import/README.md) - JSON payload snapshots for controlled content imports.

## Maintenance Rule

When a README section becomes too detailed for production onboarding, move it into the closest focused doc here and leave only the short link in the root README.
