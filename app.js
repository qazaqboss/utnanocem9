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

  /* KPI counter animation */
  const kpiNumbers = document.querySelectorAll('.kpi-number');
  const kpiObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        kpiObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  kpiNumbers.forEach(n => kpiObserver.observe(n));
})();

function animateCounter(el) {
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

/* ═══ 9. CHART: Oil Rate Case Study ═══ */
(function initOilRateChart() {
  const ctx = document.getElementById('oilRateChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        'До РИР', '1 неделя', '1 месяц', '3 месяца', '6 месяцев'
      ],
      datasets: [
        {
          label: 'Дебит нефти (т/сут)',
          data: [4.2, 8.5, 10.1, 10.8, 10.2],
          backgroundColor: (ctx) => {
            const idx = ctx.dataIndex;
            return idx === 0
              ? 'rgba(189,189,189,0.5)'
              : `rgba(13,13,13,${0.5 + idx * 0.12})`;
          },
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Обводнённость (%)',
          data: [92, 60, 38, 30, 28],
          type: 'line',
          borderColor: '#EA580C',
          backgroundColor: 'rgba(234,88,12,0.08)',
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
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { boxWidth: 20, boxHeight: 2, padding: 14, font: { size: 12 } }
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

/* ═══ 12. CALCULATOR (USD) ═══ */
(function initCalculator() {
  const inputs = {
    wellCount: { el: document.getElementById('wellCount'), val: document.getElementById('wellCountVal') },
    waterCut:  { el: document.getElementById('waterCut'),  val: document.getElementById('waterCutVal') },
    oilPrice:  { el: document.getElementById('oilPrice'),  val: document.getElementById('oilPriceVal') },
    wellRate:  { el: document.getElementById('wellRate'),  val: document.getElementById('wellRateVal') },
  };

  /* Live range display */
  Object.values(inputs).forEach(({ el, val }) => {
    el.addEventListener('input', () => { val.textContent = el.value; });
  });

  let roiChartInstance = null;

  document.getElementById('calcBtn').addEventListener('click', calculate);

  function calculate() {
    const wells      = parseInt(inputs.wellCount.el.value);
    const waterCut   = parseInt(inputs.waterCut.el.value);
    const oilPrice   = parseInt(inputs.oilPrice.el.value); // USD/barrel
    const wellRate   = parseInt(inputs.wellRate.el.value); // t/day

    /* Model assumptions */
    const successRate    = 0.92;                         // 92% success rate
    const waterReduction = 0.62;                         // 62% water cut reduction
    const ratioIncrease  = 1 + (waterCut / 100) * 1.8;  // oil rate multiplier
    const operationDays  = 180;                          // 6 months
    const costPerWellUSD = 17_000;                       // ~$17K per well operation
    const tonPerBarrel   = 0.136;                        // tons → barrels conversion
    const oilPricePerTon = oilPrice / tonPerBarrel;      // $/ton

    const additionalRatePerWell = wellRate * (ratioIncrease - 1) * successRate; // extra t/day
    const totalAdditionalOil    = additionalRatePerWell * wells * operationDays; // total extra tons
    const revenueUSD            = totalAdditionalOil * oilPricePerTon;           // $
    const costUSD               = costPerWellUSD * wells;                        // $
    const roi                   = ((revenueUSD - costUSD) / costUSD * 100);
    const newWaterCut           = waterCut * (1 - waterReduction);

    /* Update DOM */
    document.getElementById('resultRevenue').textContent =
      '$ ' + formatUSD(Math.round(revenueUSD));
    document.getElementById('resultOil').textContent =
      '+' + Math.round(totalAdditionalOil).toLocaleString('ru') + ' т';
    document.getElementById('resultWater').textContent =
      '-' + Math.round(waterCut - newWaterCut) + '%';
    document.getElementById('resultCost').textContent =
      '$ ' + formatUSD(costUSD);
    document.getElementById('resultROI').textContent =
      Math.round(roi) + '%';

    /* ROI bar chart */
    const roiCtx = document.getElementById('roiChart');
    if (roiChartInstance) roiChartInstance.destroy();

    const months = ['Mo1', 'Mo2', 'Mo3', 'Mo4', 'Mo5', 'Mo6'];
    const revenues = months.map((_, i) =>
      Math.round((totalAdditionalOil / 6) * (i + 1) * oilPricePerTon)
    );
    const costs = months.map(() => costUSD);

    roiChartInstance = new Chart(roiCtx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Additional revenue',
            data: revenues,
            backgroundColor: 'rgba(5,150,105,0.15)',
            borderColor: 'rgb(5,150,105)',
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
            type: 'bar',
          },
          {
            label: 'Operation cost',
            data: costs,
            type: 'line',
            borderColor: '#EA580C',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 16, boxHeight: 2, padding: 12, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: $${formatUSD(Math.round(ctx.raw))}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { size: 10 }, callback: v => '$' + formatUSD(v) },
          }
        }
      }
    });

    /* Animate result panel */
    const panel = document.getElementById('calcResults');
    panel.style.animation = 'none';
    panel.offsetHeight;
    panel.style.animation = 'fadeInUp 0.4s ease';
  }

  /* Run on load with defaults */
  calculate();

  function formatUSD(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return n.toFixed(0);
  }
})();


/* ═══ 13. CONTACT FORM ═══ */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Отправляем...';
    btn.disabled = true;

    setTimeout(() => {
      document.getElementById('formSuccess').classList.add('show');
      btn.style.display = 'none';
      form.querySelectorAll('input, textarea').forEach(el => el.value = '');
    }, 1200);
  });
})();

/* ═══ 14. FADE-IN ANIMATION ═══ */
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .nav-link.active {
    color: var(--c-text) !important;
    background: rgba(0,0,0,0.06) !important;
  }
`;
document.head.appendChild(fadeStyle);

/* ═══ 15. SMOOTH ENTRANCE for sections ═══ */
(function initSectionFade() {
  const style = document.createElement('style');
  style.textContent = `
    .section-fade { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .section-fade.in { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.section-title, .section-desc, .chart-card, .kpi-card, .metric-card, .step-item, .case-heading')
    .forEach(el => {
      el.classList.add('section-fade');
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in');
          obs.unobserve(el);
        }
      }, { threshold: 0.1 });
      obs.observe(el);
    });
})();
