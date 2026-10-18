import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { GameAudio } from '../shared/audio';
import { cueBetween } from '../shared/utils';
import { createMatch, defaultSettings, reduceMatch } from './engine';
import type { Action, Match, Settings } from './engine';
import { detectDevice } from './gestures';
import type { DeviceMode } from './gestures';
import { useMotion } from './useMotion';

type SessionAction = Action | { type: 'NEW'; settings: Settings } | { type: 'CLEAR' };
interface ContextValue {
  match: Match | null; dispatch: Dispatch<SessionAction>; settings: Settings; setSettings: (settings: Settings) => void;
  device: DeviceMode; chooseDevice: (device: DeviceMode) => void; controls: 'motion' | 'buttons'; useButtons: () => void;
  motion: ReturnType<typeof useMotion>; practice: { correct: boolean; skipped: boolean }; landscape: boolean;
  muted: boolean; toggleSound: () => void; unlockAudio: () => void;
  setAssistedPlay: (enabled: boolean) => void;
}
const Context = createContext<ContextValue | null>(null);

export function HeadsUpProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<DeviceMode>(detectDevice);
  const [controls, setControls] = useState<'motion' | 'buttons'>(() => detectDevice() === 'phone' ? 'motion' : 'buttons');
  const [landscape, setLandscape] = useState(() => window.innerWidth > window.innerHeight);
  const [practice, setPractice] = useState({ correct: false, skipped: false });
  const [settings, setSettings] = useState(defaultSettings);
  const [muted, setMuted] = useState(false);
  const [match, dispatch] = useReducer((state: Match | null, action: SessionAction) => {
    if (action.type === 'NEW') return createMatch(action.settings);
    if (action.type === 'CLEAR') return null;
    return state ? reduceMatch(state, action) : null;
  }, null);
  const location = useLocation();
  const inside = location.pathname.startsWith('/heads-up');
  const motion = useMotion(inside && device === 'phone' && controls === 'motion', outcome => {
    if (location.pathname === '/heads-up/setup') setPractice(value => ({ ...value, [outcome]: true }));
    if (location.pathname === '/heads-up/play' && match?.phase === 'playing' && landscape) dispatch({ type: 'RECORD', outcome, now: performance.now() });
  }, () => dispatch({ type: 'PAUSE', now: performance.now() }));
  const audio = useRef<GameAudio | null>(null);
  const previousSeconds = useRef(settings.seconds);
  useEffect(() => {
    const player = new GameAudio(); audio.current = player;
    return () => { player.close(); audio.current = null; };
  }, []);
  useEffect(() => { audio.current?.setMuted(muted); }, [muted]);
  useEffect(() => {
    const update = () => setLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  useEffect(() => {
    if (!inside) { dispatch({ type: 'CLEAR' }); motion.disable(); }
  }, [inside, motion.disable]);
  useEffect(() => { motion.reset(); }, [match?.phase, match?.completed.length, motion.reset]);
  useEffect(() => {
    if (match?.phase !== 'playing' && match?.phase !== 'countdown') return;
    if (location.pathname !== '/heads-up/play' || (device === 'phone' && !landscape) || (controls === 'motion' && motion.status !== 'ready')) {
      dispatch({ type: 'PAUSE', now: performance.now() }); return;
    }
    const timer = window.setInterval(() => dispatch({ type: 'TICK', now: performance.now() }), 80);
    const onHidden = () => { if (document.hidden) dispatch({ type: 'PAUSE', now: performance.now() }); };
    document.addEventListener('visibilitychange', onHidden);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onHidden); };
  }, [match?.phase, location.pathname, device, landscape, controls, motion.status]);
  useEffect(() => {
    if (!match) return;
    const seconds = Math.ceil(match.remainingMs / 1000);
    if (match.phase === 'ready') previousSeconds.current = match.settings.seconds;
    if (match.phase === 'playing' || match.phase === 'reviewing') {
      const cue = cueBetween(previousSeconds.current, seconds);
      if (cue) audio.current?.play(cue);
      previousSeconds.current = seconds;
    }
    if (match.phase === 'paused') audio.current?.stop();
  }, [match]);
  function chooseDevice(next: DeviceMode) {
    dispatch({ type: 'PAUSE', now: performance.now() });
    motion.disable(); setPractice({ correct: false, skipped: false }); setDevice(next); setControls(next === 'phone' ? 'motion' : 'buttons');
    if (next === 'phone') setSettings(value => ({ ...value, assistedPlay: false }));
  }
  function setAssistedPlay(enabled: boolean) {
    setSettings(value => ({ ...value, assistedPlay: enabled }));
    if (enabled) motion.disable();
    setControls(enabled || device === 'keyboard' ? 'buttons' : 'motion');
    dispatch({ type: 'PAUSE', now: performance.now() });
  }
  return <Context.Provider value={{ match, dispatch, settings, setSettings, device, chooseDevice, controls,
    setAssistedPlay, useButtons: () => setAssistedPlay(true),
    motion, practice, landscape, muted, toggleSound: () => { audio.current?.unlock(); setMuted(value => !value); }, unlockAudio: () => audio.current?.unlock() }}>{children}</Context.Provider>;
}
export function useHeadsUp() {
  const value = useContext(Context);
  if (!value) throw new Error('Heads Up screens need HeadsUpProvider');
  return value;
}
