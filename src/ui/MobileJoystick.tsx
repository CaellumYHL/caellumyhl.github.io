import { useRef, useState, type PointerEvent } from 'react'

interface MobileJoystickProps {
  readonly disabled: boolean
  readonly onChange: (x: number, y: number) => void
  readonly onJump: () => void
}

const MAX_TRAVEL = 42

export function MobileJoystick({
  disabled,
  onChange,
  onJump,
}: MobileJoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  const update = (event: PointerEvent<HTMLDivElement>): void => {
    const base = baseRef.current
    if (!base || disabled) return
    const rect = base.getBoundingClientRect()
    let x = event.clientX - (rect.left + rect.width / 2)
    let y = event.clientY - (rect.top + rect.height / 2)
    const length = Math.hypot(x, y)
    if (length > MAX_TRAVEL) {
      x = (x / length) * MAX_TRAVEL
      y = (y / length) * MAX_TRAVEL
    }
    setKnob({ x, y })
    onChange(x / MAX_TRAVEL, y / MAX_TRAVEL)
  }

  const release = (event: PointerEvent<HTMLDivElement>): void => {
    if (pointerIdRef.current !== event.pointerId) return
    pointerIdRef.current = null
    setKnob({ x: 0, y: 0 })
    onChange(0, 0)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div className="touch-controls" aria-label="Touch controls">
      <div
        ref={baseRef}
        className="joystick"
        onPointerDown={(event) => {
          if (disabled) return
          pointerIdRef.current = event.pointerId
          event.currentTarget.setPointerCapture(event.pointerId)
          update(event)
        }}
        onPointerMove={(event) => {
          if (pointerIdRef.current === event.pointerId) update(event)
        }}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <span className="joystick__ticks" aria-hidden="true" />
        <span
          className="joystick__knob"
          style={{ transform: `translate3d(${knob.x}px, ${knob.y}px, 0)` }}
        />
      </div>
      <button className="jump-control" type="button" onPointerDown={onJump} disabled={disabled}>
        <span>JUMP</span>
      </button>
    </div>
  )
}
