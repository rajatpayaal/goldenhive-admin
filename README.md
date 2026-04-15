# Goldenhive Frontend Admin Panel

React + Vite + TypeScript based admin panel, refactored to follow service-app style folder architecture while keeping existing pages compatible.

## Refactor Summary

### 1) service-app style structure alignment

Added architectural layers to mirror service-app conventions:

- [src/context/UserContext.tsx](src/context/UserContext.tsx)
- [src/hooks/index.ts](src/hooks/index.ts)
- [src/utilty/PrivateRoute.tsx](src/utilty/PrivateRoute.tsx)
- [src/utilty/PublicRoute.tsx](src/utilty/PublicRoute.tsx)
- [src/utilty/Loader.tsx](src/utilty/Loader.tsx)
- [src/utilty/NotFoundPage.tsx](src/utilty/NotFoundPage.tsx)
- [src/utilty/TokenHandler.tsx](src/utilty/TokenHandler.tsx)

Routing now uses utility guards and token hydration in:

- [src/App.tsx](src/App.tsx)

### 2) Backend route indexing for integration

Backend routes are indexed and mapped in one place:

- [src/services/api.endpoints.ts](src/services/api.endpoints.ts)

This file is generated from goldenhive-backend route shape (base prefix: /api + module prefixes from backend router), and is the single source for API paths.

### 3) API service alignment with backward compatibility

Primary service layer:

- [src/services/apiService.ts](src/services/apiService.ts)

Compatibility re-export for existing imports:

- [src/services/api.service.ts](src/services/api.service.ts)

So current pages that still import ../services/api.service continue working without immediate migration.

### 4) Auth endpoint correction

Admin login now prefers backend admin auth endpoint first:

- [src/store/authStore.ts](src/store/authStore.ts)

Order:
1. POST /auth/admin/login
2. fallback to POST /auth/login

## Current Architecture

Key folders:

- src/components: layout and reusable UI
- src/context: app-level context providers
- src/hooks: shared hooks exports
- src/pages: feature pages
- src/services: endpoint map + API functions
- src/store: state management
- src/utilty: route guards, loader, token handler, fallback pages

## Environment

API base URL defaults to:

- http://localhost:8000/api

Override with:

- VITE_API_URL

in your .env file.

## Docker + CI/CD Setup

### Local Docker

- Build and run with compose:
	- docker compose up --build -d
- App is served by Nginx at:
	- http://localhost:5173

### GitHub Actions Workflow

Single workflow file:

- [.github/workflows/ci-docker.yml](.github/workflows/ci-docker.yml)

It runs on push and pull request to main with steps:

1. npm ci
2. typecheck
3. lint
4. build
5. docker image build + smoke test

Docker push is enabled only for push on main and only when these repository secrets exist:

- DOCKERHUB_USERNAME
- DOCKERHUB_TOKEN

If these secrets are missing, workflow still succeeds and skips the publish step.

## Notes for Future Integration

- Add new backend route paths first in [src/services/api.endpoints.ts](src/services/api.endpoints.ts), then implement related API functions in [src/services/apiService.ts](src/services/apiService.ts).
- Once all page imports migrate to apiService.ts, api.service.ts can remain as a lightweight compatibility layer or be removed in a cleanup PR.
