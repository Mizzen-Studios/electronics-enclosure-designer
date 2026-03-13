import { GizmoHelper, GizmoViewport } from '@react-three/drei'

export function OrientationWidget() {
  return (
    <GizmoHelper alignment="top-right" margin={[90, 90]}>
      <GizmoViewport
        axisColors={['#ef4444', '#10b981', '#3b82f6']}
        labelColor="#111827"
      />
    </GizmoHelper>
  )
}
