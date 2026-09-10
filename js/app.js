(() => {
  // ── NAVBAR ──
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navLinkEls = document.querySelectorAll('.nav-link');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinkEls.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('.section');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkEls.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => sectionObserver.observe(s));

  // Navbar scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ── TYPING EFFECT ──
  const typed = document.getElementById('typed');
  const words = ['clean code.', 'scalable apps.', 'great UX.', 'the future.'];
  let wordIdx = 0, charIdx = 0, isDeleting = false;

  function type() {
    const word = words[wordIdx];
    if (isDeleting) {
      charIdx--;
      typed.textContent = word.substring(0, charIdx);
    } else {
      charIdx++;
      typed.textContent = word.substring(0, charIdx);
    }
    let delay = isDeleting ? 40 : 80;
    if (!isDeleting && charIdx === word.length) { delay = 2000; isDeleting = true; }
    else if (isDeleting && charIdx === 0) { isDeleting = false; wordIdx = (wordIdx + 1) % words.length; delay = 400; }
    setTimeout(type, delay);
  }
  type();

  // ── STAT COUNTERS ──
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersStarted = false;

  function animateCounters() {
    statNumbers.forEach(el => {
      const target = +el.dataset.target;
      const duration = 2000;
      const start = performance.now();
      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  // ── SKILL RINGS ──
  const scards = document.querySelectorAll('.scard');
  let skillsStarted = false;

  function animateRings() {
    scards.forEach(card => {
      const fill = card.querySelector('.ring-fill');
      if (!fill) return;
      const pct = fill.dataset.pct;
      card.style.setProperty('--pct', pct);
      card.classList.add('animated');
    });
  }

  // ── SCROLL REVEALS ──
  const revealEls = document.querySelectorAll(
    '.pcard, .scard, .titem, .stats-row, .cta-card, .hero-content'
  );
  revealEls.forEach(el => el.classList.add('fade-up'));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        if (e.target.classList.contains('stats-row') && !countersStarted) {
          countersStarted = true;
          animateCounters();
        }
        if (e.target.classList.contains('scard') && !skillsStarted) {
          skillsStarted = true;
          setTimeout(animateRings, 300);
        }
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));
  scards.forEach(el => revealObserver.observe(el));
})();
