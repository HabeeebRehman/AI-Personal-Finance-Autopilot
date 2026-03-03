# AI Personal Finance Autopilot

A scalable monorepo for AI-powered personal finance management.

## Project Structure

- `apps/api`: Node.js + Express + Prisma backend.
- `apps/mobile`: Expo React Native mobile app.
- `packages/types`: Shared TypeScript definitions.

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup the backend:
   - Navigate to `apps/api`
   - Configure `.env` with your `DATABASE_URL`
   - Run migrations: `npm run prisma:migrate`

### Running the Project

- **Backend**: `npm run dev:api` (Runs on http://localhost:5000)
- **Mobile**: `npm run dev:mobile` (Starts Expo CLI)

## API Endpoints

- `GET /health`: Basic health check route.
