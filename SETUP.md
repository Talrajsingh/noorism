# Noorism — Setup Guide

## What was changed

### 1. Supabase database integration
- All orders are now saved to Supabase when a customer places an order
- Orders table stores: name, phone, address, notes, items, total, status

### 2. Admin panel (`/admin`)
- Password-protected login page
- Dashboard showing all orders with stats (total, pending, revenue, delivered)
- Update order status (pending → confirmed → shipped → delivered / cancelled)
- Accessible via the **Admin** button in the footer

### 3. Developer section
- Added "Built by" section on the homepage (Section 03)
- Has a photo slot and a personal comment — edit in `src/routes/index.tsx`

### 4. Admin button in footer
- Subtle "Admin" link in the bottom-right of the footer

---

## How to set up Supabase

### Step 1 — Create a Supabase project
1. Go to https://supabase.com and sign up / log in
2. Click **New project** and fill in the details
3. Wait for the project to be ready (~1 min)

### Step 2 — Create the orders table
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Paste the contents of `supabase-setup.sql` and click **Run**

### Step 3 — Create an admin user
1. Go to **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter your admin email and a strong password
4. Save these credentials — you'll use them to log in at `/admin`

### Step 4 — Add environment variables
1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. In your Supabase dashboard go to **Settings → API**
3. Copy **Project URL** → paste as `VITE_SUPABASE_URL`
4. Copy **anon public key** → paste as `VITE_SUPABASE_ANON_KEY`

### Step 5 — Install dependencies and run
```bash
npm install        # or: bun install
npm run dev        # or: bun dev
```

---

## Customise the Developer section

Open `src/routes/index.tsx` and find the `DEVELOPER` object near the top:

```ts
const DEVELOPER = {
  name: "Your Name",           // ← your name
  role: "Developer",           // ← your role/title
  photoUrl: "",                // ← URL or path to your photo
  comment: `...`,              // ← your personal comment
};
```

For the photo, either:
- Use a URL: `"https://avatars.githubusercontent.com/u/YOUR_ID"`
- Place a file in `public/` and use: `"/your-photo.jpg"`

---

## File changes summary

| File | Change |
|------|--------|
| `src/lib/supabase.ts` | **NEW** — Supabase client + types |
| `supabase-setup.sql` | **NEW** — Run in Supabase SQL Editor |
| `.env.example` | **NEW** — Env var template |
| `src/routes/admin.tsx` | **NEW** — Admin login + orders dashboard |
| `src/routeTree.gen.ts` | **UPDATED** — Added `/admin` route |
| `src/components/OrderDialog.tsx` | **UPDATED** — Saves orders to Supabase |
| `src/components/SiteFooter.tsx` | **UPDATED** — Admin button added |
| `src/routes/index.tsx` | **UPDATED** — Developer section added |
| `package.json` | **UPDATED** — Added `@supabase/supabase-js` |
