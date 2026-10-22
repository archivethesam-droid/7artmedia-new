7ART WEBSITE — VERCEL + SEO BLOG CMS

LOCAL:
1. npm install
2. npm run dev
3. Open http://localhost:3000
4. Open http://localhost:3000/admin/

VERCEL:
Read CMS_SETUP.md. Add SITE_URL, GITHUB_REPO, OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET in Vercel, then redeploy.

The CMS uses GitHub authentication and editorial workflow. Blog posts and uploaded images are committed to GitHub, and Vercel automatically rebuilds after publishing.

CHATBOT:
The 7Art cat chatbot is included on public website pages. Its settings are in assets/7art-chatbot-loader.js; the widget script, cat image and meow audio are in assets/. Sample replies work without an AI API. Set apiEndpoint in the loader only after connecting a secure backend for live AI answers.
