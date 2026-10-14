import { useEffect, useRef, useState } from 'react';
import type { GlobeInstance } from 'globe.gl';
import './GoalGlobe.css';

export interface GeoPlace {
  /** IATA code shown on the label, e.g. "TPE". */
  code: string;
  city: string;
  lat: number;
  lng: number;
}

export interface GoalGlobeProps {
  from: GeoPlace;
  to: GeoPlace;
  /** 0–1. Saved ÷ target, already clamped. Drives how far along the route the plane is. */
  progress: number;
  /** Text inside the plane marker, e.g. "已飛行 30%". */
  progressLabel: string;
  /** Fly the camera in on first render. Ignored when the user prefers reduced motion. */
  animateIn?: boolean;
  /** Accessible description of the visual. */
  ariaLabel: string;
  className?: string;
}

interface Palette {
  globe: string;
  land: string;
  atmosphere: string;
  route: string;
  traveled: string;
  destination: string;
}

const readPalette = (el: HTMLElement): Palette => {
  const css = getComputedStyle(el);
  const v = (name: string) => css.getPropertyValue(name).trim();
  const dark = el.closest('[data-theme="dark"]') !== null || document.documentElement.dataset.theme === 'dark';
  return {
    globe: dark ? '#101a2a' : '#f3f6fc',
    land: withAlpha(v('--primary') || '#2f5bea', dark ? 0.6 : 0.5),
    atmosphere: v('--primary') || '#2f5bea',
    route: withAlpha(v('--ink-muted') || '#566173', 0.95),
    traveled: v('--savings') || '#0b7f60',
    destination: v('--primary') || '#2f5bea',
  };
};

function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * A 3D globe showing a savings goal as a flight: the route from `from` to `to`,
 * the stretch already "flown" (money saved) in the savings colour, and a plane marker
 * at the current position. Drag to rotate. The globe library loads lazily.
 */
export function GoalGlobe({ from, to, progress, progressLabel, animateIn = true, ariaLabel, className }: GoalGlobeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unsupported'>('loading');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;
    let themeObserver: MutationObserver | undefined;

    (async () => {
      const [{ default: Globe }, { feature }, countriesTopo, { geoInterpolate }, THREE] = await Promise.all([
        import('globe.gl'),
        import('topojson-client'),
        import('world-atlas/countries-110m.json'),
        import('d3-geo'),
        import('three'),
      ]);
      if (disposed) return;

      const testCanvas = document.createElement('canvas');
      if (!testCanvas.getContext('webgl2') && !testCanvas.getContext('webgl')) {
        setStatus('unsupported');
        return;
      }

      const topo = countriesTopo as unknown as Parameters<typeof feature>[0];
      const countries = (feature(topo, (topo as unknown as { objects: { countries: Parameters<typeof feature>[1] } }).objects.countries) as unknown as {
        features: object[];
      }).features;

      const reduce = prefersReducedMotion();
      const palette = readPalette(host);
      const globe = new Globe(host, { animateIn: false, rendererConfig: { alpha: true, antialias: true } });
      globeRef.current = globe;

      const material = new THREE.MeshPhongMaterial({ color: palette.globe, shininess: 4 });
      globe
        .backgroundColor('rgba(0,0,0,0)')
        .globeMaterial(material)
        .showAtmosphere(true)
        .atmosphereColor(palette.atmosphere)
        .atmosphereAltitude(0.16)
        .hexPolygonsData(countries)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.45)
        .hexPolygonUseDots(true)
        .hexPolygonColor(() => palette.land);

      // Route geometry. three-globe draws arcs as a cubic Bézier whose peak altitude is
      // half the great-circle distance (in radians) × the auto-scale. We rebuild the same
      // curve to place the plane exactly on the drawn line.
      const ALT_SCALE = 0.45;
      const start: [number, number] = [from.lng, from.lat];
      const end: [number, number] = [to.lng, to.lat];
      const interpolate = geoInterpolate(start, end);
      const dist = (() => {
        const toRad = Math.PI / 180;
        const [l1, p1] = [start[0] * toRad, start[1] * toRad];
        const [l2, p2] = [end[0] * toRad, end[1] * toRad];
        return Math.acos(Math.min(1, Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(l2 - l1)));
      })();
      const peak = (dist / 2) * ALT_SCALE;
      const cp = (t: number) => {
        const [lng, lat] = interpolate(t);
        return { lat, lng, alt: peak * 1.5 };
      };
      const toVec = ({ lat, lng, alt }: { lat: number; lng: number; alt: number }) => {
        const c = globe.getCoords(lat, lng, alt);
        return new THREE.Vector3(c.x, c.y, c.z);
      };
      const curve = new THREE.CubicBezierCurve3(
        toVec({ lat: from.lat, lng: from.lng, alt: 0 }),
        toVec(cp(0.25)),
        toVec(cp(0.75)),
        toVec({ lat: to.lat, lng: to.lng, alt: 0 }),
      );
      const p = Math.max(0, Math.min(1, progress));
      // Sample the curve by arc length and convert back to lat/lng/altitude so the drawn
      // route, the "flown" segment and the plane all sit on exactly the same line.
      const SAMPLES = 160;
      const toGeo = (t: number) => {
        const v = curve.getPointAt(t);
        const g = globe.toGeoCoords({ x: v.x, y: v.y, z: v.z });
        return { lat: g.lat, lng: g.lng, alt: Math.max(0.002, g.altitude) };
      };
      const ts = Array.from({ length: SAMPLES + 1 }, (_, i) => i / SAMPLES);
      const traveledPts = [...ts.filter((t) => t < p), p].map(toGeo);
      const remainingPts = [p, ...ts.filter((t) => t > p)].map(toGeo);
      const planePos = toGeo(p);
      const paths = [
        { kind: 'remaining', points: remainingPts },
        ...(p > 0 ? [{ kind: 'traveled', points: traveledPts }] : []),
      ];

      const makeLabel = (place: GeoPlace, role: 'from' | 'to') => {
        const el = document.createElement('div');
        el.className = `fl-globe-label fl-globe-label--${role}`;
        el.innerHTML = `<strong></strong><span></span>`;
        el.querySelector('strong')!.textContent = place.code;
        el.querySelector('span')!.textContent = place.city;
        return el;
      };
      const plane = document.createElement('div');
      plane.className = 'fl-globe-plane';
      plane.innerHTML =
        '<svg viewBox="-12 -12 24 24" width="16" height="16" aria-hidden="true"><path d="M10 0c0-1.2-1.2-1.8-2.5-1.8H2L-4-10h-2.5l3.5 8.2h-4.5l-2-2.7h-2L-10 0l-1.5 4.5h2l2-2.7h4.5L-6.5 10H-4l6-8.2h5.5C8.8 1.8 10 1.2 10 0Z" fill="currentColor"/></svg><span></span>';
      plane.querySelector('span')!.textContent = progressLabel;

      const html = [
        { lat: from.lat, lng: from.lng, alt: 0.01, el: makeLabel(from, 'from') },
        { lat: to.lat, lng: to.lng, alt: 0.01, el: makeLabel(to, 'to') },
        { lat: planePos.lat, lng: planePos.lng, alt: planePos.alt, el: plane },
      ];

      const applyPalette = (pal: Palette) => {
        material.color.set(pal.globe);
        globe
          .atmosphereColor(pal.atmosphere)
          .hexPolygonColor(() => pal.land)
          .pathColor((d: object) => ((d as { kind: string }).kind === 'traveled' ? pal.traveled : pal.route))
          .ringColor(() => (t: number) => withAlpha(pal.destination, 1 - t));
      };

      type PathDatum = { kind: string; points: { lat: number; lng: number; alt: number }[] };
      const isTraveled = (d: object) => (d as PathDatum).kind === 'traveled';
      globe
        .pathPoints((d: object) => (d as PathDatum).points)
        .pathPointLat('lat')
        .pathPointLng('lng')
        .pathPointAlt('alt')
        .pathResolution(1)
        .pathStroke((d: object) => (isTraveled(d) ? 1.8 : 0.7))
        .pathDashLength((d: object) => (isTraveled(d) ? 1 : 0.025))
        .pathDashGap((d: object) => (isTraveled(d) ? 0 : 0.016))
        .pathDashAnimateTime(0)
        .pathTransitionDuration(reduce ? 0 : 1200)
        .ringsData([{ lat: to.lat, lng: to.lng }])
        .ringMaxRadius(3.5)
        .ringPropagationSpeed(1.6)
        .ringRepeatPeriod(reduce ? 0 : 1600)
        .htmlElementsData(html)
        .htmlLat('lat')
        .htmlLng('lng')
        .htmlAltitude('alt')
        .htmlElement((d: object) => (d as { el: HTMLElement }).el);
      applyPalette(palette);

      const controls = globe.controls();
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.rotateSpeed = 0.6;

      const size = () => {
        globe.width(host.clientWidth).height(host.clientHeight);
      };
      size();
      resizeObserver = new ResizeObserver(size);
      resizeObserver.observe(host);

      const [midLng, midLat] = interpolate(0.42);
      const finalView = { lat: midLat - 14, lng: midLng + 6, altitude: 2.0 };
      if (animateIn && !reduce) {
        globe.pointOfView({ lat: finalView.lat - 40, lng: finalView.lng + 120, altitude: 4.2 }, 0);
        requestAnimationFrame(() => {
          if (disposed) return;
          globe.pointOfView(finalView, 2400);
          window.setTimeout(() => !disposed && globe.pathsData(paths), 1500);
        });
      } else {
        globe.pointOfView(finalView, 0);
        globe.pathsData(paths);
      }

      themeObserver = new MutationObserver(() => applyPalette(readPalette(host)));
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      setStatus('ready');
    })().catch(() => !disposed && setStatus('unsupported'));

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      themeObserver?.disconnect();
      globeRef.current?._destructor();
      globeRef.current = null;
      host.replaceChildren();
    };
  }, [from, to, progress, progressLabel, animateIn]);

  return (
    <div className={['fl-globe', className].filter(Boolean).join(' ')} role="img" aria-label={ariaLabel}>
      <div ref={hostRef} className="fl-globe__canvas" />
      {status === 'loading' && <div className="fl-globe__status">地球載入中…</div>}
      {status === 'unsupported' && <div className="fl-globe__status">這個瀏覽器不支援 3D 顯示，進度請看下方數字。</div>}
      {status === 'ready' && <div className="fl-globe__hint" aria-hidden="true">拖曳可轉動地球</div>}
    </div>
  );
}
