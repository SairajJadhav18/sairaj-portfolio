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
