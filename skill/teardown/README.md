# Teardown runtime for Codex

This package ports the instructions and vendors the runtime of
[elvarofficial/teardown](https://github.com/elvarofficial/teardown) (MIT).
The kit, capture, sound engine and review rules originate in
[whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) (MIT).
Keep [LICENSE](LICENSE) when redistributing code. Recorded samples are CC0,
prepared by Barty-Bart/motion-graphics; see [sample sources](sfx/samples/SOURCES.md).

The runtime includes the seven kit files, build/capture/beat analysis, sheet and
waveform tools, pure Python sound engine plus twelve recordings, and three compact
complete machines (six live/film entries). Examples are executable templates, not
additional required dependencies. Promotional images and upstream Git metadata
are excluded.

Changes: Codex workflow and Windows commands, environment/PATH-based sample
ffmpeg, populated review timelines, capture argument/error checks and a
dependency-free packaging/kinematics check (`node scripts/check.mjs`).
The inherited scores still mirror some timing/model constants; review manifests
do not yet make all film and audio events a single source of truth.

Install npm dependencies here and Playwright Chromium once. Node >=20 is needed;
video needs ffmpeg/ffprobe, sound needs Python 3. From a project workspace run
`node "<runtime>/sims/build.mjs" v8-live`. Outputs resolve from the current working
directory to teardown-out, or TEARDOWN_OUT. Copy new machine sources into your
project and import teardown-kit aliases. Follow [SKILL.md](SKILL.md).

The port is self-contained in source, but node_modules and Chromium binaries are
not bundled. No Claude CLI, user profile path or remote asset fetch is needed for
bundled example pages after building. This package does not register /teardown as
a CLI command or automatically publish a site.
