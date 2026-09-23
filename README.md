# CampusRooming

A student housing marketplace: students browse and post room listings; every
listing stays hidden until an admin approves it.

## Stack
- Node.js + Express
- MongoDB + Mongoose
- EJS templates, server-rendered (no build step)
- Session-based auth (`express-session` + `connect-mongo`), passwords hashed with `bcryptjs`
- `multer` for room photo uploads

## Features
- **Auth**: register/login/logout, hashed passwords, sessions stored in Mongo
- **Browse**: public homepage lists only *approved* rooms, with search (title/location/description), room-type filter, max price filter, and price sort
- **Submit a room**: any logged-in user can submit a listing (title, description, type, price, location, amenities, up to 6 photos) — it's created with `status: pending`
- **My listings**: a user's own submissions with their current status (pending / approved / rejected) and the rejection reason if any
- **Admin approval queue** (`/admin`, admin role only):
  - Dashboard with counts (pending / approved / rejected / users) and the newest pending submissions
  - Full queue at `/admin/rooms`, filterable by status tab, with one-click **Approve** or **Reject + reason**
  - `/admin/users` to promote/demote user roles

## Setup

```bash
npm install
cp .env.example .env    # then edit MONGO_URI / SESSION_SECRET if needed
npm run dev              # or: npm start
```

The app expects a MongoDB instance at `MONGO_URI` (defaults to
`mongodb://127.0.0.1:27017/campusrooming` for a local install). If you don't
have MongoDB locally, the free tier of MongoDB Atlas works — just paste its
connection string into `.env`.

## Create your first admin

Registering through the site always creates a `student` account. To get an
admin account:

```bash
npm run seed:admin -- "Your Name" you@example.com yourPassword123
```

This creates the user if they don't exist yet, or promotes them to admin if
they've already registered. You can also promote/demote any user later from
`/admin/users` once you're logged in as an admin.

## Roles
- `student` — can browse, submit listings, manage their own listings
- `lister` — same permissions as student; use it to tag frequent/verified listers if useful to you
- `admin` — everything above, plus the approval queue and user management

## Project layout

```
config/db.js            Mongo connection
models/User.js           User schema (bcrypt password hashing)
models/Room.js           Room schema (status: pending/approved/rejected)
middleware/auth.js        requireAuth / requireAdmin / attachUser
middleware/upload.js      multer config for room photos
controllers/               route logic (auth / rooms / admin)
routes/                    route definitions
views/                     EJS templates
public/css/style.css       all styling
public/img/rooms/          uploaded room photos (created at runtime)
scripts/createAdmin.js     CLI to bootstrap/promote an admin
```

## Notes
- Uploaded photos are saved to `public/img/rooms/` and served statically —
  fine for a school project; swap for S3/Cloudinary if you deploy this for real.
- Session store lives in MongoDB (`connect-mongo`), so logins survive server restarts.
