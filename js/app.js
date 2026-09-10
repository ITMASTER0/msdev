(() => {
  // ── LOADER ──
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.style.display = 'none';
    }, 2500);
  });

  // ── CUSTOM CURSOR ──
  const outer = document.getElementById('cursorOuter');
  const inner = document.getElementById('cursorInner');
  const glow = document.getElementById('cursorGlow');
  const canvas = document.getElementById('cursorCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let mx = 0, my = 0, ox = 0, oy = 0, gx = 0, gy = 0;

  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
  }

  const particles = [];
  class Particle {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4;
      this.life = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.size = Math.random() * 3 + 1;
      this.color = ['#6366f1','#ec4899','#06b6d4','#10b981','#f59e0b'][Math.floor(Math.random()*5)];
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.life -= this.decay;
      this.vx *= 0.98; this.vy *= 0.98;
    }
    draw(ctx) {
      if (this.life <= 0) return;
      ctx.globalAlpha = this.life;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  let frameCount = 0;
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (outer) { outer.style.left = mx + 'px'; outer.style.top = my + 'px'; }
    if (ctx) {
      frameCount++;
      if (frameCount % 2 === 0) particles.push(new Particle(mx, my));
    }
  });

  function animateCursor() {
    ox += (mx - ox) * 0.12;
    oy += (my - oy) * 0.12;
    gx += (mx - gx) * 0.06;
    gy += (my - gy) * 0.06;
    if (inner) { inner.style.left = mx + 'px'; inner.style.top = my + 'px'; }
    if (outer) { outer.style.left = ox + 'px'; outer.style.top = oy + 'px'; }
    if (glow) { glow.style.left = gx + 'px'; glow.style.top = gy + 'px'; }

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].life <= 0) particles.splice(i, 1);
      }
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Cursor states
  function addHover(cls) { document.body.classList.add(cls); }
  function removeHover(cls) { document.body.classList.remove(cls); }

  document.querySelectorAll('a, button, .nav-link, .btn, .nav-cta').forEach(el => {
    el.addEventListener('mouseenter', () => addHover('cursor-hover'));
    el.addEventListener('mouseleave', () => removeHover('cursor-hover'));
  });
  document.querySelectorAll('.pcard, .scard, .ccard').forEach(el => {
    el.addEventListener('mouseenter', () => addHover('cursor-card'));
    el.addEventListener('mouseleave', () => removeHover('cursor-card'));
  });

  // ── CUSTOM RIGHT-CLICK MENU ──
  const rcMenu = document.getElementById('rcMenu');
  let rcVisible = false;

  function showRC(e) {
    e.preventDefault();
    if (!rcMenu) return;
    const menuW = 260, menuH = 340;
    let x = e.clientX, y = e.clientY;
    if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 10;
    if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 10;
    rcMenu.style.left = x + 'px';
    rcMenu.style.top = y + 'px';
    rcMenu.classList.add('active');
    rcVisible = true;
  }

  function hideRC() {
    if (rcMenu && rcVisible) { rcMenu.classList.remove('active'); rcVisible = false; }
  }

  document.addEventListener('contextmenu', showRC);
  document.addEventListener('click', (e) => { if (rcVisible && !rcMenu.contains(e.target)) hideRC(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideRC(); });

  rcMenu && rcMenu.querySelectorAll('.rc-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const href = item.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          hideRC();
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      } else if (href) {
        hideRC();
        if (item.target === '_blank') window.open(href, '_blank');
        else window.location.href = href;
      } else {
        hideRC();
      }
    });
  });

  const rcTop = document.getElementById('rcTop');
  if (rcTop) rcTop.addEventListener('click', (e) => {
    e.preventDefault();
    hideRC();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── 3D CARD TILT (POWERED UP) ──
  document.querySelectorAll('.pcard, .scard, .ccard').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const pctX = (x - cx) / cx;
      const pctY = (y - cy) / cy;
      const rX = pctY * -18;
      const rY = pctX * 18;
      const tX = pctX * 10;
      const tY = pctY * 10;
      const s = 1.04 + Math.abs(pctX * pctY) * 0.02;
      card.style.transform = `perspective(600px) rotateX(${rX}deg) rotateY(${rY}deg) translate3d(${tX}px, ${tY}px, 30px) scale3d(${s},${s},1)`;
      // Dynamic shine based on mouse position
      const shine = card.querySelector('.pcard-shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.08) 0%, transparent 50%)`;
      }
      // Dynamic shadow offset
      const shadowX = -pctX * 25;
      const shadowY = -pctY * 25;
      card.style.boxShadow = `${shadowX}px ${shadowY}px 60px rgba(0,0,0,0.4), ${shadowX*0.3}px ${shadowY*0.3}px 20px rgba(99,102,241,0.06), 0 0 0 1px var(--border-hover)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.transition = 'transform 0.7s cubic-bezier(0.22,1,0.36,1), box-shadow 0.7s';
      const shine = card.querySelector('.pcard-shine');
      if (shine) shine.style.background = '';
      setTimeout(() => { card.style.transition = 'transform 0.05s, box-shadow 0.05s'; }, 700);
    });
    card.addEventListener('mouseenter', () => { card.style.transition = 'transform 0.05s, box-shadow 0.05s'; });
  });



  // ── NAVBAR ──
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navLinkEls = document.querySelectorAll('.nav-link');

  hamburger && hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks && navLinks.classList.toggle('open');
  });
  navLinkEls.forEach(link => {
    link.addEventListener('click', () => {
      hamburger && hamburger.classList.remove('open');
      navLinks && navLinks.classList.remove('open');
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

  window.addEventListener('scroll', () => {
    navbar && navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ── TYPING EFFECT ──
  const typed = document.getElementById('typed');
  const words = ['clean code.', 'scalable apps.', 'great UX.', 'the future.'];
  let wIdx = 0, cIdx = 0, deleting = false;
  function type() {
    if (!typed) return;
    const word = words[wIdx];
    if (deleting) { cIdx--; typed.textContent = word.substring(0, cIdx); }
    else { cIdx++; typed.textContent = word.substring(0, cIdx); }
    let delay = deleting ? 35 : 70;
    if (!deleting && cIdx === word.length) { delay = 2000; deleting = true; }
    else if (deleting && cIdx === 0) { deleting = false; wIdx = (wIdx + 1) % words.length; delay = 300; }
    setTimeout(type, delay);
  }
  type();

  // ── STAT COUNTERS ──
  const statNums = document.querySelectorAll('.stat-number');
  let countersStarted = false;
  function animateCounters() {
    statNums.forEach(el => {
      const target = +el.dataset.target;
      const dur = 2000; const start = performance.now();
      function update(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(update);
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
      card.style.setProperty('--pct', fill.dataset.pct);
      card.classList.add('animated');
    });
  }

  // ── SCROLL REVEAL ──
  const revealEls = document.querySelectorAll('.pcard, .scard, .titem, .stats-row, .hero-content, .ccard, .section-header');
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 6) * 0.08 + 's';
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        if (e.target.classList.contains('stats-row') && !countersStarted) { countersStarted = true; animateCounters(); }
        if (e.target.classList.contains('scard') && !skillsStarted) { skillsStarted = true; setTimeout(animateRings, 200); }
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => revealObserver.observe(el));
  scards.forEach(el => revealObserver.observe(el));

  // ── TIMELINE LINE ──
  const tlLine = document.querySelector('.timeline-line');
  if (tlLine) {
    const lo = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animated'); });
    }, { threshold: 0.1 });
    lo.observe(tlLine);
  }

  // ── MAGNETIC BUTTONS ──
  document.querySelectorAll('.btn, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      btn.style.transform = `translate(${x*0.25}px, ${y*0.25}px) scale(1.05)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  // ── PARALLAX GLOWS ──
  const glows = document.querySelectorAll('.glow');
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    glows.forEach((g, i) => { g.style.transform = `translateY(${sy * (i+1) * 0.04}px)`; });
  });

  // ── EASTER EGG: KONAMI ──
  let konami = [];
  const code = [38,38,40,40,37,39,37,39,66,65];
  document.addEventListener('keydown', (e) => {
    konami.push(e.keyCode);
    if (konami.length > 10) konami.shift();
    if (JSON.stringify(konami) === JSON.stringify(code)) {
      document.body.style.animation = 'none';
      document.body.offsetHeight;
      document.body.style.animation = 'konamiSpin 1s ease-in-out';
      konami = [];
    }
  });
  const style = document.createElement('style');
  style.textContent = '@keyframes konamiSpin { 0%{transform:rotate(0) scale(1)} 50%{transform:rotate(180deg) scale(1.1)} 100%{transform:rotate(360deg) scale(1)} }';
  document.head.appendChild(style);
})();
