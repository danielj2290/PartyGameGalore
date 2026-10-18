import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { createMatch, cueBetween, defaultSettings, reduceMatch } from './engine';
import type { Action, Match, Settings } from './engine';
import { GameAudio } from './audio';

type SessionAction = Action | { type: 'NEW'; settings: Settings } | { type: 'CLEAR' };
const Context = createContext<{
  match: Match | null; dispatch: Dispatch<SessionAction>; settings: Settings;
  setSettings: (settings: Settings) => void; muted: boolean; toggleSound: () => void; unlockAudio: () => void;
} | null>(null);

export function CharadesProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [muted, setMuted] = useState(false);
  const [match, dispatch] = useReducer((state: Match | null, action: SessionAction) => {
    if (action.type === 'NEW') return createMatch(action.settings);
    if (action.type === 'CLEAR') return null;
    return state ? reduceMatch(state, action) : null;
  }, null);
  const audio = useRef<GameAudio | null>(null);
  const previousSeconds = useRef(settings.seconds);
  const location = useLocation();
  // Clear after the home route commits; clearing on the old play route can
  // trigger its missing-match redirect before navigation finishes.
  useEffect(() => {
    if (location.pathname === '/') dispatch({ type: 'CLEAR' });
  }, [location.pathname]);
  useEffect(() => {
    const player = new GameAudio(); audio.current = player;
    return () => { player.close(); audio.current = null; };
  }, []);
  useEffect(() => { audio.current?.setMuted(muted); }, [muted]);
  useEffect(() => {
    if (match?.phase !== 'playing') return;
    if (location.pathname !== '/charades/play') { dispatch({ type: 'PAUSE', now: performance.now() }); return; }
    const timer = window.setInterval(() => dispatch({ type: 'TICK', now: performance.now() }), 80);
    const onHidden = () => { if (document.hidden) dispatch({ type: 'PAUSE', now: performance.now() }); };
    document.addEventListener('visibilitychange', onHidden);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onHidden); };
  }, [match?.phase, location.pathname]);
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
  return <Context.Provider value={{ match, dispatch, settings, setSettings, muted,
    toggleSound: () => { audio.current?.unlock(); setMuted(value => !value); },
    unlockAudio: () => audio.current?.unlock() }}>{children}</Context.Provider>;
}

export function useCharades() {
  const value = useContext(Context);
  if (!value) throw new Error('Charades screens need CharadesProvider');
  return value;
}
