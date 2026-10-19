import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const DIST = path.join(ROOT, 'dist');
const deployDirectories = ['assets', 'blog', 'admin'];
const deployExtensions = new Set(['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.txt', '.xml', '.webmanifest']);

await fs.rm(DIST, { recursive: true, force: true });
await fs.mkdir(DIST, { recursive: true });

for (const directory of deployDirectories) {
  const source = path.join(ROOT, directory);
  try {
    await fs.cp(source, path.join(DIST, directory), { recursive: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const githubRepo = process.env.GITHUB_REPO || 'YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME';
const cmsConfigPath = path.join(DIST, 'admin', 'config.yml');
let cmsConfig = await fs.readFile(cmsConfigPath, 'utf8');
cmsConfig = cmsConfig
  .replace(/^  repo: .*$/m, `  repo: ${githubRepo}`)
  .replace(/^  base_url: .*$/m, `  base_url: ${siteUrl}`)
  .replace(/^site_url: .*$/m, `site_url: ${siteUrl}`)
  .replace(/^display_url: .*$/m, `display_url: ${siteUrl}`)
  .replace(/^  src: .*\/favicon\.png$/m, `  src: ${siteUrl}/favicon.png`);
await fs.writeFile(cmsConfigPath, cmsConfig);

if (!process.env.GITHUB_REPO) {
  console.warn('CMS warning: GITHUB_REPO is not set. Live /admin login will require this Vercel environment variable.');
}

for (const entry of await fs.readdir(ROOT, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const extension = path.extname(entry.name).toLowerCase();
  if (deployExtensions.has(extension) || entry.name === '_headers' || entry.name === '_redirects') {
    await fs.copyFile(path.join(ROOT, entry.name), path.join(DIST, entry.name));
  }
}

const GTM_ID = 'GTM-TNB5LWVR';

// GTM Head Code
const gtmHead = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');</script>
<!-- End Google Tag Manager -->`;

// GTM Body Code
const gtmBody = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

// Automatically install GTM on public HTML pages
async function installGTM(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    const relativePath = path.relative(DIST, filePath);

    if (relativePath.split(path.sep)[0] === 'admin') continue;

    if (entry.isDirectory()) {
      await installGTM(filePath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

    let html = await fs.readFile(filePath, 'utf8');

    if (!/<head\b[^>]*>/i.test(html) ||
        !/<body\b[^>]*>/i.test(html)) continue;

    if (html.includes('googletagmanager.com/gtm.js')) continue;

    html = html.replace(/<head\b[^>]*>/i,
      tag => `${tag}\n${gtmHead}`);

    html = html.replace(/<body\b[^>]*>/i,
      tag => `${tag}\n${gtmBody}`);

    await fs.writeFile(filePath, html, 'utf8');
  }
}

await installGTM(DIST);
console.log('GTM installation completed');

console.log(`Production site exported to ${DIST}`);
