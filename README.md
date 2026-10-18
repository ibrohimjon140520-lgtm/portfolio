# IBROHIMJON — Surveillance Archive

A dark personal portfolio for Ummatillayev Ibrohimjon: pure black, self-hosted JetBrains Mono, red REC indicators, monochrome CCTV project feeds and restrained signal interference.

## Run

Node 22.18+ required.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. For production: `npm run build`, then `npm start`.

## Current experience

Six naturally stacked sections: Hero, About, Works, Motion, FAQ and Contact. The hero pairs huge glitch typography with an original procedural line sculpture and decorative binary bands. Six existing concept artworks appear as camera feeds with UTC timestamps updated every second by one shared timer. There is no camera access or real surveillance recording.

A finite GSAP ScrollTrigger pin holds the full-screen Works gallery while six camera cards rotate around a genuine CSS 3D orbit. Scroll distance is limited to five transitions; after the final card, normal page movement resumes. Reverse scrolling re-enters and unwinds the same orbit. Previous/next buttons and Continue below provide direct navigation. With JavaScript unavailable, reduced motion or effects paused, cards remain an ordinary accessible grid. Headings and section content reveal with perspective flips. The hero sculpture, type and targeting marks move at different speeds. Hover causes a brief glitch. Native smooth anchor scrolling preserves wheel, keyboard, scrollbar and touch input; the Works pin is temporary and there are no body scroll locks.

Project cards open an accessible native dialog with previous/next controls, Escape and restored focus. FAQ uses numbered disclosure buttons. Mobile has a collapsible navigation menu. Reduced motion and the visual-effects pause button disable decorative animation without disabling content or live timestamps.

Contact channels are configured with author's verified links (Telegram personal & channel, LinkedIn, Instagram, and GitHub) in `lib/data.ts`. Entries render automatically with interactive cards and direct external links. All six projects remain explicitly labelled independent concepts.

## Files

- `components/Portfolio.tsx`: current page, clock timer, FAQ and scroll choreography.
- `app/globals.css`: CCTV visual system, responsive layout and self-hosted font import.
- `components/ProjectOverlay.tsx`: native project dialog.
- `lib/data.ts`: projects and contact URLs.
- `public/projects/`: original local artwork, displayed in grayscale.

Earlier Three.js scenes are retained in `components/scene/` for future reuse but are not loaded by this portfolio. The current design uses actual CSS 3D transforms driven by scroll, as requested.

## Verification

```sh
npm run typecheck
npm test
npm run build
# With a running server:
npm run test:smoke
npm run test:browser
```

Server-render tests cover section order, camera feeds/clocks, FAQ region references, unique IDs and honest contact placeholders. Retained scene tests also run. The browser suite exercises desktop wheel and mobile touch scrolling, bottom/reverse travel, live clock updates, CSS 3D transforms, navigation, project dialogs, FAQ, pause and reduced motion. `CHROME_PATH` selects Chrome; `CREATOR_TEST_URL` changes the preview address. Screenshots are saved to ignored `test-results/`.

This environment currently exposes no connected browser. Previous isolated Chrome launches were blocked by sandbox restrictions. Build and non-browser tests can run, but visual appearance and actual desktop/touch interactions must not be described as browser-verified until the browser suite passes. The referenced inspiration site was unreachable here; this implementation follows the supplied design brief with original layout and artwork. No deployment was requested or performed.

Hydration hardening: procedural hero SVG coordinates are rounded to three decimals before serialization, avoiding server/browser floating-point differences. Regression tests cover stable markup, orbit continuity and all six front-facing states.

## Motion wall

Ten CCTV-style video cards follow the rotating gallery, with a large central particle study. Nine original H.264 clips are served locally from `public/motion/`, alongside JPG posters. Clips are silent, loop in four seconds, and load/play only when visible. Hidden tabs, offscreen feeds, reduced motion and the global pause control stop playback. Per-feed controls allow individual pauses and an autoplay fallback. Contact channels remain pending. The hero display name is now IBROHIM at a smaller size.

`scripts/generate-motion.py` regenerates the procedural clips with NumPy and FFmpeg (`FFMPEG_PATH` override); the optional macOS ARM encoder dependency is skipped on other platforms. Existing video assets require no encoder at runtime.
