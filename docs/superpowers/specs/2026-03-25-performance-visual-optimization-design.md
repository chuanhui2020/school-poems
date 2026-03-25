# 诗词元宇宙 — 性能与视觉优化设计

日期：2026-03-25
状态：已审核

## 背景

项目使用 React Three Fiber + Three.js 构建 3D 诗词可视化。当前存在两个核心问题：
1. 页面加载慢、交互卡顿（draw call 过多、GC 压力、字体过大）
2. 唐宋等诗人密集朝代星球重叠看不清，缩放体验差
3. 整体视觉效果偏 demo 感，缺乏氛围

## 约束

- 布局算法必须完全数据驱动，不硬编码朝代或人数假设
- 后续可能增减作者数据，布局需自动适配
- 美术风格：国风星空融合（星空为底 + 水墨元素）

---

## 模块 1：InstancedMesh 星球渲染

**问题：** 79 个 `AuthorStar3D` 各创建 mesh + pointLight + Billboard Text。其中 mesh + Text 产生 ~158 次 draw call（79 球体 + 79 文字），87 个 pointLight（79 星球 + 8 星云）大幅增加逐片元光照计算开销。加上 8 个星云粒子、24 条关系线、~30 条时间轴线段和 ~15 个时间轴/朝代标签，总 draw call 约 ~180。

**方案：**

新建 `AuthorStarField.tsx`，用单个 `InstancedMesh` 渲染所有星球：

- 1 个 `SphereGeometry` + `InstancedMesh(geometry, material, count)`
- `setMatrixAt` 设置每个 instance 的位置和缩放（radius）
- `setColorAt` 设置朝代颜色
- 材质用 `MeshStandardMaterial` 的 `emissive` + `emissiveIntensity` 模拟发光
- 去掉所有逐星 pointLight，保留 Scene 中的 3 个全局光源
- hover/select 通过 `onPointerMove` + `event.instanceId` 识别
- 注意：设置 instance matrices 后必须调用 `computeBoundingSphere()`，否则 raycasting 静默失败。或设置 `frustumCulled={false}`

**Text 标签：**
- 只为 hovered 或 selected 的星球显示 `<Text>` 标签（最多 1-2 个）
- 从 79 个 Text 降到 1-2 个

**影响文件：**
- 新建 `src/components/AuthorStarField.tsx`
- 修改 `src/components/Universe3D.tsx`（替换 AuthorStar3D 循环）
- `src/components/AuthorStar3D.tsx` 可删除

**draw call：** ~180 → 1（星球）+ 1-2（标签）。87 个 pointLight 降为 3 个全局光源，大幅减少逐片元光照开销。

---

## 模块 2：useFrame GC 压力消除

**问题：**
- `AuthorStar3D.useFrame` 每帧 `new THREE.Vector3()` — 60fps = 每秒 60 次分配
- `RelationshipCurve3D` 每次 render `new THREE.Vector3()` 创建 start/end

**方案：**

- InstancedMesh 方案下，AuthorStar3D 的 useFrame 消失
- hover/select 缩放动画在 `AuthorStarField` 的单一 useFrame 中用预分配的 `_tempMatrix`/`_tempVec` 更新
- `RelationshipCurve3D`：start/end/mid 在同一个 `useMemo` 中计算并缓存，依赖 `[sourceNode.x, sourceNode.y, sourceNode.z, targetNode.x, targetNode.y, targetNode.z]`，去掉 render 内的 `new THREE.Vector3()`

**影响文件：**
- `src/components/AuthorStarField.tsx`（新建）
- `src/components/RelationshipCurve3D.tsx`

**结果：** 每帧 0 次 new 分配

---

## 模块 3：字体优化

**问题：** `LXGWWenKai-Regular.ttf` 25MB，troika-three-text 需要完整下载才能渲染。

**方案：**

使用 `fonttools`/`pyftsubset` 对字体子集化：
- 提取项目中实际用到的汉字（诗人名 + 朝代名 ≈ 200 字符）
- 输出 woff2 格式，预计 200-500KB
- 回退方案：使用 CDN woff2 版本（~6MB）

**影响文件：**
- `public/fonts/LXGWWenKai-Regular.ttf` → `public/fonts/LXGWWenKai-Subset.woff2`
- 所有引用该字体路径的组件

---

## 模块 4：DynastyNebula3D 合并

**问题：** 8 个朝代各创建 `<points>` + `<pointLight>` + `<Text>` = 24 个对象。

**方案：**

- 8 个 nebula 的粒子合并为 1 个 `<points>` 组件（960 粒子，1 次 draw call）
- 去掉 8 个 pointLight，用粒子颜色 + 全局光照替代
- 朝代标签保留（8 个 Text 影响不大）
- 合并后放弃逐朝代独立旋转（当前每个 nebula 有独立 rotation.y 动画）。改为整体缓慢旋转，视觉差异可忽略，换取单一 draw call 的性能收益

**影响文件：**
- 重写 `src/components/DynastyNebula3D.tsx` 或新建 `DynastyNebulaField.tsx`

---

## 模块 5：useSemanticZoom 优化

**问题：** `useSemanticZoom(distanceRef.current)` 在 render 函数体中读取 ref 值，但 ref 只在 useFrame 内更新，因此 render 时拿到的是上一帧的 stale 值。distance → zoomLevel 的判断应在 frame loop 内完成以保证准确性。

**方案：**

- 把 distance → zoomLevel 判断直接放在 `CameraController` 的 useFrame 内
- 只在 zoomLevel 实际变化时调用 `setZoomLevel`
- 去掉 `useSemanticZoom` hook 的 useEffect

**影响文件：**
- `src/components/CameraController.tsx`
- `src/hooks/useSemanticZoom.ts`（可删除或简化为纯函数）

---

## 模块 6：动态自适应布局 + 缩放体验

**问题：** 唐代 26 人、宋代 21 人挤在 Y 轴 80 单位内，球半径最大 4，直接重叠。

### 6a) 自适应空间分布

修改 `layoutAuthors3D`，完全数据驱动。使用统一的螺旋分布算法，当 n 较小时螺旋自然退化为近似线性排列：

- 分布策略：始终使用螺旋柱体分布，螺旋半径 = `sqrt(n) * SPIRAL_RADIUS_FACTOR`
  - 当 n <= 3 时，螺旋半径极小，视觉上等同于线性排列
  - 当 n 增大时，螺旋自然展开为立体结构
- 所有可调参数作为命名常量定义在 `layout.ts` 顶部：
  - `SPIRAL_RADIUS_FACTOR`：螺旋半径系数
  - `MIN_SPACING`：最小间距保证
  - `SPREAD_FACTOR`：Y/Z 扩展系数
- 最小间距 = `max(两球半径之和 * 3, MIN_SPACING)`
- Y/Z spread 范围 = `sqrt(n) * SPREAD_FACTOR`，人越多空间越大，不设死上限
- X 轴按 birth_year + 基于 index 的确定性偏移避免重叠（不用随机，保证每次布局一致）

### 6b) 语义缩放 LOD

| 缩放级别 | 距离 | 星球显示 | 标签显示 |
|---------|------|---------|---------|
| galaxy | >200 | 所有星球，小尺寸 | 只显示朝代名 |
| dynasty | 60-200 | 正常尺寸 | 诗作数 >3 的诗人名字 |
| poet | <60 | 放大，发光增强 | 所有诗人名字 |

注意：当前 `INITIAL_POSITION` 为 z=300，`OrbitControls` 的 `minDistance=5`/`maxDistance=800`。新阈值下初始视图仍为 galaxy 级别，三个缩放级别均可达。实现时需同步审查这些参数确保匹配。

### 6c) 缩放手感

- `zoomSpeed` 根据距离动态调整：远处 0.8，近处 0.3
- 缩放时 camera 位置 lerp 平滑过渡
- 滚轮缩放朝鼠标指向方向推进（dolly toward cursor）

### 6d) 点击飞入

- 点击朝代星云 → 飞到该朝代中心，dynasty 级别距离
- 点击诗人星球 → 飞到诗人附近，poet 级别距离

**影响文件：**
- `src/lib/layout.ts`（layoutAuthors3D 重写）
- `src/components/CameraController.tsx`
- `src/components/AuthorStarField.tsx`（LOD 逻辑）

---

## 模块 7：视觉提升

### 7a) 后处理效果

使用 `@react-three/postprocessing` 的 EffectComposer：

- Bloom：星球和关系线发光溢出
- ToneMapping（ACESFilmic）：电影级色调
- Vignette：四角压暗聚焦中心
- 深度雾：使用 postprocessing 库的深度雾效果（而非 Three.js 场景级 `<fog>`），确保雾在 Bloom 之后应用，避免远处物体产生泛白光晕

### 7b) 星球 shader 材质

替换 MeshStandardMaterial 为自定义 shader：

- 表面 simplex noise 纹理模拟云纹/气流
- 边缘 fresnel 发光（rim light）
- 呼吸脉动：emissive 强度随时间缓慢变化

### 7c) AI 生图资源（用户自行生成）

**Skybox 提示词：**

> Deep space panorama with subtle Chinese ink wash influence. Dark indigo-black background with scattered stars. Faint wisps of nebula clouds rendered in traditional Chinese ink painting style — soft gradients of deep blue, muted gold, and pale jade green. No planets, no text. Seamless equirectangular projection for 3D skybox. 8K resolution, photorealistic starfield with artistic ink wash overlay.

**朝代星云纹理提示词（alpha 透明 PNG，1024x1024）：**

> Ethereal nebula cloud texture on black background. Chinese ink wash painting style with [朝代色] color palette. Soft, flowing brushstroke-like gas clouds. Transparent edges fading to black. Square format, 1024x1024, PNG with alpha channel.

朝代色参考：
- 唐：warm gold and vermillion
- 宋：celadon green and pale blue
- 先秦：bronze and earth brown
- 汉：deep crimson and jade
- 魏晋：silver and misty grey
- 元：cobalt blue and white
- 明：imperial yellow and navy
- 清：royal purple and teal

**星球纹理提示词（可选，512x512）：**

> Spherical planet surface texture, Chinese ink wash art style. Swirling cloud patterns in [朝代色]. Seamless tileable texture, 512x512. Dark background with luminous colored wisps. No text, no symbols.

**影响文件：**
- 新建 `src/components/PostProcessing.tsx`
- 新建 `src/shaders/authorStar.vert` / `authorStar.frag`（或内联 shader）
- `src/components/Universe3D.tsx`（添加 EffectComposer + fog）
- `public/textures/`（AI 生成的贴图资源）

---

## 预期效果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| Draw calls | ~180 | ~15 |
| PointLights | 87 | 3 |
| Text 组件 | ~95 | ~10 |
| 每帧 new 分配 | ~80 | 0 |
| 字体加载 | 25MB | ~300KB |
| 密集朝代可读性 | 重叠不可读 | 螺旋分布 + LOD |

## 补充说明

- `TimelineRail3D` 创建 ~30 条 Line + ~7 个 Text（世纪刻度 + 朝代标记），已计入 draw call 统计，当前开销不大，暂不优化
- `PoemOrbit3D` 在选中作者时为每首诗创建独立 mesh。诗作多的作者（如李白）可能一次出现 10+ 个球体。当前仅在选中时渲染，影响有限，但如后续体验不佳可改为 InstancedMesh
- `StarfieldBackground`（2000 粒子）已是单个 `<points>` 高效实现，无需优化
- `fonttools`/`pyftsubset` 为构建时 dev 依赖，不影响运行时 bundle

## 依赖

- `@react-three/postprocessing`（新增）
- `fonttools` / `pyftsubset`（构建时工具，子集化字体）
