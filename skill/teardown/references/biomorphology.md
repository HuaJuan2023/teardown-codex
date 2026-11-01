# Biological form before mechanism detail

Read for biomimetic machines, animals and insect-inspired robots when recognition or anatomical form matters. Apply alongside engineering.md. This extends Teardown; the upstream machine examples do not supply biological modeling expertise.

## Establish a form reference

Choose a taxon, life stage and (when consequential) sex or morph. Use an identifiable specimen image plus an authoritative morphology source. Record URLs, image credit, views available and what each source supports. A single perspective photo does not establish hidden dimensions. Mark proportions estimated from images separately from measured specimen data and engineering design choices. Do not mix a wingless juvenile with an adult's wings or combine different species without declaring a deliberate hybrid design.

Define the few landmarks and shapes that make the subject recognizable. For an insect these may include the body segment transitions, leg attachment sites, antenna insertions, eye positions and folded appendage angles. Ratios are usually more useful than arbitrary absolute size. A JSON contract can record reference IDs, landmarks and ratio ranges; `scripts/validate-morphology.mjs` checks the declared design, not biological truth.

Contract fields: `taxon`, `stage`, `designScope` and `units` (`mm`, `m` or `normalized`); `references:[{id,url|path,supports}]`; `landmarks:{name:[x,y,z]}`; `ratios:[{id,numerator:[pointA,pointB],denominator:[pointC,pointD],range:[min,max],basis,referenceId}]`; `features:[{id,views:[...],referenceId}]`. Landmarks use one declared coordinate frame. Range limits are design acceptance unless supported by actual specimen measurements. Run `node "$SkillDir/scripts/validate-morphology.mjs" ./morphology.json`.

## Build and inspect the silhouette first

Before bolts and dashboards, build simple continuous volumes or tapered profiles for the head, thorax, abdomen and limbs. Make front, side and dorsal orthographic images plus a three-quarter hero image. Inspect solid monochrome silhouettes with materials, markings, labels and mechanism detail disabled. A model recognizable only because of color, painted eyes or a title needs better proportions.

Check: major volume ratios and tapers; segment transitions and gaps; posture and limb insertion; appendage count; distinctive negative spaces; symmetry or documented asymmetry. Compare available views against reference photos. State missing views. Numeric ratios passing does not constitute a visual pass or a measured biological match.

## Fit the mechanism inside the form

Treat the approved outer contour as a design constraint. Fit stators, bearings, joints, cable routes and mounts before detailing. Show which features are load-bearing structure and which are covers. If a package does not fit, change the actuator scale, transmission, proportion or stated design scope; do not bury collisions under a skin. Do not describe an invented miniature actuator as an available SKU.

Adding motion can spoil an already readable animal. Compare the same exterior pose before and after installing drives, then inspect orthographic silhouettes again. Size hip, knee, wing-root and neck mechanisms for their local segment envelope; repeated spherical or box-shaped housings should not dominate slender limbs. When reducing a concept drive, update the motor, gears, shaft, cover, declared dimensions and clearance checks together. A visual miniature is not evidence that such a motor exists. Do not reuse one example's scale percentages as biological or engineering defaults.

Inventory the requested moving appendages and functional parts before implementation. Mark each output as independently actuated, explicitly coupled, intentionally fixed or out of scope. Show useful isolated motions alongside coordinated motion; test that every promised appendage actually changes pose. Anatomical segments need not each have a separate motor: document coupled distal links. Choose a biological form consistent with the requested behavior, such as an orb-weaver reference for an orb-web process, and distinguish the biological structures from explanatory robot hardware.

Verify the stator origin at its declared joint as well as the output direction; test meshing gear center distances through the motion. Output-only checks can miss a case mounted on the wrong end of a link.

Rigid shells follow the same joint frames as their internal links. Folded appendages need local pivots and real clearance, not independent shell animation. Deformable anatomy may require skinned meshes or external GLB assets; code lofts, curves and tapered links suit simpler shells. Choose based on visible shape, not a blanket preference for primitives. Naturalistic shape does not establish naturalistic force, gait or behavior.

In an isolated subsystem, hide unrelated root-level covers and connectors as well as parent assemblies. Use a view that exposes its actual outlets and transmission. Surface markings should follow the curved skin rather than float above it like structural ribs. Check these details in current close-ups; numeric landmark ratios do not detect them.

## Three readable layers

Provide an exterior view, a structural/exoskeleton view and a mechanism view; add an exploded view when it clarifies assembly. Keep the exterior as the opening hero when biological identity is the question. Opening the model should preserve identity landmarks. A cutaway should reveal a specific load or transmission path; opacity changes alone are not an explanation.

Drive labels and readouts from shared state. Distinguish biological reference from engineering analogy in the product. For example, a tendon spool is an explanatory robot transmission, not a claim about an insect's muscles. Avoid biological claims based solely on a stylized render.

## Acceptance and iteration

For a new biomimetic example capture and open: exterior hero; front/side/dorsal silhouettes; appendage close-up at motion endpoints; structural and mechanism layers; exploded assembly; mobile layout. In films inspect the transitions as well. Keep an iteration note stating the visible defect, change and new evidence. Use a second render after changes; do not relabel an old image as verification.

Run engineering checks for link lengths, output alignment, declared actuator dimensions, ground/contact assumptions and tested interference scope. Add shell landmark/attachment checks. Compare projected silhouettes or landmark ratios only when the reference view is calibrated; do not invent an image similarity score as a substitute for inspection.

At handoff separate: numerical design checks, manual visual findings, measured reference data and unverified physical behavior. Include the source contract and current reference sheet. A visually convincing concept is still a concept unless manufacturing and hardware claims have evidence.
