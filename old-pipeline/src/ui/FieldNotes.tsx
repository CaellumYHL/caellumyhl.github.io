import { useEffect, useRef } from 'react'
import {
  contactDetails,
  exhibitById,
  exhibits,
} from '../data/portfolio'

interface FieldNotesProps {
  readonly onClose: () => void
}

const experience = exhibitById.get('experience')
const skills = exhibitById.get('skills')
const projects = exhibits.filter((entry) => entry.kind === 'project')

export function FieldNotes({ onClose }: FieldNotesProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  return (
    <section className="field-notes" role="dialog" aria-modal="true" aria-labelledby="notes-title">
      <header className="field-notes__bar">
        <span className="field-notes__mark">CYH</span>
        <span>
          <b>FIELD NOTES</b>
          <small>PROFESSIONAL RÉSUMÉ · UPDATED AUGUST 2026</small>
        </span>
        <nav>
          <button onClick={() => window.print()}>Print / save PDF</button>
          <button ref={closeRef} onClick={onClose}>Return to gallery <kbd>ESC</kbd></button>
        </nav>
      </header>

      <div className="field-notes__layout">
        <aside className="field-notes__profile">
          <p className="notes-overline">ENGINEER · GAME DEVELOPER · TORONTO</p>
          <h1 id="notes-title">Caellum<br />Yip Hoi-Lee</h1>
          <p className="field-notes__intro">
            Founding engineer and Computer Science student building agentic systems,
            production software, machine-learning infrastructure, and games.
          </p>

          <dl className="profile-stats">
            <div><dt>Education</dt><dd>University of Toronto<br />HBSc, Computer Science</dd></div>
            <div><dt>Graduation</dt><dd>April 2029</dd></div>
            <div><dt>GPA</dt><dd>3.94 / 4.0</dd></div>
            <div><dt>Based</dt><dd>{contactDetails.location}</dd></div>
          </dl>

          <div className="profile-contact">
            <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
            <a href={`tel:${contactDetails.phone.replace(/[^+\d]/g, '')}`}>{contactDetails.phone}</a>
            <a href="https://github.com/CaellumYHL" target="_blank" rel="noreferrer">{contactDetails.github}</a>
            <a
              href="https://www.linkedin.com/in/caellum-yip-hoi-lee-29242b30b"
              target="_blank"
              rel="noreferrer"
            >
              {contactDetails.linkedin}
            </a>
          </div>
        </aside>

        <main className="field-notes__record">
          <section className="notes-section">
            <header><span>01</span><h2>Experience</h2></header>
            {experience?.timeline?.map((entry) => (
              <article className="resume-entry" key={`${entry.organization}-${entry.role}`}>
                <div className="resume-entry__head">
                  <span>
                    <h3>{entry.role}</h3>
                    <p>{entry.organization} · {entry.location}</p>
                  </span>
                  <time>{entry.period}</time>
                </div>
                <ul>{entry.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
              </article>
            ))}
          </section>

          <section className="notes-section">
            <header><span>02</span><h2>Selected projects</h2></header>
            {projects.map((project) => (
              <article className="resume-entry resume-entry--project" key={project.id}>
                <div className="resume-entry__head">
                  <span>
                    <h3>{project.title}</h3>
                    <p>{project.eyebrow}</p>
                  </span>
                  <strong>{project.metric} · {project.metricLabel}</strong>
                </div>
                <p>{project.summary}</p>
                <ul>{project.bullets?.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                <div className="resume-tech">{project.tech?.map((item) => <span key={item}>{item}</span>)}</div>
                {project.links?.map((link) => (
                  <a className="resume-project-link" key={link.href} href={link.href} target="_blank" rel="noreferrer">
                    {link.label} ↗
                  </a>
                ))}
              </article>
            ))}
          </section>

          <section className="notes-section">
            <header><span>03</span><h2>Technical capability</h2></header>
            <div className="resume-skills">
              {skills?.skillGroups?.map((group) => (
                <article key={group.label}>
                  <h3>{group.label}</h3>
                  <p>{group.items.join(' · ')}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="notes-section notes-section--study">
            <header><span>04</span><h2>Ongoing study: wet paper</h2></header>
            <div className="study-note">
              <p>
                My favourite moment in watercolor painting is the least controllable one:
                pigment drifting through water, meeting another colour, and settling into
                the fibres. This site treats that moment as an interface rather than decoration.
              </p>
              <p>
                The interactive canvas in the gallery is a compact browser interpretation of
                the layered ideas in Curtis et al.’s 1997 watercolor model—water flow,
                suspended and deposited pigment, and an uneven paper field. It began as an
                early experiment in conversation with my friend Claudy, and it remains
                deliberately alive and unfinished.
              </p>
              <a
                className="resume-project-link"
                href="https://grail.cs.washington.edu/projects/watercolor/"
                target="_blank"
                rel="noreferrer"
              >
                Read the original SIGGRAPH project ↗
              </a>
            </div>
          </section>

          <footer className="field-notes__end">
            <span>END OF RÉSUMÉ</span>
            <a href={`mailto:${contactDetails.email}`}>Start a conversation →</a>
          </footer>
        </main>
      </div>
    </section>
  )
}
