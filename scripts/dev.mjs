import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const WATCH_DIR = path.join(ROOT, 'content', 'blog');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32', ...options });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)));
  });
}

async function build() {
  await run(process.execPath, ['scripts/build.mjs']);
}

async function signature(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const parts = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      parts.push(`${entry.name}:${await signature(fullPath)}`);
    } else {
      const stat = await fs.stat(fullPath);
      parts.push(`${entry.name}:${stat.size}:${stat.mtimeMs}`);
    }
  }
  return parts.join('|');
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
  return path.join(ROOT, normalized);
}

const server = http.createServer(async (request, response) => {
  try {
    let pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;
    if (pathname === '/') pathname = '/index.html';
    let filePath = safePath(pathname);
    let stat;
    try {
      stat = await fs.stat(filePath);
    } catch {
      if (!path.extname(filePath)) {
        try {
          filePath = `${filePath}.html`;
          stat = await fs.stat(filePath);
        } catch {
          filePath = safePath(path.join(pathname, 'index.html'));
          stat = await fs.stat(filePath);
        }
      } else {
        throw new Error('Not found');
      }
    }
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      stat = await fs.stat(filePath);
    }
    if (!filePath.startsWith(ROOT)) throw new Error('Forbidden');
    const content = await fs.readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    response.end(content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('404 — Page not found');
  }
});

await build();

const cmsCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const cms = spawn(cmsCommand, ['decap-server'], { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
cms.on('error', (error) => console.error('Could not start Decap local proxy:', error.message));

server.listen(PORT, HOST, () => {
  console.log(`\n7Art website: http://localhost:${PORT}`);
  console.log(`Blog admin:   http://localhost:${PORT}/admin/`);
  console.log('Content changes are rebuilt automatically. Press Ctrl+C to stop.\n');
});

let lastSignature = await signature(WATCH_DIR);
let building = false;
setInterval(async () => {
  try {
    const nextSignature = await signature(WATCH_DIR);
    if (nextSignature !== lastSignature && !building) {
      lastSignature = nextSignature;
      building = true;
      console.log('\nBlog content changed — rebuilding...');
      try { await build(); } catch (error) { console.error(error.message); }
      building = false;
    }
  } catch (error) {
    console.error('Watch error:', error.message);
  }
}, 1200);

function shutdown() {
  server.close();
  if (!cms.killed) cms.kill('SIGTERM');
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
