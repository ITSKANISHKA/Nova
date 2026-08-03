# Deployment Guide — Making It Public

This deploys the backend to **Render**, the frontend to **Vercel**, and the database on **MongoDB Atlas** (all free tiers), exactly like the TrustLens setup.

---

## Step 1 — MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas and create a free cluster (M0).
2. Under **Database Access**, create a user with a username/password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere — required since Render's IP isn't static).
4. Click **Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecommerce
   ```
   Replace `<username>` and `<password>` with your actual credentials.

---

## Step 2 — Push code to GitHub

1. Create a new repository on GitHub (e.g. `ecommerce-platform`).
2. Upload the `backend` and `frontend` folders (drag-and-drop via GitHub's web UI works fine, same as you did for TrustLens).

---

## Step 3 — Razorpay (Payments)

1. Sign up at https://dashboard.razorpay.com/ (test mode is enabled by default — no business verification needed for testing).
2. Go to **Settings → API Keys → Generate Test Key**.
3. Copy the **Key Id** and **Key Secret** — you'll need both.

---

## Step 4 — Deploy Backend to Render

1. Go to https://render.com → **New → Web Service** → connect your GitHub repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add these Environment Variables:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_ACCESS_SECRET` | any long random string |
   | `JWT_REFRESH_SECRET` | a **different** long random string |
   | `CLIENT_URL` | your Vercel URL (add this **after** Step 5, then redeploy) |
   | `RAZORPAY_KEY_ID` | from Step 3 |
   | `RAZORPAY_KEY_SECRET` | from Step 3 |
4. Deploy. Note your backend URL, e.g. `https://your-app.onrender.com`.
5. Once live, run the seed script once from the Render Shell tab: `npm run seed`.

---

## Step 5 — Deploy Frontend to Vercel

1. Go to https://vercel.com → **New Project** → import the same GitHub repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-app.onrender.com/api` (your Render URL + `/api`) |
4. Deploy. Note your frontend URL, e.g. `https://your-app.vercel.app`.

---

## Step 6 — Connect them (important!)

1. Go back to **Render → your backend → Environment**, set `CLIENT_URL` to your Vercel URL from Step 5.
2. Trigger a manual redeploy on Render so the CORS setting picks it up.
3. Visit your Vercel URL — register a new account, browse products, and test checkout with Razorpay test card `4111 1111 1111 1111`, any future expiry, any CVV.

---

## Troubleshooting login/logout issues

- **Stuck logged out after refresh:** Check that `CLIENT_URL` on Render exactly matches your Vercel URL (no trailing slash), and that `VITE_API_URL` on Vercel matches your Render URL + `/api`.
- **Cookies not persisting:** This app sets `sameSite: 'none'` and `secure: true` in production automatically — this only works over HTTPS, which both Render and Vercel provide by default.
- **404 on page refresh (e.g. `/product/123`):** Already handled by `frontend/vercel.json`, which rewrites all routes to `index.html`.
