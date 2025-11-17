# GrassRoots Backend

This backend is a minimal Node.js + Express app using Sequelize (MySQL) to provide APIs for the frontend.

Quick start

1. Copy `.env.example` to `.env` and update DB credentials.

2. Install dependencies:

```powershell
cd backend
npm install
```

3. Create the database in MySQL (example):

```sql
CREATE DATABASE grassroots_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Start the server:

```powershell
npm run dev
```

The server serves the existing `frontend/` folder and exposes APIs under `/api/*`:
- `GET/POST/DELETE /api/qr`
- `GET/POST/PUT/DELETE /api/products`
- `GET/POST/PUT/DELETE /api/orders`
- `GET/POST /api/profile`

When you're ready I'll provide SQL schema and migration scripts, and adjust models to match the flow you provide.
