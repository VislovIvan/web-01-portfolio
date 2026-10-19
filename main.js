'use strict';

const THEME_KEY = 'portfolio.theme';

function readTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Без хранилища тема переключается, но не запоминается
  }
}

function initTheme() {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  const meta = document.querySelector('meta[name="theme-color"]');
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let chosen = readTheme();

  function apply(theme) {
    root.dataset.theme = theme;
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    meta.content = theme === 'dark' ? '#121114' : '#fbfbfa';
  }

  apply(root.dataset.theme === 'dark' ? 'dark' : 'light');

  button.addEventListener('click', () => {
    chosen = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(chosen);
    saveTheme(chosen);
  });

  // Пока тема не выбрана вручную, она следует за системой
  system.addEventListener('change', (event) => {
    if (chosen !== 'dark' && chosen !== 'light') apply(event.matches ? 'dark' : 'light');
  });
}

function initMenu() {
  const header = document.getElementById('header');
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('site-nav');
  const desktop = window.matchMedia('(min-width: 760px)');

  function isOpen() {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  function setOpen(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && !header.contains(event.target)) setOpen(false);
  });

  desktop.addEventListener('change', () => setOpen(false));
}

function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.site-nav .nav-link'));
  const sections = ['top', ...links.map((link) => link.hash.slice(1))]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function mark(id) {
    links.forEach((link) => {
      const current = link.hash === `#${id}`;
      link.classList.toggle('is-current', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  // Текущим считается раздел, который пересекает середину экрана
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) mark(entry.target.id);
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach((section) => observer.observe(section));
}

function initProjects() {
  const chips = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('.project'));
  const search = document.getElementById('project-search');
  const status = document.getElementById('projects-status');
  const empty = document.getElementById('projects-empty');
  const reset = document.getElementById('projects-reset');
  let category = 'all';

  const texts = new Map(cards.map((card) => [card, card.textContent.toLowerCase().replace(/\s+/g, ' ')]));

  chips.forEach((chip) => {
    const key = chip.dataset.filter;
    const count = key === 'all' ? cards.length : cards.filter((card) => card.dataset.category === key).length;
    chip.querySelector('.chip-count').textContent = String(count);
  });

  function render() {
    const query = search.value.trim().toLowerCase();
    let shown = 0;

    cards.forEach((card) => {
      const inCategory = category === 'all' || card.dataset.category === category;
      const visible = inCategory && (query === '' || texts.get(card).includes(query));
      card.hidden = !visible;
      if (visible) shown += 1;
    });

    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === category)));
    empty.hidden = shown > 0;
    status.textContent = shown > 0 ? `Показано ${shown} из ${cards.length}` : 'Ничего не найдено';
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      category = chip.dataset.filter;
      render();
    });
  });

  search.addEventListener('input', render);

  reset.addEventListener('click', () => {
    category = 'all';
    search.value = '';
    render();
    chips[0].focus();
  });

  render();
}

initTheme();
initMenu();
initScrollSpy();
initProjects();
