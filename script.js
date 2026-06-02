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


// ── Sticky Scroll — seção de Aparelhos ──
const aparelhoSteps  = document.querySelectorAll('.aparelho-step');
const stickyImg      = document.getElementById('sticky-img');

if (aparelhoSteps.length && stickyImg) {
  const changeImage = (newSrc) => {
    if (!newSrc || stickyImg.src.endsWith(newSrc.replace(/^.*\//, ''))) return;
    stickyImg.style.opacity = '0';
    stickyImg.style.transform = 'scale(0.97)';
    setTimeout(() => {
      stickyImg.src = newSrc;
      stickyImg.style.opacity = '1';
      stickyImg.style.transform = 'scale(1)';
    }, 220);
  };

  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Desativa todos
        aparelhoSteps.forEach(s => s.classList.remove('active'));
        // Ativa o atual
        entry.target.classList.add('active');
        // Troca imagem
        const newImg = entry.target.dataset.img;
        if (newImg) changeImage(newImg);
      }
    });
  }, {
    rootMargin: '-35% 0px -35% 0px',
    threshold: 0
  });

  aparelhoSteps.forEach(step => stepObserver.observe(step));
}


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
