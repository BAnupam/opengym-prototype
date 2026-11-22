# Tasks

## 1. Container definitions

- [x] 1.1 Add API and multi-stage web container build definitions, verifying both images build through Docker Compose
- [x] 1.2 Add pinned Nginx static-server configuration with an SPA `try_files` fallback and a separate `/api` proxy, verifying generated configuration routes API traffic without falling back to `index.html`

## 2. Local runtime configuration

- [x] 2.1 Add Docker Compose services for PostgreSQL 16, API, and web with internal service networking and configurable web host-port binding, verifying no service requires a fixed host PostgreSQL port
- [x] 2.2 Define environment configuration so only the API service receives `DATABASE_URL`, verifying the web service configuration excludes it

## 3. Smoke verification

- [x] 3.1 Add an automated Compose smoke test that starts the stack on an available host port and verifies same-origin `/api/v1/health`, then cleans up containers and test-created resources
- [x] 3.2 Document the local Compose startup and configurable port workflow, verifying the documented command runs without a fixed host database port
