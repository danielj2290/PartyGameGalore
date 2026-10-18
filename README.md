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

## Local Heads Up

Click **Play** on Heads Up. The first screen detects a phone/tablet or laptop, with a selector to correct the choice. Device setup comes before the rules and settings.

- **Phone:** rotate to landscape. Use landscape rotation lock if your device supports it; portrait-only rotation lock should stay off. Keep the screen facing clue-givers. Tap Enable motion, allow access, and practice both tilts. Tilt the screen toward the sky for Correct or toward the ground for Skip, returning upright between gestures. Assisted play lets a friend tap Correct/Skip if permission or sensors are unavailable.
- **Laptop:** a clue-giver presses Up for Correct or Down for Skip while the guesser faces away from the word. Held keys do not repeatedly count answers. Enable Assisted play in Settings to show on-screen controls.
- **Teams:** 4–20 players, split as evenly as possible. Rounds are the player count divided by two, rounded up. For 7 players, that is 4 rounds and 8 turns total; both teams get 4 turns. Rotate guessers; the smaller team repeats one guesser. Team 1 is pink and Team 2 is blue.
- **Free-for-all:** 2–20 players, with one timed turn and a distinct card-outline color for each person.

Choose 30, 60 (default), 90, or 120 seconds per turn. Ten enabled categories contain 500 items total: Disney movies, animated movies, Fortnite, video games, celebrities, music artists, animals, UCSD places, UCSD majors, and UCSD food. Each deck is a separate plain JSON array in `src/games/heads-up/data/`. Names and titles were selected from general knowledge and mixed rather than ranked; the campus lists need your review. The original 100-item Starter mix remains available as a bonus. Scores are revealed only at the end. Each turn has a three-second handoff, timer warnings, pause/resume, reset, and an editable word review.

Phone motion requires HTTPS and a supporting browser. Permission is requested only from the Enable motion button; receiving real orientation data is checked separately. Missing sensor data, switching tabs, and rotating to portrait pause play. The browser cannot confirm or control the device's system rotation-lock setting. See [MDN's motion permission reference](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static).

Motion geometry, gesture filtering, permissions/fallbacks, and the game flow have automated tests. Physical iOS/Android sensor behavior and browser layout still need testing on real devices. Refreshing clears an active match; Play again retains your settings for the current session.

## Code map

- `src/app/`: routes and homepage.
- `src/games/registry.ts`: homepage game metadata.
- `src/games/charades/engine.ts`: turn state, timing, word draws, and scoring.
- `src/games/charades/words.ts`: typed local word bank.
- `src/games/charades/`: rules, settings, play, review, results, scoreboard, and audio.
- `src/games/heads-up/`: device setup, rules, settings, game engine, play, review, and results.
- `src/games/heads-up/data/`: editable JSON decks; see its README for counts and review notes.
- `src/games/heads-up/categories.ts`: category labels and JSON-to-card loading.
- `src/games/heads-up/words.ts`: compatibility export for the original starter deck.
- `src/games/heads-up/gestures.ts`: screen-tilt geometry, gesture thresholds, and device detection.
- `src/games/heads-up/useMotion.ts`: browser sensor permission, listeners, and loss-of-signal handling.
- `src/games/shared/`: shared timer sounds, shuffle/timer-cue utilities, and accessible game dialogs.
- `src/styles/tokens.css`: shared colors, fonts, and animation speeds.

See `HOMEPAGE.md` for the homepage's React/CSS overview and visual customization guide.
