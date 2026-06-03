/* ════════════════════════════════════════
   dB Aparelhos Auditivos — script.js
   Sticky scroll · Animações · Rastreamento
   ════════════════════════════════════════ */

'use strict';

// ── Ano no footer ──────────────────────
document.getElementById('ano').textContent = new Date().getFullYear();


// ── Header scroll shadow ───────────────
const header = document.getElementById('site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();


// ── Menu mobile ───────────────────────
const menuBtn  = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

menuBtn?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuBtn.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  mobileNav.setAttribute('aria-hidden', String(!open));
});

// Fechar ao clicar em link interno
mobileNav?.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuBtn?.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  });
});


// ── Smooth scroll âncoras ─────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY
                - parseInt(getComputedStyle(document.documentElement)
                    .getPropertyValue('--header-h') || '68');
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  });
});


// ── FAQ acordeão ──────────────────────
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';

    // Fecha todos
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      const ans = document.getElementById(b.getAttribute('aria-controls'));
      ans?.setAttribute('hidden', '');
    });

    // Abre o clicado
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      const ans = document.getElementById(btn.getAttribute('aria-controls'));
      ans?.removeAttribute('hidden');
    }
  });
});


// ── Animações de entrada (IntersectionObserver) ──
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      animObserver.unobserve(entry.target); // animar só uma vez
    }
  });
}, {
  rootMargin: '0px 0px -60px 0px',
  threshold: 0.08
});

document.querySelectorAll('[data-animate]').forEach(el => {
  animObserver.observe(el);
});


// ── Sticky Scroll — seção de Aparelhos + sticky manual desktop ──
// Esta versão não depende mais do CSS position: sticky, porque o sticky nativo
// pode falhar quando algum ancestral recebe overflow/transform. No desktop,
// ela controla o estado: normal -> fixed -> absolute final.
const aparelhoSteps = Array.from(document.querySelectorAll('.aparelho-step'));
const stickyImg = document.getElementById('sticky-img');
const desktopQuery = window.matchMedia('(min-width: 901px)');

function normalizeSrc(src) {
  return (src || '').split('/').pop();
}

function updateAparelhoImage() {
  if (!aparelhoSteps.length || !stickyImg) return;

  let bestStep = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  const referenceLine = window.innerHeight * 0.52;

  aparelhoSteps.forEach((step) => {
    const rect = step.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const stepMiddle = rect.top + rect.height / 2;
    const distance = Math.abs(stepMiddle - referenceLine);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestStep = step;
    }
  });

  if (!bestStep) {
    bestStep = aparelhoSteps.find((step) => step.getBoundingClientRect().bottom > 0) || aparelhoSteps[aparelhoSteps.length - 1];
  }

  aparelhoSteps.forEach((item) => item.classList.toggle('active', item === bestStep));

  const newImg = bestStep?.getAttribute('data-img');
  const currentImg = stickyImg.getAttribute('src') || '';

  if (desktopQuery.matches && newImg && normalizeSrc(currentImg) !== normalizeSrc(newImg)) {
    stickyImg.style.opacity = '0';
    stickyImg.style.transform = 'translateY(8px) scale(.98)';

    window.setTimeout(() => {
      stickyImg.setAttribute('src', newImg);
      stickyImg.style.opacity = '1';
      stickyImg.style.transform = 'translateY(0) scale(1)';
    }, 150);
  }
}

function setupManualSticky() {
  // Slot da imagem da seção Aparelhos: já existe no HTML.
  const productWrap = document.querySelector('.sticky-product-wrap');
  const productSlot = document.querySelector('.sticky-col-image');
  const productBoundary = document.querySelector('.section-aparelhos .sticky-layout');

  const items = [
    {
      el: productWrap,
      slot: productSlot,
      boundary: productBoundary,
      top: () => getHeaderHeight() + 32
    }
  ].filter(item => item.el && item.slot && item.boundary);

  function getHeaderHeight() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '68';
    return parseInt(raw, 10) || 68;
  }

  function resetItem(item) {
    item.el.classList.remove('manual-sticky-fixed', 'manual-sticky-ended');
    item.el.classList.add('manual-sticky-normal');
    item.el.style.position = '';
    item.el.style.top = '';
    item.el.style.left = '';
    item.el.style.width = '';
    item.el.style.zIndex = '';
    item.slot.style.minHeight = '';
    item.slot.style.position = '';
  }

  function applyItem(item) {
    if (!desktopQuery.matches) {
      resetItem(item);
      return;
    }

    item.el.classList.remove('manual-sticky-normal');

    item.slot.style.position = 'relative';
    item.slot.style.minHeight = `${item.el.offsetHeight}px`;

    const top = item.top();
    const slotRect = item.slot.getBoundingClientRect();
    const boundaryRect = item.boundary.getBoundingClientRect();
    const elHeight = item.el.offsetHeight;
    const slotWidth = item.slot.getBoundingClientRect().width;

    const shouldStart = boundaryRect.top <= top;
    const shouldEnd = boundaryRect.bottom <= top + elHeight;

    if (!shouldStart) {
      item.el.classList.remove('manual-sticky-fixed', 'manual-sticky-ended');
      item.el.classList.add('manual-sticky-normal');
      item.el.style.position = '';
      item.el.style.top = '';
      item.el.style.left = '';
      item.el.style.width = '';
      item.el.style.zIndex = '';
      return;
    }

    if (shouldEnd) {
      const endTop = Math.max(0, boundaryRect.bottom - slotRect.top - elHeight);
      item.el.classList.remove('manual-sticky-fixed', 'manual-sticky-normal');
      item.el.classList.add('manual-sticky-ended');
      item.el.style.position = 'absolute';
      item.el.style.top = `${endTop}px`;
      item.el.style.left = '0px';
      item.el.style.width = `${slotWidth}px`;
      item.el.style.zIndex = '5';
      return;
    }

    item.el.classList.remove('manual-sticky-ended', 'manual-sticky-normal');
    item.el.classList.add('manual-sticky-fixed');
    item.el.style.position = 'fixed';
    item.el.style.top = `${top}px`;
    item.el.style.left = `${slotRect.left}px`;
    item.el.style.width = `${slotWidth}px`;
    item.el.style.zIndex = '5';
  }

  let ticking = false;
  function update() {
    ticking = false;
    updateAparelhoImage();
    items.forEach(applyItem);
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  desktopQuery.addEventListener?.('change', requestUpdate);
  window.addEventListener('load', requestUpdate);

  requestUpdate();
}

setupManualSticky();


// ── Rastreamento WhatsApp (GA4 / GTM) ─
document.querySelectorAll('.js-whatsapp-cta').forEach(el => {
  el.addEventListener('click', () => {
    const loc = el.dataset.ctaLocation || 'unknown';

    // dataLayer para GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'whatsapp_click',
      cta_location: loc,
      page_path: window.location.pathname
    });

    // gtag direto (caso não use GTM)
    if (typeof gtag === 'function') {
      gtag('event', 'whatsapp_click', {
        event_category: 'lead',
        event_label: loc,
        value: 1
      });
    }
  });
});


// ── Acordeão horizontal — seção de dor ───
(function () {
  const accordion = document.getElementById('dor-accordion');
  if (!accordion) return;

  const items    = Array.from(accordion.querySelectorAll('.dor-ac-item'));
  const ctaItem  = accordion.querySelector('.dor-ac-cta');
  const isMobile = () => window.innerWidth < 640;

  function setActive(target) {
    if (isMobile()) return; // no mobile não usa hover
    items.forEach(item => item.classList.remove('is-open'));
    if (target) target.classList.add('is-open');
  }

  // Hover nos cards brancos
  items.forEach(item => {
    if (item.classList.contains('dor-ac-cta')) return;
    item.addEventListener('mouseenter', () => setActive(item));
  });

  // Hover no card CTA
  ctaItem?.addEventListener('mouseenter', () => setActive(ctaItem));

  // Ao sair do acordeão inteiro → CTA volta a abrir
  accordion.addEventListener('mouseleave', () => setActive(ctaItem));
})();

// ── Hover sutil na imagem do hero ─────
const heroImg = document.querySelector('.hero-product-img');
if (heroImg) {
  const heroVisual = heroImg.closest('.hero-visual');
  heroVisual?.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;
    heroImg.style.transform = `translateY(-6px) rotateX(${cy * -4}deg) rotateY(${cx * 6}deg)`;
  });
  heroVisual?.addEventListener('mouseleave', () => {
    heroImg.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
  });
}
