import { Component, lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChromeFallback } from './ChromeFallback';
import styles from './DiscoBall.module.css';

const DiscoBallScene = lazy(() => import('./DiscoBallScene'));

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window.matchMedia === 'function' && window.matchMedia(query).matches);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <ChromeFallback /> : this.props.children; }
}

export function DiscoBall() {
  const fixture = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const chain = useRef<HTMLDivElement>(null);
  const [webGL, setWebGL] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const mobile = useMediaQuery('(max-width: 700px), (pointer: coarse)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  useLayoutEffect(() => {
    let disposed = false;
    const measure = () => {
      if (disposed || !viewport.current || !chain.current) return;
      // Measure the original position so repeated resizes never accumulate lift.
      viewport.current.style.transform = 'none';
      const bounds = viewport.current.getBoundingClientRect();
      const lift = Math.max(0, bounds.top) / 2;
      viewport.current.style.transform = `translateY(-${lift}px)`;
      fixture.current?.style.setProperty('--ball-lift', `${lift}px`);
      // Let the title and game grid follow the ball by the same distance.
      fixture.current?.closest('main')?.style.setProperty('--disco-lift', `${lift}px`);
      chain.current.style.left = `${bounds.left + bounds.width / 2}px`;
      // Continue underneath the opaque ball. Its silhouette hides the excess,
      // so the visible chain meets the facets even with transparent canvas padding.
      chain.current.style.height = `${Math.max(0, bounds.top - lift + bounds.height / 2)}px`;
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    for (const target of [viewport.current, fixture.current?.parentElement?.parentElement, document.body]) {
      if (target) observer?.observe(target);
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    void document.fonts?.ready.then(measure);
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
    };
  }, []);
  useEffect(() => {
    // Skip the renderer entirely in browsers without WebGL 2 (including jsdom).
    setWebGL(typeof window.WebGL2RenderingContext !== 'undefined');
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      setOnScreen(entries[0]?.isIntersecting ?? false);
    }, { rootMargin: '100px' });
    if (fixture.current) observer?.observe(fixture.current);
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  return <div ref={fixture} className={styles.fixture} aria-hidden="true">
    <div className={styles.spotlights} style={{ animationPlayState: onScreen && pageVisible && !reducedMotion ? 'running' : 'paused' }}>
      <i className={styles.beam} /><i className={styles.beam} />
      <i className={styles.beam} /><i className={styles.beam} />
    </div>
    <div ref={chain} className={styles.chain} />
    <div ref={viewport} className={styles.viewport}>
      <SceneBoundary><Suspense fallback={<ChromeFallback />}>
        {webGL ? <DiscoBallScene mobile={mobile} reducedMotion={reducedMotion} active={onScreen && pageVisible} /> : <ChromeFallback />}
      </Suspense></SceneBoundary>
    </div>
  </div>;
}
