'use strict';
// Everything here runs locally; there is no dependency on the Flexbe runtime.
const mobile = window.matchMedia('(max-width: 800px)');
function adapt() {
  document.body.classList.toggle('adaptive-mobile', mobile.matches);
  document.body.classList.toggle('adaptive-desktop', !mobile.matches);
  document.body.classList.toggle('is-mobile', mobile.matches);
  document.body.classList.toggle('is-desktop', !mobile.matches);
  const sections = {'608740719':'955316229','426141581':'441859752'};
  document.querySelectorAll('a[href]').forEach(a => {
    const original = a.dataset.staticOriginalHref || a.getAttribute('href');
    a.dataset.staticOriginalHref = original;
    const [path,hash] = original.split('#');
    if (hash && sections[hash]) a.setAttribute('href', path+'#'+(mobile.matches ? sections[hash] : hash));
  });
}
adapt();
mobile.addEventListener('change', adapt);
const header = document.querySelector('header.b_block');
if (header) {
  const nav = document.createElement('nav');
  nav.className = 'static-mobile-header';
  nav.setAttribute('aria-label', 'Основная навигация');
  const bar = document.createElement('div');
  bar.className = 'static-mobile-bar';
  const logo = header.querySelector('.component-logo');
  if (logo) {
    const link = document.createElement('a');
    link.href = logo.querySelector('a')?.href || './index.html';
    link.append(logo.querySelector('img').cloneNode(true));
    bar.append(link);
  }
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'static-mobile-toggle';
  toggle.textContent = 'Меню';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'mobile-links');
  const links = document.createElement('div');
  links.id = 'mobile-links';
  links.className = 'static-mobile-links';
  links.hidden = true;
  header.querySelectorAll('.component-menu a[href]').forEach(a => links.append(a.cloneNode(true)));
  const contact = header.querySelector('a[href*="wa.me"]');
  if (contact) { const a = document.createElement('a'); a.href = contact.href; a.textContent = 'Связаться'; links.append(a); }
  function closeMenu() { links.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', () => { links.hidden = !links.hidden; toggle.setAttribute('aria-expanded', String(!links.hidden)); });
  links.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  bar.append(toggle); nav.append(bar, links); document.body.prepend(nav);
}
function openModal(dialog) { if (dialog && !dialog.open) dialog.showModal(); }
document.querySelectorAll('[data-action="modal"]').forEach(anchor => {
  const trigger = anchor.closest('button') || anchor;
  trigger.addEventListener('click', e => { e.preventDefault(); openModal(document.getElementById(anchor.dataset.modalId)); });
});
document.querySelectorAll('button .component-button, button').forEach(button => {
  const anchor = button.querySelector('a[href]');
  if (anchor && button.type !== 'submit') button.addEventListener('click', e => { e.preventDefault(); window.location.assign(anchor.href); });
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-static-close], [data-action="close"]').forEach(close => close.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
});
document.querySelectorAll('[data-action="popup"]').forEach(anchor => {
  const figure = anchor.closest('figure');
  const img = figure?.querySelector('img');
  if (!img) return;
  figure.tabIndex = 0;
  figure.setAttribute('role', 'button');
  figure.setAttribute('aria-label', 'Увеличить изображение');
  const show = () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'static-modal static-lightbox';
    dialog.setAttribute('aria-label', 'Просмотр изображения');
    const close = document.createElement('button'); close.type = 'button'; close.className = 'static-close'; close.textContent = '×'; close.setAttribute('aria-label','Закрыть');
    close.addEventListener('click', () => dialog.close());
    dialog.append(close, img.cloneNode(true)); document.body.append(dialog);
    dialog.addEventListener('close', () => dialog.remove());
    dialog.showModal();
  };
  figure.addEventListener('click', show);
  figure.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
});
document.querySelectorAll('.static-carousel').forEach(carousel => {
  const container = carousel.closest('.flexbe-cards-slider') || carousel.parentElement;
  container.querySelectorAll('.swiper-button-prev, .swiper-button-next').forEach(control => {
    control.classList.remove('swiper-button-disabled'); control.removeAttribute('aria-disabled');
    control.tabIndex = 0; control.setAttribute('role','button');
    const previous = control.classList.contains('swiper-button-prev');
    control.setAttribute('aria-label', previous ? 'Предыдущие карточки' : 'Следующие карточки');
    const scroll = () => carousel.scrollBy({left: (previous ? -1 : 1) * carousel.clientWidth * 0.85, behavior: 'smooth'});
    control.addEventListener('click', scroll);
    control.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scroll(); } });
  });
});
document.querySelectorAll('[data-static-form]').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const text = `Заявка с сайта Remar.pro\n\nИмя: ${fields.get('name') || ''}\nТелефон: ${fields.get('phone') || ''}\nEmail: ${fields.get('email') || ''}\n\nИнтересующая услуга: `;
    const href = `mailto:info@remar.pro?subject=${encodeURIComponent('Заявка с сайта Remar.pro')}&body=${encodeURIComponent(text)}`;
    const status = form.querySelector('.static-form-status');
    status.textContent = 'Письмо подготовлено. Отправьте его в почтовой программе. Если она не открылась, напишите на info@remar.pro.';
    const retry = document.createElement('a'); retry.href = href; retry.textContent = ' Открыть письмо повторно'; status.append(retry);
    window.location.assign(href);
  });
});

// Preserved service descriptions are independent expandable sections.
document.querySelectorAll('.spoiler-list-item').forEach(item => {
  const button = item.querySelector('.spoiler-button-arrow');
  const description = item.querySelector('.spoiler-text-desc');
  if (!button || !description) return;
  button.setAttribute('aria-label','Развернуть или свернуть описание услуги');
  button.setAttribute('aria-expanded', item.dataset.expanded || 'true');
  button.addEventListener('click', () => {
    const expanded = item.dataset.expanded !== 'true';
    item.dataset.expanded = String(expanded);
    button.setAttribute('aria-expanded', String(expanded));
    description.setAttribute('aria-hidden', String(!expanded));
    description.classList.toggle('collapsed--show', expanded);
    description.hidden = !expanded;
  });
});
if (mobile.matches && location.hash === '#608740719') {
  requestAnimationFrame(() => document.getElementById('955316229')?.scrollIntoView());
}
