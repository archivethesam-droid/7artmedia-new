(() => {
  const cards = [...document.querySelectorAll('[data-blog-card]')];
  if (!cards.length) return;

  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const categoryInputs = [...document.querySelectorAll('.filter-option input[type="checkbox"]')];
  const tagButtons = [...document.querySelectorAll('[data-tag]')];
  const pagination = document.getElementById('pagination');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const clearFilters = document.getElementById('clearFilters');
  const newsletterForm = document.getElementById('newsletterForm');
  const postsPerPage = 6;
  let page = 1;
  let activeTag = '';

  function filteredCards() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const categories = new Set(categoryInputs.filter((input) => input.checked).map((input) => input.value));
    return cards.filter((card) => {
      const matchesQuery = !query || card.dataset.search.includes(query);
      const matchesCategory = !categories.size || categories.has(card.dataset.category);
      const tags = (card.dataset.tags || '').split('|');
      const matchesTag = !activeTag || tags.includes(activeTag);
      return matchesQuery && matchesCategory && matchesTag;
    });
  }

  function renderPagination(total) {
    if (!pagination) return;
    const pages = Math.ceil(total / postsPerPage);
    pagination.innerHTML = '';
    if (pages <= 1) return;

    for (let index = 1; index <= pages; index += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(index);
      button.className = index === page ? 'is-active' : '';
      button.setAttribute('aria-label', `Go to blog page ${index}`);
      if (index === page) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => {
        page = index;
        applyFilters();
        document.getElementById('latest-posts-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      pagination.appendChild(button);
    }
  }

  function applyFilters(resetPage = false) {
    if (resetPage) page = 1;
    const matches = filteredCards();
    const start = (page - 1) * postsPerPage;
    const visible = new Set(matches.slice(start, start + postsPerPage));

    cards.forEach((card) => { card.hidden = !visible.has(card); });
    if (resultCount) resultCount.textContent = `${matches.length} article${matches.length === 1 ? '' : 's'}`;
    if (emptyState) emptyState.hidden = matches.length !== 0;
    renderPagination(matches.length);
  }

  searchInput?.addEventListener('input', () => applyFilters(true));
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') applyFilters(true);
  });
  searchButton?.addEventListener('click', () => applyFilters(true));
  categoryInputs.forEach((input) => input.addEventListener('change', () => applyFilters(true)));
  tagButtons.forEach((button) => button.addEventListener('click', () => {
    const selected = button.dataset.tag || '';
    activeTag = activeTag === selected ? '' : selected;
    tagButtons.forEach((tag) => tag.classList.toggle('is-active', tag.dataset.tag === activeTag));
    applyFilters(true);
  }));
  clearFilters?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    categoryInputs.forEach((input) => { input.checked = false; });
    activeTag = '';
    tagButtons.forEach((tag) => tag.classList.remove('is-active'));
    applyFilters(true);
  });
  newsletterForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('newsletterEmail')?.value.trim();
    if (!email) return;
    const subject = encodeURIComponent('Subscribe me to 7Art updates');
    const body = encodeURIComponent(`Please subscribe this email to 7Art updates: ${email}`);
    window.location.href = `mailto:7artsupportofficial@gmail.com?subject=${subject}&body=${body}`;
  });

  applyFilters();
})();
