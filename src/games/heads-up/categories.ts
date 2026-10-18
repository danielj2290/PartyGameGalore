import starter from './data/starter.json';
import disney from './data/disney.json';
import animated from './data/animated.json';
import ucsdPlaces from './data/ucsd_places.json';
import ucsdMajors from './data/ucsd_majors.json';
import fortnite from './data/fortnite.json';
import videoGames from './data/video_games.json';
import celebrities from './data/celebrities.json';
import musicArtists from './data/music_artists.json';
import animals from './data/animals.json';
import ucsdFood from './data/ucsd_food.json';

export const categoryItems = {
  starter, disney, animated, fortnite, video_games: videoGames,
  celebrities, music_artists: musicArtists, animals,
  ucsd_places: ucsdPlaces, ucsd_majors: ucsdMajors, ucsd_food: ucsdFood,
} satisfies Record<string, string[]>;

export type CategoryId = keyof typeof categoryItems;
export interface Prompt { id: string; text: string }
export interface Category { id: CategoryId; label: string; description: string }
export const categories: Category[] = [
  { id: 'starter', label: 'Starter mix', description: 'A little of everything to get the game going.' },
  { id: 'disney', label: 'Disney movies', description: 'Recognizable Disney animation and live-action favorites.' },
  { id: 'animated', label: 'Animated movies', description: 'DreamWorks, Pixar, and Spider-Verse favorites.' },
  { id: 'fortnite', label: 'Fortnite', description: 'Chapter 1 and 2 locations, plus Chapter 1 weapons, skins, and emotes.' },
  { id: 'video_games', label: 'Video games', description: 'Popular games across consoles, computers, and phones.' },
  { id: 'celebrities', label: 'Celebrities', description: 'Familiar actors, athletes, musicians, and internet personalities.' },
  { id: 'music_artists', label: 'Music artists', description: 'Popular singers, rappers, bands, and DJs across genres.' },
  { id: 'animals', label: 'Animals', description: 'Familiar creatures from backyards, jungles, and oceans.' },
  { id: 'ucsd_places', label: 'UCSD places', description: 'Campus buildings, colleges, landmarks, dining halls, and fields.' },
  { id: 'ucsd_majors', label: 'UCSD majors', description: 'Recognizable undergraduate subjects and programs.' },
  { id: 'ucsd_food', label: 'UCSD food', description: 'Campus eateries, dining spots, cafes, and sweet treats.' },
];

const promptDecks = Object.fromEntries(Object.entries(categoryItems).map(([category, items]) => [category,
  [...new Set(items.map(item => item.trim()).filter(Boolean))].map((text, index) => ({ id: `heads-up-${category}-${index}`, text })),
])) as Record<CategoryId, Prompt[]>;

export function getCategoryWords(category: CategoryId): Prompt[] {
  const deck = promptDecks[category];
  if (!deck?.length) throw new Error(`No Heads Up content for category: ${category}`);
  return deck;
}
