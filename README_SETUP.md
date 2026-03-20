# Setup Guide for Siti-Vetrina

This project uses **Supabase** for Backend (Auth & Database) and **Cloudflare Pages** for hosting the generated sites. Both have generous free tiers.

## 1. Supabase Setup

1. **Create a Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2. **Database Schema**:
   - Go to the **SQL Editor** in the Supabase dashboard.
   - Paste the contents of `supabase/schema.sql` (to be created) and run the script.
3. **Authentication**:
   - Enable **Email Auth** in the Authentication settings.
4. **API Keys**:
   - Go to **Project Settings > API**.
   - Copy the `Project URL` and `anon public` key.
   - Create a `.env.local` file in the project root:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
     ```

---

## 2. Cloudflare Pages Setup

1. **Get an account**: Go to [Cloudflare](https://dash.cloudflare.com/).
2. **API Token**:
   - Go to **My Profile > API Tokens**.
   - Create a token with **Cloudflare Pages: Edit** permissions.
3. **Account ID**:
   - You can find your **Account ID** in the URL or on the dashboard sidebar.
4. **Environment Variables**:
   - Add these to your `.env.local`:
     ```env
     CLOUDFLARE_API_TOKEN=your_token
     CLOUDFLARE_ACCOUNT_ID=your_id
     ```

## 3. Local Development

1. Run `npm install`.
2. Run `npm run dev`.
3. Open `http://localhost:3000`.
