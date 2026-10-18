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

Click **Play** on Charades to read the rules, choose settings, and start a match. Two teams alternate timed turns; one round includes a turn for each team. Defaults are 60 seconds, unlimited skips, Easy words, 3 rounds, and a random starting team.

Only the actor should see the screen. Correct answers earn 1 point. Review and correct word outcomes after every turn before confirming scores. Timer sounds warn at 10 seconds, count down the final 5, and signal the end; sounds can be muted. Switching browser tabs pauses the game automatically.

Choose Easy or Challenging, with 250 prompts each in `src/games/charades/words.ts`. All 300 previous prompts are retained alongside 200 new physical-comedy and facial-expression prompts. Easy includes the former Easy bank and the easier half of Medium; Challenging includes the remaining Medium and former Hard. Category filtering is still a future feature. See `src/games/charades/WORD_BANK_NOTES.md` for research links and selection notes. A browser refresh clears the active match; Play again keeps settings during the current session.

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

## Local Wavelength

Click **Play Wavelength** for rules, settings, and a two-team game on one device. Team 1 is pink; Team 2 is blue. The clue-giver privately sees a random target, types a short clue, hides the target, and passes the device. Their teammates discuss and move the dial using touch, mouse, or the keyboard-accessible slider. After the guess locks, the other team chooses left or right, then both teams see the reveal and confirm the scores.

The default is an untimed race to 10 points. Standard starting points, catch-up turns, and paired tiebreaks follow the [published Wavelength rulebook](https://www.sutherlandshire.nsw.gov.au/__data/assets/pdf_file/0032/77909/Wavelength-rulebook.pdf). Optional house settings offer races to 15/20, fixed 3/5/7 rounds, and 60/90/120-second discussion timers. Fixed rounds give equal turns, start both teams at zero, disable catch-up turns, and allow a draw. A timer starts only after the handoff and locks the current needle at zero.

This local adaptation uses an original 80-pair deck in `src/games/wavelength/spectra.ts`. Each pair has an editable topic shown above the dial. The dial is numbered from 0 to 10 in steps of 1, and a pink banner marks the opposing team's prediction phase. Digital scoring is based on distance along the visible 0–10 dial: up to 0.3 earns 4 points; up to 0.7 earns 3; up to 1.1 earns 2; farther earns 0. Exact boundaries favor the higher score. The opposing team can earn 1 point for the correct side, except on a 4-point hit. These band widths are PGG's digital choice, rather than a measured copy of the physical device.

The target is removed from the rendered dial during handoff and guessing. Leaving an active stage or hiding the tab covers the private content and pauses any running clock; resume is explicit. Reset clears the current clue and guesses and requires a new target; confirmed scores remain. Results include the scoreboard and expandable clue history. Play again returns to settings; Exit home clears the match. Refreshing clears the match, as with the other games. Automated tests cover rules, scoring, privacy, timing, full games, replay, and routing; real-device visual and touch testing remains manual.

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
- `src/games/wavelength/`: rules, settings, private clue/handoff/guess/prediction/reveal stages, scoreboard, results, and tests.
- `src/games/wavelength/engine.ts`: scoring bands, starting points, catch-up turns, tiebreaks, and optional discussion clock.
- `src/games/wavelength/spectra.ts`: editable original spectrum-pair deck.
- `src/games/shared/`: shared timer sounds, shuffle/timer-cue utilities, and accessible game dialogs.
- `src/styles/tokens.css`: shared colors, fonts, and animation speeds.

See `HOMEPAGE.md` for the homepage's React/CSS overview and visual customization guide.
