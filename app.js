/* ═══════════════════════════════════════════════
   NanoCem UT-9 — Application Logic & Charts
   ═══════════════════════════════════════════════ */

'use strict';

/* ─── Global Chart defaults ─── */
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#6B6B6B';

/* ═══ 1. NAVIGATION ═══ */
(function initNav() {
  const nav = document.getElementById('navbar');
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  /* Active link highlight */
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
})();

/* ═══ 2. HERO PARTICLES CANVAS ═══ */
(function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 14000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(13,13,13,${p.opacity})`;
      ctx.fill();
    });

    /* Draw connection lines */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(13,13,13,${0.05 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    createParticles();
    draw();
  });
})();

/* ═══ 3. SCROLL ANIMATIONS ═══ */
(function initScrollAnimations() {
  /* App cards staggered reveal */
  const appCards = document.querySelectorAll('.app-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  appCards.forEach(c => cardObserver.observe(c));

  /* KPI counter animation — low threshold so it fires when card enters viewport */
  const kpiNumbers = document.querySelectorAll('.kpi-number, .kpi2-num');
  const kpiObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        kpiObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  kpiNumbers.forEach(n => kpiObserver.observe(n));
  /* Fallback: if already in viewport on load */
  setTimeout(() => {
    kpiNumbers.forEach(n => {
      const rect = n.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        animateCounter(n);
        kpiObserver.unobserve(n);
      }
    });
  }, 600);
})();

function animateCounter(el) {
  /* Text-only values (e.g. 14,5х or 12–15) */
  if (el.dataset.targetText) {
    let dots = 0;
    const frames = ['...', '..', '.'];
    const ticker = setInterval(() => {
      el.textContent = frames[dots++ % frames.length];
    }, 200);
    setTimeout(() => {
      clearInterval(ticker);
      el.textContent = el.dataset.targetText;
    }, 900);
    return;
  }
  /* Numeric counter */
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ═══ 3b. CRACK PARTICLE ANIMATION ═══ */
(function initCrackAnimation() {
  const canvas = document.getElementById('crackCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, animId;
  let particles = [];

  /* Crack path — a jagged channel through rock */
  function getCrackPath(w, h) {
    /* returns array of {x,y} points forming a winding crack */
    const pts = [];
    const steps = 24;
    const cx = w * 0.5;
    let y = 0;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const jitter = (i === 0 || i === steps) ? 0 : (Math.random() - 0.5) * w * 0.18;
      pts.push({ x: cx + jitter, y: t * h });
    }
    return pts;
  }

  let crackPts = [];
  const CRACK_W = 18; /* visual crack width px */

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    crackPts = getCrackPath(W, H);
    initParticlePool();
  }

  /* Spawn a particle at the top of crack */
  function spawnParticle() {
    const top = crackPts[0];
    return {
      x: top.x + (Math.random() - 0.5) * CRACK_W * 0.6,
      y: top.y,
      r: Math.random() * 2.5 + 1,
      speed: Math.random() * 1.2 + 0.4,
      opacity: Math.random() * 0.6 + 0.4,
      seg: 0,        /* which crack segment */
      progress: 0,   /* 0–1 along segment */
    };
  }

  function initParticlePool() {
    particles = [];
    const count = Math.min(Math.floor(W / 8), 40);
    for (let i = 0; i < count; i++) {
      const p = spawnParticle();
      /* stagger initial positions */
      p.y = Math.random() * H;
      p.seg = Math.floor(Math.random() * (crackPts.length - 1));
      p.progress = Math.random();
    }
  }

  /* Get x position along crack at fraction t */
  function crackX(t) {
    const idx = t * (crackPts.length - 1);
    const lo  = Math.floor(idx);
    const hi  = Math.min(lo + 1, crackPts.length - 1);
    const f   = idx - lo;
    return crackPts[lo].x * (1 - f) + crackPts[hi].x * f;
  }

  function drawRock() {
    /* Dark crack background */
    ctx.fillStyle = '#0f172a'; // dark crack
    ctx.fillRect(0, 0, W, H);

    /* Rock texture — left side */
    const leftPath = new Path2D();
    leftPath.moveTo(0, 0);
    for (let i = 0; i < crackPts.length; i++) {
      const cx = crackPts[i].x - CRACK_W / 2;
      leftPath.lineTo(cx, crackPts[i].y);
    }
    leftPath.lineTo(0, H);
    leftPath.closePath();

    /* Rock texture — right side */
    const rightPath = new Path2D();
    rightPath.moveTo(W, 0);
    for (let i = 0; i < crackPts.length; i++) {
      const cx = crackPts[i].x + CRACK_W / 2;
      rightPath.lineTo(cx, crackPts[i].y);
    }
    rightPath.lineTo(W, H);
    rightPath.closePath();

    /* Rock fill with light texture */
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#f9fafb');
    grad.addColorStop(0.5, '#e5e7eb');
    grad.addColorStop(1, '#f9fafb');
    ctx.fillStyle = grad;
    ctx.fill(leftPath);
    ctx.fill(rightPath);

    /* Rock edge highlight */
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke(leftPath);
    ctx.stroke(rightPath);

    /* Crack centre line (faint) */
    ctx.beginPath();
    ctx.moveTo(crackPts[0].x, 0);
    for (const pt of crackPts) ctx.lineTo(pt.x, pt.y);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    /* Crack width label */
    const midPt = crackPts[Math.floor(crackPts.length / 2)];
    ctx.save();
    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.textAlign = 'right';
    ctx.fillText('← 0,02 мм →', midPt.x - CRACK_W / 2 - 4, midPt.y);
    ctx.restore();
  }

  function updateParticles() {
    for (const p of particles) {
      p.y += p.speed;
      const t = p.y / H;
      p.x = crackX(Math.min(t, 1)) + (Math.random() - 0.5) * CRACK_W * 0.4;

      if (p.y > H + 10) {
        /* reset to top */
        const top = crackPts[0];
        p.x = top.x + (Math.random() - 0.5) * CRACK_W * 0.5;
        p.y = -p.r * 2;
        p.speed = Math.random() * 1.2 + 0.4;
        p.r = Math.random() * 2.5 + 1;
        p.opacity = Math.random() * 0.6 + 0.4;
      }
    }
  }

  function drawParticles() {
    for (const p of particles) {
      /* Glow */
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      glow.addColorStop(0, `rgba(234,88,12,${p.opacity * 0.4})`); // Orange glow
      glow.addColorStop(1, 'rgba(234,88,12,0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      /* Core dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.fill();
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawRock();
    updateParticles();
    drawParticles();
    animId = requestAnimationFrame(loop);
  }

  /* Start when visible */
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      resize();
      loop();
      obs.disconnect();
    }
  }, { threshold: 0.2 });
  obs.observe(canvas);

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    loop();
  }, { passive: true });
})();

/* ═══ 4. CHART: Particle Size Distribution ═══ */
(function initParticleSizeChart() {
  const ctx = document.getElementById('particleSizeChart');
  if (!ctx) return;


  const labels = [];
  const nanoCemData = [];
  const standardData = [];

  for (let i = 0; i <= 100; i += 2) {
    labels.push(i === 0 ? '' : i);
    /* NanoCem: tight bell curve peaking at x=3.5 (on 0-100 scale ~7) */
    const xN = (i - 7) / 2.5;
    nanoCemData.push(Math.max(0, 100 * Math.exp(-0.5 * xN * xN)));
    /* Standard: broad bell peaking at x=65 */
    const xS = (i - 65) / 18;
    standardData.push(Math.max(0, 100 * Math.exp(-0.5 * xS * xS)));
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'NanoCem UT-9',
          data: nanoCemData,
          borderColor: '#0D0D0D',
          borderWidth: 2.5,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(13,13,13,0.06)',
        },
        {
          label: 'Стандартный цемент',
          data: standardData,
          borderColor: '#BDBDBD',
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(189,189,189,0.07)',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 24,
            boxHeight: 2,
            padding: 16,
            font: { size: 12, weight: '500' },
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%`
          }
        },
        annotation: {}
      },
      scales: {
        x: {
          title: { display: true, text: 'Размер частиц (отн. шкала)', font: { size: 11 }, color: '#9E9E9E' },
          grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
          ticks: { maxTicksLimit: 8, font: { size: 11 } }
        },
        y: {
          title: { display: true, text: 'Объёмная доля (%)', font: { size: 11 }, color: '#9E9E9E' },
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11 }, callback: v => v + '%' },
          min: 0, max: 110,
        }
      }
    }
  });
})();

/* ═══ 5. CHART: Penetration Comparison ═══ */
(function initPenetrationChart() {
  const ctx = document.getElementById('penetrationChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['NanoCem UT-9', 'Микроцемент', 'Портландцемент'],
      datasets: [{
        label: 'Мин. трещина (мм)',
        data: [0.02, 0.15, 0.75],
        backgroundColor: ['#0D0D0D', '#868686', '#C8C8C8'],
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} мм`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11 }, callback: v => v + ' мм' },
          title: { display: true, text: 'Минимальная трещина (мм)', font: { size: 11 }, color: '#9E9E9E' }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: '500' } }
        }
      }
    }
  });
})();

/* ═══ 6. CHART: Strength over Time ═══ */
(function initStrengthChart() {
  const ctx = document.getElementById('strengthChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['0', '1 сут', '3 сут', '7 сут', '14 сут', '28 сут'],
      datasets: [
        {
          label: 'NanoCem UT-9',
          data: [0, 14, 32, 52, 66, 75],
          borderColor: '#0D0D0D',
          backgroundColor: 'rgba(13,13,13,0.07)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0D0D0D',
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: 'Стандартный цемент',
          data: [0, 5, 14, 25, 32, 42],
          borderColor: '#BDBDBD',
          backgroundColor: 'rgba(189,189,189,0.05)',
          borderWidth: 2,
          borderDash: [6, 4],
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#BDBDBD',
          pointRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { boxWidth: 24, boxHeight: 2, padding: 16, font: { size: 12, weight: '500' } }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} МПа`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11 } }
        },
        y: {
          title: { display: true, text: 'Прочность (МПа)', font: { size: 11 }, color: '#9E9E9E' },
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11 }, callback: v => v + ' МПа' },
          min: 0
        }
      }
    }
  });
})();



/* ═══ 7. CHART: Radar (Application) ═══ */
(function initRadarChart() {
  const ctx = document.getElementById('radarChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        'Нефтегаз (РИР)',
        'Цементирование',
        'Укрепление грунтов',
        'Гидроизоляция',
        'Тоннели',
        'Спец. условия'
      ],
      datasets: [
        {
          label: 'NanoCem UT-9',
          data: [95, 88, 82, 90, 87, 85],
          borderColor: 'rgba(255,255,255,0.8)',
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointRadius: 5,
        },
        {
          label: 'Стандартный цемент',
          data: [55, 75, 60, 50, 58, 45],
          borderColor: 'rgba(255,255,255,0.3)',
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderWidth: 1.5,
          borderDash: [5, 4],
          pointBackgroundColor: 'rgba(255,255,255,0.4)',
          pointRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: 'rgba(255,255,255,0.6)', boxWidth: 20, boxHeight: 2, padding: 16, font: { size: 12 } }
        }
      },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: {
            stepSize: 25,
            color: 'rgba(255,255,255,0.25)',
            backdropColor: 'transparent',
            font: { size: 10 },
          },
          grid: { color: 'rgba(255,255,255,0.08)' },
          pointLabels: {
            color: 'rgba(255,255,255,0.65)',
            font: { size: 12, weight: '500' },
          },
          angleLines: { color: 'rgba(255,255,255,0.08)' }
        }
      }
    }
  });
})();

/* ═══ 8. CHART: Sparklines ═══ */
function makeSparkline(id, data, color) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: color.replace(')', ', 0.12)').replace('rgb', 'rgba'),
        tension: 0.5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      animation: { duration: 1000 }
    }
  });
}

(function initSparklines() {
  makeSparkline('spark1', [120, 150, 170, 200, 230, 260, 290, 310, 350], 'rgb(26,107,255)');
  makeSparkline('spark2', [78, 80, 82, 85, 88, 90, 92, 93, 95], 'rgb(5,150,105)');
  makeSparkline('spark3', [10, 18, 22, 27, 31, 35, 37, 39, 40], 'rgb(124,58,237)');
  makeSparkline('spark4', [38, 55, 70, 88, 105, 115, 128, 138, 148], 'rgb(234,88,12)');
})();

/* ═══ 8b. PENETRATION ANIMATION (penCanvas) ═══ */
(function initPenAnimation() {
  const canvas = document.getElementById('penCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, rafId;
  const CRACK_W = 14;     /* crack visual width */
  const PARTICLE_COUNT = 18;
  const CYCLE = 8000;     /* ms per full cycle */
  let particles = [];
  let startTime = null;

  function resize() {
    W = canvas.parentElement.clientWidth;
    H = canvas.parentElement.clientHeight || 280;
    canvas.width  = Math.round(W * devicePixelRatio);
    canvas.height = Math.round(H * devicePixelRatio);
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function spawnParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: W / 2 + (Math.random() - 0.5) * CRACK_W * 0.7,
        /* stagger starting y so they feel continuous */
        phase: Math.random(),
        r: Math.random() * 2 + 2,
        speed: Math.random() * 0.3 + 0.7,
        wobble: (Math.random() - 0.5) * 0.6,
      });
    }
  }

  function drawScene(t) {
    ctx.clearRect(0, 0, W, H);

    /* ── Rock blocks ── */
    const cx = W / 2;
    const gap = CRACK_W / 2;

    /* left block */
    const gL = ctx.createLinearGradient(0, 0, cx - gap, 0);
    gL.addColorStop(0, '#2c2c2c');
    gL.addColorStop(1, '#3a3a3a');
    ctx.fillStyle = gL;
    ctx.fillRect(0, 0, cx - gap, H);

    /* right block */
    const gR = ctx.createLinearGradient(cx + gap, 0, W, 0);
    gR.addColorStop(0, '#3a3a3a');
    gR.addColorStop(1, '#2c2c2c');
    ctx.fillStyle = gR;
    ctx.fillRect(cx + gap, 0, W - (cx + gap), H);

    /* crack edges highlight */
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - gap, 0); ctx.lineTo(cx - gap, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + gap, 0); ctx.lineTo(cx + gap, H); ctx.stroke();

    /* crack label */
    ctx.save();
    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.textAlign = 'left';
    ctx.fillText('Микротрещина 0,05 мм', cx + gap + 6, H * 0.38);
    ctx.restore();

    /* ── Fill layer (phases 0.75–1.0 of cycle) ── */
    const cyclePos = (t % CYCLE) / CYCLE;
    let fillOpacity = 0;
    if (cyclePos > 0.73 && cyclePos < 0.93) {
      fillOpacity = (cyclePos - 0.73) / 0.2;
    } else if (cyclePos >= 0.93) {
      fillOpacity = 1 - (cyclePos - 0.93) / 0.07;
    }
    if (fillOpacity > 0) {
      const fillH = H * 0.35;
      const fillG = ctx.createLinearGradient(0, H - fillH, 0, H);
      fillG.addColorStop(0, `rgba(0,102,255,0)`);
      fillG.addColorStop(1, `rgba(0,102,255,${0.65 * fillOpacity})`);
      ctx.fillStyle = fillG;
      ctx.fillRect(cx - gap, H - fillH, CRACK_W, fillH);
    }

    /* ── Particles ── */
    for (const p of particles) {
      const age = ((t / CYCLE * p.speed) + p.phase) % 1;
      /* fade in / out */
      let alpha;
      if (age < 0.12) alpha = age / 0.12;
      else if (age > 0.82) alpha = (1 - age) / 0.18;
      else alpha = 1;

      const py = age * (H + 20) - 10;
      const px = cx + p.wobble * Math.sin(py * 0.06) * 5;

      /* settling scale */
      const scale = age > 0.72 ? 1 + (age - 0.72) * 0.8 : 1;

      /* glow */
      const gr = ctx.createRadialGradient(px, py, 0, px, py, p.r * 5 * scale);
      gr.addColorStop(0, `rgba(0,102,255,${0.25 * alpha})`);
      gr.addColorStop(1, 'rgba(0,102,255,0)');
      ctx.beginPath();
      ctx.arc(px, py, p.r * 5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = gr;
      ctx.fill();

      /* core */
      ctx.beginPath();
      ctx.arc(px, py, p.r * scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,136,255,${alpha})`;
      ctx.fill();
    }
  }

  function loop(ts) {
    if (!startTime) startTime = ts;
    drawScene(ts - startTime);
    rafId = requestAnimationFrame(loop);
  }

  /* Trigger on visibility */
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      resize();
      spawnParticles();
      rafId = requestAnimationFrame(loop);
      obs.disconnect();
    }
  }, { threshold: 0.25 });
  obs.observe(canvas);

  window.addEventListener('resize', () => {
    cancelAnimationFrame(rafId);
    startTime = null;
    resize();
    spawnParticles();
    rafId = requestAnimationFrame(loop);
  }, { passive: true });
})();

/* ═══ 9. CHART: Oil Rate Case Study ═══ */
(function initOilRateChart() {
  const ctx = document.getElementById('oilRateChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['До РИР', 'День 7', 'День 14', 'День 30+'],
      datasets: [
        {
          label: 'Дебит нефти (т/сут)',
          data: [1.1, 7.5, 16, 16],
          backgroundColor: (c) => {
            const idx = c.dataIndex;
            return idx === 0
              ? 'rgba(189,189,189,0.5)'
              : `rgba(13,13,13,${0.55 + idx * 0.12})`;
          },
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Обводнённость (%)',
          data: [92, 56, 26, 26],
          type: 'line',
          borderColor: '#EA580C',
          backgroundColor: 'rgba(234,88,12,0.07)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#EA580C',
          yAxisID: 'y2',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        delay: (ctx) => ctx.type === 'data' && ctx.mode === 'default'
          ? ctx.dataIndex * 150
          : 0,
        duration: 900,
        easing: 'easeOutQuart',
      },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { boxWidth: 20, boxHeight: 2, padding: 14, font: { size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: c => c.datasetIndex === 0
              ? ` Дебит: ${c.raw} т/сут`
              : ` Обводнённость: ${c.raw}%`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11 } }
        },
        y: {
          title: { display: true, text: 'Дебит нефти (т/сут)', font: { size: 11 }, color: '#9E9E9E' },
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11 } },
          min: 0
        },
        y2: {
          position: 'right',
          title: { display: true, text: 'Обводнённость (%)', font: { size: 11 }, color: '#EA580C' },
          ticks: { font: { size: 11 }, color: '#EA580C', callback: v => v + '%' },
          grid: { display: false },
          min: 0, max: 100
        }
      }
    }
  });
})();


/* ═══ 10. CHART: Success Rate Comparison ═══ */
(function initSuccessChart() {
  const ctx = document.getElementById('successChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['NanoCem UT-9', 'Микроцемент', 'Полимеры', 'Портландцемент'],
      datasets: [{
        label: 'Успешность (%)',
        data: [95, 72, 68, 55],
        backgroundColor: ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)'],
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw}%` } }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(255,255,255,0.55)', font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: v => v + '%' },
          min: 0, max: 100,
        }
      }
    }
  });
})();

/* ═══ 11. CHART: Strength Comparison ═══ */
(function initStrengthCompChart() {
  const ctx = document.getElementById('strengthCompChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['NanoCem UT-9', 'Микроцемент', 'Портландцемент', 'Полимеры'],
      datasets: [{
        label: 'Прочность (МПа)',
        data: [75, 57, 40, 22],
        backgroundColor: ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)'],
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw} МПа` } }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(255,255,255,0.55)', font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: v => v + ' МПа' },
          min: 0,
        }
      }
    }
  });
})();

/* ═══ End of app.js ═══ */

/* ═══ 13. CONTACT FORM ═══ */
(function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = "Отправляем...";
    btn.disabled = true;
    setTimeout(() => {
      const suc = document.getElementById("formSuccess");
      if (suc) { suc.style.display = "block"; }
      btn.style.display = "none";
      form.querySelectorAll("input, textarea").forEach(el => el.value = "");
    }, 1200);
  });
})();

/* ═══ 14. SECTION FADE ═══ */
(function initSectionFade() {
  const style = document.createElement("style");
  style.textContent = ".section-fade{opacity:0;transform:translateY(28px);transition:opacity .65s ease,transform .65s ease} .section-fade.in{opacity:1;transform:translateY(0)} .nav-link.active{color:var(--c-text)!important;background:rgba(0,0,0,.06)!important}";
  document.head.appendChild(style);
  /* NOTE: kpi2-card intentionally excluded — counters need elements visible */
  document.querySelectorAll(".sec-title,.sec-sub,.chart-card,.task-card,.why-metric,.econ-card,.case2-col,.ba-panel,.h2m-card")
    .forEach(el => {
      el.classList.add("section-fade");
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { el.classList.add("in"); obs.unobserve(el); }
      }, { threshold: 0.05 });
      obs.observe(el);
    });
})();

/* ═══ 15. RIR TIMELINE ═══ */
(function initRirTimeline() {
  const section = document.getElementById("rir-process");
  if (!section) return;
  const steps = section.querySelectorAll(".rir-step");
  const fill  = document.getElementById("rirTrackFill");
  let triggered = false;
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !triggered) {
      triggered = true;
      if (fill) fill.classList.add("animated");
      steps.forEach(step => {
        const delay = parseInt(step.dataset.delay || 0);
        setTimeout(() => step.classList.add("visible"), delay + 200);
      });
      obs.disconnect();
    }
  }, { threshold: 0.2 });
  obs.observe(section);
})();
