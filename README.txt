7ART WEBSITE — VERCEL + SEO BLOG CMS

LOCAL:
1. npm install
2. npm run dev
3. Open http://localhost:3000
4. Open http://localhost:3000/admin/

VERCEL:
Read CMS_SETUP.md. Add SITE_URL, GITHUB_REPO, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET and OAUTH_STATE_SECRET in Vercel, then redeploy. Use GITHUB_REPO=archivethesam-droid/7artmedia-new exactly.

The CMS uses GitHub authentication and editorial workflow. Blog posts and uploaded images are committed to GitHub, and Vercel automatically rebuilds after publishing.
