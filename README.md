# Pokemon Collections

Pokemon Collections is a small full-stack web app for building custom Pokemon lists from a browsable catalogue. Users can select Pokemon, see rule validation feedback, save valid lists, view saved list details, download a list as JSON, and upload a previously downloaded file for review and saving.

The project is intentionally scoped as a compact test-task implementation, not an enterprise platform.

## Features

- Browse Pokemon through the backend-powered catalogue.
- Create a named Pokemon list by selecting and unselecting Pokemon.
- Preview validation state while selecting.
- Save only lists that satisfy the business rules.
- View saved list summaries and saved list details.
- Download saved lists as a versioned JSON file.
- Upload a downloaded JSON file back into the create flow.
- Light/dark theme with local persistence.
- English/Russian frontend i18n with local persistence.
- Backend, frontend, and minimal Playwright smoke tests.

## Tech Stack

- Backend: Node.js, NestJS, TypeScript, Mongoose
- Frontend: React, Vite, TypeScript, React Router
- Styling: Tailwind CSS
- Database: MongoDB
- External API: PokeAPI, accessed only by the backend
- Tests: Jest, Supertest, Vitest, React Testing Library, Playwright
- Local runtime: Docker Compose

## Why This Stack

NestJS gives a clear module/controller/service structure for the API without much custom plumbing. React with Vite keeps the frontend fast and simple. MongoDB with Mongoose is enough for saving list documents and Pokemon snapshots. Tailwind keeps styling lightweight. Docker Compose makes the local API, web app, and database start with one command.

## Architecture

```text
React SPA
  -> NestJS REST API
    -> MongoDB
    -> PokeAPI
```

Backend responsibilities:

- Fetch Pokemon data from PokeAPI.
- Normalize Pokemon responses for the frontend.
- Cache Pokemon detail responses in memory.
- Re-resolve Pokemon by ID before saving lists.
- Validate business rules as the source of truth.
- Persist saved lists in MongoDB.
- Return versioned JSON downloads.

Frontend responsibilities:

- Render pages and local UI state.
- Call only the backend API.
- Provide validation feedback before save.
- Parse uploaded JSON files.
- Resolve uploaded Pokemon IDs through the backend.
- Trigger saves and downloads.
- Manage theme and language preferences in localStorage.

## Business Rules

A saved list must satisfy both rules:

- At least 3 Pokemon of different species must be selected.
- Total weight must not exceed 1300 hectograms.

Important details:

- PokeAPI weight is already in hectograms.
- Distinct species are counted with `speciesName`, not Pokemon name.
- Different forms of the same species do not count as different species.
- Backend validation is authoritative.
- Frontend validation is only for user feedback.

## Import And Export Format

Downloaded and uploaded files use this versioned JSON contract:

```json
{
  "version": 1,
  "name": "Starter Team",
  "pokemonIds": [1, 4, 7]
}
```

Upload rules:

- Only `version: 1` is supported.
- Malformed JSON is rejected.
- Missing or invalid `pokemonIds` is rejected.
- Uploaded files are not trusted for weight, species, sprites, or types.
- After upload, the frontend fetches Pokemon details by ID from the backend.
- Upload does not auto-save; the user reviews and saves explicitly.

## API Endpoints

Base URL in local development: `http://localhost:3000/api`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Returns `{ "status": "ok" }`. |
| GET | `/pokemon?limit=20&offset=0` | Returns paginated normalized Pokemon. |
| GET | `/pokemon/:id` | Returns one normalized Pokemon. |
| GET | `/lists` | Returns saved list summaries. |
| GET | `/lists/:id` | Returns full saved list details. |
| POST | `/lists` | Creates a valid list from `{ name, pokemonIds }`. |
| GET | `/lists/:id/download` | Returns the versioned JSON download file. |

Normalized Pokemon shape:

```ts
type PokemonDto = {
  id: number;
  name: string;
  speciesName: string;
  weight: number;
  spriteUrl: string | null;
  types: string[];
};
```

Business rule error shape:

```json
{
  "message": "A list must contain at least 3 Pokemon of different species.",
  "code": "MIN_DISTINCT_SPECIES",
  "statusCode": 400,
  "path": "/api/lists"
}
```

## Local Setup

Prerequisites:

- Docker and Docker Compose
- Node.js and npm, for running tests outside Docker

Install dependencies for local test/build commands:

```bash
npm install
```

Optional environment customization:

```bash
cp .env.example .env
```

Start the full app:

```bash
docker-compose up --build
```

Default local URLs:

- Frontend: `http://localhost:5173`
- API health: `http://localhost:3000/api/health`
- MongoDB: `mongodb://localhost:27017`

Verify the API:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{ "status": "ok" }
```

Stop the app:

```bash
docker-compose down
```

## Environment Variables

Root `.env.example`:

| Variable | Default | Used by | Description |
| --- | --- | --- | --- |
| `API_PORT` | `3000` | Docker Compose | Host port for the API container. |
| `WEB_PORT` | `5173` | Docker Compose | Host port for the web container. |
| `MONGO_PORT` | `27017` | Docker Compose | Host port for MongoDB. |
| `MONGODB_URI` | `mongodb://mongo:27017/pokemon_collections` | API container | MongoDB URI used inside Docker. |
| `VITE_API_URL` | `http://localhost:3000/api` | Web container | Backend API URL used by the frontend. |

When running the API directly outside Docker, `MONGODB_URI` should point to a reachable MongoDB instance.

## Tests

Run all unit and integration tests:

```bash
npm test
```

Run backend tests only:

```bash
npm test -w apps/api
```

Run frontend tests only:

```bash
npm test -w apps/web
```

Run builds:

```bash
npm run build
```

Run minimal Playwright E2E smoke tests:

```bash
npx playwright install chromium
npm run test:e2e
```

The Playwright tests start the Vite dev server automatically and mock backend API responses in the browser. They cover app load, valid list creation, and download/upload review without calling a real backend or PokeAPI.

## Theme And i18n

- Theme supports light and dark modes.
- Theme preference is stored in `localStorage`.
- Dark mode is applied with a root `dark` class for Tailwind.
- The app defaults to light theme.
- UI text supports English and Russian through `react-i18next`.
- Language preference is stored in `localStorage`.
- Pokemon names are not translated.
- Downloaded JSON keys are not translated.
- Backend i18n is intentionally not implemented because only frontend UI text needs translation.

## Engineering Decisions

- Backend is the source of truth for validation.
- Frontend validation exists only for fast user feedback.
- Pokemon data is resolved by the backend from PokeAPI.
- The frontend never calls PokeAPI directly.
- Saved lists store Pokemon snapshots so old saved lists display consistently even if PokeAPI data changes later.
- Import/export format is versioned from the start.
- In-memory Pokemon detail cache is used instead of Redis to keep the solution small.
- No authentication or user accounts because they were not required.
- No backend i18n because API errors are stable contract messages and UI translation is frontend-only.
- Tests mock external APIs and do not call real PokeAPI.

## Trade-Offs

- In-memory cache is simple and fast, but it resets on API restart and is not shared across instances.
- Saved snapshots favor stable display over always showing the latest PokeAPI data.
- The catalogue has basic pagination but no advanced search/filtering.
- Upload supports only the JSON contract needed by the task.
- Playwright tests mock the backend for stability; backend behavior is covered separately by API tests.
- The README keeps operational setup simple and does not describe deployment because deployment is out of scope.

## Known Limitations

- No authentication or per-user list ownership.
- No edit or delete flow for saved lists.
- No server-side rendering.
- No Redis or distributed cache.
- No full Pokedex synchronization.
- No CSV/XML import or export.
- No production deployment configuration.
- E2E smoke tests do not exercise a real browser-to-Docker-backend path.

## Possible Improvements

- Add search and type filters to the catalogue.
- Add edit/delete flows for saved lists.
- Add richer loading and empty states after product requirements stabilize.
- Add a shared API contract package if the app grows.
- Add CI workflow for tests and builds.
- Add real end-to-end tests against Docker Compose if deployment confidence becomes important.
