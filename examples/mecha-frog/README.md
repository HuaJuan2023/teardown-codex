# CERATO R3 / 机械角蛙

由 teardown 1.4.1 工作流迭代验证的原创仿生机器人示例。宽头、角状眼罩、折叠后肢；包含潜行、剪叉捕获、后肢加载、风箱、旋转拆解、连续回装及规定跳跃轨迹。

这是机械角蛙 R3 的可复现源码；原机械蚁示例另行保留。上游 runtime 来自 elvarofficial/teardown 与 whaleyxbt/claude-motion，MIT。

## 安装与构建

先按仓库根说明在 skill/teardown 中安装 npm 依赖与 Playwright Chromium。Node 20+；影片需要 ffmpeg/ffprobe；说明音轨需要 Python 3。以下命令在本目录执行。可用 CHROMIUM 指定浏览器可执行文件，用 TEARDOWN_DEPS 指定已有 node_modules；正常安装不需要这些覆盖。

```powershell
.\build.ps1
```

打开 teardown-out/dist/mecha-frog-live.html。页面含外观、开盖、机械总成、爆炸、各总成、盖板展开/爆炸滑块、视角、暂停、合成声音和自动导览；鼠标操作接管，静置 25 秒恢复。

## 验证最新项目

```powershell
node ../../skill/teardown/scripts/validate-machine.mjs ./machine.json
node ../../skill/teardown/scripts/validate-morphology.mjs ./morphology.json
node ../../skill/teardown/scripts/qa.mjs --live ./teardown-out/dist/mecha-frog-live.html --film ./teardown-out/dist/mecha-frog-film.html --timeline ./mecha-frog-film/timeline.json --adapter ./qa-adapter.mjs --out ./teardown-out/qa
node ./checks/mechanisms.mjs
node ./checks/dynamics.mjs
node ./checks/final-qa.mjs
node ./checks/interaction.mjs
```

覆盖 12,012 个基础运动学状态、2,002 个潜行状态、输出方向与实际网格端点、回装、分段盖板连续性、风箱端部、带局部窗口的重复寻帧、暂停、构图边界、移动端布局、声音控制、相机阻尼收敛和真实静置恢复。报告与截图生成到 teardown-out；通过数值检查不等于视觉验收，须打开截图复核。

## 33 秒、1080p、60 fps 成片

```powershell
node ../../skill/teardown/sims/capture.mjs mecha-frog-film --size 1600x900 --dpr 1.2 --fps 60 --out ./teardown-out/mecha-frog-r3-silent.mp4
python ../../skill/teardown/run_sfx.py ./mecha-frog-shared/score.py --out ./teardown-out/mecha-frog-r3-score.wav
ffmpeg -hide_banner -y -i ./teardown-out/mecha-frog-r3-silent.mp4 -i ./teardown-out/mecha-frog-r3-score.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart ./teardown-out/mecha-frog-r3-demo.mp4
node ../../skill/teardown/sheet.mjs --video ./teardown-out/mecha-frog-r3-demo.mp4 0 5.5 10.7 13.5 17.8 20.8 22.8 26.4 28.3 32 --size 640 --cols 3 --rows 2 --name verified
node ../../skill/teardown/wave.mjs ./teardown-out/mecha-frog-r3-demo.mp4 --timeline ./mecha-frog-film/timeline.json --lufs -19
```

Windows 也可使用 py -3 代替 python。预期视频 1980 帧，音画各 33 秒；ffprobe 检查尺寸、帧率、帧数和两个流的时长。音轨为程序化说明，不是真机录音。生成 HTML、截图、音视频和缓存不纳入源码提交。

## 模型边界与参考

行星级 12/18/48 齿，速比 5，近似齿形；剪叉杆长 20 mm；反向丝杠导程 2 mm/rev；风箱偏置曲柄半径 2 mm、连杆 14 mm、偏置 10 mm、解析行程 0–4 mm。连续折叠膜随端板行程变形，局部窗口明确标注隐去周边。

形态参考与估计比例见 morphology.json，机构假设与执行轴见 machine.json，之前的生物外形研究保存为 references/biological-envelope.json。参考仅支持所声明的外形/概念依据，没有复制真机测量数据。

零件登记 972 个实体件（含 174 个紧固件），480 处绘制细节另列，15 组行星总成；数量不是质量证明或采购 BOM。潜行、跳跃、跟踪与辅助转速为规定动作。未验证全实体扫掠干涉、接触力、制造公差、载荷/温升或真实手机与 iGPU 性能。
