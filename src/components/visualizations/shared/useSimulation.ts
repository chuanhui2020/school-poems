import { useEffect, useRef, useState, useCallback } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3'

export interface SimNode extends SimulationNodeDatum {
  id: string
  [key: string]: unknown
}

export interface SimLink extends SimulationLinkDatum<SimNode> {
  source: string | SimNode
  target: string | SimNode
  [key: string]: unknown
}

interface SimulationConfig {
  linkDistance?: number
  chargeStrength?: number
  collideRadius?: number
  centerStrength?: number
  alphaDecay?: number
}

export function useSimulation(
  nodes: SimNode[],
  links: SimLink[],
  dimensions: { width: number; height: number },
  config: SimulationConfig = {}
) {
  const {
    linkDistance = 100,
    chargeStrength = -300,
    collideRadius = 30,
    centerStrength = 0.1,
    alphaDecay = 0.02,
  } = config

  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null)
  const [simulatedNodes, setSimulatedNodes] = useState<SimNode[]>([])
  const [simulatedLinks, setSimulatedLinks] = useState<SimLink[]>([])

  const tick = useCallback(() => {
    setSimulatedNodes((prev) => {
      const sim = simulationRef.current
      if (!sim) return prev
      return sim.nodes().map((n) => ({ ...n }))
    })
    setSimulatedLinks((prev) => {
      const sim = simulationRef.current
      if (!sim) return prev
      const simLinks = (sim.force('link') as ReturnType<typeof forceLink<SimNode, SimLink>>)
      if (!simLinks) return prev
      return simLinks.links().map((l) => ({ ...l }))
    })
  }, [])

  useEffect(() => {
    if (nodes.length === 0) {
      setSimulatedNodes([])
      setSimulatedLinks([])
      return
    }

    const nodesCopy = nodes.map((n) => ({ ...n }))
    const linksCopy = links.map((l) => ({ ...l }))

    const simulation = forceSimulation<SimNode>(nodesCopy)
      .force(
        'link',
        forceLink<SimNode, SimLink>(linksCopy)
          .id((d) => d.id)
          .distance(linkDistance)
      )
      .force('charge', forceManyBody().strength(chargeStrength))
      .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2).strength(centerStrength))
      .force('collide', forceCollide<SimNode>().radius(collideRadius))
      .force('x', forceX(dimensions.width / 2).strength(0.05))
      .force('y', forceY(dimensions.height / 2).strength(0.05))
      .alphaDecay(alphaDecay)
      .on('tick', tick)

    simulationRef.current = simulation

    return () => {
      simulation.stop()
      simulationRef.current = null
    }
  }, [nodes, links, dimensions.width, dimensions.height, linkDistance, chargeStrength, collideRadius, centerStrength, alphaDecay, tick])

  const reheat = useCallback(() => {
    simulationRef.current?.alpha(0.3).restart()
  }, [])

  return { nodes: simulatedNodes, links: simulatedLinks, simulation: simulationRef, reheat }
}
