import type { CSSProperties } from 'react'
import {
  exhibits,
  totalExhibits,
  type Exhibit,
  type ExhibitId,
} from '../data/portfolio'
import type { PlayerTelemetry } from '../game/PlayerSlime'
import { MobileJoystick } from './MobileJoystick'

interface HudProps {
  readonly visible: boolean
  readonly gameEnabled: boolean
  readonly nearby: Exhibit | null
  readonly tracked: Exhibit | null
  readonly discovered: ReadonlySet<ExhibitId>
  readonly telemetry: PlayerTelemetry
  readonly directoryOpen: boolean
  readonly onOpenNearby: () => void
  readonly onToggleDirectory: () => void
  readonly onOpenNotes: () => void
  readonly onGuide: (id: ExhibitId) => void
  readonly onMove: (x: number, y: number) => void
  readonly onJump: () => void
}

function MiniMap({
  telemetry,
  discovered,
  tracked,
  onGuide,
}: Pick<HudProps, 'telemetry' | 'discovered' | 'tracked' | 'onGuide'>) {
  const playerStyle = {
    '--map-x': `${((telemetry.x + 13) / 26) * 100}%`,
    '--map-y': `${((telemetry.z + 28.5) / 40) * 100}%`,
  } as CSSProperties

  return (
    <div className="mini-map" aria-label="Gallery map">
      <div className="mini-map__grid" aria-hidden="true" />
      <div className="mini-map__divider" aria-hidden="true" />
      <div className="mini-map__pool" aria-hidden="true" />
      {exhibits.map((exhibit) => {
        const style = {
          '--map-x': `${((exhibit.position[0] + 13) / 26) * 100}%`,
          '--map-y': `${((exhibit.position[2] + 28.5) / 40) * 100}%`,
          '--map-accent': exhibit.accent,
        } as CSSProperties
        return (
          <button
            key={exhibit.id}
            className={`mini-map__node${tracked?.id === exhibit.id ? ' is-tracked' : ''}${discovered.has(exhibit.id) ? ' is-read' : ''}`}
            style={style}
            onClick={() => onGuide(exhibit.id)}
            aria-label={`Guide to ${exhibit.navLabel}`}
            title={exhibit.navLabel}
          />
        )
      })}
      <span className="mini-map__player" style={playerStyle} aria-hidden="true" />
      <span className="mini-map__north">N</span>
    </div>
  )
}

export function Hud({
  visible,
  gameEnabled,
  nearby,
  tracked,
  discovered,
  telemetry,
  directoryOpen,
  onOpenNearby,
  onToggleDirectory,
  onOpenNotes,
  onGuide,
  onMove,
  onJump,
}: HudProps) {
  return (
    <div className={`hud${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <header className="hud__topbar">
        <div className="identity-plate">
          <span className="identity-plate__sigil">CYH</span>
          <span>
            <b>CAELLUM YIP HOI-LEE</b>
            <small>SOFTWARE ENGINEER · GAME DEVELOPER</small>
          </span>
        </div>

        <div className="hud__top-actions">
          <div className="archive-progress" aria-label={`${discovered.size} of ${totalExhibits} sections visited`}>
            <small>VISITED</small>
            <b>{discovered.size} / {totalExhibits}</b>
            <span>
              {exhibits.map((entry) => (
                <i key={entry.id} className={discovered.has(entry.id) ? 'is-read' : undefined} />
              ))}
            </span>
          </div>
          <button className="hud-button" onClick={onOpenNotes}>
            <span>RÉSUMÉ</span>
            <small>PRINT VIEW</small>
          </button>
        </div>
      </header>

      <div className="hud__objective" aria-live="polite">
        <span className="objective-mark" />
        <span>
          <small>{tracked ? 'GUIDED ROUTE' : 'ROOM'}</small>
          <b>
            {tracked
              ? tracked.navLabel.toUpperCase()
              : telemetry.z < -12.9
                ? 'WORK & SKILLS'
                : 'PROJECT GALLERY'}
          </b>
        </span>
      </div>

      <div className="hud__left-rail">
        <button
          className={`rail-button${directoryOpen ? ' is-active' : ''}`}
          onClick={onToggleDirectory}
          aria-expanded={directoryOpen}
        >
          <span className="rail-button__icon">⌖</span>
          <span>EXPLORE</span>
        </button>
        <div className="control-legend">
          <span><kbd>W</kbd></span>
          <span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span>
          <small>MOVE WITH VIEW</small>
        </div>
      </div>

      {nearby ? (
        <button
          className="inspect-prompt"
          style={{ '--prompt-accent': nearby.accent } as CSSProperties}
          onClick={onOpenNearby}
        >
          <span className="inspect-prompt__key">E</span>
          <span>
            <small>{nearby.kind === 'project' ? 'PROJECT' : nearby.kind === 'experience' ? 'WORK' : 'SKILLS'}</small>
            <b>Open {nearby.navLabel}</b>
          </span>
          <span className="inspect-prompt__arrow">↗</span>
        </button>
      ) : (
        <div className="movement-hint">
          <span className={telemetry.inWater ? 'is-active' : undefined} />
          WASD / ARROWS · CLICK THE FLOOR TO WALK
        </div>
      )}

      <footer className="hud__footer">
        <div className="hud__map-wrap">
          <MiniMap
            telemetry={telemetry}
            discovered={discovered}
            tracked={tracked}
            onGuide={onGuide}
          />
          <div className="map-caption">
            <small>MAP</small>
            <b>PROJECTS / WORK</b>
          </div>
        </div>
      </footer>

      <MobileJoystick
        disabled={!gameEnabled}
        onChange={onMove}
        onJump={onJump}
      />
    </div>
  )
}
