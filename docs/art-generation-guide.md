# 美术资源生成指南

## 1. Skybox 天空盒

- 格式：等距柱状投影（equirectangular），8192x4096 或 4096x2048，JPG
- 放置：`public/textures/skybox.jpg`

提示词：

> Deep space panorama, equirectangular projection for 3D skybox. Dark indigo-black void with scattered dim stars. Faint wisps of nebula clouds painted in traditional Chinese ink wash (水墨) style — soft flowing gradients of deep blue, muted gold, and pale jade green, as if brushed with diluted ink on dark xuan paper. No planets, no text, no bright objects in center. Stars concentrated toward edges. Seamless wrap-around panorama. 8K resolution.

---

## 2. 朝代星云纹理（8 张）

- 格式：1024x1024，PNG，黑底透明边缘
- 放置：`public/textures/nebula-{id}.png`

通用模板：

> Ethereal nebula cloud on pure black background. Chinese ink wash painting style — soft, flowing brushstroke-like gas clouds with [朝代色]. Edges fade smoothly to transparent black. No stars, no text, no symbols. Square format 1024x1024, suitable as a transparent texture overlay.

| 文件名 | 朝代 | [朝代色] 替换为 |
|--------|------|----------------|
| nebula-pre-qin.png | 先秦 | bronze and warm earth brown tones |
| nebula-han.png | 汉 | deep crimson red and jade green |
| nebula-wei-jin.png | 魏晋南北朝 | silver, misty grey, and cool lavender |
| nebula-tang.png | 唐 | warm gold, vermillion red, and amber |
| nebula-song.png | 宋 | celadon green, pale blue, and soft cyan |
| nebula-yuan.png | 元 | cobalt blue and stark white |
| nebula-ming.png | 明 | imperial yellow and deep navy blue |
| nebula-qing.png | 清 | royal purple, teal, and dark emerald |

---

## 3. 星球表面纹理（可选，8 张）

- 格式：512x512，PNG，seamless tileable
- 放置：`public/textures/star-{id}.png`

通用模板：

> Spherical planet surface texture, Chinese ink wash art style. Swirling cloud patterns and flowing brushstrokes in [朝代色]. Dark background with luminous colored wisps, like ink diffusing in water. Seamless tileable texture 512x512. No text, no symbols, no hard edges.

朝代色同上表。

---

## 目录结构

```
public/textures/
  skybox.jpg
  nebula-pre-qin.png
  nebula-han.png
  nebula-wei-jin.png
  nebula-tang.png
  nebula-song.png
  nebula-yuan.png
  nebula-ming.png
  nebula-qing.png
  star-pre-qin.png      (可选)
  star-han.png           (可选)
  star-wei-jin.png       (可选)
  star-tang.png          (可选)
  star-song.png          (可选)
  star-yuan.png          (可选)
  star-ming.png          (可选)
  star-qing.png          (可选)
```

生成完放到对应路径，告诉我即可接入代码。
