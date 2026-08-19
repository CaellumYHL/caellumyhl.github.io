import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import { Vector3 } from 'three'
import {
  exhibitById,
  exhibits,
  type ExhibitId,
} from './data/portfolio'
import { PortfolioWorld } from './game/PortfolioWorld'
import type {
  PlayerInputState,
  PlayerTelemetry,
} from './game/PlayerSlime'
import { DirectoryPanel } from './ui/DirectoryPanel'
import { ExhibitPanel } from './ui/ExhibitPanel'
import { FieldNotes } from './ui/FieldNotes'
import { Hud } from './ui/Hud'
import { IntroScreen } from './ui/IntroScreen'
import { ArtStudio, type ArtStudioMode } from './ui/ArtStudio'

const DISCOVERY_KEY = 'caellum-portfolio:seen-sections'
const PROXIMITY_DISTANCE = 2.85

function readInitialDiscoveries(): Set<ExhibitId> {
  try {
    const raw = window.localStorage.getItem(DISCOVERY_KEY)
    if (!raw) return new Set()
    const values = JSON.parse(raw) as unknown
    if (!Array.isArray(values)) return new Set()
    return new Set(
      values.filter((value): value is ExhibitId =>
        typeof value === 'string' && exhibitById.has(value as ExhibitId),
      ),
    )
  } catch {
    return new Set()
  }
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!media) return
    const update = (): void => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}

interface SceneBoundaryProps {
  readonly children: ReactNode
  readonly onOpenNotes: () => void
}

class SceneBoundary extends Component<SceneBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Portfolio scene failed to render', error, info)
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="scene-failure">
          <span>3D gallery unavailable</span>
          <h1>The professional record is still available.</h1>
          <button className="action-button action-button--primary" onClick={this.props.onOpenNotes}>
            Open résumé
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function nearestExhibit(x: number, z: number): ExhibitId | null {
  let nearest: ExhibitId | null = null
  let nearestDistance = PROXIMITY_DISTANCE

  for (const exhibit of exhibits) {
    const distance = Math.hypot(x - exhibit.position[0], z - exhibit.position[2])
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = exhibit.id
    }
  }
  return nearest
}

function guidedDestination(id: ExhibitId): Vector3 {
  const exhibit = exhibitById.get(id)
  if (!exhibit) return new Vector3()
  const target = new Vector3(exhibit.position[0], 0, exhibit.position[2])
  const inward = target.clone().multiplyScalar(-1)
  if (inward.lengthSq() < 0.01) inward.set(0, 0, 1)
  inward.normalize().multiplyScalar(2.05)
  return target.add(inward)
}

export function App() {
  const startupParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const startupMode = startupParams.get('mode')
  const requestedStudio = startupParams.get('studio')
  const startupStudio: ArtStudioMode | null =
    requestedStudio === 'watercolor' || requestedStudio === 'faces'
      ? requestedStudio
      : null
  const requestedExhibit = startupParams.get('exhibit')
  const startupExhibit = requestedExhibit && exhibitById.has(requestedExhibit as ExhibitId)
    ? requestedExhibit as ExhibitId
    : null
  const directNotes = startupMode === 'resume' || startupMode === 'notes'
  const directGallery = startupMode === 'gallery' || startupMode === 'play' || startupMode === 'catalogue'
  const reducedMotion = useReducedMotion()
  const [started, setStarted] = useState(
    directNotes || directGallery || Boolean(startupExhibit) || Boolean(startupStudio),
  )
  const [fieldNotesOpen, setFieldNotesOpen] = useState(directNotes)
  const [directoryOpen, setDirectoryOpen] = useState(startupMode === 'catalogue')
  const [studioMode, setStudioMode] = useState<ArtStudioMode | null>(startupStudio)
  const [activeId, setActiveId] = useState<ExhibitId | null>(startupExhibit)
  const [nearbyId, setNearbyId] = useState<ExhibitId | null>(null)
  const [trackedId, setTrackedId] = useState<ExhibitId | null>(null)
  const [discovered, setDiscovered] = useState<Set<ExhibitId>>(readInitialDiscoveries)
  const [telemetry, setTelemetry] = useState<PlayerTelemetry>({
    x: 0,
    z: 7.45,
    speed: 0,
    inWater: false,
  })

  const inputRef = useRef<PlayerInputState>({ x: 0, y: 0, jumpQueued: false })
  const destinationRef = useRef<Vector3 | null>(null)
  const playerPositionRef = useRef(new Vector3(0, 0, 7.45))
  const liveRegionRef = useRef<HTMLDivElement>(null)

  const activeExhibit = activeId ? exhibitById.get(activeId) ?? null : null
  const nearbyExhibit = nearbyId ? exhibitById.get(nearbyId) ?? null : null
  const trackedExhibit = trackedId ? exhibitById.get(trackedId) ?? null : null
  const gameEnabled = started && !fieldNotesOpen && !directoryOpen && !activeExhibit && !studioMode

  useEffect(() => {
    try {
      window.localStorage.setItem(DISCOVERY_KEY, JSON.stringify([...discovered]))
    } catch {
      // Progress persistence is a convenience; the experience remains usable without it.
    }
  }, [discovered])

  useEffect(() => {
    if (gameEnabled) return
    inputRef.current.x = 0
    inputRef.current.y = 0
    destinationRef.current = null
  }, [gameEnabled])

  const handleTelemetry = useCallback((next: PlayerTelemetry): void => {
    setTelemetry(next)
    const nextNearby = nearestExhibit(next.x, next.z)
    setNearbyId((current) => (current === nextNearby ? current : nextNearby))
  }, [])

  const openExhibit = useCallback((id: ExhibitId): void => {
    setStarted(true)
    setDirectoryOpen(false)
    setFieldNotesOpen(false)
    setStudioMode(null)
    setTrackedId(null)
    setActiveId(id)
    setDiscovered((current) => {
      if (current.has(id)) return current
      const next = new Set(current)
      next.add(id)
      return next
    })
  }, [])

  const guideTo = useCallback((id: ExhibitId): void => {
    setStarted(true)
    setActiveId(null)
    setDirectoryOpen(false)
    setFieldNotesOpen(false)
    setStudioMode(null)
    setTrackedId(id)
    destinationRef.current = guidedDestination(id)
  }, [])

  const openNotes = useCallback((): void => {
    setStarted(true)
    setActiveId(null)
    setDirectoryOpen(false)
    setStudioMode(null)
    setFieldNotesOpen(true)
  }, [])

  const openStudio = useCallback((mode: ArtStudioMode): void => {
    setStarted(true)
    setActiveId(null)
    setDirectoryOpen(false)
    setFieldNotesOpen(false)
    setStudioMode(mode)
  }, [])

  const continueFrom = useCallback(
    (currentId: ExhibitId): void => {
      const currentIndex = exhibits.findIndex((entry) => entry.id === currentId)
      const ordered = [
        ...exhibits.slice(currentIndex + 1),
        ...exhibits.slice(0, currentIndex + 1),
      ]
      const next = ordered.find((entry) => !discovered.has(entry.id)) ?? ordered[0]
      if (next) guideTo(next.id)
    },
    [discovered, guideTo],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.code === 'Escape') {
        if (studioMode) setStudioMode(null)
        else if (fieldNotesOpen) setFieldNotesOpen(false)
        else if (activeId) setActiveId(null)
        else if (directoryOpen) setDirectoryOpen(false)
        return
      }

      if (!started && event.code === 'Enter') {
        setStarted(true)
        return
      }

      if (!gameEnabled || event.repeat) return
      if (event.code === 'KeyE' && nearbyId) {
        event.preventDefault()
        openExhibit(nearbyId)
      } else if (event.code === 'KeyM') {
        event.preventDefault()
        setDirectoryOpen(true)
      } else if (event.code === 'KeyF') {
        event.preventDefault()
        openNotes()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeId, directoryOpen, fieldNotesOpen, gameEnabled, nearbyId, openExhibit, openNotes, started, studioMode])

  useEffect(() => {
    const message = nearbyExhibit
      ? `${nearbyExhibit.navLabel} is in range.`
      : trackedExhibit
        ? `Guiding toward ${trackedExhibit.navLabel}.`
        : ''
    if (liveRegionRef.current) liveRegionRef.current.textContent = message
  }, [nearbyExhibit, trackedExhibit])

  return (
    <main className={`app-shell${fieldNotesOpen ? ' notes-open' : ''}`}>
      <SceneBoundary onOpenNotes={openNotes}>
        <PortfolioWorld
          gameEnabled={gameEnabled}
          reducedMotion={reducedMotion}
          nearbyId={nearbyId}
          trackedId={trackedId}
          inputRef={inputRef}
          destinationRef={destinationRef}
          playerPositionRef={playerPositionRef}
          onTelemetry={handleTelemetry}
          onOpenExhibit={openExhibit}
          onOpenStudio={openStudio}
        />
      </SceneBoundary>

      <div className="world-grade" aria-hidden="true" />
      <div className="world-vignette" aria-hidden="true" />
      <div className="world-grain" aria-hidden="true" />

      <Hud
        visible={started && !fieldNotesOpen && !studioMode}
        gameEnabled={gameEnabled}
        nearby={nearbyExhibit}
        tracked={trackedExhibit}
        discovered={discovered}
        telemetry={telemetry}
        directoryOpen={directoryOpen}
        onOpenNearby={() => nearbyId && openExhibit(nearbyId)}
        onToggleDirectory={() => setDirectoryOpen((open) => !open)}
        onOpenNotes={openNotes}
        onGuide={guideTo}
        onMove={(x, y) => {
          inputRef.current.x = x
          inputRef.current.y = y
        }}
        onJump={() => {
          inputRef.current.jumpQueued = true
        }}
      />

      {!started && !fieldNotesOpen ? (
        <IntroScreen onEnter={() => setStarted(true)} onOpenNotes={openNotes} />
      ) : null}

      {directoryOpen ? (
        <DirectoryPanel
          discovered={discovered}
          trackedId={trackedId}
          onGuide={guideTo}
          onOpen={openExhibit}
          onClose={() => setDirectoryOpen(false)}
        />
      ) : null}

      {activeExhibit ? (
        <ExhibitPanel
          exhibit={activeExhibit}
          onClose={() => setActiveId(null)}
          onContinue={() => continueFrom(activeExhibit.id)}
          onOpenNotes={openNotes}
        />
      ) : null}

      {fieldNotesOpen ? <FieldNotes onClose={() => setFieldNotesOpen(false)} /> : null}

      {studioMode ? (
        <ArtStudio initialMode={studioMode} onClose={() => setStudioMode(null)} />
      ) : null}

      <div ref={liveRegionRef} className="sr-only" aria-live="polite" />
    </main>
  )
}
