# LabFlow

LabFlow is a lab management system: patient registration, test ordering and result entry, payments, and staff/role administration for diagnostic laboratories. Each lab runs as its own organization on a shared LabFlow deployment.

Built with Next.js (App Router), TypeScript, MongoDB/Mongoose, and Auth.js.

## Getting Started

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Create `.env.local` with:
   ```
   DB_NAME=<mongo database name>
   DB_USER=<mongo user>
   DB_PASSWORD=<mongo password>
   AUTH_SECRET=<random secret, e.g. `openssl rand -base64 33`>
   NEXTAUTH_URL=http://localhost:3000
   ```
3. Run the dev server:
   ```bash
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Project layout

- `src/app` — routes and API handlers (App Router)
- `src/components` — UI components, organized by domain (`PatientsData`, `PaymentsData`, `ResultsData`, `UserData`) and by shared chrome (`Sidebar`, `Navbars`, `Cards`, etc.)
- `src/models` — Mongoose schemas
- `src/auth.ts` / `src/auth.config.ts` — Auth.js configuration (split so `middleware.ts` avoids bundling native Node dependencies)
- `src/lib/dbConnect.ts` — MongoDB connection handling

## Tech notes

- Sessions use Auth.js v5 with a Credentials provider (email/password, bcrypt-hashed).
- `AUTH_SECRET` is required — without it, authentication fails with a Configuration error.
