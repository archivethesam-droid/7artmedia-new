import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const BLOG_OUTPUT_DIR = path.join(ROOT, 'blog');
const SITE_URL = (process.env.SITE_URL || 'https://7artmedia.com').replace(/\/$/, '');
const SITE_NAME = '7Art';
const DEFAULT_AUTHOR = '7Art Team';

marked.setOptions({ gfm: true, breaks: false });

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const escapeAttr = escapeHtml;
const normalizeArray = (value) => Array.isArray(value) ? value.map(String).filter(Boolean) : value ? [String(value)] : [];
const normalizePath = (value = '') => value.startsWith('/') ? value : `/${value}`;
const absoluteUrl = (value = '') => /^https?:\/\//i.test(value) ? value : `${SITE_URL}${normalizePath(value)}`;
const toIso = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
  return date.toISOString();
};
const formatDate = (value) => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
}).format(new Date(value));
const slugify = (value = '') => String(value)
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
const readingTime = (text = '') => `${Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 220))} min read`;
const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function addHeadingIds(html) {
  return html.replace(/<h([2-4])>(.*?)<\/h\1>/g, (match, level, inner) => {
    const plain = inner.replace(/<[^>]+>/g, '');
    const id = slugify(plain);
    return `<h${level} id="${escapeAttr(id)}">${inner}</h${level}>`;
  });
}

async function loadPosts() {
  const files = (await fs.readdir(CONTENT_DIR)).filter((file) => file.endsWith('.md'));
  const posts = [];
  const slugSet = new Set();

  for (const file of files) {
    const source = await fs.readFile(path.join(CONTENT_DIR, file), 'utf8');
    const parsed = matter(source);
    const data = parsed.data || {};
    const title = String(data.title || '').trim();
    const slug = slugify(data.slug || path.basename(file, '.md'));
    const description = String(data.description || '').trim();
    const date = toIso(data.date);
    const updated = data.updated ? toIso(data.updated) : date;

    if (!title || !slug || !description || !data.featured_image || !data.featured_image_alt) {
      throw new Error(`${file}: title, slug, description, featured_image and featured_image_alt are required.`);
    }
    if (slugSet.has(slug)) throw new Error(`Duplicate blog slug: ${slug}`);
    slugSet.add(slug);

    const bodyHtml = addHeadingIds(marked.parse(parsed.content));
    const post = {
      title,
      slug,
      metaTitle: String(data.meta_title || title).trim(),
      description,
      date,
      updated,
      author: String(data.author || DEFAULT_AUTHOR),
      category: String(data.category || 'Marketing'),
      tags: normalizeArray(data.tags),
      featured: data.featured === true,
      draft: data.draft === true,
      featuredImage: normalizePath(String(data.featured_image)),
      featuredImageAlt: String(data.featured_image_alt),
      readTime: readingTime(parsed.content),
      bodyHtml,
      bodyText: parsed.content,
      url: `/blog/${slug}/`
    };

    if (post.metaTitle.length > 65) console.warn(`SEO warning: ${file} meta title is ${post.metaTitle.length} characters.`);
    if (post.description.length < 90 || post.description.length > 165) console.warn(`SEO warning: ${file} meta description is ${post.description.length} characters.`);
    posts.push(post);
  }

  return posts
    .filter((post) => !post.draft)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || new Date(b.date) - new Date(a.date));
}

function nav(prefix = '/') {
  return `
  <nav class="global-nav" aria-label="Primary navigation" data-global-nav>
    <div class="global-nav__inner">
      <a class="global-nav__brand" href="${prefix}index.html" aria-label="7Art home">
        <span class="global-nav__mark" aria-hidden="true">7</span><span>7Art</span>
      </a>
      <div class="global-nav__links" id="globalNavLinks" data-global-nav-links>
        <a class="global-nav__link" href="${prefix}leadership.html">Leadership</a>
        <a class="global-nav__link" href="${prefix}index.html#framework">Framework</a>
        <a class="global-nav__link" href="${prefix}index.html#services">Services</a>
        <a class="global-nav__link" href="${prefix}results.html">Results</a>
        <a class="global-nav__link" href="${prefix}blog.html" aria-current="page">Blog</a>
        <a class="global-nav__link" href="${prefix}index.html#faq">FAQ</a>
      </div>
      <a class="global-nav__cta" href="${prefix}index.html#contact">Get Free Growth Audit</a>
      <button class="global-nav__toggle" type="button" aria-label="Open navigation" aria-controls="globalNavLinks" aria-expanded="false" data-global-nav-toggle>☰</button>
    </div>
  </nav>`;
}

function footer(prefix = '/') {
  return `
  <footer class="blog-footer-site">
    <div class="blog-footer-grid">
      <div>
        <a class="footer-brand" href="${prefix}index.html"><span>7</span>7Art</a>
        <p>AI-assisted growth marketing for D2C brands.</p>
      </div>
      <div><h2>Explore</h2><a href="${prefix}results.html">Results</a><a href="${prefix}leadership.html">Leadership</a><a href="${prefix}blog.html">Blog</a></div>
      <div><h2>Services</h2><a href="${prefix}index.html#services">Growth Strategy</a><a href="${prefix}index.html#services">Performance Marketing</a><a href="${prefix}index.html#services">Content & Creative</a></div>
      <div><h2>Start a conversation</h2><a href="mailto:7artsupportofficial@gmail.com">7artsupportofficial@gmail.com</a><a href="${prefix}index.html#contact">Get a free growth audit</a></div>
    </div>
    <div class="blog-footer-bottom">© ${new Date().getUTCFullYear()} 7Art Media. All rights reserved.</div>
  </footer>`;
}

function postCard(post) {
  return `<article class="blog-card" data-blog-card data-category="${escapeAttr(post.category.toLowerCase())}" data-tags="${escapeAttr(post.tags.join('|').toLowerCase())}" data-search="${escapeAttr(`${post.title} ${post.description} ${post.category} ${post.tags.join(' ')}`.toLowerCase())}">
    <a class="blog-card__image" href="${post.url}" aria-label="Read ${escapeAttr(post.title)}">
      <img src="${escapeAttr(post.featuredImage)}" alt="${escapeAttr(post.featuredImageAlt)}" loading="lazy" width="1200" height="675">
      ${post.featured ? '<span class="featured-label">Featured</span>' : ''}
    </a>
    <div class="blog-card__content">
      <div class="blog-card__meta"><span class="category-pill">${escapeHtml(post.category)}</span><span>${escapeHtml(post.readTime)}</span></div>
      <h2><a href="${post.url}">${escapeHtml(post.title)}</a></h2>
      <p>${escapeHtml(post.description)}</p>
      <div class="blog-card__bottom"><span>${escapeHtml(post.author)} · <time datetime="${post.date}">${escapeHtml(formatDate(post.date))}</time></span><a class="read-link" href="${post.url}">Read article <span aria-hidden="true">→</span></a></div>
    </div>
  </article>`;
}

function renderBlogIndex(posts) {
  const categories = [...new Set(posts.map((post) => post.category))].sort();
  const tags = [...new Set(posts.flatMap((post) => post.tags))].sort();
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '7Art Growth & Marketing Insights',
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(post.url),
      name: post.title
    }))
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Growth & Marketing Insights | 7Art Blog</title>
  <meta name="description" content="Actionable growth strategy, paid marketing, content, SEO and AI automation insights for D2C brands from the 7Art team.">
  <link rel="canonical" href="${SITE_URL}/blog.html">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Growth & Marketing Insights | 7Art Blog">
  <meta property="og:description" content="Actionable growth and marketing insights for ambitious D2C brands.">
  <meta property="og:url" content="${SITE_URL}/blog.html">
  <meta property="og:image" content="${SITE_URL}/favicon.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Growth & Marketing Insights | 7Art Blog">
  <meta name="twitter:description" content="Actionable growth and marketing insights for ambitious D2C brands.">
  <meta name="twitter:image" content="${SITE_URL}/favicon.png">
  <link rel="alternate" type="application/rss+xml" title="7Art Blog RSS" href="${SITE_URL}/rss.xml">
  <link rel="icon" href="/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/global-navbar.css">
  <link rel="stylesheet" href="/blog-shared.css">
  <link rel="stylesheet" href="/lead-popup.css?v=2">
  <script type="application/ld+json">${safeJson(itemList)}</script>
</head>
<body class="blog-index-page">
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${nav('/')}
  <header class="blog-hero">
    <div class="blog-shell">
      <span class="eyebrow">7ART KNOWLEDGE HUB</span>
      <h1>Growth &amp; Marketing Insights</h1>
      <p>Practical strategies, frameworks and experiments to help D2C brands grow with clarity.</p>
    </div>
  </header>
  <main class="blog-shell blog-layout" id="main-content">
    <section aria-labelledby="latest-posts-title">
      <div class="section-heading"><div><span class="eyebrow">LATEST THINKING</span><h2 id="latest-posts-title">Articles built for action</h2></div><p id="resultCount" aria-live="polite">${posts.length} articles</p></div>
      <div class="blog-grid" id="blogGrid">${posts.map(postCard).join('\n')}</div>
      <nav class="pagination" id="pagination" aria-label="Blog pagination"></nav>
      <div class="empty-state" id="emptyState" hidden><h2>No matching posts</h2><p>Try a different search term or clear the filters.</p><button type="button" id="clearFilters">Clear all filters</button></div>
    </section>
    <aside class="blog-sidebar" aria-label="Blog filters">
      <div class="sidebar-card">
        <label class="filter-title" for="searchInput">Search articles</label>
        <div class="search-box"><input id="searchInput" type="search" placeholder="Search posts..." autocomplete="off"><button type="button" id="searchButton">Search</button></div>
      </div>
      <div class="sidebar-card">
        <h2 class="filter-title">Category</h2>
        <div class="filter-options">${categories.map((category, index) => `<label class="filter-option"><input type="checkbox" value="${escapeAttr(category.toLowerCase())}"><span>${escapeHtml(category)}</span></label>`).join('')}</div>
      </div>
      <div class="sidebar-card">
        <h2 class="filter-title">Popular tags</h2>
        <div class="tag-list">${tags.map((tag) => `<button type="button" class="tag" data-tag="${escapeAttr(tag.toLowerCase())}">${escapeHtml(tag)}</button>`).join('')}</div>
      </div>
      <div class="sidebar-card subscribe-card">
        <span class="eyebrow">WEEKLY IDEAS</span><h2>Subscribe to Updates</h2><p>Get useful growth insights delivered to your inbox.</p>
        <form class="newsletter" id="newsletterForm"><label class="sr-only" for="newsletterEmail">Your email</label><input id="newsletterEmail" type="email" placeholder="Your email" required><button type="submit">Subscribe</button></form>
      </div>
    </aside>
  </main>
  ${footer('/')}
  <script src="/global-navbar.js"></script>
  <script src="/blog.js"></script>
  <script src="/lead-popup.js?v=2"></script>
</body>
</html>`;
}

function relatedCard(post) {
  return `<article class="related-card"><a href="${post.url}"><img src="${escapeAttr(post.featuredImage)}" alt="${escapeAttr(post.featuredImageAlt)}" loading="lazy"><span>${escapeHtml(post.category)}</span><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.readTime)} · ${escapeHtml(formatDate(post.date))}</p></a></article>`;
}

function renderArticle(post, posts) {
  const related = posts
    .filter((candidate) => candidate.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category) || new Date(b.date) - new Date(a.date))
    .slice(0, 3);
  const canonical = absoluteUrl(post.url);
  const imageUrl = absoluteUrl(post.featuredImage);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: [imageUrl],
    datePublished: post.date,
    dateModified: post.updated,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.png` }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    articleSection: post.category,
    keywords: post.tags.join(', ')
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.metaTitle)} | 7Art</title>
  <meta name="description" content="${escapeAttr(post.description)}">
  <meta name="author" content="${escapeAttr(post.author)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeAttr(post.metaTitle)}">
  <meta property="og:description" content="${escapeAttr(post.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:alt" content="${escapeAttr(post.featuredImageAlt)}">
  <meta property="article:published_time" content="${post.date}">
  <meta property="article:modified_time" content="${post.updated}">
  <meta property="article:section" content="${escapeAttr(post.category)}">
  ${post.tags.map((tag) => `<meta property="article:tag" content="${escapeAttr(tag)}">`).join('\n  ')}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(post.metaTitle)}">
  <meta name="twitter:description" content="${escapeAttr(post.description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="icon" href="/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/global-navbar.css">
  <link rel="stylesheet" href="/blog-shared.css">
  <link rel="stylesheet" href="/lead-popup.css?v=2">
  <script type="application/ld+json">${safeJson(schema)}</script>
</head>
<body class="article-page">
  <a class="skip-link" href="#article-content">Skip to article</a>
  ${nav('/')}
  <main>
    <div class="article-shell">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/blog.html">Blog</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(post.title)}</span></nav>
      <header class="article-header">
        <span class="category-pill">${escapeHtml(post.category)}</span>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="article-deck">${escapeHtml(post.description)}</p>
        <div class="article-meta"><span>By <strong>${escapeHtml(post.author)}</strong></span><span><time datetime="${post.date}">${escapeHtml(formatDate(post.date))}</time></span><span>${escapeHtml(post.readTime)}</span></div>
        <div class="article-tags">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </header>
      <figure class="article-cover"><img src="${escapeAttr(post.featuredImage)}" alt="${escapeAttr(post.featuredImageAlt)}" width="1200" height="675" fetchpriority="high"></figure>
      <div class="article-content" id="article-content">${post.bodyHtml}</div>
      <aside class="author-box" aria-label="About the author"><div class="author-avatar" aria-hidden="true">7</div><div><span>Written by</span><h2>${escapeHtml(post.author)}</h2><p>Growth strategy and execution insights from the 7Art team.</p></div><a href="/index.html#contact">Discuss your growth challenge</a></aside>
    </div>
    ${related.length ? `<section class="related-section"><div class="blog-shell"><div class="section-heading"><div><span class="eyebrow">KEEP READING</span><h2>Related insights</h2></div><a class="read-link" href="/blog.html">View all articles →</a></div><div class="related-grid">${related.map(relatedCard).join('')}</div></div></section>` : ''}
  </main>
  ${footer('/')}
  <script src="/global-navbar.js"></script>
  <script src="/lead-popup.js?v=2"></script>
</body>
</html>`;
}

function renderSitemap(posts) {
  const staticPages = [
    ['/', '1.0', 'weekly'],
    ['/index.html', '1.0', 'weekly'],
    ['/leadership.html', '0.8', 'monthly'],
    ['/results.html', '0.9', 'monthly'],
    ['/blog.html', '0.9', 'weekly']
  ];
  const urls = staticPages.map(([url, priority, frequency]) => `<url><loc>${SITE_URL}${url}</loc><changefreq>${frequency}</changefreq><priority>${priority}</priority></url>`);
  posts.forEach((post) => urls.push(`<url><loc>${absoluteUrl(post.url)}</loc><lastmod>${post.updated.slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function renderRss(posts) {
  const items = posts.slice(0, 20).map((post) => `<item>
<title>${escapeHtml(post.title)}</title>
<link>${absoluteUrl(post.url)}</link>
<guid isPermaLink="true">${absoluteUrl(post.url)}</guid>
<pubDate>${new Date(post.date).toUTCString()}</pubDate>
<description>${escapeHtml(post.description)}</description>
</item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>7Art Growth &amp; Marketing Insights</title>
<link>${SITE_URL}/blog.html</link>
<description>Growth strategy, marketing, content, SEO and AI insights for D2C brands.</description>
<language>en-IN</language>
${items}
</channel></rss>\n`;
}

async function build() {
  const posts = await loadPosts();
  await fs.rm(BLOG_OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(BLOG_OUTPUT_DIR, { recursive: true });

  await fs.writeFile(path.join(ROOT, 'blog.html'), renderBlogIndex(posts));
  for (const post of posts) {
    const outputDir = path.join(BLOG_OUTPUT_DIR, post.slug);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, 'index.html'), renderArticle(post, posts));
  }
  await fs.writeFile(path.join(ROOT, 'sitemap.xml'), renderSitemap(posts));
  await fs.writeFile(path.join(ROOT, 'rss.xml'), renderRss(posts));
  await fs.writeFile(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  await fs.writeFile(path.join(ROOT, 'assets', 'blog', 'posts.json'), JSON.stringify(posts.map(({ bodyHtml, bodyText, ...post }) => post), null, 2));

  console.log(`Built ${posts.length} published blog post${posts.length === 1 ? '' : 's'}.`);
  console.log(`Blog index: ${path.join(ROOT, 'blog.html')}`);
}

build().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
