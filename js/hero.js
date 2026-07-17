/* ============================================================
   RIO — hero "hanging words" animation
   ------------------------------------------------------------
   A classical academic pediment with strands of research-
   integrity words hanging beneath it like a curtain. Strands
   sway with a gentle wind and part around the visitor's
   cursor. Clicking a word opens a popup about that pillar of
   research integrity.

   EDIT ME: the WORDS array below holds every hanging word and
   the popup text shown when it is clicked. Edit freely.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. THE WORDS + POPUP CONTENT  (safe to edit)
     `w`     — the word that hangs from the pediment
     `kicker`— small label above the popup title
     `body`  — array of paragraphs shown in the popup.
               The last placeholder paragraph is styled as an
               "add your content" block — replace it!
  ---------------------------------------------------------- */
  const WORDS = [
    {
      w: 'HONESTY', kicker: 'Pillar · How integrity was built',
      body: [
        'Honesty is the oldest pillar of research integrity. As early as 1830, Charles Babbage catalogued the ways science could go wrong — “hoaxing, forging, trimming and cooking” — giving the scientific community its first taxonomy of fraud.',
        'Every modern integrity framework begins here: report methods, data and findings truthfully, and let the evidence speak.'
      ]
    },
    {
      w: 'RIGOR', kicker: 'Pillar · How integrity was built',
      body: [
        'Rigor is care made visible. The Royal Society’s founding motto, Nullius in verba (1660) — “take nobody’s word for it” — set the expectation that claims must survive careful, methodical scrutiny.',
        'Sound design, appropriate methods and honest uncertainty remain the everyday craft of trustworthy research.'
      ]
    },
    {
      w: 'TRANSPARENCY', kicker: 'Pillar · How integrity was built',
      body: [
        'Transparency turned integrity from a private virtue into a public practice. The open-science movement — pre-registration, open data, and the FAIR data principles (2016) — made showing your work part of doing the work.',
        'When methods, materials and data are open, errors surface faster and trust compounds.'
      ]
    },
    {
      w: 'ACCOUNTABILITY', kicker: 'Pillar · How integrity was built',
      body: [
        'Modern research accountability was forged in 1947, when the Nuremberg Code established that researchers answer personally for the conduct of their studies.',
        'Institutional oversight — review boards, integrity officers and offices like this one — grew from that principle.'
      ]
    },
    {
      w: 'OBJECTIVITY', kicker: 'Pillar · How integrity was built',
      body: [
        'Objectivity means managing the biases every researcher carries. Through the late twentieth century, journals and funders made conflict-of-interest disclosure a standard condition of publishing and funding.',
        'Declaring interests does not eliminate bias — it lets readers weigh it.'
      ]
    },
    {
      w: 'REPRODUCIBILITY', kicker: 'Pillar · How integrity was built',
      body: [
        'The “replication crisis” of the 2010s — when landmark findings across fields failed to reproduce — moved reproducibility to the centre of research integrity.',
        'Registered reports, shared code and replication studies are now core tools for building results that last.'
      ]
    },
    {
      w: 'ETHICS', kicker: 'Pillar · How integrity was built',
      body: [
        'Research ethics matured through two landmark documents: the Declaration of Helsinki (1964) and the Belmont Report (1979), which articulated respect for persons, beneficence and justice.',
        'Integrity extends those duties beyond human subjects to the entire research enterprise.'
      ]
    },
    {
      w: 'FAIRNESS', kicker: 'Pillar · How integrity was built',
      body: [
        'Fairness governs how credit, authorship and review are shared. The ICMJE authorship criteria, first issued in 1985, codified who counts as an author — and who is owed acknowledgement.',
        'Fair peer review and fair attribution keep the scientific commons worth contributing to.'
      ]
    },
    {
      w: 'TRUST', kicker: 'Pillar · How integrity was built',
      body: [
        'Trust is the currency of science: the public funds research it cannot personally verify, and scholars build on results they did not produce.',
        'Research integrity offices exist to protect that trust — investigating concerns fairly and strengthening good practice before problems arise.'
      ]
    },
    {
      w: 'OPENNESS', kicker: 'Pillar · How integrity was built',
      body: [
        'Openness reshaped scholarly publishing. The Budapest Open Access Initiative (2002) argued that publicly funded knowledge should be publicly readable — and open data, code and protocols followed.',
        'Openness is transparency at the scale of the whole research record.'
      ]
    },
    {
      w: 'RESPONSIBILITY', kicker: 'Pillar · How integrity was built',
      body: [
        'In 2010, the Singapore Statement on Research Integrity became the first international framework of its kind — four principles and fourteen responsibilities agreed across 51 countries.',
        'It marked the moment research integrity became a shared, global professional standard.'
      ]
    },
    {
      w: 'STEWARDSHIP', kicker: 'Pillar · How integrity was built',
      body: [
        'Stewardship is the duty to safeguard the research record itself. The US Office of Research Integrity was established in 1992, and the Committee on Publication Ethics (COPE) followed in 1997.',
        'Corrections, retractions and preserved data keep the record honest for the researchers who come next.'
      ]
    },
    {
      w: 'MENTORSHIP', kicker: 'Pillar · How integrity was built',
      body: [
        'Integrity is taught, not assumed. From the 1990s onward, major funders such as the NIH and NSF required training in the responsible conduct of research (RCR) for the scientists they support.',
        'Good mentorship passes on not just techniques, but standards.'
      ]
    },
    {
      w: 'ACCURACY', kicker: 'Pillar · How integrity was built',
      body: [
        'Accuracy is maintained, not merely achieved. Corrections and retractions — once hidden — became a visible, normal part of science, helped by watchdogs like Retraction Watch (founded 2010).',
        'A record that can admit error is a record that can be trusted.'
      ]
    }
  ];

  /* Placeholder appended to every popup — replace with your content */
  const POPUP_PLACEHOLDER =
    'Add your own story here — how this principle shaped research integrity at your institution.';

  /* ----------------------------------------------------------
     2. Setup
  ---------------------------------------------------------- */
  const stage = document.getElementById('hero-stage');
  const canvas = document.getElementById('hero-canvas');
  if (!stage || !canvas) return;
  const ctx = canvas.getContext('2d');

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COLORS = {
    inkA: '#1e5c38',       // strand letters (green ink)
    inkB: '#2a6868',       // strand letters (teal ink)
    hover: '#ec8b2d',      // hovered word (logo nib orange)
    shadow: 'rgba(23, 49, 31, 0.10)',
    pedimentDark: '#1e5c38',
    pedimentMid: '#2e7d4f',
    pedimentLight: '#eef6f0',
    frieze: '#ffffff',
    friezeText: '#57866a',
    line: '#cfe2d5',
    accent: '#ec8b2d',
    teal: '#3d8f8f'
  };

  const SEG = 15;          // px between letters along a strand
  const FONT_SIZE = 14;

  /* the 3D roof artwork (assets/roof.svg) + its hang-line geometry:
     the fascia board in the SVG spans x 150..750 of 900, and its
     underside sits at y 372 of 420 — strands hang from there */
  const ROOF_SRC = 'assets/roof.svg';
  const ROOF_AR = 420 / 900;              // height / width
  const HANG_Y = 372 / 420;               // fraction of roof height
  const HANG_L = 168 / 900;               // strand span, fraction of width
  const HANG_R = 732 / 900;
  const roofImg = new Image();
  roofImg.src = ROOF_SRC;

  let W = 0, H = 0, DPR = 1;
  let strands = [];
  let mouse = { x: -9999, y: -9999, vx: 0, px: -9999, py: -9999, down: false };
  let hovered = null;      // { strand, group }
  let growth = 0;          // 0 → 1 curtain-lowering intro
  let startTime = null;
  let ped = null;          // pediment geometry

  /* ----------------------------------------------------------
     3. Roof geometry + drawing (the 3D artwork in roof.svg)
  ---------------------------------------------------------- */
  function computePediment() {
    const pw = Math.min(W * 0.98, 700);
    const phH = pw * ROOF_AR;
    const cx = W / 2;
    const top = Math.max(14, H * 0.03);
    const x0 = cx - pw / 2;
    ped = {
      cx, pw, top, phH, x0,
      baseY: top + phH * HANG_Y,
      left: x0 + pw * HANG_L,
      right: x0 + pw * HANG_R
    };
  }

  /* The roof + its soft shadow are baked once into an offscreen
     canvas (blur is expensive), then cheaply blitted every frame. */
  let roofCanvas = null;
  const ROOF_PAD = 56;
  function bakeRoof() {
    if (!roofImg.complete || !roofImg.naturalWidth || !ped) return;
    roofCanvas = document.createElement('canvas');
    roofCanvas.width = (ped.pw + ROOF_PAD * 2) * DPR;
    roofCanvas.height = (ped.phH + ROOF_PAD * 2) * DPR;
    const rc = roofCanvas.getContext('2d');
    rc.scale(DPR, DPR);
    rc.shadowColor = 'rgba(23, 49, 31, .28)';
    rc.shadowBlur = 30;
    rc.shadowOffsetX = 12;
    rc.shadowOffsetY = 16;
    rc.drawImage(roofImg, ROOF_PAD, ROOF_PAD, ped.pw, ped.phH);
  }
  roofImg.onload = bakeRoof;

  function drawPediment() {
    if (!roofCanvas) return;
    ctx.drawImage(roofCanvas,
      ped.x0 - ROOF_PAD, ped.top - ROOF_PAD,
      ped.pw + ROOF_PAD * 2, ped.phH + ROOF_PAD * 2);
  }

  /* ----------------------------------------------------------
     4. Strand construction (verlet chains of letters)
  ---------------------------------------------------------- */
  let wordBag = [];
  function nextWordIndex() {
    if (!wordBag.length) {
      wordBag = WORDS.map((_, i) => i);
      for (let i = wordBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordBag[i], wordBag[j]] = [wordBag[j], wordBag[i]];
      }
    }
    return wordBag.pop();
  }

  function buildStrands() {
    strands = [];
    const usable = ped.right - ped.left;
    /* fewer strands on phones = fewer physics points to simulate */
    const density = W_SMALL() ? 40 : 28;
    const count = Math.max(7, Math.min(20, Math.floor(usable / density)));
    const gap = usable / (count - 1);

    for (let s = 0; s < count; s++) {
      const x = ped.left + s * gap + (Math.random() * 8 - 4);
      const maxLen = H - ped.baseY - 40;
      const base = maxLen * 0.72;
      const len = base * (0.62 + Math.random() * 0.38);
      const letterCount = Math.max(8, Math.floor(len / SEG));

      /* fill the strand with words, blank slot between words */
      const letters = [];
      let group = 0;
      while (letters.length < letterCount) {
        const wi = nextWordIndex();
        const word = WORDS[wi].w;
        for (const ch of word) letters.push({ ch, wi, group });
        letters.push(null);
        group++;
      }
      letters.length = letterCount;

      /* verlet points: one more than letters */
      const pts = [];
      for (let i = 0; i <= letterCount; i++) {
        pts.push({
          x: x, y: ped.baseY + i * SEG * 0.02,
          px: x, py: ped.baseY + i * SEG * 0.02
        });
      }

      strands.push({
        anchorX: x,
        letters, pts,
        phase: Math.random() * Math.PI * 2,
        swayAmp: 0.5 + Math.random() * 0.6,
        tint: Math.random() < 0.28 ? COLORS.inkB : COLORS.inkA
      });
    }
  }

  /* ----------------------------------------------------------
     5. Physics
  ---------------------------------------------------------- */
  const GRAVITY = 0.55;
  const DAMPING = 0.965;
  const MOUSE_R = 95;
  const MOUSE_F = 2.6;

  function step(t) {
    const wind = REDUCED ? 0 : 1;
    for (const s of strands) {
      const pts = s.pts;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        let vx = (p.x - p.px) * DAMPING;
        let vy = (p.y - p.py) * DAMPING;
        p.px = p.x; p.py = p.y;

        /* wind */
        const sway =
          Math.sin(t * 0.0009 + s.phase + p.y * 0.004) * 0.045 * s.swayAmp +
          Math.sin(t * 0.0021 + s.phase * 1.7 + i * 0.35) * 0.016;
        vx += sway * wind;

        /* mouse repulsion */
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_R * MOUSE_R && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (1 - d / MOUSE_R) * MOUSE_F;
          vx += (dx / d) * f + mouse.vx * 0.06 * (1 - d / MOUSE_R);
          vy += (dy / d) * f * 0.35;
        }

        p.x += vx;
        p.y += vy + GRAVITY;
      }

      /* constraints */
      const segNow = SEG * (0.08 + 0.92 * growth);
      for (let k = 0; k < 3; k++) {
        pts[0].x = s.anchorX;
        pts[0].y = ped.baseY;
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i], b = pts[i + 1];
          let dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          const diff = (d - segNow) / d;
          const off = 0.5 * diff;
          if (i === 0) { b.x -= dx * diff; b.y -= dy * diff; }
          else {
            a.x += dx * off; a.y += dy * off;
            b.x -= dx * off; b.y -= dy * off;
          }
        }
      }
    }
  }

  /* ----------------------------------------------------------
     6. Rendering
  ---------------------------------------------------------- */
  function drawStrands(shadowPass) {
    ctx.save();
    if (shadowPass) {
      ctx.translate(12, 16);
      ctx.fillStyle = COLORS.shadow;
    }
    ctx.font = `600 ${FONT_SIZE}px "Cormorant Garamond", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = shadowPass ? 1 : 0.92;

    /* on phones, skip per-letter rotation (save/rotate/restore is
       the costliest part of the draw) — strands are near-vertical
       so upright glyphs look almost identical */
    const rotate = !W_SMALL();

    for (let si = 0; si < strands.length; si++) {
      const s = strands[si];
      if (!shadowPass) ctx.fillStyle = s.tint;
      for (let i = 0; i < s.letters.length; i++) {
        const L = s.letters[i];
        if (!L) continue;
        const a = s.pts[i], b = s.pts[i + 1];
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;

        L.x = mx; L.y = my;   // cache for hit-testing

        const isHover = !shadowPass && hovered &&
          hovered.strand === si && hovered.group === L.group;

        if (isHover) {
          ctx.fillStyle = COLORS.hover;
          ctx.font = `700 ${FONT_SIZE + 1}px "Cormorant Garamond", Georgia, serif`;
        }

        if (rotate) {
          const ang = Math.atan2(b.y - a.y, b.x - a.x) - Math.PI / 2;
          ctx.save();
          ctx.translate(mx, my);
          ctx.rotate(ang);
          ctx.fillText(L.ch, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(L.ch, mx, my);
        }

        if (isHover) {
          ctx.fillStyle = s.tint;
          ctx.font = `600 ${FONT_SIZE}px "Cormorant Garamond", Georgia, serif`;
        }
      }
    }
    ctx.restore();
  }

  function findHover() {
    if (mouse.x < -100) { hovered = null; return; }
    let best = null, bestD = 20 * 20;
    for (let si = 0; si < strands.length; si++) {
      const s = strands[si];
      for (const L of s.letters) {
        if (!L || L.x === undefined) continue;
        const dx = L.x - mouse.x, dy = L.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD) { bestD = d2; best = { strand: si, group: L.group, wi: L.wi }; }
      }
    }
    hovered = best;
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  }

  /* The animation only runs while the hero is actually on screen
     and the tab is visible — it costs nothing while the visitor
     reads the rest of the page or switches tabs. */
  let running = false;
  function setRunning(on) {
    if (on && !running) { running = true; requestAnimationFrame(frame); }
    else if (!on) { running = false; }
  }

  let lastDraw = 0;
  function frame(t) {
    if (!running) return;
    /* 30fps cap on phones — halves the work, imperceptible for a
       gentle sway */
    if (W_SMALL() && t - lastDraw < 30) { requestAnimationFrame(frame); return; }
    lastDraw = t;
    if (startTime === null) startTime = t;
    const el = t - startTime;
    growth = REDUCED ? 1 : Math.min(1, el / 1900);
    growth = 1 - Math.pow(1 - growth, 3);   // ease-out cubic

    ctx.clearRect(0, 0, W, H);
    step(t);
    findHover();
    if (W > 640) drawStrands(true);   // soft cast shadow (skipped on phones)
    drawStrands(false);               // ink pass
    drawPediment();

    /* mouse velocity decay */
    mouse.vx *= 0.8;

    requestAnimationFrame(frame);
  }

  /* ----------------------------------------------------------
     7. Popup
  ---------------------------------------------------------- */
  const backdrop = document.getElementById('word-modal');
  const modalKicker = document.getElementById('modal-kicker');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  function openPopup(wi) {
    const data = WORDS[wi];
    modalKicker.textContent = data.kicker;
    modalTitle.textContent = data.w.charAt(0) + data.w.slice(1).toLowerCase();
    modalBody.innerHTML = '';
    for (const para of data.body) {
      const p = document.createElement('p');
      p.textContent = para;
      modalBody.appendChild(p);
    }
    const ph = document.createElement('div');
    ph.className = 'placeholder small';
    ph.innerHTML = '<strong>Your content</strong>' + POPUP_PLACEHOLDER;
    modalBody.appendChild(ph);

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closePopup();
  });
  document.querySelector('.modal-close').addEventListener('click', closePopup);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
  });

  /* ----------------------------------------------------------
     8. Events
  ---------------------------------------------------------- */
  function toLocal(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener('mousemove', (e) => {
    const p = toLocal(e);
    mouse.vx = p.x - (mouse.px === -9999 ? p.x : mouse.px);
    mouse.px = p.x; mouse.py = p.y;
    mouse.x = p.x; mouse.y = p.y;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999; mouse.y = -9999; mouse.px = -9999;
  });
  canvas.addEventListener('click', () => {
    if (hovered) { openPopup(hovered.wi); return; }
    /* gust on empty click */
    for (const s of strands) {
      for (let i = 1; i < s.pts.length; i++) {
        const p = s.pts[i];
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < 200) {
          p.x += (dx / d) * (1 - d / 200) * 26;
          p.y += (dy / d) * (1 - d / 200) * 9;
        }
      }
    }
  });

  /* touch: drag parts the curtain, tap opens the word */
  let touchMoved = false;
  canvas.addEventListener('touchstart', (e) => {
    touchMoved = false;
    const t = e.touches[0];
    const p = toLocal(t);
    mouse.x = p.x; mouse.y = p.y; mouse.px = p.x;
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    touchMoved = true;
    const t = e.touches[0];
    const p = toLocal(t);
    mouse.vx = p.x - mouse.px;
    mouse.px = p.x;
    mouse.x = p.x; mouse.y = p.y;
  }, { passive: true });
  canvas.addEventListener('touchend', () => {
    if (!touchMoved && hovered) openPopup(hovered.wi);
    mouse.x = -9999; mouse.y = -9999; mouse.px = -9999;
  });

  /* ----------------------------------------------------------
     9. Resize / boot
  ---------------------------------------------------------- */
  function resize() {
    /* cap the pixel budget harder on small screens */
    DPR = Math.min(window.devicePixelRatio || 1, W_SMALL() ? 1.5 : 2);
    W = stage.clientWidth;
    H = stage.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    computePediment();
    bakeRoof();
    buildStrands();
  }

  function W_SMALL() { return stage.clientWidth < 640; }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); startTime = null; }, 180);
  });

  resize();

  /* run only while visible: hero on screen + tab in foreground */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      setRunning(entries[0].isIntersecting && !document.hidden);
    }, { threshold: 0.05 }).observe(stage);
  } else {
    setRunning(true);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) setRunning(false);
    else {
      const r = stage.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) setRunning(true);
    }
  });
})();
