# Assembly density, motion and exploded views

Use for detailed machines and mechanical creatures. Read alongside engineering.md; biological references additionally require biomorphology.md. Declare whether the subject is anatomy, an original biomimetic robot, or fiction. A robot's gearbox is an engineering analogy, not an animal organ.

## Meaningful parts before decoration

Prototype one complete transmission before multiplying it. Build the fixed stator mount, reduction stage, bearing pair, shaft, output clevis and driven link. Name the constraint and coupling equation. Compare the complete package against the approved outer contour in front, side and dorsal views. Keep recognizable head proportions, folded limbs and negative spaces; reduce the whole package together when joints overwhelm the animal.

Maintain an assembly registry: stable part ID, subsystem, physical role, parent frame, material and disassembly stage/direction. Count separately: functional assemblies, distinct physical parts, repeated fasteners, and rendering primitives. Fiber strokes, mesh subdivisions and gear teeth are not separate manufactured parts. Report counts from the registry, not a scene traversal. Do not use a universal minimum part count.

Detail should explain assembly: paired cheeks support a pin; a bearing seats in a housing; a spring has two actual anchors; a cable reaches its spool. Prefer shaped sections, recessed screw heads, retaining rings and mating faces over ornamental gears. Validate link endpoints and gear centers numerically. Procedural tooth profiles must be called approximate unless involute contact is actually implemented.

For the representative assembly, shape parts around their jobs: tapered load paths, clevis pairs, mounting flanges, bearing seats, functional apertures, panel seams and restrained edge radii. Inspect material contrast at the delivery scale. Adding fasteners or HUD readouts cannot repair an oversized joint or a featureless housing. For curved panels, subdivide before nonlinear deformation and inspect welded normals and bevels in a close-up; a low-resolution warped cap can retain visible triangular folds.

## Keep mechanics separate from display offsets

Compute the assembled pose first. Solve all constraints in that coordinate system. Then apply reversible display offsets through an assembly tree. At explosion zero every part must return exactly to its assembled transform. Stage the sequence: covers and captive screws, support plates and bearings, transmission internals, then outputs or elastic elements. Choose local axial/radial removal directions appropriate to each part. Keep each fastener associated with its own cover, and retain the output's local axis during motion.

An exploded mechanism is a disassembly diagram, not a physically operable state. Mark it accordingly. Check zero, intermediate and full explosion in static and moving poses. Inspect whether small components overlap or leave the viewport; fit the visible assembly, provide isolated macro views and retain orientation when the visitor orbits manually. Guide lines should connect an assembled datum to the corresponding displaced part, not arbitrary screen locations.

## Motion hierarchy and verification

Derive transmission motion from the output/input ratio, then derive passive or secondary motion from the same state. Prescribed joint motion, spring energy illustration and actual dynamic force integration are different models: label them accurately. A normalized energy curve does not predict a robot's jump height. Pause must stop all advertised moving parts; idle motion must not defeat pause. Camera tracking should preserve the visitor's orientation and zoom rather than refitting each frame.

Layer motion around the actual transmission: primary locomotion or manipulation, visible internal outputs, then restrained secondary behavior such as tracking, ventilation or elastic recovery. Keep each advertised motion tied to a declared driver and freeze all of them on pause, including cover and explosion interpolation. For prescribed gait phases, check foot-target continuity, stance drift and planned support count at entry, steady motion and stopping; do not present these checks as a contact-force solution.

Before broad visual polish, inspect a close-up of the representative transmission at both motion endpoints. Capture same-camera assembled/section/exploded views and front/side/top silhouettes. Verify the registry, connection residuals, fixed stator vs driven output, reduction ratios, spring anchors, explosion restoration and non-monotonic film seeks. Test actual controls and the real idle-resume delay. Scope collision evidence explicitly: numerical point checks do not establish full-solid clearance.

An open cover does not prove the mechanism is readable. Inspect from the delivery camera: a solid fan shroud can hide its rotor, a neighboring leg can hide a crank, and separated rings can resemble a bellows at a distance while lacking a continuous membrane. Check the actual opening, continuous surfaces and moving end attachments in a macro view. When the complete animal must stay visible, a synchronized inspection inset can help; label any context hidden inside it. Use the same assembled state, restore temporary visibility and renderer state after the inset, and verify deterministic seeks with the inset active.

For a tour switching between service openings, evaluate independent cover channels from absolute time. Carry each outgoing cover's angle into the next chapter and close it smoothly while the next cover opens. Check angles immediately on both sides of each event boundary, plus pause and manual control handoff. Do not use frame-history smoothing for deterministic capture.

Keep a short project iteration record: visible defect, corrective change, new image/check. Rebuild after corrections. Do not reuse old screenshots as evidence. Promote only reusable findings into this skill; leave specimen proportions and machine-specific counts in the project.

For lofted or parametric shells, inspect normal winding, pole closure and mating seams in both shaded close-ups and flat silhouettes. A missing pole cap can resemble a sensor opening; inverted normals can create shadow acne that looks like texture. Verify these before adding surface detail or increasing light intensity.
