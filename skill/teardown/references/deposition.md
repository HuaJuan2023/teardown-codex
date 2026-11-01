# Material paths and generated structures

Use for weaving, extrusion, filament winding, cable laying, painting or similar demonstrations. This is a kinematic explanation unless material/contact physics is separately implemented and validated.

## Connected process state

Represent the itinerary as ordered segments with endpoints, process stage, length and whether material is emitted. Separate travel along an existing structure from laying a new line. Use cumulative path distance or an explicit stage cursor to locate the active segment and its partial endpoint. Check adjacent endpoints for continuity; do not create the finished object by opacity alone while the tool remains disconnected.

Derive tool/body placement, outlet transform, current lead, completed geometry and feed readouts from that cursor. Attach the lead to the actual moving nozzle, spigot, pulley exit or brush frame, not a nearby dummy point. Recompute the outlet in world coordinates after parent/joint transforms. Inspect the connection in overview, close-up and partial construction states.

When using a roller or spool analogy, relate rotation to transported length and declared effective radius. Non-emitting travel must not add deposited material or feed length. Distinguish cumulative material used from the length currently visible if a temporary structure is removed. A geometric length is derived data, not measured tension, flow or force.

Keep rendering seekable: clear or recompute segment visibility and the active endpoint for every requested cursor. Test progress forward, backward, at stage boundaries and at completion, including a repeat such as 75% → 10% → 75%. For a biological process, label mechanical analogies and omitted chemistry/behavior. Declare presentation transforms such as laying a normally vertical web on a horizontal teaching fixture, accelerated construction or simplified removal of a temporary scaffold.

## Useful controls and checks

Expose overall progress, pause/restart, useful stage jumps and a local tool close-up. Keep the current output readable when switching from locomotion to production; use nozzle angles/feed length instead of unrelated leg readouts in a spinneret close-up.

Validate path continuity, finite poses, generated-length accounting and the connection between transformed outlet and lead endpoints with a stated buffer tolerance. Check zero and maximum control amplitudes, transitions between emitting/travel segments, and repeated seeks. These checks do not prove collision-free assembly, adhesion, material strength, molecular behavior or stable contact with the generated structure.
