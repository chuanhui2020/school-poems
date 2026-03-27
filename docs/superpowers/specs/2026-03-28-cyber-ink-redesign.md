# 赛博水墨重塑 — Cyber Ink Redesign

## 概述

将诗词元宇宙的视觉风格从当前的星空宇宙主题重塑为「赛博水墨」风格：深色背景 + 水墨粒子扩散效果 + 霓虹描边，像水墨画遇上赛博朋克。同时统一升级所有 UI 组件风格，并完善触屏手势交互。

**目标设备**：桌面优先，手机能用。

---

## 1. 3D 视觉效果

### 1.1 背景层

**水墨山水远景**
- 自定义 shader 生成 3-4 层半透明山形剪影（从深到浅）
- 各层以不同速度缓慢视差滚动，营造纵深感
- 山形轮廓用 Perlin noise 生成，边缘柔和不规则

**流动墨点粒子**
- 替换现有 2000 颗静态星星
- 粒子大小不一（0.5-3.0），有拖尾效果
- 沿曲线路径飘动，模拟墨汁在水中扩散
- 颜色：深灰到浅灰，少量带朝代色调

**底色**
- 从纯深黑 `#0a0a12` 改为带微蓝的墨色渐变
- 中心略亮（`#0d1020`），边缘深沉（`#050510`）

### 1.2 朝代星云

- 从圆形粒子点改为水墨晕染团
- 每个朝代渲染为一个 billboard quad，使用 `inkNebulaShader` 程序化生成水墨晕染效果
- 用 3D noise 纹理控制边缘形状，不规则、有渗透感
- 颜色保留各朝代色，降低饱和度 30%，叠加半透明水墨灰层
- 缓慢呼吸动画（边缘微微扩散收缩）

### 1.3 作者节点

**内核**
- 从纯球体改为水墨笔触形状
- 深色墨点，用 noise 控制边缘使其不规则
- 大小保留现有 radius 计算逻辑（由上游 layout 层决定）

**霓虹光晕**
- 外圈：朝代色的发光描边
- 脉冲呼吸动画（cyan/金色交替）
- 光晕强度随缩放级别变化（远处弱，近处强）

**交互状态**
- Normal：微弱光晕
- Hover：光晕扩大 1.3x + 墨点边缘扩散动画
- Selected：强烈霓虹光晕 + 涟漪扩散效果

### 1.4 关系线

- 从平滑贝塞尔曲线改为飞白笔触效果
- 使用自定义 ribbon/tube 几何体（非 Line2），支持 per-fragment 线宽调制
- 线条粗细不均匀，有断续感（用 noise 调制线宽）
- 激活时：霓虹色流光沿线条流动
- 未激活时：淡墨色，opacity 0.15

### 1.5 诗词轨道

- 保留斐波那契球分布
- 诗词节点从球体改为小墨点（不规则圆形）
- 选中的诗词发出柔和光晕
- 轨道整体旋转保留

### 1.6 后处理

- Bloom：降低 luminanceThreshold 到 0.4（让霓虹更明显）
- 新增 Chromatic Aberration：微弱色散（offset 0.001），增加赛博感
- Vignette：加强（darkness 0.75），模拟卷轴边缘
- ToneMapping：保留 ACES Filmic

---

## 2. UI 组件设计

### 2.1 风格语言

| 元素 | 规范 |
|------|------|
| 面板底板 | 深色半透明 + `backdrop-filter: blur(16px)` + 静态 PNG noise 纹理叠加（`background-image` + `mix-blend-mode: multiply`） |
| 边框 | 不规则水墨笔触边缘（CSS mask-image 或 SVG mask） |
| 主字体 | LXGW WenKai（保留） |
| 标题排版 | 竖排（`writing-mode: vertical-rl`） |
| 正文排版 | 横排 |
| 主色 | Cyan `#00d4ff`（科技感）+ 暖金 `#d4a86a`（古风）+ 水墨灰 |
| 动效 | 水墨扩散/收缩为主，避免机械感的线性动画 |

### 2.2 HUD 顶栏

- 左上标题"诗词元宇宙"改为竖排，配 CSS 实现的红色方印 logo
- 面包屑用水墨风分隔符
- 右上按钮改为圆形图标按钮，hover 时水墨晕开动画
- 底部加一条水墨横线渐隐装饰

### 2.3 搜索面板

- 输入框底部用毛笔横线代替普通下划线
- 光标闪烁用墨滴动画
- 结果列表每项左侧加朝代色竖条标识
- 打开/关闭：墨滴扩散展开 → 收缩消散动画

### 2.4 诗词阅读器

- **古卷式布局**：模拟卷轴展开效果
- 上下有卷轴装饰边（CSS 实现）
- 诗词正文居中竖排显示（`writing-mode: vertical-rl`）
- 译文和赏析横排保持可读性
- 背景叠淡淡宣纸纹理（CSS noise filter）
- 打开动画：通过 CSS `clip-path` 或 `max-width` transition 实现从中间向两边展开的卷轴效果，卷轴两端装饰为静态 CSS 伪元素

### 2.5 作者侧边栏

- 顶部装饰：水墨笔触横条 + 朝代色渐变
- 作者名大号竖排
- 诗词列表项 hover 时左侧出现墨点标记
- 滑入动画：右侧滑入 + 水墨飘散粒子

### 2.6 时间轴

- 主轴线从直线改为水墨长横笔触
- 朝代标记改为印章风格方块（朝代色底 + 白字）
- 世纪刻度改为短竖笔触

---

## 3. 手势交互与动效

### 3.1 触屏手势

| 手势 | 动作 |
|------|------|
| 单指拖拽 | 旋转视角 |
| 双指捏合 | 缩放（配合语义缩放阈值） |
| 单指点击 | 选中作者/诗词节点 |
| 双指拖拽 | 平移画面 |

OrbitControls 默认 touch 配置已匹配上述手势（`ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN`），无需额外配置。

### 3.2 鼠标交互（桌面增强）

| 操作 | 动作 |
|------|------|
| 滚轮 | 缩放（保留动态速度） |
| 左键拖拽 | 旋转 |
| 右键拖拽 | 平移 |
| Hover 0.5s | 显示气泡卡片（作者名 + 朝代 + 诗词数） |
| 点击 | 选中 + fly-to |

### 3.3 过渡动效

**fly-to 升级**
- 从线性插值改为 ease-out-cubic 缓动曲线
- 飞入起始阶段加 2-3 帧微弱位置噪声（振幅 0.3 单位），300ms 内衰减至零

**缩放级别过渡**
- galaxy ↔ dynasty ↔ poet 切换时淡入淡出
- 标签文字渐显渐隐（而非突变）

**选中作者**
- 镜头飞入 + 无关节点淡出（opacity 降至 0.15）
- 诗词轨道从中心展开动画

**关闭选中**
- 诗词轨道收缩回中心 → 镜头回退 → 节点淡入

### 3.4 阻尼与惯性

- OrbitControls 阻尼因子从 0.08 提升到 0.12
- 启用惯性滑动（松开后自然减速）

---

## 4. 技术方案

### 4.1 自定义 Shader

| Shader | 用途 |
|--------|------|
| `inkMountainShader` | 背景水墨山水远景 |
| `inkParticleShader` | 流动墨点粒子（替换 StarfieldBackground） |
| `inkNebulaShader` | 朝代水墨晕染团（替换 DynastyNebulaField） |
| `inkStarShader` | 作者节点水墨笔触 + 霓虹光晕（替换 starMaterial） |
| `inkLineShader` | 关系线飞白笔触效果 |

所有 shader 共享一套 Perlin/Simplex noise 工具函数。

### 4.2 组件变更

| 组件 | 变更类型 |
|------|----------|
| `StarfieldBackground.tsx` | 重写 → 水墨山水 + 墨点粒子 |
| `DynastyNebulaField.tsx` | 重写 → 水墨晕染团 |
| `AuthorStarField.tsx` | 重写 shader，保留 InstancedMesh 架构 |
| `RelationshipCurve3D.tsx` | 重写 → 飞白笔触线条 |
| `PoemOrbit3D.tsx` | 小改 → 节点外观改为墨点 |
| `CameraController.tsx` | 修改 → 添加 touch 配置、升级缓动、惯性 |
| `TimelineRail3D.tsx` | 修改 → 水墨笔触轴线 + 印章标记 |
| `HUD.tsx` | 重写 → 竖排标题 + 印章 + 水墨按钮 |
| `SearchOverlay.tsx` | 重写 → 水墨风搜索面板 |
| `PoemReader.tsx` | 重写 → 古卷式竖排布局 |
| `AuthorPanel.tsx` | 重写 → 水墨风侧边栏 |
| `index.css` | 重写 → 新色彩体系 + 水墨动画 + 纹理 |

### 4.3 新增资源

所有资源存放于 `public/textures/`：

- 水墨笔触纹理：1-2 张灰度 PNG，512×512，~30KB/张，用于 CSS mask-image
- 宣纸纹理：1 张 JPEG，1024×1024，~80KB，用于阅读器背景
- 印章 SVG：1 个，<5KB，用于 HUD logo 和朝代标记

### 4.4 性能考量

- 所有 shader 效果在 GPU 上运算，不影响主线程
- InstancedMesh 架构保留，单 draw call 渲染所有作者节点
- 粒子数量控制在 2000 以内
- 水墨山水用全屏 quad + shader，无额外几何体
- 后处理 Effect 对象控制在 4 个以内（Bloom、ChromaticAberration、Vignette、ToneMapping），实际 GPU render pass 数量由 EffectComposer 自动合并
- 纹理资源总大小控制在 500KB 以内

### 4.5 CSS 架构

**色彩体系（CSS 自定义属性）**
```
--ink-bg-deep:      #050510      /* 最深背景 */
--ink-bg-mid:       #0d1020      /* 中间背景 */
--ink-bg-panel:     rgba(12, 15, 35, 0.88)  /* 面板底色 */
--ink-text:         #d0c8b8      /* 主文字（暖灰） */
--ink-text-dim:     #6a6258      /* 次要文字 */
--ink-accent-cyan:  #00d4ff      /* 科技感主色 */
--ink-accent-gold:  #d4a86a      /* 古风暖金 */
--ink-accent-red:   #c04040      /* 印章红 */
--ink-border:       rgba(255, 255, 255, 0.06)  /* 边框 */
--ink-glow-cyan:    rgba(0, 212, 255, 0.4)     /* 青色光晕 */
--ink-glow-gold:    rgba(212, 168, 106, 0.4)   /* 金色光晕 */
```

**关键 Keyframe 动画**
- `ink-spread`：墨滴扩散（scale 0→1 + opacity 变化），用于面板打开
- `ink-dissolve`：墨迹消散（opacity + blur 渐出），用于面板关闭
- `scroll-unroll`：卷轴展开（clip-path 从中心向两侧），用于诗词阅读器
- `glow-breathe`：霓虹呼吸（box-shadow 强度脉冲），用于按钮和标记
- `ink-stroke`：笔触绘制（stroke-dashoffset 动画），用于装饰线条

**工具类**
- `.ink-panel`：毛玻璃面板（blur + noise 纹理 + 边框）
- `.ink-mask-brush`：水墨笔触边缘 mask（mask-image 引用笔触纹理）
- `.ink-stamp`：印章样式（红底白字方块 + 微旋转）
- `.ink-vertical`：竖排文字（writing-mode: vertical-rl）

---

## 5. 不在范围内

- 数据结构变更（poems.json、authors.json 等不变）
- 路由变更
- 状态管理架构变更（zustand store 结构基本不变，可能新增少量字段）
- 诗词数据扩充（另一个独立任务）
- 移动端深度适配（仅保证基础可用）
