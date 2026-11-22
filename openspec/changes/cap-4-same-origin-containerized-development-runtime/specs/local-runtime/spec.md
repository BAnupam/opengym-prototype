# Spec Delta

## Purpose

Provides a reproducible local container runtime that presents the OpenGym web and API services under one browser origin while preserving the API-only database boundary.

## ADDED Requirements

### Requirement: One-origin containerized local runtime
The development runtime SHALL start PostgreSQL 16, the OpenGym API, and the built web application with Docker Compose. The web application SHALL be reachable through a configurable host port, and browser requests under `/api` SHALL be proxied to the API container so the browser observes one origin.

#### Scenario: Local same-origin health smoke test
- **WHEN** Docker is running and a developer starts the Compose stack with an available configured web host port
- **THEN** the web application responds on that port and `/api/v1/health` returns 200 through the same origin

### Requirement: Container configuration boundary
Runtime configuration and secrets SHALL be supplied through environment variables. Only the API container SHALL receive `DATABASE_URL`; the web container and browser-delivered assets SHALL not contain database access configuration.

#### Scenario: Browser data-boundary inspection
- **WHEN** a developer inspects the web container configuration and invokes the browser API path
- **THEN** the web container has no `DATABASE_URL` and database access occurs only through the API container

### Requirement: Client-route fallback
The web container SHALL serve built client assets and return the SPA entry point for unknown non-API client routes, while forwarding `/api` requests without substituting the SPA response.

#### Scenario: Reload a client route
- **WHEN** a developer reloads a known client route through the web container
- **THEN** the container returns the SPA entry point and the application restores the requested route
