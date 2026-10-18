# Party Games Galore homepage

## Run locally

```sh
npm install
npm run dev
```

Open the local URL Vite prints. `npm run build` checks TypeScript and creates the production site in `dist`. `npm run preview` serves that build.

## How the React pieces fit together

`src/main.tsx` mounts `App`. `src/app/App.tsx` composes the hero, game grid, footer, and decorative components. JSX describes what appears on the page; imported CSS Module classes style only their component.

`src/games/registry.ts` defines the `Game` TypeScript interface and the card data. `GameGrid` maps that array to `GameCard` components, using each game's stable ID as its React key. Each card receives its metadata through props. Availability controls the visible status; every Play button is intentionally disabled for this homepage milestone. Future game rules and networking can be built separately.

## Customize

- Colors, fonts, and animation durations: `src/styles/tokens.css`.
- Game titles, artwork paths, player labels, availability, and mode: `src/games/registry.ts`.
- Local vector illustrations: `public/art/`.
- Hero composition: `src/app/App.module.css`.
- Large-screen sizing: the `min-width: 1100px` / `min-height: 850px` media queries in the component CSS Modules grow the composition with the available viewport height. Smaller laptops retain the compact arrangement. `--ball-size` in `tokens.css` keeps the sphere and hero stage aligned.
- Ball pattern and movement: `src/components/DiscoBall/DiscoBall.module.css`. The layer moves 120px, exactly five 24px pattern repeats, so the loop returns to the same pattern. The clipped circle and shading stay stationary.
- Sparkle placement and stagger: `src/components/Sparkles/Sparkles.module.css`.
- Light-dot rotation and fading: `src/components/LightReflections/LightReflections.module.css`.

The decorative animations use transforms and opacity. The global reduced-motion media query stops all animation and transitions. Cards are keyboard-focusable for an equivalent focus treatment; disabled native buttons are intentionally skipped in the tab sequence. Decorative SVGs and layers are hidden from screen readers. The web fonts use Google Fonts with local serif/sans-serif fallbacks when unavailable.

There is no router, gameplay, server, or networking in this milestone.
