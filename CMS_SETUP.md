# 7Art Blog CMS — Vercel Deployment

This project is configured for **Vercel**, not Netlify. The website is generated from Markdown files in `content/blog/`, while Decap CMS is available at `/admin/`.

## How publishing works

1. An editor signs in at `/admin/` with GitHub.
2. Decap CMS saves posts and uploaded images to the connected GitHub repository.
3. Draft/review/publish uses Git branches and pull requests.
4. Publishing merges the post into `main`.
5. Vercel detects the GitHub commit and automatically rebuilds the website.

## Local development

Install Node.js 18 or newer, then run:

```bash
npm install
npm run dev
```

Open:

- Website: `http://localhost:3000`
- CMS: `http://localhost:3000/admin/`

The local CMS uses `decap-server`, writes directly to `content/blog/`, and rebuilds the site automatically. `.env.example` contains the production variable names; never commit your real OAuth secret.

## 1. Push the project to GitHub

Create a repository and upload the **contents inside this project folder** so that `package.json`, `vercel.json`, `admin/`, `api/`, `content/` and `scripts/` are at the repository root.

The default branch must be `main`. Every person who manages the blog must have push access to this repository.

## 2. Import the repository into Vercel

In Vercel, choose **Add New → Project**, import the GitHub repository and deploy it.

The included `vercel.json` already configures:

- Build command: `npm run build`
- Output directory: `dist`
- `/admin` redirect
- Admin no-index headers
- GitHub OAuth serverless functions

## 3. Add Vercel environment variables

Open **Vercel Project → Settings → Environment Variables** and add these values for Production (and Preview if needed):

```text
SITE_URL=https://your-project.vercel.app
GITHUB_REPO=github-username/repository-name
OAUTH_CLIENT_ID=your-github-oauth-client-id
OAUTH_CLIENT_SECRET=your-github-oauth-client-secret
OAUTH_STATE_SECRET=generate-a-long-random-secret
```

Do not add a trailing slash to `SITE_URL`. `OAUTH_STATE_SECRET` should be a long random value and must not be shared.

After adding or changing environment variables, redeploy the latest deployment.

## 4. Create the GitHub OAuth App

On GitHub open:

**Settings → Developer settings → OAuth Apps → New OAuth App**

Use:

```text
Application name: 7Art Blog CMS
Homepage URL: https://your-project.vercel.app
Authorization callback URL: https://your-project.vercel.app/api/complete
```

After registering:

1. Copy the Client ID into Vercel as `OAUTH_CLIENT_ID`.
2. Generate a Client Secret and add it as `OAUTH_CLIENT_SECRET`.
3. Redeploy the Vercel project.

GitHub OAuth Apps allow only one callback URL. When you connect a custom domain, update the OAuth App homepage and callback URL, update `SITE_URL` in Vercel, and redeploy.

## 5. Open the admin panel

Go to:

```text
https://your-project.vercel.app/admin/
```

Click **Login with GitHub**. The logged-in GitHub account must have push access to the repository configured in `GITHUB_REPO`.

## Draft and publish workflow

The CMS uses `publish_mode: editorial_workflow`:

- Save draft: creates a CMS branch and pull request.
- Move to review: keeps the article unpublished while it is reviewed.
- Publish: merges the pull request into `main`.
- Vercel then rebuilds and deploys the public article.

The post also has a **Draft — hide from website** field. Keep it enabled while writing and disable it before the final publish.

## Image uploads

Uploaded images are committed to:

```text
assets/blog/uploads/
```

They are published at:

```text
/assets/blog/uploads/filename.jpg
```

## Important files

- `vercel.json` — Vercel build, routing and headers
- `api/begin.js` — starts GitHub OAuth
- `api/complete.js` — completes GitHub OAuth
- `server/oauth-config.js` — validates OAuth settings, state signatures and popup messaging
- `admin/config.yml` — CMS template populated from Vercel environment variables
- `content/blog/` — blog source files
- `scripts/build.mjs` — generates article pages, sitemap and RSS
- `scripts/export.mjs` — creates `dist/` and injects `SITE_URL`/`GITHUB_REPO`

## Custom domain

When the live domain changes to `https://7artmedia.com`:

1. Set `SITE_URL=https://7artmedia.com` in Vercel.
2. Change the GitHub OAuth App Homepage URL to `https://7artmedia.com`.
3. Change its callback URL to `https://7artmedia.com/api/complete`.
4. Redeploy the project.
