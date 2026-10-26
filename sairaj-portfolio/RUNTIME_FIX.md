# React / Three.js workstation runtime fix

Fixed the repeated React root-unmount console error reported at `components/ExpertiseWorkstation.tsx:16`.

## Change
Removed the `@react-three/drei` `<Html>` label overlay inside the `Selectable` 3D object. This overlay creates a separate React-managed DOM root within the Canvas and was the location reported by the error. The 3D meshes, hover highlighting, click selection, accessible selection buttons, skills and related projects remain. Also reset the mouse cursor when selectable objects unmount.

## Run
`npm install`
`npm run dev`

If you previously ran this project, stop the server, delete `.next` and restart.

## Verification
Static source inspection completed. Dependency installation timed out in this environment; therefore a production build and browser test were not completed.
