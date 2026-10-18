import { shuffle } from '../shared/utils';
import { getCategoryWords } from './categories';
import type { CategoryId, Prompt } from './categories';

export interface Settings { mode: 'teams' | 'ffa'; players: number; seconds: number; category: CategoryId; assistedPlay: boolean }
export const defaultSettings: Settings = { mode: 'teams', players: 4, seconds: 60, category: 'starter', assistedPlay: false };
export interface Participant { id: string; label: string; color: string }
export interface Entry { word: Prompt; outcome: 'correct' | 'skipped' | 'unanswered' }
export interface Turn { participant: string; round: number; entries: Entry[] }
export type Phase = 'ready' | 'countdown' | 'playing' | 'paused' | 'reviewing' | 'finished';
export interface Match {
  settings: Settings; participants: Participant[]; schedule: { participant: string; round: number }[];
  phase: Phase; completed: Turn[]; entries: Entry[]; deck: Prompt[]; remainingMs: number; countdownMs: number; deadline: number | null;
}
export type Action = { type: 'ARM' | 'TICK' | 'PAUSE' | 'RESUME'; now: number }
  | { type: 'RECORD'; outcome: 'correct' | 'skipped'; now: number }
  | { type: 'CORRECT'; index: number; outcome: Entry['outcome'] }
  | { type: 'RESET' | 'CONFIRM' };

export const teamRounds = (players: number) => Math.ceil(players / 2);
export function createMatch(settings: Settings, random = Math.random): Match {
  const minimum = settings.mode === 'teams' ? 4 : 2;
  if (!Number.isInteger(settings.players) || settings.players < minimum || settings.players > 20 || ![30, 60, 90, 120].includes(settings.seconds)) throw new Error('Invalid Heads Up settings');
  const participants: Participant[] = settings.mode === 'teams'
    ? [{ id: 'team-1', label: 'Team 1', color: '#F7A1E3' }, { id: 'team-2', label: 'Team 2', color: '#4C8DFF' }]
    : Array.from({ length: settings.players }, (_, i) => ({ id: `player-${i + 1}`, label: `Player ${i + 1}`, color: i === 0 ? '#F7A1E3' : i === 1 ? '#4C8DFF' : `hsl(${Math.round(i * 137.508) % 360} 80% 75%)` }));
  const schedule = settings.mode === 'teams'
    ? Array.from({ length: teamRounds(settings.players) }, (_, i) => participants.map(person => ({ participant: person.id, round: i + 1 }))).flat()
    : participants.map((person, i) => ({ participant: person.id, round: i + 1 }));
  return { settings: { ...settings }, participants, schedule, phase: 'ready', completed: [], entries: [], deck: shuffle(getCategoryWords(settings.category), random), remainingMs: settings.seconds * 1000, countdownMs: 3000, deadline: null };
}
export const activeParticipant = (match: Match) => match.participants.find(person => person.id === match.schedule[Math.min(match.completed.length, match.schedule.length - 1)].participant)!;
export const score = (entries: Entry[]) => entries.filter(entry => entry.outcome === 'correct').length;
export const totalFor = (match: Match, id: string) => match.completed.filter(turn => turn.participant === id).reduce((total, turn) => total + score(turn.entries), 0);
function draw(match: Match) {
  const deck = match.deck.length ? [...match.deck] : shuffle(getCategoryWords(match.settings.category));
  const previous = match.entries.at(-1)?.word.id ?? match.completed.at(-1)?.entries.at(-1)?.word.id;
  if (deck.length > 1 && deck[0].id === previous) [deck[0], deck[1]] = [deck[1], deck[0]];
  return { word: deck[0], deck: deck.slice(1) };
}
function advanceClock(match: Match, now: number): Match {
  if (match.deadline === null) return match;
  if (match.phase === 'countdown') {
    if (now < match.deadline) return { ...match, countdownMs: match.deadline - now };
    const { word, deck } = draw(match);
    return { ...match, phase: 'playing', deck, countdownMs: 0, entries: [{ word, outcome: 'unanswered' }], deadline: now + match.remainingMs };
  }
  if (match.phase !== 'playing') return match;
  const remainingMs = Math.max(0, match.deadline - now);
  return { ...match, remainingMs, ...(remainingMs === 0 ? { phase: 'reviewing' as const, deadline: null } : {}) };
}
export function reduceMatch(match: Match, action: Action): Match {
  switch (action.type) {
    case 'ARM': return match.phase === 'ready' ? { ...match, phase: 'countdown', countdownMs: 3000, deadline: action.now + 3000 } : match;
    case 'TICK': return advanceClock(match, action.now);
    case 'PAUSE': {
      if (match.phase === 'countdown') return { ...match, phase: 'ready', deadline: null };
      const updated = advanceClock(match, action.now);
      return updated.phase === 'playing' ? { ...updated, phase: 'paused', deadline: null } : updated;
    }
    case 'RESUME': return match.phase === 'paused' ? { ...match, phase: 'playing', deadline: action.now + match.remainingMs } : match;
    case 'RECORD': {
      // Never let a key held during the handoff create an answer on the first word.
      if (match.phase !== 'playing') return match;
      const updated = advanceClock(match, action.now);
      if (updated.phase !== 'playing') return updated;
      const { word, deck } = draw(updated);
      return { ...updated, deck, entries: [...updated.entries.map((entry, i) => i === updated.entries.length - 1 ? { ...entry, outcome: action.outcome } : entry), { word, outcome: 'unanswered' }] };
    }
    case 'CORRECT': return match.phase === 'reviewing' ? { ...match, entries: match.entries.map((entry, i) => i === action.index ? { ...entry, outcome: action.outcome } : entry) } : match;
    case 'CONFIRM': {
      if (match.phase !== 'reviewing') return match;
      const slot = match.schedule[match.completed.length];
      const completed = [...match.completed, { ...slot, entries: match.entries }];
      return { ...match, completed, entries: [], phase: completed.length === match.schedule.length ? 'finished' : 'ready', remainingMs: match.settings.seconds * 1000, deadline: null };
    }
    case 'RESET': {
      if (!['playing', 'paused', 'countdown'].includes(match.phase)) return match;
      const used = new Set(match.completed.flatMap(turn => turn.entries.map(entry => entry.word.id)));
      return { ...match, phase: 'ready', entries: [], deck: shuffle(getCategoryWords(match.settings.category).filter(word => !used.has(word.id))), remainingMs: match.settings.seconds * 1000, deadline: null };
    }
  }
}
