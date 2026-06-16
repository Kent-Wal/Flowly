# Deploying Flowly (Supabase + Render + Vercel)

Deploy in this order: **Supabase → Render (API) → Vercel (frontend)**.

---

## 1. Supabase (database)

### Create the project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. Click **New project**.
3. Choose an organization, name (e.g. `flowly`), database password, and region.
4. Wait for the project to finish provisioning (~2 minutes).

### Get connection strings

1. Open your project → **Project Settings** (gear icon) → **Database**.
2. Under **Connection string**, select **URI**.
3. Copy the **Transaction pooler** string (port **6543**). This is your `DATABASE_URL`.
   - Append `?pgbouncer=true` if it is not already present.
4. Copy the **Direct connection** string (port **5432**). This is your `DIRECT_URL`.

Replace `[YOUR-PASSWORD]` in both strings with the database password you set when creating the project.

Example shapes (yours will differ):

```
DATABASE_URL=postgresql://postgres.abcdefgh:YOUR-PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.abcdefgh:YOUR-PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### Run migrations (one time)

From your machine (with the repo cloned and `.env` filled in):

```bash
cp .env.example .env
# paste DATABASE_URL and DIRECT_URL into .env

npm install
npx prisma migrate deploy
node prisma/seedCategoryMaps.js   # optional: seed category mappings
```

Alternatively, Render runs `prisma migrate deploy` on every deploy (see step 2).

---

## 2. Render (API backend)

The API must run on a host that supports long-lived processes (for the hourly Plaid sync cron). Vercel cannot host this part.

### Deploy from GitHub

1. Push this repo to GitHub if you have not already.
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect the repo and select `render.yaml` (or create a **Web Service** manually).
4. Set the service name (e.g. `flowly-api`).

### Environment variables (Render dashboard → your service → Environment)

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Supabase **Transaction pooler** URI (port 6543) |
| `DIRECT_URL` | Supabase **Direct** URI (port 5432) |
| `JWT_SECRET` | Long random string (Render can auto-generate) |
| `PLAID_CLIENT_ID` | From [Plaid Dashboard](https://dashboard.plaid.com/developers/keys) |
| `PLAID_SECRET` | From Plaid Dashboard |
| `PLAID_ENV` | `sandbox` (or `production` when ready) |
| `FRONTEND_URL` | Your Vercel URL — set after step 3, e.g. `https://flowly.vercel.app` |
| `NODE_ENV` | `production` |
| `SYNC_ENABLED` | `true` |
| `SYNC_CRON` | `0 * * * *` |

5. Deploy. Note your API URL, e.g. `https://flowly-api.onrender.com`.
6. Verify: open `https://flowly-api.onrender.com/health` — expect `{"status":"ok","db":true}`.

### Manual Web Service settings (if not using Blueprint)

- **Runtime:** Node
- **Build command:** `npm ci && npx prisma generate`
- **Start command:** `npx prisma migrate deploy && node src/server/server.js`
- **Health check path:** `/health`

---

## 3. Vercel (frontend)

### Import the project

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo.
2. Framework preset: **Vite** (auto-detected).
3. Build settings (defaults are fine):
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Install command:** `npm install`

### Environment variable (required)

In **Project Settings → Environment Variables**, add:

| Name | Value | Environments |
|------|--------|--------------|
| `VITE_API_BASE_URL` | Your Render API URL, e.g. `https://flowly-api.onrender.com` | Production, Preview, Development |

No trailing slash. This tells the React app where to send API requests.

4. Click **Deploy**.

### After first deploy

1. Copy your Vercel URL (e.g. `https://flowly.vercel.app`).
2. Go back to **Render** → your API service → **Environment**.
3. Set `FRONTEND_URL` to that exact URL (including `https://`).
4. Redeploy the Render service so CORS allows your frontend.

### Plaid (if using bank linking)

In [Plaid Dashboard](https://dashboard.plaid.com) → your app → **Allowed redirect URIs**, add your Vercel production URL if Plaid requires it for your Link configuration.

---

## 4. Verify end-to-end

1. Open your Vercel URL.
2. Sign up / sign in.
3. Link a test bank (Plaid sandbox: `user_good` / `pass_good`).
4. Confirm transactions appear on the Dashboard.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS error in browser | Set `FRONTEND_URL` on Render to your exact Vercel URL and redeploy API |
| `db: false` on `/health` | Check `DATABASE_URL` / `DIRECT_URL` in Render; confirm Supabase project is running |
| API calls go to wrong host | Set `VITE_API_BASE_URL` on Vercel and redeploy frontend |
| Plaid link fails | Confirm `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` on Render |
| Migrations fail | Use `DIRECT_URL` (port 5432), not the pooler, for `prisma migrate deploy` |

---

## Local dev with production API (optional)

In `.env`:

```
VITE_API_BASE_URL=https://flowly-api.onrender.com
FRONTEND_URL=http://localhost:5173
```

Run only the frontend: `npm run dev`. Add `http://localhost:5173` to Render `FRONTEND_URL` (comma-separated if you also have the Vercel URL).

---

## Architecture

```
Browser → Vercel (React)
              ↓  VITE_API_BASE_URL
         Render (Express + cron)
              ↓  DATABASE_URL
         Supabase (PostgreSQL)
```
