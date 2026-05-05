# Deploy Plinth

## ⚠️ Important: data persistence

This app currently uses an **in-memory store with file-based persistence** (`.data/store.json`). This works perfectly:
- Locally (`npm run dev` / `npm run start`)
- On any **long-running server** (Railway, Fly.io, Render, a VPS, Docker)

It does **not** work on serverless platforms (Vercel/Netlify Functions) because each function invocation runs in an isolated container — the in-memory state resets between requests and the filesystem is ephemeral.

For Vercel/Netlify, swap `src/lib/db/store.ts` for the MongoDB-backed implementation defined in `.kiro/specs/.../design.md` (the schemas already match). All repo files (`src/lib/repos/*.ts`) are isomorphic to that swap — only `store.ts` needs changing.

---

## Option A · Deploy to Vercel (recommended once MongoDB is wired)

```bash
# One-time
npm i -g vercel
vercel login          # opens browser, authenticate

# From the marketplace/ directory
vercel                # follow prompts (link/create project)
vercel --prod         # ship a production build
```

Or non-interactive with a token (https://vercel.com/account/tokens):

```bash
VERCEL_TOKEN=<your_token> vercel deploy --prod --yes
```

You'll need to add these env vars in the Vercel dashboard (Project → Settings → Environment Variables):

| Key | Value |
|---|---|
| `MONGODB_URI` | your MongoDB Atlas connection string |
| `AUTH_SECRET` | generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_BASE_URL` | `https://your-domain.vercel.app` |
| `PADDLE_API_KEY` | from Paddle dashboard |
| `PADDLE_WEBHOOK_SECRET` | from Paddle dashboard |
| `SENDGRID_API_KEY` | from SendGrid |
| `SENDGRID_FROM_EMAIL` | a verified sender |
| `STORAGE_DRIVER` | `s3` (and add S3 credentials) |
| `USE_MEMORY_DB` | `false` |

## Option B · Deploy to Netlify

```bash
npm i -g netlify-cli
netlify login
netlify init        # link to a site
netlify deploy --prod
```

Same env vars apply. Netlify Functions are serverless too, so MongoDB is required.

## Option C · Deploy to Railway / Fly.io / VPS (works as-is)

These run a long-lived Node process. The current in-memory + filesystem implementation just works.

### Railway (one-click style)
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Docker
```bash
docker build -t plinth .
docker run -p 3000:3000 -e AUTH_SECRET=$(openssl rand -base64 32) plinth
```

A minimal `Dockerfile`:
```Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm","run","start"]
```

---

## Pre-deploy checklist

```bash
npm run typecheck   # tsc clean
npm test            # 16/16 tests
npm run build       # production build
```
