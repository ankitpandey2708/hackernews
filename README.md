# HN Digest

A curated Hacker News reader built with Phoenix LiveView.

## Quick Start

```bash
mix deps.get        # install dependencies (like npm install)
mix phx.server      # start dev server at http://localhost:4000
```

## npm vs mix Equivalents

| npm (JavaScript) | mix (Elixir/Phoenix) | Purpose |
|---|---|---|
| `npm install` | `mix deps.get` | Install dependencies |
| `npm run dev` | `mix phx.server` | Start dev server (hot reload included) |
| `npm run build` | `mix assets.deploy && mix release` | Production build |
| `npm test` | `mix test` | Run tests |
| `package.json` | `mix.exs` | Project config & dependencies |
| `package-lock.json` | `mix.lock` | Locked dependency versions |
| `node_modules/` | `deps/` | Downloaded dependencies |
| `dist/` or `.next/` | `_build/` | Compiled output (gitignored) |

## Deployment

Deployed on [Render](https://render.com) via `render.yaml`. Pushes to `main` trigger automatic deploys after CI passes.

## CI

GitHub Actions runs on every push to `main`:
1. `mix format --check-formatted` — code style
2. `mix compile --warnings-as-errors` — compilation
3. `mix test` — test suite
