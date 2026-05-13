/**
 * portfolio · script.js
 * Subtle, elegant interactions — no libraries
 * ─────────────────────────────────────────────
 * 1. Custom cursor
 * 2. Nav — transparent → frosted on scroll (fade)
 * 3. Mobile nav toggle
 * 4. Scroll-reveal for sections & cards
 * 5. Animated stat counters
 * 6. Active nav link highlight
 * 7. Smooth anchor clicks with offset
 * 8. Marquee pause on hover
 * 9. Skill card staggered entrance
 * 10. Contact form submit feedback
 */

/* ─────────────────────────────────────────────
   1. CUSTOM CURSOR
───────────────────────────────────────────── */
(function initCursor() {
  const dot = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!dot || !follower) return;

  let mx = 0, my = 0;   // mouse position
  let fx = 0, fy = 0;   // follower position (lerped)
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateFollower() {
    fx = lerp(fx, mx, 0.13);
    fy = lerp(fy, my, 0.13);
    follower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;
    raf = requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Scale on interactive elements
  const interactives = 'a, button, .tag, .skill-card, .project-card, .social-link, input, textarea';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('active');
      follower.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('active');
      follower.classList.remove('active');
    });
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    follower.style.opacity = '1';
  });
})();


/* ─────────────────────────────────────────────
   2. NAV — transparent → frosted glass on scroll
───────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const THRESHOLD = 60; // px before nav gets background

  function updateNav() {
    if (window.scrollY > THRESHOLD) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // Throttle scroll handler for performance
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNav();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateNav(); // run once on load
})();


/* ─────────────────────────────────────────────
   3. MOBILE NAV TOGGLE
───────────────────────────────────────────── */
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  let open = false;

  toggle.addEventListener('click', () => {
    open = !open;
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';

    // Animate hamburger → X
    const spans = toggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      open = false;
      links.classList.remove('open');
      document.body.style.overflow = '';
      const spans = toggle.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
})();


/* ─────────────────────────────────────────────
   4. SCROLL-REVEAL  (IntersectionObserver)
───────────────────────────────────────────── */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal, .skill-card, .edu-card, .project-card, .timeline-item, .ha-bio, .ha-stats');

  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Respect any data-delay attribute for staggering
        const delay = entry.target.dataset.delay
          ? parseInt(entry.target.dataset.delay, 10)
          : 0;

        setTimeout(() => {
          entry.target.classList.add('visible');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach((el, i) => {
    // Initial hidden state
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.65s ease ${el.dataset.delay ? el.dataset.delay + 'ms' : '0ms'},
                            transform 0.65s ease ${el.dataset.delay ? el.dataset.delay + 'ms' : '0ms'}`;
    observer.observe(el);
  });
})();


/* ─────────────────────────────────────────────
   5. ANIMATED STAT COUNTERS
───────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400; // ms
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


/* ─────────────────────────────────────────────
   6. ACTIVE NAV LINK HIGHLIGHT
───────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!navLinks.length) return;

  function setActive() {
    let current = '';
    const offset = 120;

    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - offset) {
        current = sec.id;
      }
    });

    navLinks.forEach(a => {
      a.classList.remove('nav-active');
      if (a.getAttribute('href') === `#${current}`) {
        a.classList.add('nav-active');
      }
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();

/* Add nav-active style via JS to avoid FOUC */
(function injectActiveStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .nav-links a.nav-active {
      color: var(--pink-500) !important;
    }
    .nav-links a.nav-active::after {
      width: 100% !important;
    }
  `;
  document.head.appendChild(style);
})();


/* ─────────────────────────────────────────────
   7. SMOOTH ANCHOR SCROLLING WITH NAV OFFSET
───────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight ?? 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─────────────────────────────────────────────
   8. MARQUEE PAUSE ON HOVER
───────────────────────────────────────────── */
(function initMarquee() {
  const marquee = document.querySelector('.tech-marquee');
  if (!marquee) return;

  marquee.addEventListener('mouseenter', () => {
    marquee.style.animationPlayState = 'paused';
  });
  marquee.addEventListener('mouseleave', () => {
    marquee.style.animationPlayState = 'running';
  });
})();


/* ─────────────────────────────────────────────
   9. SUBTLE PARALLAX ON BLOBS (mouse tilt)
───────────────────────────────────────────── */
(function initBlobParallax() {
  const blobs = document.querySelectorAll('.blob');
  if (!blobs.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;  // -1 to 1
    const dy = (e.clientY - cy) / cy;

    blobs.forEach((blob, i) => {
      const depth = (i + 1) * 6; // different layers
      blob.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
    });
  });
})();


/* ─────────────────────────────────────────────
   10. CONTACT FORM SUBMIT
───────────────────────────────────────────── */
(function initForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const origText = btn.innerHTML;

    // Loading state
    btn.innerHTML = '<span>Sending…</span>';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Simulate async send (replace with real fetch/API call)
    setTimeout(() => {
      btn.innerHTML = origText;
      btn.disabled = false;
      btn.style.opacity = '1';
      form.reset();

      if (success) {
        success.style.display = 'block';
        success.style.animation = 'fadeUp 0.4s ease both';
        setTimeout(() => { success.style.display = 'none'; }, 5000);
      }
    }, 1200);
  });

  // Floating label feel — add filled class
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.toggle('filled', field.value.length > 0);
    });
  });
})();


/* ─────────────────────────────────────────────
   UTILITY: prefers-reduced-motion guard
   Disable heavy animations for accessibility
───────────────────────────────────────────── */
(function reducedMotionGuard() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }
})();


/* ─────────────────────────────────────────────
   11. TYPEWRITER CYCLING ROLE TEXT
   Cycles: Backend Developer → API Architect →
           AI Builder → Systems Engineer
───────────────────────────────────────────── */
(function initTypewriter() {
  const el = document.getElementById('typewriterLine');
  if (!el) return;

  const roles = [
    'Backend Developer',
    'API Architect',
    'AI Builder',
    'Systems Engineer',
    'NestJS Specialist',
  ];

  // Insert blinking cursor span
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  cursor.setAttribute('aria-hidden', 'true');

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let paused = false;

  function tick() {
    const current = roles[roleIndex];

    if (!deleting) {
      // Typing forward
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      el.appendChild(cursor);

      if (charIndex === current.length) {
        // Pause at full word
        paused = true;
        setTimeout(() => { paused = false; deleting = true; schedule(); }, 2200);
        return;
      }
    } else {
      // Deleting
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      el.appendChild(cursor);

      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(schedule, 400); // pause before next word
        return;
      }
    }

    schedule();
  }

  function schedule() {
    if (paused) return;
    const speed = deleting
      ? 38 + Math.random() * 20   // faster delete
      : 70 + Math.random() * 40;  // natural typing
    setTimeout(tick, speed);
  }

  // Start with a small initial delay
  el.textContent = '';
  el.appendChild(cursor);
  setTimeout(schedule, 900);
})();