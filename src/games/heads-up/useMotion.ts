import { useCallback, useEffect, useRef, useState } from 'react';
import { screenElevation, TiltDetector } from './gestures';

export type MotionStatus = 'idle' | 'requesting' | 'waiting' | 'ready' | 'denied' | 'unavailable' | 'insecure';
type PermissionConstructor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

export function useMotion(active: boolean, onGesture: (outcome: 'correct' | 'skipped') => void, onLost: () => void, monitor = true) {
  const [status, setStatus] = useState<MotionStatus>('idle');
  const [listening, setListening] = useState(false);
  const [upright, setUpright] = useState(false);
  const detector = useRef(new TiltDetector());
  const lastData = useRef(0);
  const hasData = useRef(false);
  const stale = useRef(false);
  const monitoring = useRef(monitor); monitoring.current = monitor;
  const callback = useRef(onGesture); callback.current = onGesture;
  const lost = useRef(onLost); lost.current = onLost;
  const generation = useRef(0);
  const reset = useCallback(() => detector.current.reset(), []);
  const enable = useCallback(async () => {
    const attempt = ++generation.current;
    if (!window.isSecureContext) { setStatus('insecure'); return; }
    const constructor = window.DeviceOrientationEvent as PermissionConstructor | undefined;
    if (!constructor) { setStatus('unavailable'); return; }
    setStatus('requesting');
    try {
      // Called directly from the Enable motion click, preserving user activation.
      const permission = typeof constructor.requestPermission === 'function' ? await constructor.requestPermission() : 'granted';
      if (generation.current !== attempt) return;
      if (permission !== 'granted') { setStatus('denied'); return; }
      reset(); hasData.current = false; stale.current = false;
      lastData.current = performance.now(); setUpright(false); setStatus('waiting'); setListening(true);
    } catch { if (generation.current === attempt) setStatus('denied'); }
  }, [reset]);
  const disable = useCallback(() => {
    generation.current++; setListening(false); setStatus('idle'); setUpright(false); reset();
  }, [reset]);
  useEffect(() => {
    if (!active || !listening) return;
    reset(); lastData.current = performance.now();
    const sample = (event: DeviceOrientationEvent) => {
      if (document.hidden) return;
      const elevation = screenElevation(event.beta, event.gamma);
      if (elevation === null) return;
      hasData.current = true; stale.current = false;
      lastData.current = performance.now(); setStatus('ready'); setUpright(Math.abs(elevation) <= 18);
      const outcome = detector.current.sample(elevation, lastData.current);
      if (outcome) callback.current(outcome);
    };
    const watchdog = window.setInterval(() => {
      if (document.hidden) { reset(); lastData.current = performance.now(); return; }
      // A stationary phone may stop emitting events while players read the rules.
      // Keep listening so the next tilt can recover without another permission prompt.
      if (hasData.current && !monitoring.current) { lastData.current = performance.now(); return; }
      if (!stale.current && performance.now() - lastData.current > 3000) {
        stale.current = true; setStatus('unavailable'); reset(); lost.current();
      }
    }, 500);
    window.addEventListener('deviceorientation', sample);
    return () => { window.removeEventListener('deviceorientation', sample); clearInterval(watchdog); reset(); };
  }, [active, listening, reset]);
  useEffect(() => () => { generation.current++; }, []);
  return { status, upright, enable, disable, reset };
}
