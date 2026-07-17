# n4-yatzi

Simple offline Yatzy app — a single-device, pass-and-play PWA for up to 6 players.

The whole app is a static frontend. There is no backend: [`client/`](client) holds
a Vite + React PWA, and the production image serves the built assets with nginx.
App-level details (stack, structure, theming, persistence) live in
[`client/README.md`](client/README.md).

## Prerequisites

- **Node 22** and npm — for local development
- **Docker** with Compose v2 — for building and running the image

## Development

```bash
cd client
npm install
npm run dev        # dev server on http://localhost:5173
```

Other scripts:

```bash
npm run build      # typecheck + production build into client/dist
npm run preview    # serve the production build (service worker active)
npm run typecheck  # tsc, no emit
npm run format     # prettier --write
```

Note that the service worker is disabled in `npm run dev` (`devOptions.enabled:
false` in [`client/vite.config.ts`](client/vite.config.ts)). To exercise PWA and
offline behaviour, use `npm run preview` or the Docker image.

## Docker

Compose is the easiest path. From the repository root:

```bash
docker compose up --build       # http://localhost:3000
docker compose down             # stop and remove
```

The build is fully self-contained — it runs `npm ci` and `npm run build` inside
the image, so you do not need a local `client/dist` or `node_modules` first.

To build and run the image directly, without Compose:

```bash
docker build -t n4-yatzi-client ./client
docker run --rm -p 3000:80 n4-yatzi-client
```

Change the published port by editing the left-hand side of the mapping — the
container always listens on port 80 (`-p 8080:80` serves it on
http://localhost:8080).

### How the image is put together

[`client/Dockerfile`](client/Dockerfile) is a two-stage build: `node:22-alpine`
installs dependencies and runs the Vite build, then `nginx:alpine` receives only
`dist/` plus [`client/nginx.conf`](client/nginx.conf). The runtime image carries
no source or `node_modules`.

`nginx.conf` sets the caching policy the PWA depends on:

- `/assets/*` — immutable, cached for a year (filenames are content-hashed)
- `index.html`, `sw.js`, `registerSW.js`, `*.webmanifest` — `no-cache`, so a new
  deploy is picked up instead of being served stale from cache
- everything else — falls back to `index.html` so client-side routes resolve

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) builds the client on every
push and pull request to `main`. On pushes to `main` it also builds and pushes
the image to GHCR:

```
ghcr.io/sverbach/n4-yatzi-client:latest
ghcr.io/sverbach/n4-yatzi-client:<sha>
```

Pull requests build the image but do not push it.
