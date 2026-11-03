# Immersive / Visual-Novel Redesign

Status: **design proposal — not yet implemented.** This folder holds the UX/UI
direction and static HTML mockups to execute later. Nothing here is wired to the
app; the mockups use placeholder gradients for the map and Unsplash images for
destination photos.

## Why

The current UI (`src/App.tsx` + `src/styles/app.css`) reads as a two-pane
dashboard: a map card beside a chat card, with alternating message bubbles, a
scene counter, and always-visible data (coordinates, OSM feature IDs, cache
status). It functions well but feels like "a map app with a chatbot," not the
"open-ended narrative journey" described in `docs/PRODUCT.md`.

The redesign reframes the experience from **two panels** to **one place you are
standing in, with a voice** — and pushes toward a **visual-novel (VN)** grammar:
the destination photo becomes the scene art, the companion appears as an
optional character illustration, and narration reads as prose in a dialogue box.

## Mockups (open in any browser)

| File | Screen | Shows |
|------|--------|-------|
| `mockups/01-opening.html` | Threshold / "begin your journey" | Hushed world map, serif invitation, search + quick "drop in" chips, local-first trust line. |
| `mockups/02-arrival.html` | Arrival + field notes | Full-bleed stage, cinematic "Scene 03 — You arrive" chapter card, hero photo, field-notes drawer, travelogue spine. |
| `mockups/03-ongoing-narration.html` | Mid-conversation (narration) | Narration-as-prose thread over the map (no chat bubbles), typewriter cursor, dock with suggestions + free input. |
| `mockups/04-visual-novel.html` | VN single character | Destination photo as scene art over dimmed map, togglable companion sprite, VN dialogue box with nameplate. |
| `mockups/05-two-characters.html` | VN two characters | Vendor (active, amber nameplate) + companion (dimmed), stage directions, left dock with Map / Place / Journal toggles. |
| `mockups/06-map-and-destination-panels.html` | VN + navigation | Map panel (navigate to other places) and Destination panel (image gallery + context) open over the scene so the user can travel and swap scene images without leaving the story. |

> The `.b64` files that may accompany these in the working tree are build
> artifacts used only to preview the HTML in a headless browser; they are not
> part of the design and do not need to be committed.

## Core moves

1. **Full-bleed map as the stage.** Map fills the viewport; everything else floats
   over it as translucent, blurred glass. Replace the `1.4fr / 0.7fr`
   `.workspace` grid in `app.css`.
2. **Destination photo = scene art (VN).** The selected place's photo becomes the
   full background, feathered over the dimmed live map. Promote the first
   `destinationPhotos` photo to a full-bleed hero/scene image.
3. **Narration, not messaging.** Render AI output as flowing serif prose with a
   typewriter reveal (the stream already deltas in `sendMessage`); render the
   user's action as a quiet italic line. Drop alternating bubbles and the
   "You / Guide" labels.
4. **Togglable character illustration.** Optional companion/NPC sprite, shown or
   hidden via a toggle. Multi-character scenes swap the sprite + nameplate to the
   active speaker (see mockup 05).
5. **Togglable Map & Destination panels inside the story view.** A left-side dock
   opens the Map (navigate / search / travel to other places — drives
   `choosePlace` / `completeTransition`) and the Destination panel (image gallery
   that can set the scene background, plus source context). Lets the user move
   between places and images without leaving Story mode (see mockup 06).
6. **Field notes drawer.** Tuck provenance-heavy data (coordinates, OSM feature,
   source, cache status) behind an "examine" drawer instead of always-on facts.
7. **Travelogue spine.** Reframe `narrativeEvents` as a journal path of visited
   places rather than a debug-style event log.
8. **Cinematic arrivals.** Dramatize `completeTransition`: fade/vignette, camera
   `flyTo`, a "Scene NN — You arrive at …" chapter card, then dissolve into the
   new scene art.
9. **Explore ⇄ Story toggle.** Story mode immerses (overlaid narration); Explore
   mode hands the map back for free panning/clicking. Keeps the map fully usable.

## Constraints to honor (from docs/PRODUCT.md & ARCHITECTURE.md)

- **Provenance must stay visible.** Distinguish source-backed / cached / live /
  user-narrative data. A full-bleed photo must never read as a live camera feed:
  keep an "illustrative photo · not a live view" marker and the source link.
  Photo pixels remain illustrative; only photo *metadata* feeds the model.
- **User intent wins.** Suggested actions / choices are never mandatory; a free
  "say anything" input is always available alongside VN choices. No fixed path.
- **Local-first, static.** No new backend. The redesign is presentation-only over
  the existing provider contracts and journey state.
- **No destination required to chat.** The opening and story views must allow
  free conversation before any place is chosen.

## Character illustrations — open decision

The VN look depends on a sprite, but the product only has text personas today.
Options, in suggested order:

1. **Toggle-off by default + user-uploaded portrait** (recommended first step) —
   no art pipeline; user supplies an image for their persona.
2. **Stylized placeholder frame** (used in the mockups) — zero art, labeled as a
   placeholder.
3. **AI-generated portrait** from the persona description — most VN-authentic;
   adds a provider/cost/latency dependency and its own provenance note
   (generated, not real).
4. **Small curated archetype set** the AI maps NPCs onto.

## Suggested implementation slices

1. Full-bleed stage + narration (moves 1, 3) — carries most of the "immersive"
   feeling. Rework `.workspace`/`.panel` layout and the `.conversation` renderer.
2. Scene art + VN dialogue box + illustration toggle (moves 2, 4).
3. Togglable Map & Destination panels in Story mode (move 5), wired to existing
   `choosePlace` / `completeTransition` and `destinationPhotos`.
4. Field notes drawer + travelogue spine (moves 6, 7).
5. Cinematic arrivals + Explore/Story toggle (moves 8, 9).

Do NOT add tests or new dependencies for the presentation layer unless asked.
Keep provider contracts and the journey-state model unchanged.
