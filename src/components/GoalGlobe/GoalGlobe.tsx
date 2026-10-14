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
  /** Text inside the plane marker, e.g. "已存 30%". */
  progressLabel: string;
  /** Fly the camera in on first render. Ignored when the user prefers reduced motion. */
  animateIn?: boolean;
  /**
   * Street-map tiles shown when zoomed in. Defaults to CARTO's dark basemap (OpenStreetMap data).
   * Pass null to keep the dotted globe at every zoom level.
   */
  tileUrl?: ((x: number, y: number, level: number) => string) | null;
  tileAttribution?: string;
  /**
   * Camera framing for the home view. latShift moves the camera south (negative) so the
   * route sits higher on screen, e.g. when a panel covers the lower part of the globe.
   */
  view?: { latShift?: number; lngShift?: number; altitude?: number };
  /** Accessible description of the visual. */
  ariaLabel: string;
  className?: string;
}

/** The globe always sits on the black stage, so its palette is fixed (same in light and dark themes). */
const PALETTE = {
  globe: '#141519',
  land: 'rgba(170, 182, 214, 0.55)',
  landDim: 'rgba(170, 182, 214, 0.12)',
  atmosphere: '#5b7fe0',
  route: 'rgba(242, 241, 238, 0.55)',
  traveled: '#45c9a1',
  destination: '#7c9bff',
};

const cartoDark = (x: number, y: number, level: number) => `https://${'abcd'[(x + y) % 4]}.basemaps.cartocdn.com/dark_all/${level}/${x}/${y}.png`;

const withAlpha = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Camera altitude (in globe radii) below which the street map replaces the dotted globe. */
const MAP_IN = 0.75;
const MAP_OUT = 0.95;
const MIN_ALT = 0.02;
const MAX_ALT = 4;

/**
 * A 3D globe showing a savings goal as a flight: the route from `from` to `to`, the stretch
 * already "flown" (money saved) highlighted, and a plane marker at the current position.
 * Drag to rotate; scroll, pinch or use the buttons to zoom. Close up it becomes a street map.
 */
export function GoalGlobe({
  from,
  to,
  progress,
  progressLabel,
  animateIn = true,
  tileUrl = cartoDark,
  tileAttribution = '© OpenStreetMap contributors © CARTO',
  view,
  ariaLabel,
  className,
}: GoalGlobeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const homeRef = useRef<{ lat: number; lng: number; altitude: number } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unsupported'>('loading');
  const [mapMode, setMapMode] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;

    (async () => {
      const [{ default: Globe }, { feature }, countriesTopo, { geoInterpolate }, THREE] = await Promise.all([
        import('globe.gl'),
        import('topojson-client'),
        import('world-atlas/countries-110m.json'),
        import('d3-geo'),
        import('three'),
      ]);
      if (disposed) return;

      const probe = document.createElement('canvas');
      if (!probe.getContext('webgl2') && !probe.getContext('webgl')) {
        setStatus('unsupported');
        return;
      }

      type Topo = Parameters<typeof feature>[0];
      const topo = countriesTopo as unknown as Topo & { objects: { countries: Parameters<typeof feature>[1] } };
      const countries = (feature(topo, topo.objects.countries) as unknown as { features: object[] }).features;

      const reduce = prefersReducedMotion();
      const globe = new Globe(host, { animateIn: false, rendererConfig: { alpha: true, antialias: true } });
      globeRef.current = globe;

      globe
        .backgroundColor('rgba(0,0,0,0)')
        .globeMaterial(new THREE.MeshPhongMaterial({ color: PALETTE.globe, shininess: 6 }))
        .showAtmosphere(true)
        .atmosphereColor(PALETTE.atmosphere)
        .atmosphereAltitude(0.14)
        .hexPolygonsData(countries)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.45)
        .hexPolygonUseDots(true)
        .hexPolygonColor(() => PALETTE.land)
        .globeTileEngineMaxLevel(16);

      // Route: three-globe's arc shape (cubic Bézier, peak = half the great-circle distance × scale),
      // sampled by arc length so the flown segment, the remaining segment and the plane share one line.
      const ALT_SCALE = 0.45;
      const start: [number, number] = [from.lng, from.lat];
      const end: [number, number] = [to.lng, to.lat];
      const interpolate = geoInterpolate(start, end);
      const rad = Math.PI / 180;
      const dist = Math.acos(
        Math.min(1, Math.sin(start[1] * rad) * Math.sin(end[1] * rad) + Math.cos(start[1] * rad) * Math.cos(end[1] * rad) * Math.cos((end[0] - start[0]) * rad)),
      );
      const peak = (dist / 2) * ALT_SCALE;
      const vec = (lat: number, lng: number, alt: number) => {
        const c = globe.getCoords(lat, lng, alt);
        return new THREE.Vector3(c.x, c.y, c.z);
      };
      const cp = (t: number) => {
        const [lng, lat] = interpolate(t);
        return vec(lat, lng, peak * 1.5);
      };
      const curve = new THREE.CubicBezierCurve3(vec(from.lat, from.lng, 0), cp(0.25), cp(0.75), vec(to.lat, to.lng, 0));
      const p = Math.max(0, Math.min(1, progress));
      const toGeo = (t: number) => {
        const v = curve.getPointAt(t);
        const g = globe.toGeoCoords({ x: v.x, y: v.y, z: v.z });
        return { lat: g.lat, lng: g.lng, alt: Math.max(0.002, g.altitude) };
      };
      const ts = Array.from({ length: 161 }, (_, i) => i / 160);
      const paths = [
        { kind: 'remaining', points: [p, ...ts.filter((t) => t > p)].map(toGeo) },
        ...(p > 0 ? [{ kind: 'traveled', points: [...ts.filter((t) => t < p), p].map(toGeo) }] : []),
      ];
      const planePos = toGeo(p);

      const label = (place: GeoPlace, role: 'from' | 'to') => {
        const el = document.createElement('div');
        el.className = `fl-globe-label fl-globe-label--${role}`;
        const code = document.createElement('strong');
        code.textContent = place.code;
        const city = document.createElement('span');
        city.textContent = place.city;
        el.append(code, city);
        return el;
      };
      const plane = document.createElement('div');
      plane.className = 'fl-globe-plane';
      plane.innerHTML =
        '<svg viewBox="-12 -12 24 24" width="16" height="16" aria-hidden="true"><path d="M10 0c0-1.2-1.2-1.8-2.5-1.8H2L-4-10h-2.5l3.5 8.2h-4.5l-2-2.7h-2L-10 0l-1.5 4.5h2l2-2.7h4.5L-6.5 10H-4l6-8.2h5.5C8.8 1.8 10 1.2 10 0Z" fill="currentColor"/></svg>';
      const planeText = document.createElement('span');
      planeText.textContent = progressLabel;
      plane.append(planeText);

      type PathDatum = { kind: string; points: { lat: number; lng: number; alt: number }[] };
      const traveled = (d: object) => (d as PathDatum).kind === 'traveled';
      globe
        .pathPoints((d: object) => (d as PathDatum).points)
        .pathPointLat('lat')
        .pathPointLng('lng')
        .pathPointAlt('alt')
        .pathResolution(1)
        .pathColor((d: object) => (traveled(d) ? PALETTE.traveled : PALETTE.route))
        .pathStroke((d: object) => (traveled(d) ? 1.8 : 0.7))
        .pathDashLength((d: object) => (traveled(d) ? 1 : 0.025))
        .pathDashGap((d: object) => (traveled(d) ? 0 : 0.016))
        .pathDashAnimateTime(0)
        .pathTransitionDuration(reduce ? 0 : 1200)
        .ringsData([{ lat: to.lat, lng: to.lng }])
        .ringColor(() => (t: number) => withAlpha(PALETTE.destination, 1 - t))
        .ringMaxRadius(3.5)
        .ringPropagationSpeed(1.6)
        .ringRepeatPeriod(reduce ? 0 : 1600)
        .htmlElementsData([
          { lat: from.lat, lng: from.lng, alt: 0.01, el: label(from, 'from') },
          { lat: to.lat, lng: to.lng, alt: 0.01, el: label(to, 'to') },
          { lat: planePos.lat, lng: planePos.lng, alt: planePos.alt, el: plane },
        ])
        .htmlLat('lat')
        .htmlLng('lng')
        .htmlAltitude('alt')
        .htmlElement((d: object) => (d as { el: HTMLElement }).el);

      const controls = globe.controls();
      controls.enableZoom = true;
      controls.enablePan = false;
      controls.rotateSpeed = 0.6;
      controls.zoomSpeed = 0.8;
      const radius = globe.getGlobeRadius();
      controls.minDistance = radius * (1 + MIN_ALT);
      controls.maxDistance = radius * (1 + MAX_ALT);

      // Swap between the dotted globe and the street map as the camera crosses a threshold.
      let inMap = false;
      const onCamera = () => {
        if (!tileUrl) return;
        const alt = globe.pointOfView().altitude;
        // Slow the drag down as we get closer, so the map doesn't spin away.
        controls.rotateSpeed = Math.max(0.05, Math.min(0.6, alt * 0.5));
        if (!inMap && alt < MAP_IN) {
          inMap = true;
          globe.globeTileEngineUrl(tileUrl).hexPolygonColor(() => PALETTE.landDim);
          setMapMode(true);
        } else if (inMap && alt > MAP_OUT) {
          inMap = false;
          globe.globeTileEngineUrl(null as unknown as (x: number, y: number, l: number) => string).hexPolygonColor(() => PALETTE.land);
          setMapMode(false);
        }
      };
      controls.addEventListener('change', onCamera);

      const size = () => globe.width(host.clientWidth).height(host.clientHeight);
      size();
      resizeObserver = new ResizeObserver(size);
      resizeObserver.observe(host);

      const [midLng, midLat] = interpolate(0.42);
      const home = {
        lat: midLat + (view?.latShift ?? -12),
        lng: midLng + (view?.lngShift ?? 4),
        altitude: view?.altitude ?? (host.clientWidth < 560 ? 1.9 : 2.7),
      };
      homeRef.current = home;
      if (animateIn && !reduce) {
        globe.pointOfView({ lat: home.lat - 40, lng: home.lng + 120, altitude: 4 }, 0);
        requestAnimationFrame(() => {
          if (disposed) return;
          globe.pointOfView(home, 2400);
          window.setTimeout(() => !disposed && globe.pathsData(paths), 1500);
        });
      } else {
        globe.pointOfView(home, 0);
        globe.pathsData(paths);
      }
      setStatus('ready');
    })().catch(() => !disposed && setStatus('unsupported'));

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      globeRef.current?._destructor();
      globeRef.current = null;
      host.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- view is read once for the initial framing
  }, [from, to, progress, progressLabel, animateIn, tileUrl]);

  const zoom = (factor: number) => {
    const g = globeRef.current;
    if (!g) return;
    const pov = g.pointOfView();
    g.pointOfView({ ...pov, altitude: Math.min(MAX_ALT, Math.max(MIN_ALT, pov.altitude * factor)) }, prefersReducedMotion() ? 0 : 500);
  };
  const flyTo = (place: GeoPlace) => globeRef.current?.pointOfView({ lat: place.lat, lng: place.lng, altitude: 0.08 }, prefersReducedMotion() ? 0 : 1600);
  const goHome = () => homeRef.current && globeRef.current?.pointOfView(homeRef.current, prefersReducedMotion() ? 0 : 1200);

  return (
    <div className={['fl-globe', className].filter(Boolean).join(' ')}>
      <div ref={hostRef} className="fl-globe__canvas" role="img" aria-label={ariaLabel} />
      {status === 'loading' && <div className="fl-globe__status">地球載入中…</div>}
      {status === 'unsupported' && <div className="fl-globe__status">這個瀏覽器不支援 3D 顯示，進度請看旁邊的數字。</div>}
      {status === 'ready' && (
        <>
          <div className="fl-globe__controls" role="group" aria-label="地球檢視">
            <button type="button" onClick={() => zoom(0.55)} aria-label="放大">
              ＋
            </button>
            <button type="button" onClick={() => zoom(1.8)} aria-label="縮小">
              －
            </button>
            <button type="button" onClick={goHome} aria-label="回到整條航線" title="回到整條航線">
              ⌂
            </button>
          </div>
          <div className="fl-globe__jumps">
            <button type="button" onClick={() => flyTo(from)}>
              看 {from.city}
            </button>
            <button type="button" onClick={() => flyTo(to)}>
              看 {to.city}
            </button>
          </div>
          <div className="fl-globe__hint" aria-hidden="true">
            {mapMode ? tileAttribution : '拖曳轉動 · 滾輪或雙指縮放'}
          </div>
        </>
      )}
    </div>
  );
}
