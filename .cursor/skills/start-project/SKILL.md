---
name: start-project
description: >-
  Starts the course-builder local development environment: Docker Compose for
  backend services, then Vite frontend via Laravel Sail. Use when the user asks
  to start, run, launch, or raise the project (запустить проект, поднять
  окружение, start sail, npm run dev, vite).
---

# Start Project

Run these steps from the repository root, in order.

## Steps

1. Start Docker Compose services in detached mode:

```bash
docker-compose up -d
```

2. Start the Vite frontend through Sail (long-running — run in background):

```bash
./vendor/bin/sail npm run dev
```

## Execution notes

- Working directory must be the project root (Linux path under WSL, e.g. `/home/.../course-builder`). Do not run Sail via Windows UNC paths.
- Do not skip step 1; containers must be up before `sail npm`.
- `./vendor/bin/sail npm run dev` is a foreground process: start it in the background (`block_until_ms: 0`) and confirm Vite started from the output.
- If `vendor/bin/sail` is missing, run `composer install` first, then retry from step 1.
- Report success or the first failing command's error to the user.
