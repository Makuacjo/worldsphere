import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Interactive Earth (Three.js).
 *
 * Fully self-contained — the continents are generated in a fragment shader
 * (domain-warped fBm) tinted with the WorldSphere palette, so there are no
 * texture files to ship or CORS-load. Layers: procedural earth + fresnel
 * atmosphere glow + starfield. Drag to rotate, scroll to zoom, hover/click the
 * region markers to jump to that region's stories.
 *
 * Fallbacks: no WebGL → CSS gradient orb; reduced-motion → no auto-rotation.
 */

const REGIONS: { name: string; lat: number; lon: number }[] = [
  { name: 'Africa', lat: 2, lon: 20 },
  { name: 'Asia', lat: 45, lon: 90 },
  { name: 'Europe', lat: 50, lon: 15 },
  { name: 'North America', lat: 45, lon: -100 },
  { name: 'South America', lat: -15, lon: -60 },
  { name: 'Oceania', lat: -25, lon: 135 },
];

const hexToRGB = (hex: string): [number, number, number] => {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const int = parseInt(full, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
};

const cssColor = (name: string, fallback: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return hexToRGB(v || fallback);
};

const latLonToVec3 = (lat: number, lon: number, r: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
};

const EARTH_VERT = /* glsl */ `
varying vec3 vObjPos;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vObjPos = position;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const EARTH_FRAG = /* glsl */ `
precision highp float;
varying vec3 vObjPos;
varying vec3 vNormal;
varying vec3 vView;
uniform vec3 uOcean;
uniform vec3 uLand;
uniform vec3 uLandHi;
uniform vec3 uAtmos;
uniform float uTime;

vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
// Ashima 3D simplex noise
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++){
    v += a * snoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec3 p = normalize(vObjPos);
  float continents = fbm(p * 1.6);
  float land = smoothstep(0.02, 0.14, continents);
  float detail = fbm(p * 4.0) * 0.5 + 0.5;

  vec3 ocean = mix(uOcean * 0.6, uOcean, smoothstep(-0.4, 0.1, continents));
  vec3 land3 = mix(uLand, uLandHi, detail);
  vec3 base = mix(ocean, land3, land);

  // Simple lambert-ish shading from a fixed light direction.
  vec3 lightDir = normalize(vec3(0.6, 0.35, 0.7));
  float diff = clamp(dot(normalize(vNormal), lightDir) * 0.5 + 0.5, 0.0, 1.0);
  base *= 0.45 + 0.75 * diff;

  // Fresnel rim → atmosphere tint on the limb.
  float fres = pow(1.0 - max(dot(normalize(vNormal), vView), 0.0), 3.0);
  base += uAtmos * fres * 0.7;

  gl_FragColor = vec4(base, 1.0);
}
`;

const ATMO_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const ATMO_FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
uniform vec3 uColor;
void main(){
  float fres = pow(1.0 - max(dot(normalize(vNormal), vView), 0.0), 2.5);
  gl_FragColor = vec4(uColor, fres * 0.9);
}
`;

interface Tooltip { name: string; x: number; y: number; visible: boolean; }

const InteractiveGlobe = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<Tooltip>({ name: '', x: 0, y: 0, visible: false });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.4, 5.2);

    const R = 1.6;

    // Earth
    const earthMat = new THREE.ShaderMaterial({
      vertexShader: EARTH_VERT,
      fragmentShader: EARTH_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uOcean: { value: new THREE.Vector3(...cssColor('--ocean', '#394C59')) },
        uLand: { value: new THREE.Vector3(...cssColor('--forest', '#4A6B3A')) },
        uLandHi: { value: new THREE.Vector3(...cssColor('--teal', '#6B8487')) },
        uAtmos: { value: new THREE.Vector3(...cssColor('--cloud', '#B6C1D3')) },
      },
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 96), earthMat);
    scene.add(earth);

    // Atmosphere glow
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      uniforms: { uColor: { value: new THREE.Vector3(...cssColor('--cloud', '#B6C1D3')) } },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(R * 1.18, 64, 64), atmoMat);
    scene.add(atmosphere);

    // Stars
    const starCount = 1400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(18 + Math.random() * 22);
      starPos.set([v.x, v.y, v.z], i * 3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, sizeAttenuation: true, transparent: true, opacity: 0.7 })
    );
    scene.add(stars);

    // Region markers
    const markerGroup = new THREE.Group();
    const markerGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const markerColor = new THREE.Color().setRGB(...cssColor('--accent-bright', '#8FB2A9'));
    REGIONS.forEach(region => {
      const pos = latLonToVec3(region.lat, region.lon, R * 1.02);
      const marker = new THREE.Mesh(
        markerGeo,
        new THREE.MeshBasicMaterial({ color: markerColor })
      );
      marker.position.copy(pos);
      marker.userData.region = region.name;
      markerGroup.add(marker);

      // faint ring halo
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.06, 0.09, 24),
        new THREE.MeshBasicMaterial({ color: markerColor, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
      );
      halo.position.copy(pos);
      halo.lookAt(0, 0, 0);
      markerGroup.add(halo);
    });
    earth.add(markerGroup);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 8;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.5;
    controls.rotateSpeed = 0.55;

    // Raycasting for markers
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered: THREE.Object3D | null = null;

    const pickMarker = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markerGroup.children, false);
      return hits.find(h => h.object.userData.region)?.object ?? null;
    };

    const onMove = (e: PointerEvent) => {
      const obj = pickMarker(e.clientX, e.clientY);
      hovered = obj;
      renderer.domElement.style.cursor = obj ? 'pointer' : 'grab';
      if (obj) {
        controls.autoRotate = false;
        setTooltip({ name: obj.userData.region, x: e.clientX, y: e.clientY, visible: true });
      } else {
        controls.autoRotate = !reduceMotion;
        setTooltip(t => (t.visible ? { ...t, visible: false } : t));
      }
    };
    const onClick = (e: PointerEvent) => {
      const obj = pickMarker(e.clientX, e.clientY);
      if (obj) navigate(`/stories?region=${encodeURIComponent(obj.userData.region)}`);
    };
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerdown', onClick);

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resize);

    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;

    const render = () => {
      if (!running) return;
      const t = clock.getElapsedTime();
      earthMat.uniforms.uTime.value = t;
      stars.rotation.y = t * 0.01;
      // Pulse hovered marker
      markerGroup.children.forEach(m => {
        const target = m === hovered ? 1.6 : 1;
        m.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
      });
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    const onVisibility = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!running) { running = true; render(); }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerdown', onClick);
      controls.dispose();
      renderer.dispose();
      earthMat.dispose();
      atmoMat.dispose();
      starGeo.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [navigate]);

  return (
    <div className="globe">
      {failed ? (
        <div className="globe__fallback" aria-hidden="true" />
      ) : (
        <div ref={mountRef} className="globe__stage" role="img" aria-label="Interactive 3D globe of Earth" />
      )}
      {tooltip.visible && (
        <div className="globe__tip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.name}
          <small>View stories →</small>
        </div>
      )}
    </div>
  );
};

export default InteractiveGlobe;
