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

export function SceneGridAndRulers({ width, height, depth }: SceneGridAndRulersProps) {
  const floorY = -height / 2 - 2
  const rulerY = floorY + 0.05
  const widthLineZ = depth / 2 + 12
  const depthLineX = -width / 2 - 12
  const tickLength = 2

  const widthTicks = useMemo(
    () =>
      buildTicks(-Math.floor(width / 2), Math.floor(width / 2), 10, (value) => ({
        start: [value, rulerY, widthLineZ - tickLength] as [number, number, number],
        end: [value, rulerY, widthLineZ + tickLength] as [number, number, number],
      })),
    [rulerY, tickLength, width, widthLineZ],
  )

  const depthTicks = useMemo(
    () =>
      buildTicks(-Math.floor(depth / 2), Math.floor(depth / 2), 10, (value) => ({
        start: [depthLineX - tickLength, rulerY, value] as [number, number, number],
        end: [depthLineX + tickLength, rulerY, value] as [number, number, number],
      })),
    [depth, depthLineX, rulerY, tickLength],
  )

  const gridSize = Math.max(width, depth) * 2.8
  const labelSize = Math.max(3.4, Math.min(width, depth) * 0.045)
  const labelOutlineWidth = Math.max(0.08, labelSize * 0.06)

  return (
    <>
      <Grid
        position={[0, floorY, 0]}
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
          [-width / 2, rulerY, widthLineZ],
          [width / 2, rulerY, widthLineZ],
        ]}
        color="#4f46e5"
      />
      {widthTicks.map((tick, index) => (
        <Line key={`width-tick-${index}`} points={[tick.start, tick.end]} color="#6366f1" />
      ))}
      <Text
        position={[0, rulerY, widthLineZ + 5]}
        rotation={[-Math.PI / 2, 0, 0]}
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
          [depthLineX, rulerY, -depth / 2],
          [depthLineX, rulerY, depth / 2],
        ]}
        color="#4f46e5"
      />
      {depthTicks.map((tick, index) => (
        <Line key={`depth-tick-${index}`} points={[tick.start, tick.end]} color="#6366f1" />
      ))}
      <Text
        position={[depthLineX - 5, rulerY, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
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
