# Sairaj — Cinematic portfolio (refined)

## Run
`npm install` then `npm run dev`

## What changed
- Shortened 3D intro and replaced scroll-timeline-dependent chapter fades with GSAP ScrollTrigger.
- Fixed horizontal gallery end distance to include the entire last slide; on tablets and phones it becomes native swipeable scroll-snap.
- Larger project panels with full descriptions, more room for artwork, and six distinct editorial SVG illustrations. These are **concept illustrations**, not screenshots.
- Redesigned experience as three large, readable editorial panels: Junior Developer, Best Buy and Neo Financial only.
- New palette: porcelain, midnight blue, sea-glass sage and electric coral.

Run `npm run build` before deploying. Replace the project SVG illustrations with real screenshots when available.


## Scroll and typography refinements
- Desktop projects are pinned to a viewport-height gallery with measured horizontal travel, including the last slide.
- Project text can scroll inside its card when needed, without clipping.
- Mobile projects use native swipe scrolling with scroll snap, not GSAP pinning.
- Headline and section typography has been scaled down.
- After installing dependencies, run `npm run dev` and verify at several viewport sizes.

## Role-focused copy revision
Removed generic creative slogans and replaced them with résumé-supported software development, data analytics, project, and experience headings. The existing 3D scene and horizontal scrolling remain unchanged.


## Project images
Each of the six projects now has its own explicitly mapped SVG illustration in `public/projects/` (utility dashboard, healthcare portal, football pitch/predictions, F1 telemetry, Unity pixel platformer, and student calendar). These are **original conceptual visuals**, not actual screenshots. Replace the matching SVG file with a real screenshot and update `image` in `data/content.ts` if desired.


## Race-start landing scene
The landing hero now features a 3D starting grid with two stylized open-wheel cars and a five-light start gantry. Scrolling through the short hero lights up red lamps, switches them to green, and launches the cars down the track. Motion is tied to scroll progress (scroll backward to rewind). Reduced-motion users see the stationary grid. The rest of the role-focused portfolio and six distinct project illustrations are retained.


## New About Me section
The About Me section appears directly after the race-start landing. It uses `public/about-portrait.jpg`, includes a concise developer bio, and moves the Dalhousie education and résumé link from Professional Experience into this section.

## Positioning update
Updated landing, About Me, navigation, projects and contact copy to describe an early-career computer science student exploring cybersecurity, data science/analytics and software development, without labeling them a frontend, backend or full-stack specialist.

## Lights-out update
Eight cars in four rows, five larger sequential red lights followed by green launch, stronger emissive glow, a longer camera-follow launch, and a smooth animated telemetry cursor.


### Technical expertise redesign
The Technical Expertise section now uses a compact midnight-teal skill directory with four organized panels, readable skill chips, a smaller heading, and responsive single-column mobile layout. All skill names remain sourced from `data/content.ts`.


## Interactive expertise workstation
The Technical Expertise section is now a clickable 3D desk. Click the code monitor, analytics display, PC tower or team tablet to reveal the corresponding skills. Keyboard-accessible buttons beneath the scene provide an alternative. The section is lazy-loaded on the client; no additional dependencies are required.


## Connected workstation projects

The interactive Technical Expertise workstation now includes contextual project previews. Select the code monitor, analytics monitor, PC tower, or team tablet to see corresponding skills plus relevant projects. Preview artwork, titles, categories and metrics are sourced directly from `data/content.ts`, avoiding duplicated project information. Clicking a project preview navigates to the existing Projects gallery. Edit `relatedProjectIndices` in `components/ExpertiseWorkstation.tsx` to adjust associations.


## Bird’s-eye technical expertise
The Technical Expertise section now shows an overhead 3D desk. Hovering highlights objects; clicking selects a skills/project panel. Accessible buttons remain available below the scene.


## Isometric Technical Expertise room
The Technical Expertise section is now a cozy, stylized isometric room inspired by the user's cutaway room reference. Hover or click the two monitors, PC tower, and tablet to reveal skills and related projects. Accessible buttons below the scene provide the same interaction.


### Final Lap detail pass
Enhanced the contact section with a detailed racing car, finish gantry, track lighting, asphalt texture, telemetry, and responsive refinements. Based on runtime-fixed release; the ExpertiseWorkstation Html removal remains intact.


## Race-start grandstands update
The starting grid now includes two tiered spectator stands with animated cheering crowds, randomized camera flashes, and scroll-triggered confetti. Crowd and confetti are instanced to reduce draw calls. The earlier workstation runtime fix is retained.


## Motion, gestures & engagement pass (Nov 2026)
**Performance (less lag)**
- `components/StaticMerge.tsx` merges the race scene's hundreds of static meshes into one draw call per material (cars, grandstands, circuit, track, light gantry). Animated meshes opt out with `userData={{noMerge:true}}`.
- The race and Pixel canvases stop rendering when off-screen; resolution adapts automatically on slower devices (drei `PerformanceMonitor`). Clearcoat materials and four floodlight point lights were removed.
- The custom cursor no longer re-renders the whole page on every mouse move; it sleeps when idle. The normal cursor comes back for touch, keyboard and reduced-motion users.
- CSS animations pause in sections that are off-screen. The night-sky background is now a 48 KB WebP (was a 508 KB PNG).

**Gestures & overlays**
- Projects: drag with the mouse (with momentum), swipe on touch, ← → / Home / End keys, position dots and counter. Clicking a project opens a detail sheet: swipe down or Esc to close, swipe sideways or ← → to change project, focus is trapped and restored.
- Mobile menu overlay with staggered links; swipe up or tap outside to close.
- Expertise room: subtle pointer tilt, swipe or ← → through the 15 concepts, and on phones/tablets the details panel scrolls into view after a tap.

**Lower bounce rate**
- Fixed nav with section links, active-section highlight, scroll progress bar and an always-visible Résumé button (hides on scroll down, returns on scroll up).
- Hero shows availability, three CTAs (Projects / Résumé / Contact), quick facts, and a "Skip intro" link; the HUD bar now reflects real scroll progress and the hero copy fades out as the cars launch.
- Mid-page call to action after Experience; Open Graph / social preview metadata.


## Realistic screenshots, skill network map, clean contact (Nov 2026)
- **Project images** (`public/projects/*.webp`) are now realistic app screenshots built to match each description: a Power BI report, the clinic web dashboard, a Streamlit predictor, a MySQL query workspace on EC2, the Unity 6 editor showing the Level 2 binary vault, and a weekly timetable. They use **sample data**; swap in real captures with the same file names whenever you have them.
- **Technical Expertise** is now `components/SkillNetworkMap.tsx`: an abstract topographic network map. The 6 projects and 15 concepts connect to shared skill hubs (data in `data/network.ts`). Selecting a node sends a signal along the shortest path through the network while the camera flies there. Gestures: drag to pan, pinch or Ctrl/⌘ + scroll to zoom, tap nodes, ← → keys, swipe the details panel, guided tour button. On tall phone screens the map is drawn rotated so it fills the screen.
- **Contact** is now `components/ContactSection.tsx`: a profile card (availability, copy-email, LinkedIn, GitHub, résumé) and the message form. Pixel the robot is no longer used.
- No longer used by the page (safe to delete): `ExpertiseWorkstation.tsx`, `RobotDogContact.tsx`, `Pixel3D.tsx`, `public/isometric-room.png`.
