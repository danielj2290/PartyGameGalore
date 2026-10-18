# PartyGameGalore
PGG
https://partygamesgalore.vercel.app/

## Development

```sh
npm install
npm run dev
npm test
npm run build
```

## Local Charades

Click **Play** on Charades to read the rules, choose settings, and start a match. Two teams alternate timed turns; one round includes a turn for each team. Defaults are 60 seconds, unlimited skips, Medium words, 3 rounds, and a random starting team.

Only the actor should see the screen. Correct answers earn 1 point. Review and correct word outcomes after every turn before confirming scores. Timer sounds warn at 10 seconds, count down the final 5, and signal the end; sounds can be muted. Switching browser tabs pauses the game automatically.

Categories are placeholders for now. There are 100 local prompts per difficulty. A browser refresh clears the active match; Play again keeps settings during the current session.

React Router uses hash URLs (for example, `/#/charades/rules`), so Vercel needs no additional route rewrites. Build command: `npm run build`; output directory: `dist`.

## Code map

- `src/app/`: routes and homepage.
- `src/games/registry.ts`: homepage game metadata.
- `src/games/charades/engine.ts`: turn state, timing, word draws, and scoring.
- `src/games/charades/words.ts`: typed local word bank.
- `src/games/charades/`: rules, settings, play, review, results, scoreboard, and audio.
- `src/styles/tokens.css`: shared colors, fonts, and animation speeds.

See `HOMEPAGE.md` for the homepage's React/CSS overview and visual customization guide.
