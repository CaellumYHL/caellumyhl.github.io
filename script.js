const content = document.getElementById("content");

// Predefined portfolio sections
const sections = {
  home: `
    <h2>Welcome!</h2>
    <p>This is my portfolio website. Use the buttons above to explore.</p>
  `,
  about: `
    <h2>About Me</h2>
    <p>Hello! I'm a web enthusiast learning to build cool websites.</p>
  `,
  projects: `
    <h2>Projects</h2>
    <ul>
      <li>Head of IT, RHHS Computer Science Club</li>
      <li>Head of Programming/Co-founder, RHHS Game Design Club</li>
      <li>Owner and Software Lead, Bronze Bat Studio</li>
    </ul>
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
    content.innerHTML = sections[section];
  });
});
