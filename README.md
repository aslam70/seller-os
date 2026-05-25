# Seller OS — Premium Multi-Tenant Social Commerce SaaS

Seller OS is an enterprise-grade Software-as-a-Service (SaaS) operational control deck and analytics platform designed specifically for Bangladeshi social commerce (F-commerce) merchants selling on Facebook, Instagram, and TikTok. 

It streamlines manual order entries, tracks shipments, aggregates courier metrics, analyzes cash-on-delivery (COD) return risks, and automates customer communications via WhatsApp.

**Live Production Url:** [https://seller-os-khaki.vercel.app](https://seller-os-khaki.vercel.app)

---

## ✨ Premium SaaS Features

### 1. Interactive Business Analytics Dashboard
- **SVG Sales Trend Line Chart:** A gorgeous, responsive trend graph mapping sales revenue and order counts over 7 days, complete with interactive hover tooltips.
- **Return Risk Gauge:** A circular progress radial meter showing return rates (critical for local COD) with automated trust rating classification flags (Trusted, Medium, High Risk).
- **Courier Performance Benchmarks:** Dynamic rankings analyzing delivery success rates across major couriers (Pathao, Steadfast, Redx) to help sellers minimize returns.
- **Payment Share breakdown:** A segmented visual share bar mapping billing splits (COD, bKash, Nagad, Card).

### 2. CSV Bulk Importer & Data Exporter
- **Custom RFC-4180 CSV Parser:** A robust custom JavaScript parser that handles commas, quoted values, double-quotes escaping, and line breaks without relying on heavy libraries.
- **Visual Validation Grid:** An interactive preview spreadsheet validating parsed rows and highlighting missing fields before importing.
- **Automated Directory Sync:** Automatically registers new products and customer entries in the background during bulk imports to maintain database integrity.
- **Filtered Exporter:** Allows instant download of filtered orders as a clean, standardized CSV file.

### 3. Buttery Smooth Kanban Board
- Built on top of `@dnd-kit/core` and `@dnd-kit/sortable`.
- Implements **Optimistic UI Updates** locally to visual columns for buttery smooth drag-and-drop feedback.
- Restricts database API requests by checking card column modifications and triggering a single Supabase write **only on DragEnd**, saving massive server costs.

### 4. Smart manual Sales Registration Modal
- **Customer Autocomplete:** As you type, searches for existing customers to auto-populate phone numbers and delivery addresses.
- **Product Autocomplete:** Searches and selects products from the catalog, auto-filling price and catalog metadata.
- **Delivery Zone Toggles:** Quick switch between Inside Dhaka and Outside Dhaka. Automatically and dynamically pulls the seller's **custom shop delivery fee defaults** configured in their Control Center, falling back to standard rates (৳60 / ৳120) if unset.

### 5. Advanced Customer Profiles, Risk Scoring & WhatsApp Quick Actions
- **Dynamic Customer Risk Scoring (`useCustomerRisk`):** Analyzes historical orders for any customer by phone number to calculate lifetime orders, successful deliveries, returns, and return rates.
  - Automatically filters out the current active order to prevent evaluation bias.
  - Dynamically classifies customers into granular risk tiers: `Trusted` (Return Rate < 20%), `Medium Risk` (20% - 40%), `High Risk` (>= 40%), or `New Customer` (0 previous orders).
  - Renders visual shield badges (`ShieldCheck`, `ShieldAlert`, `Shield`, `UserPlus`) and custom color-coded indicators based on risk severity directly in the **Order Drawer**.
- **Comprehensive Profiles:** Compiles customer lifetime value, successful deliveries, returns count, and order histories.
- **F-Commerce Transactional Drafts:** Automatically generates pre-formatted messages (Order Confirmed, Shipped, Returned) with live order data.
- **WhatsApp & SMS Redirects:** One-click redirect links (`wa.me/880...`) that launch WhatsApp or SMS with pre-filled messages for instant tracking alerts.

### 6. Shop Configuration Settings
- Sellers can customize their Shop Name, helpline, and **custom Inside/Outside Dhaka delivery defaults**, which dynamically override the order registration defaults.

### 7. Multi-tier Subscriptions & Quota Paywalls
- Persistent, user-isolated subscription plans:
  - **Free Plan:** Limit of 15 orders. CSV bulk importing/exporting is locked.
  - **Grower Plan (৳499/mo):** Limit of 250 orders, unlocks SVG analytics, CSV tools, and WhatsApp template boards.
  - **Enterprise Plan (৳1,499/mo):** Unlimited orders, customers, and priority dedicated support.
- Displays dynamic subscription status badges in the sidebar.
- **Checkout upgrade simulator:** A beautiful glassmorphic modal mimicking a mobile banking portal (bKash/Nagad/Rocket) to simulate upgrading plans and instantly unlocking quotas.

---

## 🔒 Multi-Tenant Database Security (RLS)

Seller OS enforces absolute customer data isolation. Row Level Security (RLS) policies are active across all database tables in Supabase:
- **Tables:** `orders`, `products`, `customers`.
- **Policy Rules:** Every operational transaction (Insert, Select, Update, Delete) is strictly validated against `auth.uid() = user_id`. Sellers can **only** access and modify their own store data.

---

## 🛠️ Technology Stack
- **Framework:** React 19 (SPA) + Vite 8
- **Styling:** Tailwind CSS v4 + Vanilla HSL styling utilities
- **Backend/Database:** Supabase (PostgreSQL with RLS)
- **Icons:** Lucide React
- **Drag-and-Drop:** `@dnd-kit/core` + `@dnd-kit/sortable`
- **Notifications:** React Hot Toast

---

## 🚀 Local Run Guidelines

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Variables Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Running Dev Server
Launch the local dev environment:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 5. Production Compilation
Compile the project for deployment:
```bash
npm run build
```
This generates a highly optimized production bundle inside the `/dist` directory.
