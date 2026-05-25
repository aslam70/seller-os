# SellerOS – Real‑World SaaS Demo

## Overview
SellerOS is a small but **feature‑rich SaaS‑style** web application that lets you manage **orders, products, customers, and dashboards**. The project demonstrates:
- **Premium‑tier gating** (Free / Grower / Enterprise) backed by Supabase profiles.
- **Glass‑morphic paywalls** that visually block premium features.
- **Mock payment flow** that safely simulates a bKash transaction without collecting real credentials.
- **Tailwind‑only UI** (no DaisyUI) with vibrant colors and micro‑animations.
- **Real‑time data** fetched from Supabase.

The codebase is built with **Vite + React** and uses **Tailwind CSS** for styling.

---

## Tech Stack
- **Framework**: Vite + React 18
- **Styling**: Tailwind CSS (pure utilities, custom glass‑morphism)
- **Database / Auth**: Supabase (PostgreSQL, RLS policies, auth)
- **State management**: React hooks (`useOrders`, `useSubscription`, etc.)
- **Notifications**: `react-hot-toast`
- **Icons**: `lucide-react`
- **Deployment**: Any static host (Netlify, Vercel) – just run `npm run build` and serve the `dist` folder.

---

## Getting Started (Local Development)
1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/seller-os.git
   cd seller-os
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up Supabase**
   - Create a new project at https://app.supabase.com.
   - In the project's **SQL editor**, run the migration file `00004_create_profiles_table.sql`:
     ```sql
     create table public.profiles (
       id uuid primary key,
       tier text not null default 'free',
       updated_at timestamptz default now()
     );
     ```
   - Enable **RLS** and add a policy that allows a user to **read & upsert** their own profile.
   - Copy the **anon public key** and **API URL** from Supabase settings.
4. **Create a `.env` file** in the project root:
   ```env
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
5. **Run the dev server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5175` (Vite picks the next free port).

---

## Key Features
- **Subscription Management** (`useSubscription`): reads the tier from Supabase `profiles` table and updates it securely via an upsert.
- **Paywall Modal** (`SaaSUpgradeModal.jsx`): shows a single **“Simulate Payment”** button – no PIN field, eliminating any credential‑harvesting risk.
- **Order UI** (`useOrders`): generates a short `display_id` (`Math.random().toString(36).substring(2,8).toUpperCase()`) for each order.
- **Tailwind‑only Buttons** on the Products page – DaisyUI removed.
- **Loading State** handling on Kanban page with a simple spinner.
- **Sidebar** now passes `orders.length` to `useSubscription` so `reachedLimit` works correctly.
- **Toast messages**: success vs. error are used appropriately (e.g., order deletion now shows `toast.success`).

---

## Project Structure (high‑level)
```
src/
├─ components/          # UI primitives (Sidebar, SaaSUpgradeModal, etc.)
├─ features/
│   ├─ auth/            # Supabase auth hook
│   ├─ orders/          # useOrders hook + pages
│   ├─ customers/       # Customer panel
│   ├─ products/        # Products page & hook
│   ├─ dashboard/       # Dashboard page with premium overlays
│   ├─ settings/        # Settings/Control Center page
│   └─ subscription/    # useSubscription hook & plan constants
├─ lib/                 # Supabase client, constants
└─ App.jsx              # Routes & layout
```

---

## Deployment Checklist
- ✅ Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in the hosting environment.
- ✅ Run `npm run build` and upload the generated `dist/` folder.
- ✅ Verify that the **profiles** table exists and RLS policies are active.
- ✅ Test the upgrade flow: open the modal, click **“Simulate Payment”**, and confirm the tier changes in the sidebar.

---

## Known Limitations & Future Work
| Area | Limitation | Suggested improvement |
|------|------------|------------------------|
| `display_id` generation | Simple random string may collide at very high scale | Switch to `nanoid` or UUID‑based IDs when scaling. |
| Loading UI | Basic spinner on Kanban page; could be replaced with a polished skeleton UI. |
| Tests | No unit / integration tests yet – add Jest + React Testing Library. |
| Documentation | README now covers basics; consider adding a **contributing guide** and **API reference**. |

---

## License
This project is provided under the MIT License – feel free to fork, modify, and deploy.

---

*Happy hacking! 🎉*
