# Mechanical evidence and acceptance

Use this for articulated machines, especially robots with independently actuated joints. The visible mechanism must explain how the output is constrained and driven.

## Joint and actuator map

Before adding detail, enumerate moving rigid links, joint axes and parent/child relationships. Every moving joint must identify an actuator, an explicit coupling equation, or an intentional manual input. A joint driven directly by animation with no visible actuator or linkage is an incomplete assembly. Fixed mounts belong to the parent link; horns, crank pins and driven levers belong to the output. Verify their world directions against the solver over the motion cycle. Account for keyed horn neutral and command travel separately from link angle.

For complex custom mechanisms write `machine.json` and run:

```powershell
node "$SkillDir/scripts/validate-machine.mjs" ./machine.json
```

Contract: `units` is `mm` or `m`; `reference` records provenance; `assumptions` lists design approximations. `actuators:[{id,input}]` maps input state to outputs. `joints:[{id,parent,child,axis,axisFrame,drive}]` uses normalized axes in the documented frame. `drive` is `{type:'actuator',id}`, `{type:'coupling',equation}`, or `{type:'fixed'}`. Document external manual inputs in the coupling equation and assumptions. This manifest checks declared coverage, not geometric correctness or manufacturability.

`readouts:[{id,unit,source,equation}]` classifies each value as `command`, `derived`, `estimate` or `measured`. Measured values need an actual sensor/data source; estimates need equations and assumptions. Contact commanded by gait phase is not measured foot force. Power or temperature does not follow from joint angle alone. Prefer fewer meaningful readouts over unsupported instruments.

## Geometry that carries information

Build the load path: stator mount → shaft/bearing → output horn/crank → link → next joint. Add clevises, bushings, plate thickness, mounting ears, fasteners and cable routes where they explain assembly. Avoid decorative gears with no mechanical purpose. Manufacturer dimensions may justify a package envelope; they do not justify invented internal tooth counts, machining tolerances or strength claims. A procedural concept can be precise without claiming to be production CAD.

Check residuals, endpoints, reachable targets, travel limits, phase continuity and linkage lengths numerically. For independent axes sweep input phase and the amplitude range. Collision reports must name their tested solids and sampling intervals. Package OBB checks do not establish full-solid or swept-volume clearance. Static/dynamic load, fasteners, wires, ground contact, slip and thermal limits need separate evidence when relevant.

## Live and film acceptance

The shared kit provides `operator.js` for phase-preserving handoff/idle resume and `focus.js` for fitting selected assemblies. These are helpers; test their integration. A phone layout must reflow or intentionally simplify panels rather than scale a desktop console into unreadable text. Inspect inherited theme variables and text contrast in screenshots.

Exercise zero and maximum amplitudes as well as the default animation; controls shared across subsystems can leave one axis moving when the user requests zero motion. Test the real idle-resume path. A resume callback can read a newer clock than the current RAF timestamp, so clamp local tour time at zero or fall back to the first event before dereferencing it. Preserve the current mechanical phase on handoff; only an explicit restart should reset a process cursor.

Pause tests should include an opening or explosion mid-transition, plus auxiliary movement, rather than only a stationary mechanism. Compare world transforms after the pause has taken effect. For orbit tests, wait for damping to converge within a bounded timeout before checking that orientation and zoom remain stable during motion; a fixed short delay can confuse slow rendering with unwanted camera refitting.

For custom machines, expose `window.TEARDOWN={ready:true,snapshot()}` with semantic state. `snapshot` must include all mechanically relevant outputs. Run:

```powershell
node "$SkillDir/scripts/qa.mjs" --live ./teardown-out/dist/my-live.html --film ./teardown-out/dist/my-film.html --timeline ./my-film/timeline.json --adapter ./qa-adapter.mjs --out ./teardown-out/qa
```

Optional adapter exports `modelCheck()` and `liveCheck(page,{screenshot})`; assertions fail the report. Test important controls, alignment and actual collision bodies here. Generic QA checks page exceptions, mobile overflow, seek-state repeatability, screenshot drift and RAF cadence on the current GPU. It saves images and a JSON report even on test failure. Inspect the images yourself. RAF cadence on a desktop GPU does not establish phone/iGPU performance. Pixel comparison permits a tiny edge-noise tolerance; semantic state remains exact.

Use one timeline with `duration`, `fps`, `events:[{id,at,...parameters}]`. Only `at` is time; rpm, dimensions and actuator IDs remain data. Live tour, film script, review stills and score cues consume this file. For mechanical sound, export a track from the same model and verify its parameters match the timeline. Call it procedural sonification unless it is recorded sound. Physical cue approximations, such as an assumed touchdown phase, remain approximations even when event timing is shared.
