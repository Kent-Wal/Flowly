# Flowly

This repository contains a full-stack **Financial Tracking Application**.  
It integrates with **Plaid** to securely retrieve financial account and transaction data, uses **Prisma ORM** for database management, and is fully **Dockerized** for consistent development and deployment.

When connecting to a bank account using Plaid use the username **user_good** and the password **pass_good** with any bank institution.

---

## Features

- Secure Plaid account linking
- Fetch and store user transaction data
- PostgreSQL database integration
- Prisma ORM for database access
- Environment-based configuration
- Docker and Docker Compose support
- Production deployment: **Vercel** (frontend) + **Supabase** (database) + **Render** (API)

---

## Tech Stack

- **Frontend:** ReactJS + Vite → deployed on **Vercel**
- **Backend:** NodeJS + Express → deployed on **Render** (or Railway / Fly.io)
- **Database:** PostgreSQL on **Supabase**
- **ORM:** Prisma
- **Containerization:** Docker

---

## Local Development

```bash
cp .env.example .env   # fill in values (local Postgres or Supabase)
npm install
npx prisma migrate dev
npm run dev:all        # frontend :5173, API :5000
```

Or with Docker:

```bash
docker compose up
```

---

## Production Deployment

The app splits into three services:

| Service | Host | What it runs |
|---------|------|--------------|
| Frontend | Vercel | React SPA (`dist/`) |
| Database | Supabase | PostgreSQL |
| API | Render | Express + Plaid sync cron |

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step Supabase, Render, and Vercel setup.

---

## Future Improvements

- Improve transaction categorization logic
- Add budgeting features
- Allow users to export financial data to CSV or PDF

---

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
