const content = document.getElementById("content");

const sections = {
  home: `
    <h2>Home</h2>
    <p>Welcome to my portfolio! </p>
  `,
  about: `
    <h2>About Me</h2>
    <div class="card">
      <p>Hey, I'm <strong>Caellum Yip Hoi-Lee</strong> </p>
      <p>Outside of programming, I enjoy playing the piano, making games,
      and working out. </p>
    </div>
  `,
  skills: `
    <h2>Skills & Frameworks</h2>
    <div class="skills-grid">
      <div class="skill-item">Python</div>
      <div class="skill-item">Java</div>
      <div class="skill-item">C++</div>
      <div class="skill-item">Lua</div>
      <div class="skill-item">HTML/CSS</div>
      <div class="skill-item">JavaScript</div>
      <div class="skill-item">React</div>
      <div class="skill-item">Git</div>
      <div class="skill-item">Figma</div>
      <div class="skill-item">Unity (C#)</div>
      <div class="skill-item">Arduino</div>
      <div class="skill-item">SQL</div>
    </div>
  `,
  projects: `
    <h2>Projects</h2>
    <div class="card">
      <h3>Twin Universe Space Simulator <span class="tag">Lua</span></h3>
      <p>Space exploration game with 2.8M+ player visits and custom physics systems.</p>
    </div>
    <div class="card">
      <h3>OPUS eLibrary <span class="tag">Java</span></h3>
      <p>Java desktop system for managing book loans and student accounts with authentication.</p>
    </div>
    <div class="card">
      <h3>Custom PCB Game System <span class="tag">C++ / KiCad</span></h3>
      <p>Built an LED-matrix game board from scratch, with C++ logic on Arduino.</p>
    </div>
  `,
  experience: `
    <h2>Experience</h2>
    <div class="card">
      <h3>Head of IT — RHHS Computer Science Club</h3>
      <ul>
        <li>Maintained club website and event systems (TypeScript, SCSS).</li>
        <li>Supported members and ran coding workshops.</li>
      </ul>
    </div>
    <div class="card">
      <h3>Head of Programming — RHHS Game Design Club</h3>
      <ul>
        <li>Taught Unity/C# and built demos for new developers.</li>
      </ul>
    </div>
    <div class="card">
      <h3>Owner — Bronze Bat Studio</h3>
      <ul>
        <li>Published games to Steam and Roblox with 3M+ total plays.</li>
      </ul>
    </div>
  `,
  education: `
    <h2>Education</h2>
    <div class="card">
      <h3>University of Toronto</h3>
      <p>Honours BSc in Computer Science (2025–2029)</p>
    </div>
    <div class="card">
      <h3>Richmond Hill High School</h3>
      <p>97% average, AP student, multiple awards.</p>
    </div>
  `,
  contact: `
    <h2>Contact</h2>
    <p>Reach out at 
    <a href="mailto:caecaeyhl@gmail.com">caecaeyhl@gmail.com</a></p>
  `
};

document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.getAttribute("data-section");

    document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    content.classList.add("fade-out");
    setTimeout(() => {
      content.innerHTML = sections[section];
      content.classList.remove("fade-out");
      content.classList.add("fade-in");
      setTimeout(() => content.classList.remove("fade-in"), 300);
    }, 300);
  });
});
