# 赛博水墨重设计 — 设计规格

> 将古诗词网络从宇宙/太空主题转变为赛博水墨（Cyber Ink-wash）风格，所有视觉效果全部程序化 GLSL 生成，不依赖外部纹理贴图。

---

## 1. 色彩系统

| 角色 | 色值 | 说明 |
|------|------|------|
| 背景底色 | `#0a0a0f` | 近黑，微冷调 |
| 墨色远山 | `#1a1a2e` | 最远层 |
| 墨色中山 | `#2d2d44` | 中间层 |
| 墨色近山 | `#4a4a6a` | 最近层 |
| 赛博青 | `#00e5ff` | 主强调色，科技感光晕 |
| 朱砂红 | `#ff6b35` | 辅助强调，印章、选中态 |
| 宣纸白 | `#e0dcd0` | 文字色，微暖 |
| 朝代色 | 沿用 `colorScales.ts` | 饱和度降低 30%，融入水墨氛围 |

CSS 变量定义在 `src/index.css`，替换现有深空色板。

---

## 2. 水墨山水背景（InkBackground）

替代 `StarfieldBackground.tsx` 的 2000 颗星点。

**实现方式：** 全屏四边形（fullscreen quad）+ 单个 fragment shader。

**视觉层次：**
- 3-4 层远山剪影，FBM（分形布朗运动）噪声生成山脊轮廓
- 每层不同墨色浓度：远淡近浓，z-depth 分离产生视差
- 山体边缘墨晕扩散：基于距离场的 smoothstep 渐变
- 底部雾气：低频噪声 + 时间驱动缓慢流动
- 顶部留白：模拟宣纸天空空旷感，仅有稀疏墨点作远景点缀
- 整体亮度极低，确保前景 3D 元素突出

**Shader 文件：**
- `src/shaders/noise.ts` — 共享 GLSL 噪声函数（simplex、fbm）
- `src/shaders/inkMountainShader.ts` — 山水背景 shader

**组件文件：** `src/components/InkBackground.tsx`

---

## 3. 朝代星云（DynastyNebulaField）

从粒子云改为水墨晕染 billboard。

**视觉效果：**
- 每个朝代一个 billboard 四边形，始终面向摄像机
- Fragment shader 用多层 simplex noise 生成墨团扩散，模拟墨滴入水晕开
- 朝代色以低饱和度叠加在墨色基底上，如淡彩点染
- 边缘用噪声驱动的 alpha 衰减，形成不规则墨渍轮廓（非圆形）
- 微弱时间动画：墨团缓慢呼吸式缩放，模拟墨在水中扩散
- Galaxy 级别缩放时显示朝代名称（troika-three-text，LXGW WenKai 字体）

**Shader 文件：** `src/shaders/inkNebulaShader.ts`

**修改文件：** `src/components/DynastyNebulaField.tsx` — 重写为 billboard 四边形

---

## 4. 作者节点（AuthorStarField）

保持 InstancedMesh 架构，替换 shader 效果。

**视觉效果：**
- 核心：墨点形态，噪声扰动圆形 SDF 生成不规则墨滴轮廓
- 外圈：赛博青（`#00e5ff`）细线光晕，模拟数字化描边
- 选中态：光晕扩大 + 朱砂红脉冲
- Hover 态：墨点微扩散，光晕亮度提升

**数据映射不变：**
- 节点大小：1 + poemCount × 0.4，clamp [1, 4]
- LOD 文字标签：poet 级别显示作者名

**Shader 文件：** `src/shaders/inkStarShader.ts`（替代 `starMaterial.ts`）

**修改文件：** `src/components/AuthorStarField.tsx` — 替换 shader 引用

---

## 5. 关系连线（RelationshipCurve3D）

从 QuadraticBezierLine 改为水墨笔触 ribbon。

**几何体：** 沿贝塞尔曲线挤出的 ribbon（扁平带状），宽度沿路径变化模拟毛笔提按（中间粗、两端细）。

**Fragment shader：**
- 沿长度方向用噪声扰动 alpha，产生枯笔飞白效果
- 边缘不规则，模拟墨迹渗透
- 颜色取关系类型映射，整体偏墨色，仅微带色相

**交互态：**
- 默认：透明度 0.15，不抢视觉焦点
- 相关作者 hover/选中：透明度升至 0.6，宽度微增

**关系强度仍映射到基础宽度。**

**Shader 文件：** `src/shaders/inkLineShader.ts`

**修改文件：** `src/components/RelationshipCurve3D.tsx` — 重写为 ribbon 几何体

---

## 6. 诗作轨道（PoemOrbit3D）

从简单球体改为墨点风格。

**视觉效果：**
- 每首诗渲染为小墨点，噪声扰动的圆形 SDF
- Fibonacci 球面分布逻辑不变
- 墨点大小统一（远小于作者节点）
- Hover：墨点扩散 + 显示诗名 tooltip
- 选中：墨点变为朱砂红，其余保持墨色
- 整组绕作者节点缓慢旋转动画保留

**修改文件：** `src/components/PoemOrbit3D.tsx`

---

## 7. 时间轴（TimelineRail3D）

从线段 + 文字标签改为书法卷轴风格。

**视觉效果：**
- 主轴线：ribbon 几何体模拟长卷展开，宽度微有起伏（笔触感）
- 世纪刻度：短竖笔画，噪声扰动边缘
- 朝代区间：沿轴线底部用淡墨色块标注范围，颜色取朝代色（低饱和度）
- 朝代名称标签：troika-three-text + LXGW WenKai
- 印章标记：朝代起止点用程序化 shader 绘制的方形印章（红色方框 + 内部文字），不用纹理

**修改文件：** `src/components/TimelineRail3D.tsx`

---

## 8. UI 层

统一水墨风格，替换现有玻璃拟态。

### 8.1 HUD（顶栏）

- 竖排标题「古诗词网络」置于左上角，从上往下排列
- 面包屑导航横排，置于竖排标题右侧，字体缩小
- 搜索和重置按钮改为印章风格（朱砂红方框），hover 时微扩散
- 背景去掉 backdrop-blur，改为从顶部向下的墨色渐变淡出

**修改文件：** `src/components/HUD.tsx`

### 8.2 SearchOverlay（搜索面板）

- 从模态弹窗改为右侧滑入面板
- 输入框：底部单线（模拟横线纸），无边框
- 搜索结果列表：每项左侧加小墨点标记，hover 时墨点扩散
- 背景：半透明深墨色

**修改文件：** `src/components/SearchOverlay.tsx`

### 8.3 PoemReader（诗文阅读）

- 竖排文字布局（`writing-mode: vertical-rl`）
- 从右向左阅读，模拟古籍排版
- 诗文、译文、注释分栏展示
- 背景：宣纸色（`#e0dcd0`）配深墨文字，与 3D 场景形成明暗反差

**修改文件：** `src/components/PoemReader.tsx`

### 8.4 AuthorPanel（作者面板）

- 保持右侧滑入，宽度不变
- 背景改为半透明墨色
- 作者名大字号，风格标签改为小印章样式
- 诗作列表每项前加墨点

**修改文件：** `src/components/AuthorPanel.tsx`

---

## 9. 摄像机与交互（CameraController）

- 保持 OrbitControls + 语义缩放逻辑
- 增加缓动阻尼（damping），让摄像机运动更丝滑
- fly-to 动画加入 ease-out 曲线
- 新增 HoverCard 组件：作者节点 hover 延迟 300ms 后显示浮动卡片，包含作者名、朝代、代表作

**新增文件：** `src/components/HoverCard.tsx`

**修改文件：** `src/components/CameraController.tsx`

---

## 10. Store 变更

`src/store/useStore.ts` 新增字段：

- `hoveredAuthorTimer: ReturnType<typeof setTimeout> | null` — hover 延迟计时器，用于 HoverCard 300ms 延迟显示

---

## 11. 后处理（Post-processing）

`src/components/Universe3D.tsx` 中的 EffectComposer 调整：

- Bloom：降低强度，避免过度发光破坏水墨质感
- ToneMapping：保留，微调参数适配新色板
- Vignette：保留，加深边缘暗角强化卷轴感

---

## 12. 文件变更总览

### 新增
| 文件 | 说明 |
|------|------|
| `src/shaders/noise.ts` | 共享 GLSL 噪声函数（simplex、fbm） |
| `src/shaders/inkMountainShader.ts` | 水墨山水背景 shader |
| `src/shaders/inkNebulaShader.ts` | 朝代墨团 billboard 材质 |
| `src/shaders/inkStarShader.ts` | 作者节点墨点 + 赛博光晕 |
| `src/shaders/inkLineShader.ts` | 关系连线笔触材质 |
| `src/components/InkBackground.tsx` | 水墨山水背景组件 |
| `src/components/HoverCard.tsx` | 作者 hover 浮动卡片 |

### 修改
| 文件 | 变更 |
|------|------|
| `src/index.css` | 新色彩系统、水墨动画、印章样式 |
| `src/components/DynastyNebulaField.tsx` | 重写为 billboard 墨团 |
| `src/components/AuthorStarField.tsx` | 替换 shader 引用 |
| `src/components/RelationshipCurve3D.tsx` | 重写为 ribbon 笔触 |
| `src/components/PoemOrbit3D.tsx` | 墨点外观 |
| `src/components/CameraController.tsx` | 缓动阻尼、HoverCard 集成 |
| `src/components/TimelineRail3D.tsx` | 书法卷轴风格 |
| `src/components/Universe3D.tsx` | 替换背景、调整后处理 |
| `src/components/HUD.tsx` | 竖排标题、印章按钮 |
| `src/components/SearchOverlay.tsx` | 右侧滑入面板 |
| `src/components/PoemReader.tsx` | 竖排文字、宣纸背景 |
| `src/components/AuthorPanel.tsx` | 水墨风格侧栏 |
| `src/store/useStore.ts` | 新增 hoveredAuthorTimer |
| `src/App.tsx` | 组件接线调整 |

### 删除
| 文件 | 原因 |
|------|------|
| `src/shaders/starMaterial.ts` | 被 inkStarShader.ts 替代 |
| `src/components/StarfieldBackground.tsx` | 被 InkBackground.tsx 替代 |

---

## 13. 设计约束

- **零纹理依赖：** 所有视觉效果纯 GLSL 程序化生成
- **性能预算：** InstancedMesh、LOD 标签、语义缩放等现有优化策略全部保留
- **字体：** 继续使用 LXGW WenKai 子集（~300KB TTF）
- **兼容性：** WebGL 2.0，不使用 compute shader
- **渐进实施：** 自底向上——先 shader 基础设施，再 3D 组件，再 UI，最后交互打磨
