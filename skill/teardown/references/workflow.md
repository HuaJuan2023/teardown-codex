# Engineering and architecture

## Source layout

| File | Responsibility |
|---|---|
| `model.js` (`kin.js`, `jansen.js`) | Real units, dimensions, one input -> poses and numbers. No renderer required. |
| `geometry.js` (`engine.js`, `beast.js`, `gear.js`) | Code geometry and update(input) or update(state). Cessna gear.js also contains its dimensions and kinematics. |
| `stage.js` | Studio, lights, shadows, post and frame(state, camera). |
| `console.js` | Example 1600 x 900 overlay, charts, toggles, callouts and leaders; update(state). Scale/letterbox responsively. |
| `film.js` | Operator SCRIPT, pure time model, deterministic camera and render(t). |
| `live.js` | Input, orbit, speed, tiers, tour and handoff; reuse model and film helpers. |
| `timeline.json`, `score.py` | Seconds-only event manifest and reproducible score. |

## Deterministic film contract

```js
import {runSim} from 'teardown-kit/runtime.js';
import {rng} from 'teardown-kit/util.js';
const DEFAULTS = {duration: 20, fps: 60, theme: 'light',
  hud: {enabled: false}, director: {enabled: false}};
runSim(DEFAULTS, async ({cfg, canvas, capture}) => {
  const random = rng(cfg.seed); // setup only; precompute particles here
  // Build geometry, console and lookup tables here.
  return {
    render(t) { /* compute full state from t, pose, update panels, draw */ return {}; },
    resize() { /* update renderer and projection */ },
  };
});
```

runSim exposes window.SIM.ready, .duration, .fps and .render(t) in capture mode (?capture or injected __CAPTURE). It does not create the machine. capture.mjs also supports foreign HTML with window.seek(t), frozen on ?render, and window.DURATION or explicit --to.

Film rendering must not depend on Date, previous frames, frame delta or Math.random. Seed randomness at setup; pre-simulate particles/agents into arrays and integrate speed in closed form or tables at setup. Seek out of order, e.g. 8, 2, 8 seconds: poses, panel numbers and images at both 8s must agree. Live camera smoothing and input integration may be stateful; keep them out of the film path. Frame zero is a ready-to-share thumbnail showing the machine.

## Numeric checks

- Sweep a full cycle: all coordinates finite and continuous; joint lengths close within a declared unit-based tolerance. Handle impossible circle intersections explicitly when changing dimensions; the inherited Jansen solver clamps negative square roots and is not a general constraint validator.
- V8: check 145 mm rod length, 89 mm stroke, periodic pose, eight evenly spaced firings per 720 degrees and valve bounds 0..1. Pressure is an explanatory approximation, not validated thermodynamics.
- Cessna: pitch diameter = 32 x 4 mm = 128 mm; half circumference = 201.06193 mm. Geometry uses rounded 201 mm and exactly pi radians, so allow 0.062 mm rounding discrepancy rather than claiming exact rack/pinion closure. Flight phases are illustrative.
- Strandbeest: check every joint pair in LINKS against HOLY on both sides over a full turn; contact/readouts must use the same solved feet. Gait and wind response are not validated aerodynamic/contact physics.
- A new multi-actuator robot can use one phase driving a documented gait/controller; do not pretend independent degrees of freedom are one exact linkage. Include reach limits, branch choices, contact phases and self-collision checks appropriate to the reference.

## Performance and appearance

Copy TIERS and slow-frame monitoring from an example live.js: lower pixel ratio, AO off, smaller shadows and alternate-frame panel redraw where appropriate. Profile the costly shader first; repeated displacement can dominate everything. Warm materials and post passes with kit/warm.js / warmComposer. Document actual GPU, viewport and frame times. Desktop capture is not proof of iGPU live performance.

Instance repetitive geometry. Planar linkages seen face-on collapse into a lattice. Open the working part; go inside when useful. Give near-white parts a darker ground or ink outline. Large metal surfaces often need roughness >=0.45 and environment intensity <=0.5; emissive layers below 1 prevent bloom from eating detail.

Entrances: cubic-bezier(0.16,1,0.3,1). Exits: cubic-bezier(0.6,0,0.9,0.35), half as long. State changes: cubic-bezier(0.65,0,0.35,1). Linear time for continuous mechanical motion. Keep an informative element alive during a held explanation.

Three.js / ANGLE pitfalls:

- Never reverse GLSL smoothstep bounds; use 1.0 - smoothstep(low, high, x).
- Use polygonOffset for near-floor decals/ShadowMaterial in post targets; DoubleSide for mirrored ground quads.
- Clamp pow bases to prevent NaN pixels poisoning bloom.
- Cutaway GTAO needs identical clipping planes on gtao.normalMaterial or a pale ghost remains.

## Timeline ownership

Author times once in timeline JSON and derive JS script and score cues from it; the three bundled examples use shared events. Keep dimensions, amplitudes and IDs as named data rather than event timestamps. Use the event-aware review walker; a legacy recursive numeric walker can misread RPM or dimensions as seconds. Shared cue timing does not validate sound formulas or presumed contact phases: check changed motion parameters against the score and label approximations.

## Packaging and publication

Builder inlines fonts, Three.js and code. build.json supports swap GLB replacements or external GLB mappings; files copies runtime decoders from dependencies. A loader must recognize the emitted url: string. Ship the generated .assets.json and every listed adjacent file. Prepare title/description/share card and poster in a publishing wrapper if needed; the generic builder only emits title and viewport metadata. No hosting integration is bundled.
