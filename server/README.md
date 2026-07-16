# Yatzy server

A minimal [Bun](https://bun.sh) static file server for the built Yatzy client.
It serves `../client/dist` and falls back to `index.html` for unknown routes so
the SPA / PWA works, with cache headers tuned for hashed assets vs. the shell.

## Prerequisites

- [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`)
- The client must be built first — it produces `client/dist`:

  ```bash
  cd ../client && npm install && npm run build
  ```

## Run

```bash
bun install        # installs @types/bun (optional, for editor types)
bun run start      # serves ../client/dist on http://localhost:3000
```

Or build the client and serve in one step:

```bash
bun run serve
```

Development with auto-reload of the server itself:

```bash
bun run dev
```

## Configuration

| Env var    | Default            | Description                          |
| ---------- | ------------------ | ------------------------------------ |
| `PORT`     | `3000`             | Port to listen on                    |
| `DIST_DIR` | `../client/dist`   | Absolute or relative path to serve   |

```bash
PORT=8080 DIST_DIR=/srv/yatzy bun run start
```

## Caching

- `/assets/*` (content-hashed JS/CSS) → `max-age=31536000, immutable`
- `index.html`, `sw.js`, `registerSW.js`, `*.webmanifest` → `no-cache`
- everything else → `max-age=3600`
