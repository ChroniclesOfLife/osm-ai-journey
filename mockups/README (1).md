# Redesign mockups

Static, standalone HTML prototypes for the immersive / visual-novel redesign.
See `../IMMERSIVE_REDESIGN.md` for the full direction.

- Open any file directly in a browser — no build step, no dependencies.
- The "map" is faked with CSS gradients; destination photos are Unsplash
  placeholders; fonts fall back to system serif/mono stand-ins (Fraunces + DM
  Mono intended in the real app). These are for look-and-feel only and are not
  wired to the app.

Order:

1. `01-opening.html` — threshold / begin-your-journey screen
2. `02-arrival.html` — arrival + field-notes drawer
3. `03-ongoing-narration.html` — mid-conversation, narration-as-prose
4. `04-visual-novel.html` — VN scene art + single character + dialogue box
5. `05-two-characters.html` — VN with two characters (active speaker swap)
6. `06-map-and-destination-panels.html` — VN with Map + Destination panels open
   for navigating places and swapping scene images
