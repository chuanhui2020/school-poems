# 诗词元宇宙 3D 重构设计

## 目标

将当前 2D SVG 时间轴可视化升级为 3D 沉浸式太空体验。诗人是星辰，朝代是星云，关系是光弧，用户在文学宇宙中自由漫游。

## 技术选型

React Three Fiber (R3F) + Drei。理由：声明式写法与现有 React 架构无缝衔接，Zustand store 直接驱动 3D 场景，Drei 提供 Billboard、Line、Stars、LOD 等开箱即用组件。

新增依赖：`three`、`@react-three/fiber`、`@react-three/drei`、`@types/three`

## 架构

```
App.tsx
├── Universe3D (R3F <Canvas>)
│   ├── CameraController (自由漫游)
│   ├── StarfieldBackground (粒子星空)
│   ├── DynastyNebula3D[] (朝代星云 ×8)
│   ├── AuthorStar3D[] (诗人节点 ×79, LOD)
│   ├── RelationshipCurve3D[] (发光贝塞尔曲线)
│   ├── PoemOrbit3D (选中诗人的诗词卫星)
│   └── TimelineRail3D (3D 时间轴标尺)
├── HUD (HTML overlay, 不变)
├── SearchOverlay (不变)
├── AuthorPanel (不变)
└── PoemReader (不变)
```

核心原则：3D 场景在 `<Canvas>` 内，所有 HTML overlay（HUD、搜索、面板、阅读器）叠在 Canvas 上方，完全不动。

## 3D 空间布局

### 坐标系统

3D 场景使用归一化坐标，不复用 2D 的像素级 `buildTimeScale`（范围 200-7800 会导致浮点精度问题）。新建 `build3DTimeScale`，将年份映射到 Three.js 友好的范围：

- X 轴 = 时间线（-1100 → 1912）→ 映射到 [-40, 40]（总宽 80 单位）
- Y 轴 = 朝代内垂直散布 → 映射到 [-15, 15]（总高 30 单位）
- Z 轴 = 文学风格分层 → 映射到 [-10, 10]（总深 20 单位）

**Z 轴映射规则：**
- 定义风格→Z 值映射表：`{ "豪放": 8, "边塞": 6, "现实主义": 3, "田园": 0, "山水": -2, "婉约": -5, "花间": -8 }`
- 多个 style_labels 取平均值
- 无 style_labels 的诗人 Z = 0（居中）
- 加随机抖动 ±1 避免重叠

### 朝代星云 (DynastyNebula3D)

- 每个朝代是半透明椭球体粒子云，颜色取自 `dynasties.json` 的 color
- 椭球沿 X 轴拉长（覆盖朝代时间跨度），Y/Z 方向包裹该朝代所有诗人
- 朝代名用 Drei `<Billboard>` + `<Text>` 渲染，始终面向相机
- 叙事文字在相机靠近时淡入（距离 < 阈值），复用 `narratives.json` 数据

### 诗人节点 LOD (AuthorStar3D)

三级细节：

| 距离 | 表现 | 开销 |
|------|------|------|
| >500 | `<Points>` 粒子光点 | 极低 |
| 100-500 | `<Sphere>` + 发光材质 + 名字 Billboard | 中 |
| <100 | 球体 + 光晕 + 名字 + 风格标签环绕 + 脉动动画 | 高 |

- 大小按作品数量（`poemCount`）
- 颜色按朝代（`node.color`）
- 使用 Drei 的 `<Detailed>` 组件实现 LOD 切换

### 关系曲线 (RelationshipCurve3D)

- Drei `<QuadraticBezierLine>`，中间控制点计算：取两诗人中点，Y 方向偏移 +5 单位（世界坐标 Y 轴向上），Z 方向偏移取两诗人 Z 差值的一半。确保曲线在 3D 空间中自然弯曲而不穿过其他节点。
- 流光动画：`dashOffset` 随时间变化
- 不同关系类型用不同颜色（复用 `relationship_types` 配置）
- 默认全部显示，选中诗人时高亮相关线、其余变暗（opacity 降低）

### 诗词卫星 (PoemOrbit3D)

- 选中诗人后，诗词节点从诗人位置弹出，沿 3D 球面分布
- 每首诗是小光球，hover 显示诗名（Billboard）
- 缓慢自转，营造行星环绕感
- 点击打开 PoemReader overlay

## 相机与交互

### 自由漫游相机 (CameraController)

- 基于 Drei `<OrbitControls>` + 自定义 fly-to 动画（`useFrame` 内 lerp）
- 鼠标左键拖拽旋转，右键拖拽平移，滚轮缩放
- 点击诗人时，相机平滑飞向目标位置（lerp ~1 秒），lookAt 目标诗人
- 移动速度根据当前缩放自适应
- 相机位置变化时自动更新 store 的 `zoomLevel`：
  - 距离最近诗人 >500 → `galaxy`
  - 100-500 → `dynasty`
  - <100 → `poet`

**初始/重置相机位置：** position = [0, 20, 60]，lookAt = [0, 0, 0]（俯瞰全景）。HUD "全景" 按钮和 store 的 `resetZoom` 触发飞回此位置。

**resetZoom 契约：** `CameraController` 在 mount 时调用 `store.setResetZoom(fn)`，注册一个将相机 lerp 回初始位置的函数。HUD 通过 `store.resetZoom()` 调用。与 2D 版本相同的 store 接口，只是注册方从 `useUniverseZoom` 变为 `CameraController`。

**fly-to 触发规则：** 只有 3D 节点点击和搜索结果点击触发相机飞行。HUD 面包屑点击取消选中但不飞行。

### 点击交互

- 点击诗人节点 → `selectAuthor(id)`，相机平滑飞向该诗人（lerp ~1 秒）
- 点击诗词卫星 → `selectPoem(id)`，打开 PoemReader
- 点击空白处 → 取消选中
- R3F 原生 Raycaster 处理 3D 拾取（`onClick` / `onPointerOver`）

### Hover 效果

- 悬停诗人 → 节点放大 1.2x，光晕增强
- 悬停关系线 → 线变亮，两端诗人高亮

## 文件变更

### 完全不动（复用）

- `src/store/useStore.ts` — 接口不变，`resetZoom` 由 `CameraController` 注册（替代原 `useUniverseZoom`）
- `src/hooks/useSearch.ts`
- `src/hooks/useTimelineLayout.ts` — 透传 `layoutAuthors` 结果，新增的 `z` 字段自动包含
- `src/components/HUD.tsx` — `resetZoom` 从 store 读取，来源变了但调用方式不变
- `src/components/SearchOverlay.tsx`
- `src/components/PoemReader.tsx`
- `src/components/AuthorPanel.tsx`
- `src/components/shared/Tooltip.tsx`
- `src/lib/colorScales.ts`
- `src/lib/dynastyNarratives.ts`
- 所有 `src/data/*.json`

### 修改

- `src/lib/layout.ts` — `layoutAuthors` 增加 z 坐标计算（按文学流派分层），新建 `build3DTimeScale` 替代像素级 scale
- `src/types/nodes.ts` — `AuthorNode` 加 `z: number` 字段
- `src/App.tsx` — `<Universe>` 换成 `<Universe3D>`，外层包 WebGL ErrorBoundary
- `package.json` — 加 three、@react-three/fiber、@react-three/drei、@types/three

### 删除（被 3D 版替代）

- `src/components/Universe.tsx`
- `src/components/DynastyNebula.tsx`
- `src/components/AuthorStar.tsx`
- `src/components/RelationshipEdge.tsx`
- `src/components/PoemOrbit.tsx`
- `src/components/TimelineAxis.tsx`
- `src/hooks/useUniverseZoom.ts`
- `src/components/visualizations/shared/useDimensions.ts`

### 新建

- `src/components/scene/Universe3D.tsx` — R3F Canvas + 场景组装 + 灯光
- `src/components/scene/CameraController.tsx` — OrbitControls + fly-to 动画
- `src/components/scene/StarfieldBackground.tsx` — Drei `<Stars>` 粒子星空
- `src/components/scene/DynastyNebula3D.tsx` — 朝代粒子椭球星云
- `src/components/scene/AuthorStar3D.tsx` — 诗人节点 + 三级 LOD
- `src/components/scene/RelationshipCurve3D.tsx` — 发光贝塞尔曲线 + 流光
- `src/components/scene/PoemOrbit3D.tsx` — 3D 球面诗词卫星
- `src/components/scene/TimelineRail3D.tsx` — 3D 时间轴标尺
- `src/hooks/useSemanticZoom.ts` — 基于相机距离的 zoom level 计算

## 性能考量

- 79 个诗人节点 + ~30 条关系线，R3F 完全能承受
- LOD 确保远处节点开销极低
- 粒子星云用 `<Points>` 而非独立 mesh，批量渲染
- 关系曲线用 `<Line>` 批量绘制
- HTML overlay 不参与 3D 渲染循环

## 灯光设置

- 低强度 `<ambientLight>`（intensity=0.3）提供基础照明，太空不需要太亮
- 诗人节点使用 `MeshStandardMaterial` + `emissive` 自发光，不依赖外部光源
- 每个朝代星云中心放一个 `<pointLight>`（颜色 = 朝代色，intensity=0.5，distance=30），给附近诗人节点微弱的朝代色调照明
- 不使用阴影（太空场景无需，节省性能）

## WebGL 降级

- `App.tsx` 中 `<Canvas>` 外层包一个 React ErrorBoundary
- 如果 WebGL 初始化失败，显示降级提示："您的浏览器不支持 3D 渲染，请使用 Chrome/Firefox 最新版"
- R3F 的 `<Canvas>` 支持 `fallback` prop，可传入 loading 占位
