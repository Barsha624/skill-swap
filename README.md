# Exora — peer-to-peer skill exchange

Teach what you know, learn what you don't. React + Node/Express + MongoDB + Socket.IO.

**Demo mode:** with no backend running (e.g. GitHub Pages) the app starts completely empty and stores everything in the visitor's own browser. Create an account (and a second one in the same browser to try matching, booking and chat).

## Run locally
```bash
cd frontend && npm install && npm start      # http://localhost:3000
cd backend  && cp .env.example .env && npm install && npm start  # optional, needs MongoDB
```

## Deploy to GitHub Pages
```bash
cd frontend
npm run deploy   # builds and publishes the build/ folder to the gh-pages branch
```
Then enable Pages from the `gh-pages` branch in the repo settings.

## Backend & security notes
- Passwords hashed with bcrypt (8–128 chars); old plain-text accounts upgrade on next login. Demo mode stores salted SHA-256 hashes.
- JWT (HS256, 7 days) required on every route except register/login; set `JWT_SECRET` (the server refuses to start in production without it).
- Every request is scoped to the logged-in user: only the mentor can accept/decline, you can only edit your own profile, chats are private.
- Inputs validated and type-checked (blocks NoSQL operator injection); regex searches escaped; unique names and emails.
- Rate limiting on login/register and globally, security headers, 20 KB body limit, no stack traces in errors, CORS locked to `CLIENT_ORIGIN`.
- Socket.IO connections need a valid token and only receive their own messages.
- Users can delete their account (password required); their sessions, messages and reviews are erased too.
- The user directory never exposes emails or passwords.
