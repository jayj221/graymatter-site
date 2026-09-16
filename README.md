# GrayMatter AI website

Static marketing site for GrayMatter AI (graymatterai.in). Plain React + Vite, no server:
every page is a file, so it is hosted on GitHub Pages.

```bash
npm install
npm run dev        # local site at http://localhost:5173
npm run build      # static files in dist-static/
npm run preview    # serve the built files
```

## Pilot inquiries

The contact form writes straight to Supabase (`supabase/graymatter_inquiries.sql`). The table is
insert-only for the website key, so it can add a lead but never read, change or delete one. Read
leads in the Supabase dashboard.

Set these before building (locally in `.env.local`, in CI as repository secrets):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_KEY=<publishable / anon key>
```

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`: build, then publish to GitHub Pages.
`public/CNAME` points the site at graymatterai.in.

## What's where

| Path | |
|---|---|
| `app/page.tsx` | the whole one-page site |
| `app/brain-scene.tsx` | the 3D glass brain and its burst (three.js) |
| `app/nerve.tsx` | the nerve that runs down the page to the footer logo |
| `app/demo.tsx`, `app/pricing.tsx`, `app/workday.tsx` | the interactive sections |
| `app/thank-you/page.tsx` | the page after an inquiry is sent |
| `app/globals.css` | all styling |
| `public/` | brain image, logo mark, favicon |
