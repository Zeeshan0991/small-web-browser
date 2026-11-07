# Small Web

Requires Node 20+, Docker.

```bash
# 1. database
docker compose up -d

# 2. api (http://localhost:4000)
cd api
npm install
npm run seed
npm run start:dev

# 3. web (http://localhost:3000), in a second terminal
cd web
npm install
npm run dev

# tests
cd api && npm test
cd web && npm test
```

`npm run seed` can be run any number of times; it never duplicates data.
Open http://localhost:3000 (not 127.0.0.1) and pick a name.