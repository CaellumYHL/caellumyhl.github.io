// Scroll to section
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Skills Data
const skills = [
  { name: "React", level: "Expert", icon: "⚛️", levelValue: 95 },
  { name: "TypeScript", level: "Advanced", icon: "📘", levelValue: 90 },
  { name: "Node.js", level: "Advanced", icon: "🟢", levelValue: 85 },
  { name: "Python", level: "Expert", icon: "🐍", levelValue: 95 },
  { name: "Docker", level: "Intermediate", icon: "🐳", levelValue: 75 },
  { name: "AWS", level: "Advanced", icon: "☁️", levelValue: 80 },
  { name: "GraphQL", level: "Advanced", icon: "◈", levelValue: 85 },
  { name: "MongoDB", level: "Intermediate", icon: "🍃", levelValue: 70 },
];

// Render Skills
const skillsContainer = document.getElementById('skills-chart');
skills.forEach(skill => {
  const skillEl = document.createElement('div');
  skillEl.className = 'skill-bar';
  skillEl.innerHTML = `
    <div style="flex:1;">${skill.icon} ${skill.name}</div>
    <div style="flex:3; background:#eee; border:1px solid #000; border-radius:9999px;">
      <div style="width:${skill.levelValue}%; background:#A4D65E; text-align:right; padding-right:0.5rem;">${skill.level}</div>
    </div>
  `;
  skillsContainer.appendChild(skillEl);
});

// Projects Data
const projects = [
  {
    title: "AI-Powered Chat Platform",
    description: "Built a real-time messaging platform with AI-powered features using WebSockets and GPT-4",
    tech: ["React", "Node.js", "Socket.io", "OpenAI"],
    github: "https://github.com/yourusername/project1",
    demo: "https://demo.example.com",
    number: "01"
  },
  // ... Add remaining projects here
];

// Render Projects
const projectsContainer = document.getElementById('projects-grid');
projects.forEach(p => {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.innerHTML = `
    <div class="project-number">${p.number}</div>
    <h3>${p.title}</h3>
    <p>${p.description}</p>
    <div class="tech">${p.tech.join(', ')}</div>
    <div class="links">
      ${p.github ? `<a href="${p.github}" target="_blank">Code</a>` : ''}
      ${p.demo ? `<a href="${p.demo}" target="_blank">Demo</a>` : ''}
    </div>
  `;
  projectsContainer.appendChild(card);
});

// Experiences Data
const experiences = [
  {
    role: "Senior Full Stack Developer",
    company: "Tech Innovations Inc.",
    period: "2022 - Present",
    code: "SE-01",
    description: "Led development of microservices architecture serving 100k+ users.",
    achievements: ["Reduced API response time by 60%", "Implemented automated testing", "Led team of 5 developers"]
  },
  // ... Add remaining experiences
];

// Render Experiences
const expContainer = document.getElementById('experience-grid');
experiences.forEach(exp => {
  const card = document.createElement('div');
  card.className = 'experience-card';
  card.innerHTML = `
    <h3>${exp.role}</h3>
    <p>${exp.company} (${exp.period})</p>
    <p>${exp.description}</p>
    <ul>
      ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
    </ul>
  `;
  expContainer.appendChild(card);
});
