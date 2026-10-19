'use strict';

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

initProjects();
