import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
} from 'three'
import { CSG } from 'three-csg-ts'
import type { CircularHole, EnclosureConfig, Face } from '../types/enclosure'
import { clampHoleToFace, getFaceBounds } from './enclosureBounds'

const material = new MeshStandardMaterial()

function buildBoxMesh(width: number, height: number, depth: number): Mesh {
  return new Mesh(new BoxGeometry(width, height, depth), material)
}

function createHoleDrill(hole: CircularHole, config: EnclosureConfig): Mesh {
  const clampedHole = clampHoleToFace(hole, config)

  const drillLength = Math.max(config.width, config.height, config.depth) + 20
  const drill = new Mesh(new CylinderGeometry(clampedHole.radius, clampedHole.radius, drillLength, 48), material)

  switch (clampedHole.face) {
    case 'front':
      drill.rotation.x = Math.PI / 2
      drill.position.set(clampedHole.x, clampedHole.y, config.depth / 2)
      break
    case 'back':
      drill.rotation.x = Math.PI / 2
      drill.position.set(clampedHole.x, clampedHole.y, -config.depth / 2)
      break
    case 'left':
      drill.rotation.z = Math.PI / 2
      drill.position.set(-config.width / 2, clampedHole.y, clampedHole.x)
      break
    case 'right':
      drill.rotation.z = Math.PI / 2
      drill.position.set(config.width / 2, clampedHole.y, clampedHole.x)
      break
    case 'top':
      drill.position.set(clampedHole.x, config.height / 2, clampedHole.y)
      break
    case 'bottom':
      drill.position.set(clampedHole.x, -config.height / 2, clampedHole.y)
      break
  }

  drill.updateMatrix()
  return drill
}

function applyEnclosureType(shell: Mesh, config: EnclosureConfig) {
  let output = shell
  const trimWall = Math.max(1, config.wallThickness)

  if (config.type === 'lid') {
    const lid = buildBoxMesh(config.width * 0.98, trimWall * 1.4, config.depth * 0.98)
    lid.position.y = config.height / 2 + trimWall * 0.7
    lid.updateMatrix()
    output.updateMatrix()
    output = CSG.union(output, lid)
  }

  if (config.type === 'flanged') {
    const flange = buildBoxMesh(
      config.width + trimWall * 4,
      trimWall,
      config.depth + trimWall * 4,
    )
    const centerCutout = buildBoxMesh(config.width, trimWall * 1.4, config.depth)

    flange.position.y = -config.height / 2 + trimWall / 2
    centerCutout.position.y = -config.height / 2 + trimWall / 2

    flange.updateMatrix()
    centerCutout.updateMatrix()

    const ringFlange = CSG.subtract(flange, centerCutout)
    output.updateMatrix()
    ringFlange.updateMatrix()
    output = CSG.union(output, ringFlange)
  }

  return output
}

export function buildEnclosureMesh(config: EnclosureConfig): Mesh {
  const wallThickness = Math.max(1, Math.min(config.wallThickness, Math.min(config.width, config.height, config.depth) / 3))
  const normalizedConfig = { ...config, wallThickness }
  const outer = buildBoxMesh(config.width, config.height, config.depth)

  const innerWidth = config.width - wallThickness * 2
  const innerHeight = config.height - wallThickness * 2
  const innerDepth = config.depth - wallThickness * 2

  let shell = outer
  if (innerWidth > 1 && innerHeight > 1 && innerDepth > 1) {
    const inner = buildBoxMesh(innerWidth, innerHeight, innerDepth)
    inner.updateMatrix()
    shell.updateMatrix()
    shell = CSG.subtract(shell, inner)
  }

  shell = applyEnclosureType(shell, normalizedConfig)

  for (const hole of config.holes) {
    const drill = createHoleDrill(hole, normalizedConfig)
    shell.updateMatrix()
    drill.updateMatrix()
    shell = CSG.subtract(shell, drill)
  }

  shell.geometry.computeVertexNormals()
  shell.geometry.center()

  return shell
}

export function buildEnclosureGeometry(config: EnclosureConfig): BufferGeometry {
  const shell = buildEnclosureMesh(config)
  return shell.geometry
}

export { getFaceBounds }
export type { Face }
