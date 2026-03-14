import { Grid, Line, Text } from '@react-three/drei'
import { useMemo } from 'react'

interface SceneGridAndRulersProps {
  width: number
  height: number
  depth: number
}

interface Tick {
  start: [number, number, number]
  end: [number, number, number]
}

function buildTicks(start: number, end: number, step: number, makeTick: (value: number) => Tick): Tick[] {
  const ticks: Tick[] = []
  for (let value = start; value <= end; value += step) {
    ticks.push(makeTick(value))
  }
  return ticks
}

export function SceneGridAndRulers({ width, depth }: SceneGridAndRulersProps) {
  const planeZ = 0
  const rulerZ = planeZ + 0.05
  const widthLineY = depth / 2 + 12
  const depthLineX = -width / 2 - 12
  const tickLength = 2

  const widthTicks = useMemo(
    () =>
      buildTicks(-Math.floor(width / 2), Math.floor(width / 2), 10, (value) => ({
        start: [value, widthLineY - tickLength, rulerZ] as [number, number, number],
        end: [value, widthLineY + tickLength, rulerZ] as [number, number, number],
      })),
    [rulerZ, tickLength, width, widthLineY],
  )

  const depthTicks = useMemo(
    () =>
      buildTicks(-Math.floor(depth / 2), Math.floor(depth / 2), 10, (value) => ({
        start: [depthLineX - tickLength, value, rulerZ] as [number, number, number],
        end: [depthLineX + tickLength, value, rulerZ] as [number, number, number],
      })),
    [depth, depthLineX, rulerZ, tickLength],
  )

  const gridSize = Math.max(width, depth) * 2.8
  const labelSize = Math.max(3.4, Math.min(width, depth) * 0.045)
  const labelOutlineWidth = Math.max(0.08, labelSize * 0.06)

  return (
    <>
      <Grid
        position={[0, 0, planeZ]}
        rotation={[Math.PI / 2, 0, 0]}
        args={[gridSize, gridSize]}
        cellSize={5}
        cellThickness={0.35}
        cellColor="#a1a1aa"
        sectionSize={25}
        sectionThickness={0.8}
        sectionColor="#6366f1"
        fadeDistance={gridSize * 0.75}
        fadeStrength={1}
      />

      <Line
        points={[
          [-width / 2, widthLineY, rulerZ],
          [width / 2, widthLineY, rulerZ],
        ]}
        color="#4f46e5"
      />
      {widthTicks.map((tick, index) => (
        <Line key={`width-tick-${index}`} points={[tick.start, tick.end]} color="#6366f1" />
      ))}
      <Text
        position={[0, widthLineY + 5, rulerZ]}
        color="#312e81"
        anchorX="center"
        anchorY="middle"
        fontSize={labelSize}
        outlineColor="#ffffff"
        outlineWidth={labelOutlineWidth}
      >
        W {Math.round(width)} mm
      </Text>

      <Line
        points={[
          [depthLineX, -depth / 2, rulerZ],
          [depthLineX, depth / 2, rulerZ],
        ]}
        color="#4f46e5"
      />
      {depthTicks.map((tick, index) => (
        <Line key={`depth-tick-${index}`} points={[tick.start, tick.end]} color="#6366f1" />
      ))}
      <Text
        position={[depthLineX - 5, 0, rulerZ]}
        rotation={[0, 0, Math.PI / 2]}
        color="#312e81"
        anchorX="center"
        anchorY="middle"
        fontSize={labelSize}
        outlineColor="#ffffff"
        outlineWidth={labelOutlineWidth}
      >
        D {Math.round(depth)} mm
      </Text>
    </>
  )
}
