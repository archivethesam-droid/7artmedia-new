import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const DIST = path.join(ROOT, 'dist');
const deployDirectories = ['assets', 'blog', 'admin'];
const deployExtensions = new Set(['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.txt', '.xml', '.webmanifest']);

const DEFAULT_SITE_URL = 'https://7artmedia-new.vercel.app';
const CANONICAL_GITHUB_REPO = 'archivethesam-droid/7artmedia-new';
const LEGACY_REPOSITORIES = new Map([
  ['archivethexam-droid/7artmedia-new', CANONICAL_GITHUB_REPO],
  ['archivethesam-droid/7artmediaofficial', CANONICAL_GITHUB_REPO],
  ['archivethesam-droid/7artmediaofficial.git', CANONICAL_GITHUB_REPO]
]);

function resolveGithubRepo(rawValue) {
  const suppliedValue = String(rawValue || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '');
  const candidate = suppliedValue || CANONICAL_GITHUB_REPO;
  const alias = LEGACY_REPOSITORIES.get(candidate.toLowerCase());

  if (alias) {
    console.warn(`CMS warning: GITHUB_REPO \"${candidate}\" is obsolete or misspelled. Using \"${alias}\" instead.`);
    return alias;
  }

  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(candidate)) {
    throw new Error(`Invalid GITHUB_REPO \"${candidate}\". Expected the format \"owner/repository\".`);
  }

  return candidate;
}

function resolveSiteUrl(rawValue) {
  const candidate = String(rawValue || DEFAULT_SITE_URL).trim().replace(/\/$/, '');
  let parsed;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(`Invalid SITE_URL \"${candidate}\". Use a complete URL such as ${DEFAULT_SITE_URL}.`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`Invalid SITE_URL protocol \"${parsed.protocol}\". Only http and https are supported.`);
  }

  return candidate;
}

async function validateCmsExport({ cmsConfigPath, githubRepo, siteUrl }) {
  const config = await fs.readFile(cmsConfigPath, 'utf8');
  const checks = [
    [`repo: ${githubRepo}`, 'GitHub repository'],
    [`base_url: ${siteUrl}`, 'OAuth base URL'],
    ['auth_endpoint: api/begin', 'OAuth begin endpoint'],
    [`site_url: ${siteUrl}`, 'CMS site URL']
  ];

  for (const [needle, label] of checks) {
    if (!config.includes(needle)) {
      throw new Error(`CMS export validation failed: ${label} was not written correctly.`);
    }
  }

  const staleValues = ['archivethexam-droid/7artmedia-new', 'archivethesam-droid/7Artmediaofficial'];
  for (const staleValue of staleValues) {
    if (config.toLowerCase().includes(staleValue.toLowerCase())) {
      throw new Error(`CMS export validation failed: stale repository value \"${staleValue}\" is still present.`);
    }
  }

  await Promise.all([
    fs.access(path.join(ROOT, 'api', 'begin.js')),
    fs.access(path.join(ROOT, 'api', 'complete.js')),
    fs.access(path.join(ROOT, 'server', 'oauth-config.js'))
  ]);
}

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

const siteUrl = resolveSiteUrl(process.env.SITE_URL);
const githubRepo = resolveGithubRepo(process.env.GITHUB_REPO);
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
  console.warn(`CMS warning: GITHUB_REPO is not set. Using the project repository ${CANONICAL_GITHUB_REPO}.`);
}

for (const entry of await fs.readdir(ROOT, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const extension = path.extname(entry.name).toLowerCase();
  if (deployExtensions.has(extension) || entry.name === '_headers' || entry.name === '_redirects') {
    await fs.copyFile(path.join(ROOT, entry.name), path.join(DIST, entry.name));
  }
}

await validateCmsExport({ cmsConfigPath, githubRepo, siteUrl });

console.log(`CMS repository: ${githubRepo}`);
console.log(`CMS site URL: ${siteUrl}`);
console.log(`Production site exported to ${DIST}`);
