import { useEffect, useRef } from 'react';
import { Renderer, Triangle, Program, Mesh, Vec2, Vec3 } from 'ogl';

/**
 * Living-Ecosystem ambient background.
 *
 * A domain-warped fBm noise field rendered on the GPU (OGL/WebGL), tinted with
 * the project's forest / sage / gold identity and gently reactive to the cursor.
 *
 * Progressive enhancement, in order of preference:
 *   1. WebGL + motion allowed  → animated shader.
 *   2. prefers-reduced-motion  → single static frame (no RAF), still on-brand.
 *   3. no WebGL at all         → CSS radial-gradient fallback (see .shader-fallback).
 *
 * Colors are read from the live CSS variables so the field tracks light/dark
 * theme, and a MutationObserver re-syncs them when `data-theme` flips.
 */

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
  float b = dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = m * p;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = uv;
  p.x *= uResolution.x / uResolution.y;

  float t = uTime * 0.045;
  vec2 mo = (uMouse - 0.5) * 0.35;

  // Iterative domain warp — the "flowing ecosystem" motion.
  vec2 q = vec2(fbm(p * 1.4 + mo + t), fbm(p * 1.4 + vec2(5.2, 1.3) - mo));
  vec2 r = vec2(
    fbm(p * 1.4 + 3.0 * q + vec2(1.7, 9.2) + t * 1.25),
    fbm(p * 1.4 + 3.0 * q + vec2(8.3, 2.8) - t)
  );
  float f = clamp(fbm(p * 1.4 + 3.0 * r) * 0.5 + 0.5, 0.0, 1.0);

  vec3 col = mix(uColorA, uColorB, smoothstep(0.15, 0.85, f));

  // Gold veins where the warp stretches — sparse, luminous.
  float vein = smoothstep(0.72, 0.98, length(r));
  col = mix(col, uColorC, vein * 0.45);

  // Radial falloff keeps the center readable for overlaid text.
  float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
  col *= 0.68 + 0.4 * vig;

  // Dithered grain to kill banding on wide gradients.
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  col += grain * 0.02;

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const hexToRGB = (hex: string): [number, number, number] => {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const int = parseInt(full, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
};

const readThemeColors = (el: HTMLElement) => {
  const cs = getComputedStyle(el);
  return {
    a: hexToRGB(cs.getPropertyValue('--foundation-color') || '#283B28'),
    b: hexToRGB(cs.getPropertyValue('--secondary-color') || '#4E6A5B'),
    c: hexToRGB(cs.getPropertyValue('--highlight-color') || '#A68D4A'),
  };
};

const ShaderBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: false,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        powerPreference: 'high-performance',
      });
    } catch {
      // No WebGL — the CSS .shader-fallback underneath stays visible.
      return;
    }

    const gl = renderer.gl;
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.display = 'block';
    container.appendChild(gl.canvas);

    const colors = readThemeColors(document.documentElement);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2(1, 1) },
        uMouse: { value: new Vec2(0.5, 0.5) },
        uColorA: { value: new Vec3(...colors.a) },
        uColorB: { value: new Vec3(...colors.b) },
        uColorC: { value: new Vec3(...colors.c) },
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.uResolution.value.set(
        gl.drawingBufferWidth,
        gl.drawingBufferHeight
      );
    };
    resize();
    window.addEventListener('resize', resize);

    // Cursor parallax — lerped toward the target for a soft, weighty feel.
    const target = new Vec2(0.5, 0.5);
    const current = new Vec2(0.5, 0.5);
    const onPointer = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      target.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height
      );
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    // Theme re-sync when data-theme flips.
    const themeObserver = new MutationObserver(() => {
      const next = readThemeColors(document.documentElement);
      program.uniforms.uColorA.value.set(...next.a);
      program.uniforms.uColorB.value.set(...next.b);
      program.uniforms.uColorC.value.set(...next.c);
      if (reduceMotion) renderer.render({ scene: mesh });
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    let raf = 0;
    let running = true;

    if (reduceMotion) {
      // One static, on-brand frame. No animation loop.
      renderer.render({ scene: mesh });
    } else {
      const start = performance.now();
      const loop = (now: number) => {
        if (!running) return;
        current.x += (target.x - current.x) * 0.04;
        current.y += (target.y - current.y) * 0.04;
        program.uniforms.uMouse.value.set(current.x, current.y);
        program.uniforms.uTime.value = (now - start) / 1000;
        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      // Pause when the tab is hidden — never burn GPU off-screen.
      const onVisibility = () => {
        if (document.hidden) {
          running = false;
          cancelAnimationFrame(raf);
        } else if (!running) {
          running = true;
          raf = requestAnimationFrame(loop);
        }
      };
      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onPointer);
        document.removeEventListener('visibilitychange', onVisibility);
        themeObserver.disconnect();
        gl.canvas.remove();
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      };
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      themeObserver.disconnect();
      gl.canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <div className="shader-stage" aria-hidden="true">
      <div className="shader-fallback" />
      <div ref={containerRef} className="shader-canvas" />
    </div>
  );
};

export default ShaderBackground;
