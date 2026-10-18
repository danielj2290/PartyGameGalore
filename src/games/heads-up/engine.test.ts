import { describe, expect, it } from 'vitest';
import { activeParticipant, createMatch, defaultSettings, reduceMatch, score, teamRounds, totalFor } from './engine';
import type { Match, Settings } from './engine';
import { starterWords } from './words';

const setup = (settings: Partial<Settings> = {}) => createMatch({ ...defaultSettings, ...settings }, () => .3);
const start = (match: Match, now = 0) => reduceMatch(reduceMatch(match, { type: 'ARM', now }), { type: 'TICK', now: now + 3000 });
const review = (match: Match) => reduceMatch(match, { type: 'TICK', now: match.deadline! });
const complete = (match: Match) => reduceMatch(review(match), { type: 'CONFIRM' });

describe('Heads Up schedule and scoring', () => {
  it.each([4, 5, 6, 7, 8, 19, 20])('gives both teams equal turns with %s players', players => {
    const match = setup({ players });
    expect(teamRounds(players)).toBe(Math.ceil(players / 2));
    expect(match.schedule).toHaveLength(Math.ceil(players / 2) * 2);
    for (const id of ['team-1', 'team-2']) expect(match.schedule.filter(turn => turn.participant === id)).toHaveLength(Math.ceil(players / 2));
    expect(match.schedule.every((turn, i) => turn.participant === (i % 2 === 0 ? 'team-1' : 'team-2'))).toBe(true);
    expect(match.schedule.map(turn => turn.round)).toEqual(Array.from({ length: Math.ceil(players / 2) }, (_, i) => [i + 1, i + 1]).flat());
  });
  it('uses the confirmed seven-player schedule: four rounds, eight total turns', () => {
    const match = setup({ players: 7 });
    expect(match.schedule).toHaveLength(8);
    expect(match.schedule.at(-1)).toEqual({ participant: 'team-2', round: 4 });
  });
  it.each([2, 7, 20])('gives %s free-for-all players one turn each and distinct colors', players => {
    const match = setup({ mode: 'ffa', players });
    expect(match.schedule).toHaveLength(players);
    expect(new Set(match.schedule.map(turn => turn.participant)).size).toBe(players);
    expect(new Set(match.participants.map(person => person.color)).size).toBe(players);
  });
  it('validates player limits and timer settings', () => {
    expect(() => setup({ players: 3 })).toThrow();
    expect(() => setup({ mode: 'ffa', players: 1 })).toThrow();
    expect(() => setup({ players: 21 })).toThrow();
    expect(() => setup({ seconds: -1 })).toThrow();
  });
  it('hides words until after the full three-second handoff and ignores early input', () => {
    let match = reduceMatch(setup(), { type: 'ARM', now: 100 });
    expect(match.phase).toBe('countdown'); expect(match.entries).toHaveLength(0);
    match = reduceMatch(match, { type: 'TICK', now: 2000 });
    expect(match.countdownMs).toBe(1100);
    expect(reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 3100 })).toBe(match);
    match = reduceMatch(match, { type: 'TICK', now: 3100 });
    expect(match.phase).toBe('playing'); expect(match.entries).toHaveLength(1); expect(match.deadline).toBe(63100);
  });
  it('cancels the handoff on pause so returning to the tab cannot start a word automatically', () => {
    const match = reduceMatch(reduceMatch(setup(), { type: 'ARM', now: 0 }), { type: 'PAUSE', now: 1500 });
    expect(match.phase).toBe('ready'); expect(match.entries).toEqual([]);
    expect(reduceMatch(match, { type: 'TICK', now: 999999 })).toBe(match);
  });
  it('handles correct/skip without restarting time and blocks input at the buzzer', () => {
    let match = start(setup());
    const deadline = match.deadline!;
    match = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 4000 });
    match = reduceMatch(match, { type: 'RECORD', outcome: 'skipped', now: 5000 });
    expect(match.deadline).toBe(deadline); expect(score(match.entries)).toBe(1);
    match = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: deadline });
    expect(match.phase).toBe('reviewing'); expect(score(match.entries)).toBe(1); expect(match.entries).toHaveLength(3);
  });
  it('pauses accurately, hides input, and resumes with only the unused time', () => {
    let match = reduceMatch(start(setup()), { type: 'PAUSE', now: 13000 });
    expect(match.remainingMs).toBe(50000); expect(match.phase).toBe('paused');
    expect(reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 50000 })).toBe(match);
    match = reduceMatch(match, { type: 'RESUME', now: 90000 });
    expect(match.deadline).toBe(140000);
  });
  it('supports corrections both ways without double counting and locks confirmed turns', () => {
    let match = start(setup({ mode: 'ffa', players: 2 }));
    match = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 4000 });
    match = reduceMatch(match, { type: 'RECORD', outcome: 'skipped', now: 5000 });
    match = review(match);
    match = reduceMatch(match, { type: 'CORRECT', index: 0, outcome: 'skipped' });
    match = reduceMatch(match, { type: 'CORRECT', index: 1, outcome: 'correct' });
    match = reduceMatch(match, { type: 'CORRECT', index: 2, outcome: 'correct' });
    match = reduceMatch(match, { type: 'CONFIRM' });
    expect(totalFor(match, 'player-1')).toBe(2);
    expect(reduceMatch(match, { type: 'CONFIRM' })).toBe(match);
    expect(reduceMatch(match, { type: 'CORRECT', index: 0, outcome: 'correct' })).toBe(match);
    expect(activeParticipant(match).id).toBe('player-2');
    match = complete(start(match, 100000));
    expect(match.phase).toBe('finished'); expect(match.completed).toHaveLength(2);
  });
  it('resets only the current turn and releases its words while preserving earlier turns', () => {
    let match = start(setup());
    match = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 4000 });
    match = start(complete(match), 100000);
    const completed = match.completed;
    const reset = reduceMatch(match, { type: 'RESET' });
    expect(reset.completed).toBe(completed); expect(reset.entries).toEqual([]); expect(reset.phase).toBe('ready');
    expect(reset.remainingMs).toBe(60000); expect(activeParticipant(reset).id).toBe('team-2');
    expect(reset.deck.some(word => completed[0].entries.some(entry => entry.word.id === word.id))).toBe(false);
    expect(reset.deck.some(word => word.id === match.entries[0].word.id)).toBe(true);
  });
  it('finishes the entire odd-team match only after both teams get all four turns', () => {
    let match = setup({ players: 7 });
    for (let i = 0; i < 8; i++) {
      match = complete(start(match, i * 100000));
      expect(match.phase).toBe(i === 7 ? 'finished' : 'ready');
    }
    expect(match.completed.filter(turn => turn.participant === 'team-1')).toHaveLength(4);
    expect(match.completed.filter(turn => turn.participant === 'team-2')).toHaveLength(4);
    expect(totalFor(match, 'team-1')).toBe(totalFor(match, 'team-2'));
  });
  it('avoids repeats until the 100-word starter mix is exhausted and keeps drawing', () => {
    expect(starterWords).toHaveLength(100);
    expect(new Set(starterWords.map(word => word.text)).size).toBe(100);
    let match = start(setup());
    for (let i = 0; i < 99; i++) match = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 4000 + i });
    expect(new Set(match.entries.map(entry => entry.word.id)).size).toBe(100);
    const snapshot = structuredClone(match);
    const last = match.entries.at(-1)!.word.id;
    const updated = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 5000 });
    expect(updated.entries.at(-1)!.word.id).not.toBe(last); expect(updated.phase).toBe('playing'); expect(match).toEqual(snapshot);
  });
});
