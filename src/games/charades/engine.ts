import { shuffle } from '../shared/utils';
export { shuffle, cueBetween } from '../shared/utils';
import { words } from './words';
import type { Difficulty, Word } from './words';

export type Team = 1 | 2;
export type Outcome = 'correct' | 'skipped' | 'unanswered';
export type Phase = 'ready' | 'playing' | 'paused' | 'reviewing' | 'finished';
export interface Settings { seconds: number; skips: number | null; difficulty: Difficulty; rounds: number; startingTeam: Team | 'random' }
export const defaultSettings: Settings = { seconds: 60, skips: null, difficulty: 'easy', rounds: 3, startingTeam: 'random' };
export interface Entry { word: Word; outcome: Outcome }
export interface Turn { team: Team; round: number; entries: Entry[] }
export interface Match {
  settings: Settings; startingTeam: Team; phase: Phase; completed: Turn[];
  entries: Entry[]; deck: Word[]; remainingMs: number; deadline: number | null;
}
export type Action =
  | { type: 'START' | 'TICK' | 'PAUSE' | 'RESUME'; now: number }
  | { type: 'RECORD'; outcome: 'correct' | 'skipped'; now: number }
  | { type: 'CORRECT'; index: number; outcome: Outcome }
  | { type: 'RESET' | 'CONFIRM' };


export function createMatch(settings: Settings, random = Math.random): Match {
  return { settings: { ...settings }, startingTeam: settings.startingTeam === 'random' ? (random() < .5 ? 1 : 2) : settings.startingTeam,
    phase: 'ready', completed: [], entries: [], deck: shuffle(words.filter(word => word.difficulty === settings.difficulty), random),
    remainingMs: settings.seconds * 1000, deadline: null };
}
export const score = (entries: Entry[]) => entries.filter(entry => entry.outcome === 'correct').length;
export const roundNumber = (match: Match) => Math.floor(match.completed.length / 2) + 1;
export const activeTeam = (match: Match): Team => match.completed.length % 2 === 0 ? match.startingTeam : match.startingTeam === 1 ? 2 : 1;
export const skipsUsed = (match: Match) => match.entries.filter(entry => entry.outcome === 'skipped').length;
export const totalFor = (match: Match, team: Team) => match.completed.filter(turn => turn.team === team).reduce((total, turn) => total + score(turn.entries), 0);

function draw(match: Match): { word: Word; deck: Word[] } {
  let deck = match.deck;
  if (!deck.length) {
    deck = shuffle(words.filter(word => word.difficulty === match.settings.difficulty));
    const previous = match.entries.at(-1)?.word.id;
    if (deck.length > 1 && deck[0].id === previous) [deck[0], deck[1]] = [deck[1], deck[0]];
  }
  return { word: deck[0], deck: deck.slice(1) };
}

export function advanceClock(match: Match, now: number): Match {
  if (match.phase !== 'playing' || match.deadline === null) return match;
  const remainingMs = Math.max(0, match.deadline - now);
  return { ...match, remainingMs, ...(remainingMs === 0 ? { phase: 'reviewing' as const, deadline: null } : {}) };
}

export function reduceMatch(match: Match, action: Action): Match {
  switch (action.type) {
    case 'START': {
      if (match.phase !== 'ready') return match;
      const { word, deck } = draw(match);
      return { ...match, deck, phase: 'playing', entries: [{ word, outcome: 'unanswered' }], deadline: action.now + match.remainingMs };
    }
    case 'TICK': return advanceClock(match, action.now);
    case 'PAUSE': {
      const updated = advanceClock(match, action.now);
      return updated.phase === 'playing' ? { ...updated, phase: 'paused', deadline: null } : updated;
    }
    case 'RESUME':
      return match.phase === 'paused' ? { ...match, phase: 'playing', deadline: action.now + match.remainingMs } : match;
    case 'RECORD': {
      const updated = advanceClock(match, action.now);
      if (updated.phase !== 'playing') return updated;
      if (action.outcome === 'skipped' && updated.settings.skips !== null && skipsUsed(updated) >= updated.settings.skips) return updated;
      const { word, deck } = draw(updated);
      const entries = updated.entries.map((entry, index) => index === updated.entries.length - 1 ? { ...entry, outcome: action.outcome } : entry);
      return { ...updated, deck, entries: [...entries, { word, outcome: 'unanswered' }] };
    }
    case 'CORRECT':
      if (match.phase !== 'reviewing') return match;
      return { ...match, entries: match.entries.map((entry, index) => index === action.index ? { ...entry, outcome: action.outcome } : entry) };
    case 'RESET': {
      if (match.phase !== 'playing' && match.phase !== 'paused') return match;
      const confirmedIds = new Set(match.completed.flatMap(turn => turn.entries.map(entry => entry.word.id)));
      const eligible = words.filter(word => word.difficulty === match.settings.difficulty && !confirmedIds.has(word.id));
      return { ...match, phase: 'ready', entries: [], deck: shuffle(eligible), remainingMs: match.settings.seconds * 1000, deadline: null };
    }
    case 'CONFIRM': {
      if (match.phase !== 'reviewing') return match;
      const completed = [...match.completed, { team: activeTeam(match), round: roundNumber(match), entries: match.entries }];
      return { ...match, completed, entries: [], phase: completed.length === match.settings.rounds * 2 ? 'finished' : 'ready',
        remainingMs: match.settings.seconds * 1000, deadline: null };
    }
  }
}
