import { describe, expect, it } from 'vitest';
import { categories, categoryItems, getCategoryWords } from './categories';
import type { CategoryId } from './categories';
import { createMatch, defaultSettings, reduceMatch } from './engine';

const counts: Record<Exclude<CategoryId, 'starter'>, number> = {
  disney: 50, animated: 50, fortnite: 60, video_games: 40, celebrities: 60,
  music_artists: 60, animals: 60, ucsd_places: 40, ucsd_majors: 40, ucsd_food: 40,
};
const requested = categories.filter(category => category.id !== 'starter');

describe('Heads Up JSON category decks', () => {
  it('connects all ten requested categories, with the original starter as a bonus', () => {
    expect(requested).toHaveLength(10);
    expect(new Set(categories.map(category => category.id)).size).toBe(categories.length);
    expect(Object.keys(categoryItems).sort()).toEqual(categories.map(category => category.id).sort());
  });
  it.each(requested)('$label has its expected count of unique, nonblank items in mixed order', ({ id }) => {
    const items = categoryItems[id];
    expect(items).toHaveLength(counts[id as Exclude<CategoryId, 'starter'>]);
    expect(items.every(item => typeof item === 'string' && item.trim() === item && item.length > 0)).toBe(true);
    expect(new Set(items.map(item => item.toLowerCase())).size).toBe(items.length);
    expect(items.some(item => /placeholder|coming soon|NEEDS REVIEW/i.test(item))).toBe(false);
    expect(items).not.toEqual([...items].sort((a, b) => a.localeCompare(b)));
  });
  it.each(requested)('$label starts, draws through exhaustion, reviews, and resets within its own deck', ({ id }) => {
    const valid = new Set(getCategoryWords(id).map(word => word.id));
    let match = createMatch({ ...defaultSettings, category: id }, () => .3);
    expect(match.deck.every(word => valid.has(word.id))).toBe(true);
    match = reduceMatch(match, { type: 'ARM', now: 0 });
    match = reduceMatch(match, { type: 'TICK', now: 3000 });
    for (let index = 0; index < valid.size + 2; index++) {
      expect(valid.has(match.entries.at(-1)!.word.id)).toBe(true);
      match = reduceMatch(match, { type: 'RECORD', outcome: index % 2 === 0 ? 'correct' : 'skipped', now: 4000 + index });
    }
    expect(match.phase).toBe('playing');
    expect(match.entries.every(entry => valid.has(entry.word.id))).toBe(true);
    match = reduceMatch(match, { type: 'RESET' });
    expect(match.settings.category).toBe(id);
    match = reduceMatch(match, { type: 'ARM', now: 100000 });
    match = reduceMatch(match, { type: 'TICK', now: 103000 });
    expect(valid.has(match.entries[0].word.id)).toBe(true);
    match = reduceMatch(match, { type: 'TICK', now: match.deadline! });
    expect(match.phase).toBe('reviewing');
    match = reduceMatch(match, { type: 'CONFIRM' });
    match = reduceMatch(match, { type: 'ARM', now: 200000 });
    match = reduceMatch(match, { type: 'TICK', now: 203000 });
    expect(valid.has(match.entries[0].word.id)).toBe(true);
    expect(match.completed[0].entries.every(entry => valid.has(entry.word.id))).toBe(true);
  });
  it('rejects an unknown category rather than silently loading starter words', () => {
    expect(() => createMatch({ ...defaultSettings, category: 'missing' as CategoryId })).toThrow(/No Heads Up content/);
  });
});
