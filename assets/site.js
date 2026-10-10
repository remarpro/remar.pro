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
  const slider = carousel.closest('.flexbe-cards-slider');
  const root = carousel.closest('.flexbe-cards-root') || carousel.parentElement;
  const controls = [...root.querySelectorAll('.swiper-button-prev, .swiper-button-next')];
  const loop = slider?.dataset.loop === '1';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, interacting = false, timer;
  const behavior = () => reduced.matches ? 'instant' : 'smooth';
  const maximum = () => Math.max(0, carousel.scrollWidth - carousel.clientWidth);
  function updateControls() {
    controls.forEach(control => {
      const previous = control.classList.contains('swiper-button-prev');
      const disabled = maximum() < 2 || (!loop && (previous ? carousel.scrollLeft < 2 : carousel.scrollLeft >= maximum() - 2));
      control.classList.toggle('swiper-button-disabled', disabled);
      control.setAttribute('aria-disabled', String(disabled));
      control.tabIndex = disabled ? -1 : 0;
    });
  }
  function move(direction) {
    const card = carousel.firstElementChild;
    if (!card || maximum() < 2) return;
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(carousel).columnGap || '0');
    let destination = carousel.scrollLeft + direction * step;
    if (loop && direction > 0 && carousel.scrollLeft >= maximum() - 2) destination = 0;
    else if (loop && direction < 0 && carousel.scrollLeft < 2) destination = maximum();
    carousel.scrollTo({left: Math.max(0, Math.min(maximum(), destination)), behavior: behavior()});
  }
  function schedule() {
    clearInterval(timer);
    const seconds = Number(slider?.dataset.autoplay);
    if (seconds > 0 && visible && !interacting && !document.hidden && !reduced.matches) timer = setInterval(() => move(1), seconds * 1000);
  }
  controls.forEach(control => {
    const previous = control.classList.contains('swiper-button-prev');
    control.setAttribute('role', 'button');
    control.setAttribute('aria-label', previous ? 'Предыдущая карточка' : 'Следующая карточка');
    const click = () => { if (control.getAttribute('aria-disabled') !== 'true') { move(previous ? -1 : 1); schedule(); } };
    control.addEventListener('click', click);
    control.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); click(); } });
  });
  carousel.tabIndex = 0;
  carousel.setAttribute('role','region');
  carousel.setAttribute('aria-label', root.closest('section')?.querySelector('h1,h2,h3,.text-style-h2')?.textContent.trim() || 'Карточки');
  carousel.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); move(e.key === 'ArrowLeft' ? -1 : 1); schedule(); } });
  // Touch uses native scrolling; mouse dragging works on images and text too.
  let drag;
  carousel.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('a,button,input')) return;
    drag = {id:e.pointerId,x:e.clientX,left:carousel.scrollLeft,moved:false};
  });
  carousel.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    if (!drag.moved && Math.abs(e.clientX-drag.x) > 6) {
      drag.moved = true; carousel.setPointerCapture(e.pointerId); carousel.classList.add('is-dragging');
      interacting = true; schedule();
    }
    if (drag.moved) { e.preventDefault(); carousel.scrollLeft = drag.left - (e.clientX-drag.x); }
  });
  const endDrag = () => {
    if (!drag) return;
    const moved = drag.moved; drag = null; carousel.classList.remove('is-dragging');
    if (moved) { carousel.dataset.ignoreClick = 'true'; setTimeout(() => delete carousel.dataset.ignoreClick, 0); }
    interacting = false; schedule();
  };
  window.addEventListener('pointerup', endDrag); carousel.addEventListener('pointercancel', endDrag);
  carousel.addEventListener('click', e => { if (carousel.dataset.ignoreClick) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  carousel.addEventListener('dragstart', e => e.preventDefault());
  root.addEventListener('mouseenter', () => { interacting=true; schedule(); });
  root.addEventListener('mouseleave', () => { interacting=false; schedule(); });
  root.addEventListener('focusin', () => { interacting=true; schedule(); });
  root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) { interacting=false; schedule(); } });
  document.addEventListener('visibilitychange', schedule); reduced.addEventListener('change', schedule);
  new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; schedule(); }, {threshold:0.15}).observe(carousel);
  carousel.addEventListener('scroll', updateControls, {passive:true});
  function resize() {
    carousel.style.setProperty('--visible-cards', mobile.matches ? (slider?.dataset.cardsMobile || '1') : (slider?.dataset.cards || '3'));
    updateControls();
  }
  new ResizeObserver(resize).observe(carousel); mobile.addEventListener('change', resize); resize();
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

// Service headings and arrow buttons share an accessible disclosure toggle.
document.querySelectorAll('.spoiler-list-item').forEach(item => {
  const button = item.querySelector('.spoiler-button-arrow');
  const heading = item.querySelector('.spoiler-text-title');
  const description = item.querySelector('.spoiler-text-desc');
  if (!button || !description) return;
  const title = heading?.querySelector('h4')?.textContent.trim() || 'Описание услуги';
  button.setAttribute('aria-label', title);
  function setExpanded(expanded) {
    item.dataset.expanded = String(expanded);
    button.setAttribute('aria-expanded', String(expanded));
    description.setAttribute('aria-hidden', String(!expanded));
    description.hidden = !expanded;
  }
  setExpanded(item.dataset.expanded === 'true');
  button.addEventListener('click', () => setExpanded(description.hidden));
  heading?.addEventListener('click', e => { if (!e.target.closest('button,a')) setExpanded(description.hidden); });
});
if (mobile.matches && location.hash === '#608740719') {
  requestAnimationFrame(() => document.getElementById('955316229')?.scrollIntoView());
}
