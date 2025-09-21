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
      <li>Project 1 – A simple demo site</li>
      <li>Project 2 – A fun JavaScript experiment</li>
      <li>Project 3 – Coming soon!</li>
    </ul>
  `,
  contact: `
    <h2>Contact</h2>
    <p>You can reach me at: <a href="mailto:myemail@example.com">myemail@example.com</a></p>
  `
};

// Attach click handlers to buttons
document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.getAttribute("data-section");
    content.innerHTML = sections[section];
  });
});
