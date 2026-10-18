import { shuffle } from '../shared/utils';
import { spectra } from './spectra';
import type { Spectrum } from './spectra';

export type Team = 1 | 2;
export type Side = 'left' | 'right';
export type Phase = 'ready' | 'clue' | 'handoff' | 'guess' | 'opponent' | 'reveal' | 'paused' | 'finished';
export interface Settings { mode: 'points' | 'rounds'; goal: number; rounds: number; seconds: number; startingTeam: Team | 'random' }
export const defaultSettings: Settings = { mode: 'points', goal: 10, rounds: 3, seconds: 0, startingTeam: 'random' };
export interface Turn {
  team: Team; spectrum: Spectrum; clue: string; target: number; guess: number; side: Side;
  main: number; bonus: number; overtime: boolean;
}
export interface Match {
  settings: Settings; startingTeam: Team; team: Team; phase: Phase; pausedFrom: Phase | null;
  deck: Spectrum[]; completed: Turn[]; target: number | null; guess: number; clue: string; side: Side | null;
  remainingMs: number; deadline: number | null;
  // A tied race gets a pair of extra turns, then another pair if still tied.
  overtimeTurns: number | null;
}
export type Action =
  | { type: 'VIEW'; target: number }
  | { type: 'CLUE'; value: string }
  | { type: 'HIDE' | 'CONFIRM' | 'RESET' }
  | { type: 'BEGIN' | 'TICK' | 'LOCK' | 'PAUSE' | 'RESUME'; now: number }
  | { type: 'GUESS'; value: number; now: number }
  | { type: 'SIDE'; side: Side }
  | { type: 'REVEAL' };

export const otherTeam = (team: Team): Team => team === 1 ? 2 : 1;
export const currentSpectrum = (match: Match) => match.deck[match.completed.length % match.deck.length];
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
export const drawTarget = (random = Math.random) => Math.min(100, Math.floor(random() * 101));

// Digital house bands on the 0–100 dial; boundaries favor the higher score.
export function pointsFor(target: number, guess: number) {
  const distance = Math.abs(target - guess);
  return distance <= 3 ? 4 : distance <= 7 ? 3 : distance <= 11 ? 2 : 0;
}
export function turnPoints(match: Pick<Match, 'target' | 'guess' | 'side'>) {
  if (match.target === null) return { main: 0, bonus: 0 };
  const main = pointsFor(match.target, match.guess);
  const correctSide = match.target < match.guess ? 'left' : match.target > match.guess ? 'right' : null;
  return { main, bonus: main !== 4 && match.side === correctSide && correctSide !== null ? 1 : 0 };
}
export const openingScore = (match: Pick<Match, 'settings' | 'startingTeam'>, team: Team) =>
  match.settings.mode === 'points' && team !== match.startingTeam ? 1 : 0;
export const totalFor = (match: Pick<Match, 'settings' | 'startingTeam' | 'completed'>, team: Team) =>
  openingScore(match, team) + match.completed.reduce((total, turn) => total + (turn.team === team ? turn.main : turn.bonus), 0);

export function createMatch(settings: Settings, random = Math.random): Match {
  const startingTeam = settings.startingTeam === 'random' ? random() < .5 ? 1 : 2 : settings.startingTeam;
  return { settings: { ...settings }, startingTeam, team: startingTeam, phase: 'ready', pausedFrom: null,
    deck: shuffle(spectra, random), completed: [], target: null, guess: 50, clue: '', side: null,
    remainingMs: settings.seconds * 1000, deadline: null, overtimeTurns: null };
}

export function confirmTurn(match: Match): Match {
  if (match.phase !== 'reveal' || match.target === null || !match.side) return match;
  const points = turnPoints(match);
  const turn: Turn = { team: match.team, spectrum: currentSpectrum(match), clue: match.clue, target: match.target,
    guess: match.guess, side: match.side, ...points, overtime: match.overtimeTurns !== null };
  const scored = { ...match, completed: [...match.completed, turn] };
  const first = totalFor(scored, 1), second = totalFor(scored, 2);
  let finished = false;
  let overtimeTurns = match.overtimeTurns;
  if (match.settings.mode === 'rounds') {
    finished = scored.completed.length >= match.settings.rounds * 2;
  } else if (overtimeTurns !== null) {
    overtimeTurns++;
    if (overtimeTurns === 2) {
      finished = first !== second;
      overtimeTurns = 0;
    }
  } else if (Math.max(first, second) >= match.settings.goal) {
    if (first === second) overtimeTurns = 0;
    else finished = true;
  }
  const catchUp = match.settings.mode === 'points' && overtimeTurns === null && points.main === 4 &&
    totalFor(scored, match.team) < totalFor(scored, otherTeam(match.team));
  return { ...scored, phase: finished ? 'finished' : 'ready', pausedFrom: null,
    team: finished || catchUp ? match.team : otherTeam(match.team), target: null, guess: 50, clue: '', side: null,
    remainingMs: match.settings.seconds * 1000, deadline: null, overtimeTurns };
}

const lockGuess = (match: Match): Match => ({ ...match, phase: 'opponent', remainingMs: 0, deadline: null });
export function reduceMatch(match: Match, action: Action): Match {
  if (match.phase === 'finished') return match;
  switch (action.type) {
    case 'VIEW':
      return match.phase === 'ready' && Number.isFinite(action.target) ? { ...match, phase: 'clue', target: clamp(action.target) } : match;
    case 'CLUE':
      return match.phase === 'clue' ? { ...match, clue: action.value.slice(0, 80) } : match;
    case 'HIDE':
      return match.phase === 'clue' && match.clue.trim() ? { ...match, phase: 'handoff', clue: match.clue.trim() } : match;
    case 'BEGIN':
      return match.phase === 'handoff' ? { ...match, phase: 'guess', deadline: match.settings.seconds ? action.now + match.remainingMs : null } : match;
    case 'GUESS':
      if (match.phase !== 'guess' || !Number.isFinite(action.value)) return match;
      if (match.deadline !== null && action.now >= match.deadline) return lockGuess(match);
      return { ...match, guess: clamp(action.value) };
    case 'TICK':
      if (match.phase !== 'guess' || match.deadline === null) return match;
      return action.now >= match.deadline ? lockGuess(match) : { ...match, remainingMs: match.deadline - action.now };
    case 'LOCK': return match.phase === 'guess' ? lockGuess(match) : match;
    case 'SIDE': return match.phase === 'opponent' && (action.side === 'left' || action.side === 'right') ? { ...match, side: action.side } : match;
    case 'REVEAL': return match.phase === 'opponent' && match.side ? { ...match, phase: 'reveal' } : match;
    case 'CONFIRM': return confirmTurn(match);
    case 'PAUSE': {
      if (match.phase === 'paused') return match;
      const remainingMs = match.phase === 'guess' && match.deadline !== null ? Math.max(0, match.deadline - action.now) : match.remainingMs;
      if (match.phase === 'guess' && match.deadline !== null && !remainingMs) return lockGuess(match);
      return { ...match, phase: 'paused', pausedFrom: match.phase, remainingMs, deadline: null };
    }
    case 'RESUME':
      return match.phase === 'paused' && match.pausedFrom ? { ...match, phase: match.pausedFrom, pausedFrom: null,
        deadline: match.pausedFrom === 'guess' && match.settings.seconds ? action.now + match.remainingMs : null } : match;
    case 'RESET':
      return { ...match, phase: 'ready', pausedFrom: null, target: null, clue: '', guess: 50, side: null,
        remainingMs: match.settings.seconds * 1000, deadline: null };
  }
}
