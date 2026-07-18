import { useEffect, useRef } from 'react';

/**
 * Constellation cursor.
 *
 * A lightweight canvas field of drifting particles that link to each other and
 * to the pointer, with a soft glow at the cursor. Enhances desktop pointer use
 * only — disabled on touch devices and under prefers-reduced-motion.
 */

interface P { x: number; y: number; vx: number; vy: number; }

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

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-bright') || '#8FB2A9';
    const lineBase = hexToRGBA(accent, 1);
    const dot = hexToRGBA(accent, 0.9);

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: P[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Density scales with area, capped for perf.
      const count = Math.min(90, Math.round((w * h) / 22000));
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

    const LINK = 130;
    const MOUSE_LINK = 190;
    let raf = 0;
    let running = true;

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Gentle pull toward the cursor when it's near.
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

      // Particle-to-particle links
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            ctx.strokeStyle = lineBase.replace('1)', `${0.14 * (1 - dist / LINK)})`);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = dot;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cursor links + glow
      if (mouse.active) {
        for (const p of particles) {
          const dist = Math.hypot(mouse.x - p.x, mouse.y - p.y);
          if (dist < MOUSE_LINK) {
            ctx.strokeStyle = lineBase.replace('1)', `${0.28 * (1 - dist / MOUSE_LINK)})`);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 22);
        g.addColorStop(0, hexToRGBA(accent, 0.5));
        g.addColorStop(1, hexToRGBA(accent, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 22, 0, Math.PI * 2);
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
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="constellation" aria-hidden="true" />;
};

export default ConstellationCursor;
