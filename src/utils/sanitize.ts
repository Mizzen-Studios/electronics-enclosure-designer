import { defaultModel } from '../app/defaultModel'
import type { CircularHole, EnclosureConfig } from '../types/enclosure'
import { clampHoleToFace } from './enclosureBounds'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const VALID_TYPES = new Set<EnclosureConfig['type']>(['plain', 'lid', 'flanged'])
const MAX_HOLES = 250
const MAX_NAME_LENGTH = 80

interface SanitizeOptions {
  allowPremium?: boolean
}

function sanitizeName(name: unknown): string {
  if (typeof name !== 'string') {
    return defaultModel.name
  }

  const trimmed = name.trim().slice(0, MAX_NAME_LENGTH)
  return trimmed.length > 0 ? trimmed : defaultModel.name
}

function sanitizeHole(hole: CircularHole, config: EnclosureConfig): CircularHole {
  return clampHoleToFace(
    {
      id: hole.id,
      face: hole.face,
      radius: Number.isFinite(hole.radius) ? hole.radius : 1,
      x: Number.isFinite(hole.x) ? hole.x : 0,
      y: Number.isFinite(hole.y) ? hole.y : 0,
    },
    config,
  )
}

export function sanitizeConfig(config: EnclosureConfig, options: SanitizeOptions = {}): EnclosureConfig {
  const width = clamp(Number.isFinite(config.width) ? config.width : defaultModel.width, 40, 240)
  const height = clamp(Number.isFinite(config.height) ? config.height : defaultModel.height, 30, 180)
  const depth = clamp(Number.isFinite(config.depth) ? config.depth : defaultModel.depth, 40, 240)
  const wallMax = Math.max(1, Math.min(width, height, depth) / 3)
  const wallThickness = clamp(
    Number.isFinite(config.wallThickness) ? config.wallThickness : defaultModel.wallThickness,
    1,
    wallMax,
  )

  const normalized: EnclosureConfig = {
    ...defaultModel,
    ...config,
    name: sanitizeName(config.name),
    type: VALID_TYPES.has(config.type) ? config.type : defaultModel.type,
    width,
    height,
    depth,
    wallThickness,
    holes: [],
    premium: options.allowPremium
      ? {
          advancedFastening: Boolean(config.premium?.advancedFastening),
          waterproofSeal: Boolean(config.premium?.waterproofSeal),
        }
      : defaultModel.premium,
    services: {
      printing: Boolean(config.services?.printing),
      delivery: Boolean(config.services?.delivery),
    },
  }

  normalized.holes = config.holes
    .slice(0, MAX_HOLES)
    .map((hole) => sanitizeHole(hole, normalized))

  return normalized
}
