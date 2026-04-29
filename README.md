# Pokemon Collections

Initial full-stack skeleton for a Pokemon collections application.

## Stack

- Backend: Node.js, NestJS, TypeScript
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Database: MongoDB
- Local runtime: Docker Compose

## Current Scope

This step only sets up the project structure and local development runtime.

Implemented:

- `apps/api` NestJS backend
- `apps/web` React/Vite frontend
- MongoDB service in Docker Compose
- `GET /api/health` endpoint returning `{ "status": "ok" }`
- Minimal frontend page that checks API availability
- Environment variable examples

Not implemented yet:

- Pokemon catalogue
- Pokemon lists
- Import/export
- Authentication
- Advanced styling

## Local Setup

Copy the example environment file if you want to customize ports or connection strings:

```bash
cp .env.example .env
```

Start the full app:

```bash
docker-compose up --build
```

Default local URLs:

- Frontend: http://localhost:5173
- API health: http://localhost:3000/api/health
- MongoDB: mongodb://localhost:27017

Verify the API:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{ "status": "ok" }
```

## Tests

Run all available tests:

```bash
npm test
```

Run backend tests:

```bash
cd apps/api
npm install
npm test
```

Frontend test tooling will be added in the dedicated frontend testing step.
