/**
 * portfolio · script.js
 * ─────────────────────────────────────────────
 * 1.  Custom cursor (dot + lerp-follower, grows on interactives)
 * 2.  Nav scroll-fade (transparent → frosted glass)
 * 3.  Mobile nav toggle (hamburger ↔ ✕)
 * 4.  Hero word-split entrance (wraps each word, staggers up)
 * 5.  Hero morph sentence (cross-fades between short statements)
 * 6.  Scroll-reveal (IntersectionObserver, clean fade+rise)
 * 7.  Skill-cloud stagger (tags pop in with delay)
 * 8.  Animated stat counters
 * 9.  Active nav link highlight
 * 10. Smooth anchor scroll with nav-height offset
 * 11. Project card subtle tilt on mousemove
 * 12. Magnetic button pull toward cursor
 * 13. Contact form submit feedback
 * 14. Reduced-motion guard
 */

'use strict';

/* ─────────────────────────────────────────────
   1. CUSTOM CURSOR
───────────────────────────────────────────── */
(function initCursor() {
  const dot = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!dot || !follower) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });

  (function animFollower() {
    fx += (mx - fx) * 0.13;
    fy += (my - fy) * 0.13;
    follower.style.transform = `translate(${fx}px,${fy}px) translate(-50%,-50%)`;
    requestAnimationFrame(animFollower);
  })();

  // Grow cursor on any interactive element
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button,.sc-tag,.project-card,input,textarea,.social-link')) {
      dot.classList.add('active');
      follower.classList.add('active');
    } else {
      dot.classList.remove('active');
      follower.classList.remove('active');
    }
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; follower.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; follower.style.opacity = '1'; });
})();


/* ─────────────────────────────────────────────
   2. NAV SCROLL-FADE
───────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let ticking = false;
  const check = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => { check(); ticking = false; }); ticking = true; }
  }, { passive: true });
  check();
})();


/* ─────────────────────────────────────────────
   3. MOBILE NAV TOGGLE
───────────────────────────────────────────── */
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  let open = false;

  const setOpen = val => {
    open = val;
    links.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    const [s0, , s2] = toggle.querySelectorAll('span');
    const mid = toggle.querySelectorAll('span')[1];
    if (open) {
      s0.style.transform = 'translateY(6.5px) rotate(45deg)';
      mid.style.opacity = '0';
      s2.style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      [s0, mid, s2].forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  };

  toggle.addEventListener('click', () => setOpen(!open));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
})();


/* ─────────────────────────────────────────────
   4. HERO WORD-SPLIT ENTRANCE
   Wraps every word in .split-line elements into
   a <span class="word"> and staggers them up.
───────────────────────────────────────────── */
(function initWordSplit() {
  const lines = document.querySelectorAll('.split-line');
  let globalIndex = 0;

  lines.forEach(line => {
    const text = line.textContent.trim();
    const words = text.split(/\s+/);
    line.innerHTML = '';

    words.forEach((word, wi) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      // stagger: each word 80ms after previous
      span.style.animationDelay = `${0.15 + globalIndex * 0.08}s`;
      line.appendChild(span);
      // space between words
      if (wi < words.length - 1) line.appendChild(document.createTextNode(' '));
      globalIndex++;
    });
  });
})();


/* ─────────────────────────────────────────────
   5. HERO MORPH SENTENCE
   Cross-fades between short, personal statements.
   No typing, no deleting — just a quiet dissolve.
───────────────────────────────────────────── */
(function initMorph() {
  const el = document.getElementById('heroMorph');
  if (!el) return;

  const sentences = [
    'I write code that scales.',
    'I make APIs feel like poetry.',
    'Systems that breathe are my craft.',
    'Clean logic. Thoughtful design.',
    'Built in Kathmandu. Built for the world.',
  ];

  let index = 0;

  function showSentence(text) {
    // Fade out
    el.style.opacity = '0';
    el.style.transform = 'translateY(-5px)';

    setTimeout(() => {
      el.querySelector('.morph-text').textContent = text;
      // Fade in
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 420);
  }

  // Transition styles — JS owns them to avoid conflict with CSS fadeIn
  el.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)';

  // Start cycling after initial appearance
  setTimeout(() => {
    setInterval(() => {
      index = (index + 1) % sentences.length;
      showSentence(sentences[index]);
    }, 3800);
  }, 3000);
})();


/* ─────────────────────────────────────────────
   6. SCROLL-REVEAL
───────────────────────────────────────────── */
(function initReveal() {
  const targets = document.querySelectorAll(
    '.reveal, .edu-card, .project-card, .timeline-item, .testimonial-card, .ha-bio, .ha-stats'
  );
  if (!targets.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay || '0', 10);
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, delay);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  targets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(26px)';
    el.style.transition = `opacity 0.65s ease ${el.dataset.delay || '0'}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${el.dataset.delay || '0'}ms`;
    io.observe(el);
  });
})();


/* ─────────────────────────────────────────────
   7. SKILL CLOUD STAGGER
───────────────────────────────────────────── */
(function initSkillCloud() {
  const tags = document.querySelectorAll('.sc-tag');
  if (!tags.length) return;

  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    tags.forEach((tag, i) => {
      setTimeout(() => tag.classList.add('visible'), i * 45);
    });
    io.disconnect();
  }, { threshold: 0.1 });

  // Observe the parent cloud container
  const cloud = document.getElementById('skillCloud');
  if (cloud) io.observe(cloud);
})();


/* ─────────────────────────────────────────────
   8. ANIMATED STAT COUNTERS
───────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const ease = t => 1 - Math.pow(1 - t, 4);

  function run(el) {
    const target = parseInt(el.dataset.target, 10);
    const t0 = performance.now();
    const dur = 1400;
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(ease(p) * target);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();


/* ─────────────────────────────────────────────
   9. ACTIVE NAV LINK
───────────────────────────────────────────── */
(function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!navLinks.length) return;

  // Inject active style once
  const style = document.createElement('style');
  style.textContent = `.nav-links a.nav-active{color:var(--pink-500)!important}.nav-links a.nav-active::after{width:100%!important}`;
  document.head.appendChild(style);

  const sections = [...document.querySelectorAll('section[id]')];

  function update() {
    let current = sections[0]?.id || '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
    navLinks.forEach(a => a.classList.toggle('nav-active', a.getAttribute('href') === `#${current}`));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ─────────────────────────────────────────────
   10. SMOOTH ANCHOR SCROLL
───────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight ?? 80;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    });
  });
})();


/* ─────────────────────────────────────────────
   11. PROJECT CARD TILT
   Subtle 3D tilt on mousemove, resets on leave.
───────────────────────────────────────────── */
(function initTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;  // -0.5 to 0.5
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg) translateY(-6px)`;
      card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    });
  });
})();


/* ─────────────────────────────────────────────
   12. MAGNETIC BUTTONS
   Buttons gently pull toward the cursor.
───────────────────────────────────────────── */
(function initMagnetic() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
      btn.style.transition = 'transform 0.15s ease';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    });
  });
})();


/* ─────────────────────────────────────────────
   13. CONTACT FORM
───────────────────────────────────────────── */
(function initForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span>Sending…</span>';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled = false;
      btn.style.opacity = '1';
      form.reset();
      if (success) { success.style.display = 'block'; setTimeout(() => { success.style.display = 'none'; }, 5000); }
    }, 1200);
  });
})();


/* ─────────────────────────────────────────────
   14. REDUCED-MOTION GUARD
───────────────────────────────────────────── */
(function reducedMotionGuard() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const s = document.createElement('style');
  s.textContent = `*,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important}`;
  document.head.appendChild(s);
})();