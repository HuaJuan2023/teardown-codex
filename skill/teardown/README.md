# Teardown runtime for Codex

This package ports the instructions and vendors the runtime of
[elvarofficial/teardown](https://github.com/elvarofficial/teardown) (MIT).
The kit, capture, sound engine and review rules originate in
[whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) (MIT).
Keep [LICENSE](LICENSE) when redistributing code. Recorded samples are CC0,
prepared by Barty-Bart/motion-graphics; see [sample sources](sfx/samples/SOURCES.md).

The runtime includes the shared kit helpers, build/capture/beat analysis, sheet and
waveform tools, pure Python sound engine plus twelve recordings, and shared model/QA helpers. This repository omits the three upstream machine
examples; obtain them separately for template scaffolding or bundled-model tests. Promotional images and upstream Git metadata
are excluded.

Version 1.4.1 consolidates the mechanical-frog review: formed-part quality, readable service openings, continuous deforming surfaces, synchronized inspection views, independent cover handovers, pause/orbit checks and encoded-delivery verification. Mechanical frog R3 is provided under repository examples/mecha-frog; the three upstream machine examples remain separate.

Version 1.4 adds a [meaningful assembly-detail workflow](references/assembly-detail.md): complete transmission prototypes, honest part inventories, local staged explosion, motion hierarchy and same-camera macro acceptance. Mechanical creatures remain distinct from biological anatomy. Version 1.3 adds appendage coverage and local joint-envelope review, connected deposition/weaving paths, actual outlet attachment checks and idle-resume boundary guidance, validated in the local mantis and spider projects. These projects live in the workspace; the upstream three-machine example set remains separate. Version 1.2 adds a reference-driven biological form workflow, orthographic silhouette acceptance, and a declared morphology validator. Version 1.1 added environment diagnostics, a working-example scaffold, actuator/joint manifests, reusable clock and focus helpers, browser QA, shared event timelines for the three films and scores, and fatal capture-error handling. Physical sound formulas retain assumptions; common event timing does not make them sensor data. Read the engineering and capture references linked from SKILL.md.

Install npm dependencies here and Playwright Chromium once. Node >=20 is needed;
video needs ffmpeg/ffprobe, sound needs Python 3. From a project workspace run
`node "<runtime>/sims/build.mjs" ./my-machine-live`. Outputs resolve from the current working
directory to teardown-out, or TEARDOWN_OUT. Copy new machine sources into your
project and import teardown-kit aliases. Follow [SKILL.md](SKILL.md).

The port is self-contained in source, but node_modules and Chromium binaries are
not bundled. No Claude CLI, user profile path or remote asset fetch is needed for
bundled example pages after building. This package does not register /teardown as
a CLI command or automatically publish a site.
