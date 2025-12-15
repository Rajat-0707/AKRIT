# SU-1 API (Express + MongoDB)

This replaces the previous PHP/MySQL API with Node.js (Express) + MongoDB using Mongoose.

## Endpoints (parity with old PHP)

- POST `/api/register` – Register user (artist/client)
- POST `/api/login` – Login and receive JWT
- GET `/api/me` – Current user info (Authorization: Bearer <token>)
- GET `/api/artists` – List artists with filters
  - Query: `q, service, location, minBudget, maxBudget, limit, offset`
- GET `/api/artist/me` – Current artist profile (Authorization: Bearer <token>)
- POST `/api/artist/update` – Update artist + profile (Authorization: Bearer <token>)

## Setup

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

Edit `.env` as needed:

- `PORT=4000`
- `MONGO_URI=mongodb://127.0.0.1:27017/su1_app`
- `JWT_SECRET=your_secret`
- `CORS_ORIGINS` for allowed dev origins

3. Run MongoDB

- Ensure MongoDB is running locally and accessible via `MONGO_URI`.

4. Start API server (dev)

```bash
npm run dev
```

Server will run at: `http://localhost:4000`

Health check: `GET /api/health`

## Frontend configuration

The frontend `my-app/src/utils/api.js` has been updated to point to `http://localhost:4000/api` when running on dev ports `3000` or `5173`. In other environments, it uses relative `/api` paths.

If you plan to host Express behind Apache on the same domain, set up a reverse proxy from `/api` to the Node server or deploy Node separately.

## Data model

- `User` collection mirrors `users` table fields (role, name, email, etc.).
- `ArtistProfile` collection mirrors `artists` table fields (img_url, bio, budget_min/max, availability, rating, reviews).

## Notes

- Passwords hashed with `bcrypt`.
- JWT (HS256) used for auth. Header: `Authorization: Bearer <token>`.
- CORS configured similar to previous PHP config, adjustable via env.
