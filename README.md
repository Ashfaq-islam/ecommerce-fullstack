# Ecommerce Fullstack

A production-ready ecommerce application with **Next.js 16** frontend and **DCMS** (schema-first headless CMS) backend.

## Architecture

ecommerce-fullstack/
├── frontend/          Next.js 16 + React 19 app
├── backend/           DCMS backend (schema-first CMS)
└── docs/              Documentation

## Features

### Frontend

- Product catalogue with filters
- Persistent shopping cart (Zustand + localStorage)
- Checkout flow with order success
- User authentication
- Product reviews with ratings
- Fully responsive
- Design tokens (CSS Modules)

### Backend

- 15 collections (products, categories, orders, reviews, etc.)
- REST API at /api/v1
- Admin UI at /__admin
- Cookie-based sessions
- OpenAPI spec at /__openapi

## Quick Start

### Prerequisites

- Node.js 20+
- DCMS binary (install guide: https://github.com/blazing-Gael/dcms)

### Backend Setup

cd backend
cp .env.example .env
dcms dev

Backend serves at http://localhost:8080

### Frontend Setup

cd frontend
npm install
cp .env.example .env.local
npm run dev

Frontend runs at http://localhost:3000

## Tech Stack

Frontend: Next.js 16.3.6, React 19.3.0, Zustand 5.0.15, CSS Modules

Backend: DCMS 0.1.0-beta.4 (https://github.com/blazing-Gael/dcms), SQLite (dev), YAML schema

## Project Structure

- frontend/ — Next.js app with App Router
- backend/ — DCMS schema + config + seed scripts
- docs/ — Setup and API documentation

## API Endpoints

- GET /api/v1/products — List products
- GET /api/v1/products?filter[slug]=slug&expand=category,brand — Product by slug
- GET /api/v1/categories — List categories
- GET /api/v1/reviews?filter[product]=uuid — Product reviews
- POST /auth/login — Login (returns token + cookie)
- GET /__health — Health check
- GET /__openapi — OpenAPI spec
- GET /__admin — Admin UI

## Environment Variables

### Backend (.env)

DCMS_ADMIN_EMAIL=your@email.com
DCMS_ADMIN_PASSWORD=strong-password-here

### Frontend (.env.local)

NEXT_PUBLIC_DATA_SOURCE=dcms
NEXT_PUBLIC_DCMS_API_URL=http://localhost:8080/api/v1

For mock mode (no backend): set NEXT_PUBLIC_DATA_SOURCE=mock

## Development Workflow

1. Start backend: cd backend && dcms dev
2. Start frontend: cd frontend && npm run dev
3. Open http://localhost:3000

## License

MIT

## Acknowledgments

- DCMS (https://github.com/blazing-Gael/dcms) by @blazing-Gael
- Next.js team
