# teardown-codex

**What:** A Codex-oriented port of the Claude Code [teardown](https://github.com/elvarofficial/teardown) skill, with a mechanical-ant offline demo.
**Not:** An official Codex product or release. Not endorsed by OpenAI, Anthropic, or the upstream authors.
**Upstream:** [elvarofficial/teardown](https://github.com/elvarofficial/teardown) | [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion)

---

## 当前版本：1.4.1

本次在原有移植与机械蚁演示基础上更新 skill、通用工具和使用说明。下文的原项目介绍、安装步骤、机械蚁示例、限制说明和上游致谢保留。

### 1.4.1 更新说明

- **零件设计与拆解**：完整传动总成、实体件与绘制细节分开登记；检查成形板件、孔槽、轴承座、连接端和开盖后的实际可见性。爆炸偏移与装配运动分开计算，支持连续回装。
- **生物学外形与动作**：加入形态参考、正交轮廓和关节封装检查；明确各附肢的独立驱动、耦合或固定关系，避免关节破坏生物轮廓。区分主体动作、内部传动与辅助动作。
- **动态展示与验证**：补充分总成的连续开合、同步局部窗口、连续变形表面、暂停冻结、相机接管和非顺序寻帧检查。方法来自本地机械角蛙等示例的实际迭代。
- **工具链**：补充环境诊断、机构与形态声明校验、通用浏览器 QA、导览接管和时间轴辅助工具；构建时统一 Three.js 实例，录像遇到页面异常会中止。
- **成片交付**：补充关键动作序列、同机位对照、编码后的尺寸/帧数/音画时长、响度与产物哈希检查。录像和程序化说明音轨已在本地机械角蛙流程中验证；这不表示原机械蚁示例已新增影片，也不证明真实手机或集显性能。

技能版本见 [package.json](./skill/teardown/package.json)，完整规则见 [SKILL.md](./skill/teardown/SKILL.md)。1.1–1.4 的方法和工具改进也随本次同步；参见 [runtime 说明](./skill/teardown/README.md)。

### 包含范围与验证

保留原有约定：本仓不打包 V8 / Cessna / Strandbeest 三台上游示例；机械蚁演示与源码仍位于 `examples/ant/`。模板脚手架需要包含这三台源码的完整 runtime；本仓可直接构建机械蚁或其他工作区自定义入口。运行 `check.mjs` 时会明确报告上游示例的数值检查未运行。

```powershell
node skill/teardown/scripts/core-test.mjs
node skill/teardown/scripts/check.mjs
node skill/teardown/scripts/doctor.mjs --mode page
```

## 最新项目复现：机械角蛙 R3

最新的 [机械角蛙 R3 源码与完整复现步骤](./examples/mecha-frog/README.md) 已加入 examples/mecha-frog/。在安装依赖后，从该目录运行 build.ps1 可构建互动页与影片入口，再按说明进行模型、交互、寻帧和 33 秒成片检查。生成产物保存在各项目的 teardown-out/，不打包进源码。原机械蚁示例继续保留。

## 简介

[elvarofficial/teardown](https://github.com/elvarofficial/teardown) 是给 Claude Code 用的 Agent Skill：用白话说「给我做一台能拆开的某某机器」，它吐出一页离线 HTML。机器在中间跑，四周面板读的是同一套真数，一点就能打开正在干活的零件，没人碰的时候页面自己导览。示例里有 V8、赛斯纳起落架、还有沙滩上的 Strandbeest——沙色工程纸底，连杆就是画面。它又站在 [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) 那套 motion 工具上。作者有一篇 [Article](https://x.com/elvar_official/status/2116174609355571402) 把「任意机械 → 可拆模拟器」讲得很清楚。

这套东西太完整了：装 skill、按图生成、model-first、再加 critic 多轮改——整条链都在。公开说明写的是 Claude Code；我翻过 fork 和关键词，没看到现成的「Codex 专用复刻」仓。Agent Skills 两边都能认 `SKILL.md`，所以格式上可以往 Codex 里塞。这个仓库就是一次 **Codex 侧移植**，并附上一只机械蚁示例，证明功能链能接通、纸面也能靠近一截。

## 上游与致谢

详见根目录 [`NOTICE`](./NOTICE) 与 [`LICENSE`](./LICENSE)（MIT）。

- 方法论与大量实现来自 [elvarofficial/teardown](https://github.com/elvarofficial/teardown)
- motion / 成片底座来自 [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion)
- 本仓 **不是** 官方 Codex 发行，也 **不** 暗示上游背书

上游三台官方示例（源码与成品）**故意不拷进本仓**。在上游仓里构建：

```bash
node sims/build.mjs v8-live
node sims/build.mjs cessna-live
node sims/build.mjs strandbeest-live
```

官方安装命令请以上游 README 为准（常见为 Claude Code 的 skill 安装路径）。

## 快速看蚂蚁演示

浏览器直接打开：

[`examples/ant/ant-live.html`](./examples/ant/ant-live.html)

做成了什么：

- 相位驱动三角步态；下颌可单独拧
- 爆炸 / 切面 / 部件隔离 / 自动导览
- HUD 绑同一帧模型状态（步态相位、功率估计、六腿负载等），不是写死装饰表
- 暖米色工程纸面；单文件离线 HTML ≈810KB

建议用本地静态服务或 `file://` 打开。工程参考图在 [`examples/ant/ref/`](./examples/ant/ref/)（爆炸 / 正交 / 运动学）。

## 安装到 Codex

需要 Node 20+、npm；若要跑 capture/成片还要 Playwright Chromium、ffmpeg/ffprobe、Python 3。

先克隆本仓：

```powershell
git clone https://github.com/HuaJuan2023/teardown-codex.git
cd teardown-codex
```

把本仓的 `skill/teardown` 拷到 Codex skills 目录，例如 Windows：

```powershell
Copy-Item -Recurse -Force .\skill\teardown "$env:USERPROFILE\.codex\skills\teardown"
```

或在任意可写目录保留一份，让 Codex 会话从该路径解析 `SKILL_DIR`（见 `skill/teardown/SKILL.md`）。

一次性装依赖（在 skill 目录内）：

```powershell
$SkillDir = (Resolve-Path '.\skill\teardown').Path
Push-Location -LiteralPath $SkillDir
try {
  npm.cmd install
  npx.cmd playwright install chromium
} finally { Pop-Location }
```

PowerShell 下优先用 `codex.cmd` / `npm.cmd` / `npx.cmd`，避免执行策略拦 `.ps1`。

## 复现蚂蚁

源码在 [`examples/ant/`](./examples/ant/)（`ant-live/` + `ant-shared/`）。

进入 `examples/ant` 后：

```powershell
cd examples\ant
.\build.ps1
```

`build.ps1` 会调用仓库内 `skill/teardown/sims/build.mjs`，对 `./ant-live` 出包。构建产物默认落在工作区的 `teardown-out/`（已 gitignore）；仓内已提交的 `ant-live.html` 是最后验收过的演示页，可直接打开对照。

## 与上游示例对照

| 对照 | 去哪看 |
|---|---|
| Strandbeest / V8 / Cessna | 上游仓构建，不要指望本仓有拷贝 |
| 机械蚁 | 本仓 `examples/ant/` |

并排打开上游 Strandbeest 和本仓蚂蚁时，功能清单可以齐，纸面气质差在「机构本身就是视觉」——多轮 critic（机 / 场 / HUD）比「装上 skill」更关键。

## 已知限制

- **机构密度**：蚂蚁连杆/关节是示意级，不是可制造 CAD；和 Strandbeest 示例比，视觉厚度仍短一截。
- **仪表真数**：面板绑的是模型状态，不是真机遥测。
- **性能 / 成片**：未系统压集显帧率与手机；今天停在可交互离线页，没走 skill 那条录像＋程序化音轨成片。
- **移植不等于官方**：路径、沙箱、技能目录习惯和 Claude Code 不一样，坑要自己踩。

## License

MIT。见 [`LICENSE`](./LICENSE) 与 [`NOTICE`](./NOTICE)。