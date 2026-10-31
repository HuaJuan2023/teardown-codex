---
name: teardown
description: Build an interactive 3D simulator of a real machine or mechanism as an offline HTML visual explainer, with model-driven panels, subsystem buttons, cutaway and exploded view modes, camera views, and an auto-tour that hands control to the visitor. Use for /teardown requests, interactive 3D lessons, working machine teardowns, and frame-accurate films with procedural sound. Use code geometry and kinematics when the object must actually work rather than appear as a static illustration.
---

# Teardown

One machine, one driveable page, optionally a film of the same machine. Resolve `SKILL_DIR` from the directory containing this file. All runtime resources are vendored here. Create new sources and outputs in the user's workspace rather than modifying the installed skill.

## Setup and Windows execution

Requires Node 20+ and npm; Playwright Chromium for capture; ffmpeg and ffprobe on PATH for video/sheets; Python 3 for sound (standard library only). Read [references/workflow.md](references/workflow.md) when building a machine and [references/capture.md](references/capture.md) when capturing or scoring.

In PowerShell prefer `codex.cmd`, `npm.cmd`, `npx.cmd` if execution policy blocks `.ps1` wrappers. Quote paths, invoke quoted executables with `&`, and prefer workspace-relative paths. Never use a Claude installation path.

One-time setup in a writable runtime copy:

```powershell
$SkillDir = (Resolve-Path './skill/teardown').Path # or actual installed directory
Push-Location -LiteralPath $SkillDir
try {
  npm.cmd install
  if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }
  npx.cmd playwright install chromium
  if ($LASTEXITCODE -ne 0) { throw 'Chromium install failed' }
} finally { Pop-Location }
```

For workspace-only sessions copy the runtime into the workspace first, and keep npm cache and `PLAYWRIGHT_BROWSERS_PATH` there. Do not install to the user profile from such a session. `TEARDOWN_DEPS`, `TEARDOWN_OUT`, `CHROMIUM`, `FFMPEG`, `FFPROBE`, `PYTHON` override paths. Executable variables contain a path alone, without embedded quotes or arguments. If only `py -3` works, use it directly for sound and set `PYTHON` to the actual python.exe for capture's music analysis.

Run authorized local work under the current sandbox. When Shell approval is required for downloads, browser/process launch or outside-workspace writes, explain the concrete command and request approval through the host if available. Under approval policy `never`, report and skip the blocked operation and continue independent checks. A skill cannot grant permissions. Publishing requires authorization for the destination.

Invoke with `$teardown`, `/skills`, or natural language. Recognize `/teardown` as a trigger phrase if delivered to the model; this package does not register a CLI slash command. If rejected by the CLI, use `$teardown` or natural language. Keep implicit skill selection enabled.

## Pipeline

1. **Pick machine + reference.** Use a real photo, manual cutaway, measured drawing or motion clip. Record provenance, dimensions and assumptions in the project. Find an appropriate reference with available tools if none was supplied; do not label invented dimensions as measured. Define the mechanical question and useful subsystem controls.
2. **Model first.** One input (crank angle, stroke, wind) produces all poses and readouts. Write math and units before geometry; separate it from Three.js where practical (Cessna combines them). Check endpoints, joint lengths, ratios and continuity numerically. Use exact solvers rather than keyframed mechanical motion. Correct collisions with parameters rather than hiding them with a camera.
3. **Console.** Panels, charts and labels consume the same frame state as geometry. Give each useful subsystem a button; include speed/input, pause, views and appropriate isolate, glass, section or exploded controls. Each must visibly work. Reuse the examples' projected leaders and consoles rather than inventing decorative gauges.
4. **Look.** Use procedural geometry, a pale studio, one accent marking the active part, shadows and restrained post. A multi-leg linkage needs a three-quarter view along its spine. Aim for 60-70% viewport occupancy, a 60 px safe margin, and principal labels around 34 px at 1080 output; verify legibility at phone width. Check white surfaces and metal for lost detail.
5. **Critic stills.** Build the film entry, capture frame zero and every scripted beat, open every tile against [the review checklist](references/capture.md), zoom into suspect transitions, fix and recapture. Never declare visual completion without reading current images. If vision/browser tools are unavailable, explicitly leave visual QA unverified.
6. **Driveable page.** Reuse the film script as an auto-tour with a cursor. Click, drag, wheel or key hands over immediately without a state jump. Resume after 25 seconds of quiet and provide a resume control. Test buttons, sliders, orbit, zoom and keys. Live input may accumulate time; capture uses a separate deterministic film entry. Implement quality tiers and shader warm-up; measure on an iGPU before claiming iGPU performance.
7. **Film.** Make `render(t)` seekable, render at `from + frame/fps`, score from the same timeline, mux, then inspect encoded MP4 sheets and final loudness. Match requested formats; a page-only task does not require a film.
8. **Optional publish notes.** Prepare title, poster, description, attribution and adjacent asset list. Aim for HTML under 1 MB; externalize heavy GLBs with `build.json` if needed. External fetched assets may require HTTP hosting rather than `file://`. Do not claim publication before a URL exists.

## Examples and build commands

Read the closest example deeply; consult others as needed:

| Example | Driver and reusable features |
|---|---|
| `sims/v8-*` | Exact slider-crank; firing order 1-8-4-3-6-5-7-2; valves and illustrative pressure model; cylinder picker and cutaways. |
| `sims/cessna-*` | Stroke 0..1, 32-tooth module-4-mm pinion, half-turn folding gear; takeoff/landing, x-ray, section and exploded modes. 201 mm is rounded from 201.062 mm. |
| `sims/strandbeest-*` | Twenty legs from Jansen lengths and circle intersections, wind integrated into crank angle; instancing, foot traces and contact charts. Start here for a walking robot. |

Each has `-shared` (model/geometry/stage/console/live/film/score), `-live/main.js` and `-film/main.js` with a seconds-only `timeline.json`. `sims/kit` supplies runtime, generic HUD/director, stage, utilities and warm-up. Machine controls, auto-tour, cutaways and quality tiers live in example code; importing the kit alone does not implement them.

Run from the project workspace so outputs go to `./teardown-out`:

```powershell
node "$SkillDir/sims/build.mjs" v8-live
node "$SkillDir/sims/build.mjs" # all six entries
node "$SkillDir/sims/build.mjs" './my-machine-film'
```

Custom entries are folders with `main.js`. Use `teardown-kit/runtime.js` and `teardown-kit/util.js` aliases; the builder resolves them and dependencies outside the skill folder. Keep sibling workspace `my-machine-shared`, `my-machine-film`, `my-machine-live` folders. See references for contracts and capture commands.

At handoff give source/HTML paths, controls, reference and assumption provenance, checks actually run, and unfinished verification. Keep the bundled MIT LICENSE and credit when redistributing runtime code.
