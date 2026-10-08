(() => {
  const nav = document.querySelector('[data-global-nav]');
  if (!nav) return;

  const toggle = nav.querySelector('[data-global-nav-toggle]');
  const links = nav.querySelector('[data-global-nav-links]');
  if (!toggle || !links) return;

  const closeMenu = () => {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.textContent = '☰';
  };

  toggle.addEventListener('click', () => {
    const willOpen = !links.classList.contains('is-open');
    links.classList.toggle('is-open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
    toggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
    toggle.textContent = willOpen ? '×' : '☰';
  });

  links.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1040) closeMenu();
  });
})();
