import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { GameAudio } from '../shared/audio';
import { cueBetween } from '../shared/utils';
import { createMatch, defaultSettings, drawTarget, reduceMatch } from './engine';
import type { Action, Match, Settings } from './engine';

type SessionAction = Action | { type: 'NEW'; settings: Settings } | { type: 'CLEAR' };
const Context = createContext<{
  match: Match | null; dispatch: Dispatch<SessionAction>; settings: Settings; setSettings: (settings: Settings) => void;
  viewTarget: () => void; muted: boolean; toggleSound: () => void;
} | null>(null);

export function WavelengthProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [muted, setMuted] = useState(false);
  const [match, dispatch] = useReducer((state: Match | null, action: SessionAction) => {
    if (action.type === 'NEW') return createMatch(action.settings);
    if (action.type === 'CLEAR') return null;
    return state ? reduceMatch(state, action) : null;
  }, null);
  const location = useLocation();
  const audio = useRef<GameAudio | null>(null);
  const previousSeconds = useRef(0);
  useEffect(() => {
    const player = new GameAudio(); audio.current = player;
    return () => { player.close(); audio.current = null; };
  }, []);
  useEffect(() => { audio.current?.setMuted(muted); }, [muted]);
  useEffect(() => {
    if (!location.pathname.startsWith('/wavelength')) dispatch({ type: 'CLEAR' });
  }, [location.pathname]);
  useEffect(() => {
    // A new ready match can render before navigation from Settings commits.
    // It contains no private target yet, so only active stages need covering.
    if (!match || match.phase === 'ready' || match.phase === 'finished' || match.phase === 'paused') return;
    if (location.pathname !== '/wavelength/play') { dispatch({ type: 'PAUSE', now: performance.now() }); return; }
    const onHidden = () => { if (document.hidden) dispatch({ type: 'PAUSE', now: performance.now() }); };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, [match?.phase, location.pathname]);
  useEffect(() => {
    if (match?.phase !== 'guess' || !match.settings.seconds) return;
    const timer = window.setInterval(() => dispatch({ type: 'TICK', now: performance.now() }), 80);
    return () => clearInterval(timer);
  }, [match?.phase, match?.settings.seconds]);
  useEffect(() => {
    if (!match) return;
    const seconds = Math.ceil(match.remainingMs / 1000);
    if (match.phase === 'handoff' || match.phase === 'ready') previousSeconds.current = seconds;
    if (match.phase === 'guess' || match.phase === 'opponent') {
      if (match.settings.seconds) {
        const cue = cueBetween(previousSeconds.current, seconds);
        if (cue) audio.current?.play(cue);
      }
      previousSeconds.current = seconds;
    }
    if (match.phase === 'paused') audio.current?.stop();
  }, [match]);
  return <Context.Provider value={{ match, dispatch, settings, setSettings,
    viewTarget: () => { audio.current?.unlock(); dispatch({ type: 'VIEW', target: drawTarget() }); }, muted,
    toggleSound: () => { audio.current?.unlock(); setMuted(value => !value); } }}>{children}</Context.Provider>;
}
export function useWavelength() {
  const value = useContext(Context);
  if (!value) throw new Error('Wavelength screens need WavelengthProvider');
  return value;
}
