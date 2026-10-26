# Interactive isometric room

The original generated illustration is used unchanged at `public/isometric-room.png`. Fifteen accessible hotspots in `components/ExpertiseWorkstation.tsx` are mapped to visible objects. Hover previews object descriptions; click, Enter or Space updates the skills and related project panel. This is an interactive illustrated scene rather than an editable 3D mesh. To adjust a hotspot location, edit its x/y percentages in the `hotspots` array.

The prior Drei Html runtime issue remains avoided: the workstation no longer mounts a Drei Html overlay.
