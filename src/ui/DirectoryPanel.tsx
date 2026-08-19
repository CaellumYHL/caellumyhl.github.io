import { Fragment, type CSSProperties } from 'react'
import { exhibits, type ExhibitId } from '../data/portfolio'

interface DirectoryPanelProps {
  readonly discovered: ReadonlySet<ExhibitId>
  readonly trackedId: ExhibitId | null
  readonly onGuide: (id: ExhibitId) => void
  readonly onOpen: (id: ExhibitId) => void
  readonly onClose: () => void
}

export function DirectoryPanel({
  discovered,
  trackedId,
  onGuide,
  onOpen,
  onClose,
}: DirectoryPanelProps) {
  return (
    <aside className="directory-panel" aria-label="Portfolio navigation">
      <header className="directory-panel__head">
        <span>
          <small>EXPLORE</small>
          <b>Choose a destination</b>
        </span>
        <button className="icon-button" onClick={onClose} aria-label="Close directory">×</button>
      </header>
      <ol className="directory-list">
        {exhibits.map((exhibit, index) => {
          const isDiscovered = discovered.has(exhibit.id)
          const isTracked = trackedId === exhibit.id
          const startsRoom = index === 0 || (
            exhibits[index - 1]?.kind === 'project' && exhibit.kind !== 'project'
          )
          return (
            <Fragment key={exhibit.id}>
              {startsRoom ? (
                <li className="directory-list__room">
                  {exhibit.kind === 'project' ? 'Project gallery' : 'Work room'}
                </li>
              ) : null}
              <li
                className={isTracked ? 'is-tracked' : undefined}
                style={{ '--entry-accent': exhibit.accent } as CSSProperties}
              >
                <button className="directory-list__record" onClick={() => onOpen(exhibit.id)}>
                  <span className="directory-list__index">0{exhibit.index}</span>
                  <span>
                    <b>{exhibit.navLabel}</b>
                    <small>{exhibit.eyebrow}</small>
                  </span>
                  <span className="directory-list__state">
                    {isDiscovered ? 'VIEWED' : 'NEW'}
                  </span>
                </button>
                <button className="directory-list__guide" onClick={() => onGuide(exhibit.id)}>
                  {isTracked ? 'GUIDING' : 'WALK THERE'}
                </button>
              </li>
            </Fragment>
          )
        })}
      </ol>
      <p className="directory-panel__hint">
        “Walk there” guides the slime to a section. Any movement key takes control again.
      </p>
    </aside>
  )
}
