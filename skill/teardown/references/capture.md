# Capture, score, review

Run from the workspace; $SkillDir is the resolved skill/runtime copy. Build the deterministic film entry, not live.js: live entries usually use their own clock; their RAF must stop when exposing a capture contract.

```powershell
node "$SkillDir/sims/build.mjs" v8-film
node "$SkillDir/sims/capture.mjs" v8-film --size 1600x900 --dpr 1.2 --stills beats --cols 4 --out teardown-out/v8-beats.png
node "$SkillDir/sims/capture.mjs" v8-film --size 1600x900 --dpr 1.2 --still 12.5 --out teardown-out/v8-12.5.png
node "$SkillDir/sims/capture.mjs" v8-film --size 1600x900 --dpr 1.2 --fps 60 --out teardown-out/v8-silent.mp4
python "$SkillDir/run_sfx.py" "$SkillDir/sims/v8-shared/score.py"
ffmpeg -y -i teardown-out/v8-silent.mp4 -i teardown-out/v8-score.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart teardown-out/v8.mp4
node "$SkillDir/sheet.mjs" --video teardown-out/v8.mp4 --timeline "$SkillDir/sims/v8-film/timeline.json"
node "$SkillDir/wave.mjs" teardown-out/v8.mp4 --timeline "$SkillDir/sims/v8-film/timeline.json"
```

Use py -3 instead of python if needed. Use & $env:FFMPEG for a custom executable. --size is CSS layout; DPR 1.2 turns 1600 x 900 into 1920 x 1080. Use even output dimensions for yuv420p. Capture prints its GPU; inspect software rendering before making performance claims.

Custom entries: build a directory, then pass its basename to capture. Supply --timeline './my-machine-film/timeline.json' for --stills beats; the default lookup only knows bundled names. Do not pass a generated .html path for a SIM entry: .html selects the separate seek contract.

## Review loop

1. Capture --stills beats: zero and every explicit `events[].at` (or legacy `beats[]`) +0.3 seconds.
2. Open every tile against the reference; inspect full frames if sheets are too small. Use an available image viewer or browser/computer-use tool; no particular connector is required.
3. Scrub transitions with --stills every:0.2 --from 3 --to 5, or --still 4.1.
4. Fix parameters, geometry, camera or UI; rebuild and repeat until a complete pass finds no remaining issue.
5. Extract final MP4 sheets with sheet.mjs and open those too. Verify ffprobe duration/frame count, page errors and final audio. Capture aborts on uncaught page exceptions. Test non-monotonic seeks (e.g. 8 → 2 → 8) before recording. Fit the camera to the intermediate exploded amount as well as both endpoints. Report blocked steps without claiming completion.

Checklist: intended contacts touch; no intersections; readouts agree with pose; one focal point per frame; 60 px edge margin; labels do not obscure parts or clip; key values readable at phone width; whites/metal preserve shape; bloom preserves detail; text holds 1 second plus 0.25 seconds per word beyond three. Test every subsystem and immediate handoff/25-second idle return in the live page.

For comparisons across iterations, hold camera, framing, pose, opening amount and lighting constant, and label which version is shown. During a staged tour, review moving sequences around cover handovers, maximum extension, explosion and return; one still per chapter can miss a snap or a floating attachment. In a multi-view renderer, also test pixel repeatability while the inspection view is active and confirm that temporary visibility, viewport and scissor changes are restored.

Before handoff, use ffprobe to check encoded dimensions, rate, frame count and separate audio/video durations against the capture range and timeline. Record the current artifact hashes and the checks actually run in the project. If a partial segment is re-recorded, splice by exact frame ranges, then inspect the newly encoded result and recheck audio alignment. On Windows, give ffmpeg drawtext an explicit existing font file if font discovery fails.

## Procedural sound

python run_sfx.py --list lists generators. sfx/score_kit.py supplies beds, chords, motor, air and accents; sfx/synth.py supplies reproducible 48 kHz synthesis and sample() for bundled CC0 recordings. Sample decoding needs ffmpeg; pure synthesis does not. Provenance: sfx/samples/SOURCES.md.

Write score(mix, tl) with TIMELINE relative to the score file, OUT in workspace/TEARDOWN_OUT, SEED and TARGET_LUFS=-14. Read every cue time from the shared timeline. The three bundled film scripts and scores now consume the same `events` array. Their physical model formulas still contain assumptions; a shared timeline alone does not prove physically exact sound. Accent changes without sonifying all continuous motion; keep tonal sounds in one key. Mixer aims at -14 LUFS with a -2 dBFS true-peak ceiling before AAC; sparse scores may master quieter. Verify final AAC with wave.mjs (advisory peak limit -1 dBFS). Inspect waveform hits against event lines and listen when an audio tool is available.

Optional --music track.wav invokes sims/beats.py through PYTHON, caches analysis and can sync the kit director; --music-start auto|SECONDS, --no-sync and --lufs adjust it. This is separate from procedural scoring. For a trimmed film, trim/offset the score identically before muxing. Do not use -shortest to conceal accidental duration mismatch.
