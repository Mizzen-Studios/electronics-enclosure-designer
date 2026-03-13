import type { CircularHole, EnclosureConfig, Face } from '../types/enclosure'

export interface FaceBounds {
  xLimit: number
  yLimit: number
}

export function getFaceBounds(config: EnclosureConfig, face: Face): FaceBounds {
  const w = config.width / 2 - config.wallThickness
  const h = config.height / 2 - config.wallThickness
  const d = config.depth / 2 - config.wallThickness

  if (face === 'front' || face === 'back') {
    return { xLimit: w, yLimit: h }
  }

  if (face === 'left' || face === 'right') {
    return { xLimit: d, yLimit: h }
  }

  return { xLimit: w, yLimit: d }
}

export function clampHoleToFace(hole: CircularHole, config: EnclosureConfig): CircularHole {
  const limits = getFaceBounds(config, hole.face)
  const radius = Math.max(1, Math.min(hole.radius, Math.abs(limits.xLimit), Math.abs(limits.yLimit)))

  return {
    ...hole,
    radius,
    x: Math.min(Math.max(hole.x, -limits.xLimit + radius), limits.xLimit - radius),
    y: Math.min(Math.max(hole.y, -limits.yLimit + radius), limits.yLimit - radius),
  }
}
