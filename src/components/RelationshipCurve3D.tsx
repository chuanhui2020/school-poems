import { useMemo } from 'react'
import * as THREE from 'three'
import type { RelationshipEdge, AuthorNode } from '../types/nodes'
import { inkLineVertex, inkLineFragment } from '../shaders/inkLineShader'

interface Props {
  edge: RelationshipEdge
  sourceNode: AuthorNode
  targetNode: AuthorNode
  highlighted: boolean
  dimmed: boolean
}

const TYPE_COLORS: Record<string, string> = {
  friendship: '#f0c060',
  teacher_student: '#80c8ff',
  literary_school: '#c080ff',
  family: '#ff9080',
  contemporary: '#80ffb0',
}

const RIBBON_SEGMENTS = 32
const RIBBON_HALF_WIDTH = 0.8

function buildRibbonGeometry(
  start: THREE.Vector3,
  mid: THREE.Vector3,
  end: THREE.Vector3
): THREE.BufferGeometry {
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
  const points = curve.getPoints(RIBBON_SEGMENTS)
  const tangents = points.map((_, i, arr) => {
    if (i === 0) return arr[1].clone().sub(arr[0]).normalize()
    if (i === arr.length - 1) return arr[i].clone().sub(arr[i - 1]).normalize()
    return arr[i + 1].clone().sub(arr[i - 1]).normalize()
  })

  const up = new THREE.Vector3(0, 1, 0)
  const vertices: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const progress: number[] = []

  for (let i = 0; i <= RIBBON_SEGMENTS; i++) {
    const t = i / RIBBON_SEGMENTS
    const p = points[i]
    const tangent = tangents[i]
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize()

    const widthScale = Math.sin(t * Math.PI)
    const hw = RIBBON_HALF_WIDTH * (0.3 + 0.7 * widthScale)

    const p0 = p.clone().add(normal.clone().multiplyScalar(hw))
    const p1 = p.clone().add(normal.clone().multiplyScalar(-hw))

    vertices.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z)
    uvs.push(t, 0, t, 1)
    progress.push(t, t)

    if (i < RIBBON_SEGMENTS) {
      const base = i * 2
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setAttribute('aProgress', new THREE.Float32BufferAttribute(progress, 1))
  geometry.setIndex(indices)

  return geometry
}

export function RelationshipCurve3D({ edge, sourceNode, targetNode, highlighted, dimmed }: Props) {
  const color = TYPE_COLORS[edge.type] ?? '#aaaaaa'
  const opacity = dimmed ? 0.05 : highlighted ? 0.6 : 0.15

  const { geometry, material } = useMemo(() => {
    const s = new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z)
    const e = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z)
    const m = s.clone().lerp(e, 0.5)
    m.y += Math.max(10, s.distanceTo(e) * 0.25)

    const geometry = buildRibbonGeometry(s, m, e)

    const material = new THREE.ShaderMaterial({
      vertexShader: inkLineVertex,
      fragmentShader: inkLineFragment,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    })

    return { geometry, material }
  }, [sourceNode.x, sourceNode.y, sourceNode.z, targetNode.x, targetNode.y, targetNode.z, color])

  // Update opacity reactively
  useMemo(() => {
    material.uniforms.uOpacity.value = opacity
  }, [material, opacity])

  return <mesh geometry={geometry} material={material} />
}
