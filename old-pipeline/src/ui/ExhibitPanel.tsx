import { useEffect, useRef, type CSSProperties } from 'react'
import type { Exhibit } from '../data/portfolio'

interface ExhibitPanelProps {
  readonly exhibit: Exhibit
  readonly onClose: () => void
  readonly onContinue: () => void
  readonly onOpenNotes: () => void
}

function LinkButton({
  label,
  href,
  kind,
}: NonNullable<Exhibit['links']>[number]) {
  const external = kind === 'external'
  return (
    <a
      className="dossier-link"
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      download={kind === 'download' ? true : undefined}
    >
      <span>{label}</span>
      <b>{external ? '↗' : kind === 'download' ? '↓' : '→'}</b>
    </a>
  )
}

export function ExhibitPanel({
  exhibit,
  onClose,
  onContinue,
  onOpenNotes,
}: ExhibitPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const sectionLabel = exhibit.kind === 'project'
    ? 'PROJECT'
    : exhibit.kind === 'experience'
      ? 'WORK EXPERIENCE'
      : 'SKILLS & TOOLS'

  useEffect(() => {
    closeRef.current?.focus()
  }, [exhibit.id])

  return (
    <div className="dossier-layer" role="presentation" onPointerDown={onClose}>
      <article
        className="dossier"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
        style={{ '--dossier-accent': exhibit.accent } as CSSProperties}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="dossier__rail" aria-hidden="true">
          <span>0{exhibit.index}</span>
          <i />
          <small>{sectionLabel}</small>
        </div>

        <header className="dossier__header">
          <div>
            <p>{exhibit.eyebrow}</p>
            <h2 id="dossier-title">{exhibit.title}</h2>
            {exhibit.period ? <span className="dossier__period">{exhibit.period}</span> : null}
          </div>
          <div className="dossier__metric">
            <b>{exhibit.metric}</b>
            <small>{exhibit.metricLabel}</small>
          </div>
          <button ref={closeRef} className="dossier__close" onClick={onClose}>
            <span>Close</span>
            <kbd>ESC</kbd>
          </button>
        </header>

        <div className={`dossier__body${!exhibit.timeline && !exhibit.skillGroups ? ' dossier__body--single' : ''}${exhibit.image ? ' dossier__body--with-image' : ''}`}>
          <section className="dossier__summary">
            <p>{exhibit.summary}</p>
            {exhibit.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            {exhibit.bullets ? (
              <ul className="evidence-list">
                {exhibit.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}

            {exhibit.image ? (
              <figure className={`dossier__image${(exhibit.imageAspect ?? 2) < 1.25 ? ' dossier__image--contain' : ''}`}>
                <img src={exhibit.image} alt={`${exhibit.title} project preview`} />
                <figcaption>PROJECT SCREENSHOT</figcaption>
              </figure>
            ) : null}
          </section>

          {exhibit.timeline ? (
            <section className="timeline" aria-label="Work experience">
              {exhibit.timeline.map((entry, index) => (
                <article key={`${entry.organization}-${entry.role}`} className="timeline-entry">
                  <span className="timeline-entry__number">0{index + 1}</span>
                  <div className="timeline-entry__heading">
                    <span>
                      <h3>{entry.role}</h3>
                      <p>{entry.organization} · {entry.location}</p>
                    </span>
                    <time>{entry.period}</time>
                  </div>
                  <ul>
                    {entry.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                </article>
              ))}
            </section>
          ) : null}

          {exhibit.skillGroups ? (
            <section className="skill-matrix" aria-label="Technical skills">
              {exhibit.skillGroups.map((group, index) => (
                <article key={group.label}>
                  <span>0{index + 1}</span>
                  <h3>{group.label}</h3>
                  <ul>
                    {group.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </article>
              ))}
            </section>
          ) : null}
        </div>

        <footer className="dossier__footer">
          <div className="tech-strip">
            <small>{exhibit.kind === 'project' ? 'BUILT WITH' : 'TECHNOLOGIES'}</small>
            <div>
              {exhibit.tech?.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          {exhibit.links?.length ? (
            <nav className="dossier__links" aria-label={`${exhibit.title} links`}>
              {exhibit.links.map((link) => <LinkButton key={link.label} {...link} />)}
            </nav>
          ) : null}
          <div className="dossier__next-actions">
            <button className="text-action" onClick={onOpenNotes}>Open full résumé</button>
            <button className="action-button action-button--primary" onClick={onContinue}>
              Go to next section <span>→</span>
            </button>
          </div>
        </footer>
      </article>
    </div>
  )
}
