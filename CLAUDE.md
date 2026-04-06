# Spidey Academy - Project Instructions

## What This Is
Pre-K educational game for Asher (age 3.5), part of the OTB Games ecosystem. Spider-hero themed with tap-only controls, voice-first instructions, and zero failure states. Teaches colors, shapes, counting, letters, and sorting.

## Verification Workflow
**IMPORTANT**: Always use the Chrome browser extension (`mcp__Claude_in_Chrome__*` tools) for visual verification and testing. The user has Chrome open with the game at `http://localhost:8085`. Use `tabs_context_mcp` to get tab IDs, then use `navigate`, `computer` (screenshot), `read_page`, `javascript_tool`, etc.

## Dev Server
- Server: `node node_modules/serve/build/main.js -l 8085 -s .`
- Launch config in `.claude/launch.json`
- Target viewport: 1024x600 (Amazon Fire tablet landscape)
- Port: 8085

## Tech Stack
- Vanilla HTML5/CSS/JS, DOM-based animations (no canvas for gameplay)
- Canvas 2D only for celebration particles
- Web Speech API for voice prompts
- Web Audio API for synthesized sound effects
- PWA with service worker (`sw.js`)
- LocalStorage for progress persistence
- No build step, no frameworks

## Key Architecture
- Single-page app: `index.html` with screen divs toggled via `.active` class
- Each activity is a singleton module in `js/activities/`
- Shared modules: `audio.js`, `voice.js`, `progress.js`, `celebration.js`, `character.js`, `sticker-book.js`
- OTB ecosystem integration via `ecosystem.js` (shared cross-game profile)

## Activities
1. **Color Catch** - Tap bugs matching target color (6 colors)
2. **Shape Builder** - Match shapes to complete web patterns (6 shapes)
3. **Number Bugs** - Count bugs and tap correct number (1-10)
4. **Letter Web** - Find matching letter from 3 choices (A-Z)
5. **Sort Sweep** - Sort items into left/right webs by category

## Design Principles
- **Tap only** - No drag, swipe, or complex gestures (80px+ touch targets)
- **No failure** - Wrong answers get gentle encouragement, never punishment
- **Voice-first** - All instructions spoken via Web Speech API
- **Ultra-short loops** - 30-60 second activities, 12-minute session cap
- **Always celebrating** - Sparkles, particles, stickers every few correct answers

## Content Progression
- Each activity tracks what the child knows and gradually introduces new content
- Colors start with red/blue, expand to 6
- Shapes start with circle/square/triangle, expand to 6
- Numbers start with 1-3, expand to 1-10
- Letters start with A/B/C/O, expand to full alphabet
- New content unlocks after 2 successful plays of an activity

## DO NOT Change
- The tap-only interaction model
- The zero-failure design (no lives, timers, or game over)
- The voice-first instruction pattern
- Touch target minimum size (80px)
- The 12-minute session cap
- Player name "Asher" as default
