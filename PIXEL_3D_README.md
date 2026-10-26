# Pixel — actual interactive 3D character

Pixel is now rendered as real Three.js geometry using React Three Fiber in components/Pixel3D.tsx (not an SVG or photo). It has a modeled body, head, articulated arms, reflective visor, and eyes.

Animations: pointer-driven head and eyes, idle bob, automatic blink, arm wave, reactive expressions for each form field, social hover, send, and copy. Interactions send an event counter so repeated interactions retrigger animations. No Drei Html overlays are used, avoiding the previous React root unmount error.

The contact form still uses mailto: and needs a backend if direct form submissions are required. Reduced motion is respected. A production build and browser visual QA remain recommended.
