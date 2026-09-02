interface IntroScreenProps {
  readonly onEnter: () => void
  readonly onOpenNotes: () => void
}

export function IntroScreen({ onEnter, onOpenNotes }: IntroScreenProps) {
  return (
    <section className="intro-screen" aria-labelledby="intro-title">
      <div className="intro-screen__wash" aria-hidden="true" />
      <div className="intro-screen__frame" aria-hidden="true">
        <span className="frame-corner frame-corner--tl" />
        <span className="frame-corner frame-corner--tr" />
        <span className="frame-corner frame-corner--bl" />
        <span className="frame-corner frame-corner--br" />
      </div>

      <header className="intro-screen__masthead">
        <span className="wordmark-sigil">CYH</span>
        <span>
          <b>CAELLUM YIP HOI-LEE</b>
          <small>ENGINEERING · GAMES · MACHINE INTELLIGENCE</small>
        </span>
      </header>

      <div className="intro-screen__content">
        <p className="overline">PERSONAL PORTFOLIO</p>
        <h1 id="intro-title">Welcome to my portfolio.</h1>
        <p className="intro-screen__lede">
          Explore my projects, work experience, and technical skills.
        </p>

        <div className="intro-screen__actions">
          <button className="action-button action-button--primary" onClick={onEnter} autoFocus>
            <span>Explore projects</span>
            <kbd>↵</kbd>
          </button>
          <button className="action-button action-button--quiet" onClick={onOpenNotes}>
            View résumé
          </button>
        </div>

        <div className="intro-screen__controls" aria-label="Controls">
          <span><kbd>WASD</kbd> move</span>
          <span><kbd>CLICK</kbd> guide</span>
          <span><kbd>SPACE</kbd> jump</span>
          <span><kbd>E</kbd> inspect</span>
        </div>
      </div>

      <footer className="intro-screen__footer">
        <span>TORONTO · CANADA</span>
        <span>THREE.JS · REACT · GLSL</span>
        <span>INTERACTIVE 3D PORTFOLIO · 2026</span>
      </footer>
    </section>
  )
}
