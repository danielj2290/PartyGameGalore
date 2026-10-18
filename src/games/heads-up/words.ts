// Compatibility export. All playable category content now lives in data/*.json.
import { getCategoryWords } from './categories';
export const starterWords = getCategoryWords('starter');
export type { Prompt } from './categories';
