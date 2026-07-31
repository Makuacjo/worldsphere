import { useEffect, useRef } from 'react';

/**
 * Constellation cursor with shape morphs.
 *
 * A canvas field of drifting particles that link to each other and to the
 * pointer. When the pointer hovers an element tagged `data-cursor="globe"`,
 * `"compass"`, or `"brain"`, a subset of the particles fly into that glyph
 * beside the cursor, then release back to free drift on leave.
 *
 * Desktop pointer only — disabled on touch and under prefers-reduced-motion.
 */

interface P { x: number; y: number; vx: number; vy: number; }
type Pt = { x: number; y: number };
type Shape = { pts: Pt[]; strokes: number[][] };

const TAU = Math.PI * 2;

// ---- shape builders (offsets around origin, radius R px) ------------------

const ellipse = (rx: number, ry: number, n: number, closed = true): Pt[] => {
  const out: Pt[] = [];
  const steps = closed ? n : n - 1;
  for (let i = 0; i <= steps; i++) {
    const a = (i / n) * TAU;
    out.push({ x: Math.cos(a) * rx, y: Math.sin(a) * ry });
  }
  return out;
};

const build = (polys: Pt[][]): Shape => {
  const pts: Pt[] = [];
  const strokes: number[][] = [];
  for (const poly of polys) {
    const idx: number[] = [];
    for (const p of poly) { idx.push(pts.length); pts.push(p); }
    strokes.push(idx);
  }
  return { pts, strokes };
};

const makeShapes = (R: number): Record<string, Shape> => {
  // Globe: outline + equator + two meridians.
  const globe = build([
    ellipse(R, R, 20),
    ellipse(R, R * 0.34, 16),
    ellipse(R * 0.45, R, 14),
    ellipse(R * 0.8, R, 14),
  ]);

  // Compass: ring + diamond needle + cardinal ticks.
  const needle = [
    { x: 0, y: -R * 0.82 }, { x: R * 0.2, y: 0 },
    { x: 0, y: R * 0.82 }, { x: -R * 0.2, y: 0 }, { x: 0, y: -R * 0.82 },
  ];
  const tick = (dx: number, dy: number): Pt[] => [
    { x: dx * R, y: dy * R }, { x: dx * R * 0.8, y: dy * R * 0.8 },
  ];
  const compass = build([
    ellipse(R, R, 26),
    needle,
    tick(0, -1), tick(1, 0), tick(0, 1), tick(-1, 0),
  ]);

  // Brain: wobbly outline + central fold.
  const outline: Pt[] = [];
  const N = 42;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * TAU;
    const r = R * (0.8 + 0.15 * Math.sin(a * 3) + 0.05 * Math.sin(a * 5));
    outline.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.9 });
  }
  const fold: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    fold.push({ x: Math.sin(t * Math.PI * 3) * R * 0.16, y: (t - 0.5) * R * 1.4 });
  }
  const brain = build([outline, fold]);

  return { globe, compass, brain };
};

const hexToRGBA = (hex: string, a: number) => {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const int = parseInt(full || '8FB2A9', 16);
  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${a})`;
};

const ConstellationCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-bright') || '#2EBDC4';
    const line1 = hexToRGBA(accent, 1);
    const dot = hexToRGBA(accent, 0.9);

    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    let particles: P[] = [];
    const shapes = makeShapes(72);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(72, Math.round((w * h) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: -999, y: -999, active: false };
    const onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; };
    const onLeave = () => { mouse.active = false; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', onLeave);

    // Track which shape (if any) the pointer is currently over.
    let shapeKey: string | null = null;
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-cursor]');
      shapeKey = el ? el.getAttribute('data-cursor') : null;
    };
    document.addEventListener('pointerover', onOver);

    const LINK = 130;
    const MOUSE_LINK = 190;
    let raf = 0;
    let running = true;
    let lastFrame = 0;
    const frameInterval = 1000 / 30;

    const frame = (now = performance.now()) => {
      if (!running) return;
      if (now - lastFrame < frameInterval) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastFrame = now;
      ctx.clearRect(0, 0, w, h);

      const shape = shapeKey ? shapes[shapeKey] : null;
      const assigned = shape ? Math.min(shape.pts.length, particles.length) : 0;

      // Move particles.
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (shape && i < assigned) {
          // Fly toward the glyph point beside the cursor.
          const t = shape.pts[i];
          const tx = mouse.x + t.x;
          const ty = mouse.y + t.y;
          p.x += (tx - p.x) * 0.2;
          p.y += (ty - p.y) * 0.2;
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        if (mouse.active) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_LINK * MOUSE_LINK) {
            const d = Math.sqrt(d2) || 1;
            p.x += (dx / d) * 0.25;
            p.y += (dy / d) * 0.25;
          }
        }
      }

      if (shape) {
        // Draw the glyph strokes from the actual (morphing) particle positions.
        ctx.strokeStyle = hexToRGBA(accent, 0.55);
        ctx.lineWidth = 1.4;
        for (const stroke of shape.strokes) {
          ctx.beginPath();
          let started = false;
          for (const idx of stroke) {
            if (idx >= assigned) continue;
            const p = particles[idx];
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
        }
        ctx.fillStyle = dot;
        for (let i = 0; i < assigned; i++) {
          ctx.beginPath();
          ctx.arc(particles[i].x, particles[i].y, 1.5, 0, TAU);
          ctx.fill();
        }
        // Free particles keep a faint presence.
        ctx.fillStyle = hexToRGBA(accent, 0.35);
        for (let i = assigned; i < particles.length; i++) {
          ctx.beginPath();
          ctx.arc(particles[i].x, particles[i].y, 1.2, 0, TAU);
          ctx.fill();
        }
      } else {
        // Free constellation: particle-to-particle links + dots.
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < LINK) {
              ctx.strokeStyle = line1.replace('1)', `${0.14 * (1 - dist / LINK)})`);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
          ctx.fillStyle = dot;
          ctx.beginPath();
          ctx.arc(a.x, a.y, 1.4, 0, TAU);
          ctx.fill();
        }
        if (mouse.active) {
          for (const p of particles) {
            const dist = Math.hypot(mouse.x - p.x, mouse.y - p.y);
            if (dist < MOUSE_LINK) {
              ctx.strokeStyle = line1.replace('1)', `${0.28 * (1 - dist / MOUSE_LINK)})`);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(mouse.x, mouse.y);
              ctx.lineTo(p.x, p.y);
              ctx.stroke();
            }
          }
        }
      }

      // Cursor glow (always).
      if (mouse.active) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 22);
        g.addColorStop(0, hexToRGBA(accent, 0.5));
        g.addColorStop(1, hexToRGBA(accent, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 22, 0, TAU);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };
    frame();

    const onVisibility = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!running) { running = true; frame(); }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onLeave);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="constellation" aria-hidden="true" />;
};

export default ConstellationCursor;
