const content = document.getElementById("content");

// Predefined portfolio sections (same as before)
const sections = {
  home: `
    <h2>Welcome!</h2>
    <p>This is my portfolio website. Use the navigation above to explore.</p>
  `,
  about: `
    <h2>About Me</h2>
    <p>Hello! I'm a passionate computer science student looking for opportunities 
    to work on projects and learn new languages.</p>
  `,
  projects: `
    <h2>Projects</h2>
    <div class="card">
      <h3>Twin Universe Space Simulator <span class="tag">Lua</span></h3>
      <p>Developed a space exploration game with rocket launches, progression systems, 
      and multiplayer missions. Drove over <strong>2.8 million player visits</strong>.</p>
    </div>
    <div class="card">
      <h3>OPUS eLibrary <span class="tag">Java</span></h3>
      <p>Built a school library management system with logins for students and librarians, 
      supporting borrowing/lending books, managing accounts, and browsing eBooks.</p>
    </div>
    <div class="card">
      <h3>Custom PCB Game System <span class="tag">KiCad, Arduino C++</span></h3>
      <p>Designed and wired a PCB with an RGB LED matrix to play Tic Tac Toe and Connect 4. 
      Programmed interactive game logic, input handling, and simple AI in C++ for the Arduino Uno.</p>
    </div>
  `,
  experience: `
    <h2>Experience</h2>
    <div class="card">
      <h3>Head of IT — RHHS Computer Science Club</h3>
      <p><em>Sep 2024 – Jun 2025</em></p>
      <ul>
        <li>Maintained and troubleshot technical infrastructure (TypeScript, SCSS) for club events.</li>
        <li>Provided technical support to members during meetings, workshops, and competitions.</li>
        <li>Created designs for events using Canva and Figma.</li>
      </ul>
    </div>
    <div class="card">
      <h3>Head of Programming / Co-founder — RHHS Game Design Club</h3>
      <p><em>Sep 2023 – Jun 2025</em></p>
      <ul>
        <li>Developed and delivered Unity lessons in C# (Flappy Bird–style game).</li>
        <li>Taught programming concepts (conditionals, functions, OOP) and Unity physics.</li>
        <li>Integrated modular gameplay systems for learning purposes.</li>
      </ul>
    </div>
    <div class="card">
      <h3>Owner & Software Lead — Bronze Bat Studio</h3>
      <p><em>Aug 2023 – Present</em></p>
      <ul>
        <li>Founded a small indie game studio publishing games on Steam and Roblox.</li>
        <li>Games in Lua and C# generated ~$2,000 revenue and 3M+ plays.</li>
      </ul>
    </div>
  `,
  education: `
    <h2>Education</h2>
    <div class="card">
      <h3>University of Toronto</h3>
      <p><em>Honours Bachelor of Science (2025–2029)</em></p>
      <p>Computer Science Admission Program. Planning to enroll in the Computer Science Specialist Program.</p>
    </div>
    <div class="card">
      <h3>Richmond Hill High School</h3>
      <p><em>Ontario Secondary School Diploma — 97% Average</em></p>
      <ul>
        <li>AP Student</li>
        <li>Received RHHS English Subject Course Award</li>
        <li>Gold Band Certificate of Merit</li>
      </ul>
    </div>
  `,
  contact: `
    <h2>Contact</h2>
    <p>You can reach me at: <a href="mailto:caecaeyhl@gmail.com">caecaeyhl@gmail.com</a></p>
  `
};

// Attach click handlers to buttons
document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.getAttribute("data-section");

    // Add active class
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Smooth fade animation
    content.classList.add("fade-out");
    setTimeout(() => {
      content.innerHTML = sections[section];
      content.classList.remove("fade-out");
      content.classList.add("fade-in");
      setTimeout(() => content.classList.remove("fade-in"), 300);
    }, 300);
  });
});
