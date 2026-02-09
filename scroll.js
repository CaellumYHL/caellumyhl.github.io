// Custom cursor
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    // Snappy cursor follow
    cursorX += (mouseX - cursorX) * 0.6;
    cursorY += (mouseY - cursorY) * 0.6;

    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;

    if (cursor && cursorFollower) {
        cursor.style.left = cursorX - 4 + 'px';
        cursor.style.top = cursorY - 4 + 'px';

        cursorFollower.style.left = followerX - 18 + 'px';
        cursorFollower.style.top = followerY - 18 + 'px';
    }

    requestAnimationFrame(animateCursor);
}

animateCursor();

// Cursor hover effect
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorFollower?.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursorFollower?.classList.remove('hover');
    });
});

// Settings toggle
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');

settingsBtn?.addEventListener('click', () => {
    settingsPanel?.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.settings-panel') && !e.target.closest('.settings-btn')) {
        settingsPanel?.classList.remove('active');
    }
});

// Smooth scroll nav
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = document.getElementById(item.dataset.section);
        section?.scrollIntoView({ behavior: 'smooth' });
    });
});

// Active nav on scroll
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-item');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        if (scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === current) {
            item.classList.add('active');
        }
    });
});

// Horizontal scroll with drag
const worksScroll = document.querySelector('.works-horizontal');
let isDown = false;
let startX;
let scrollLeft;

if (worksScroll) {
    worksScroll.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - worksScroll.offsetLeft;
        scrollLeft = worksScroll.scrollLeft;
    });

    worksScroll.addEventListener('mouseleave', () => {
        isDown = false;
    });

    worksScroll.addEventListener('mouseup', () => {
        isDown = false;
    });

    worksScroll.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - worksScroll.offsetLeft;
        const walk = (x - startX) * 2;
        worksScroll.scrollLeft = scrollLeft - walk;
    });

    // Navigation button functionality
    const prevBtn = document.getElementById('worksPrev');
    const nextBtn = document.getElementById('worksNext');
    const scrollAmount = 308; // card width (280) + gap (28)

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            worksScroll.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            worksScroll.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
}

// Parallax on title words
const titleWords = document.querySelectorAll('.title-word');
let scrollY = window.scrollY;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;

    titleWords.forEach(word => {
        const speed = parseFloat(word.dataset.speed) || 1;
        word.style.transform = `translateY(${scrollY * speed * 0.1}px)`;
    });
});

// Reveal animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

document.querySelectorAll('.work-item, .exp-item, .detail-block').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// Add reveal styles
const revealStyle = document.createElement('style');
revealStyle.textContent = `
    .reveal {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .reveal.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    .exp-item.reveal {
        transition-delay: calc(var(--index, 0) * 0.1s);
    }
`;
document.head.appendChild(revealStyle);

// Set stagger delay
document.querySelectorAll('.exp-item').forEach((item, i) => {
    item.style.setProperty('--index', i);
});

document.querySelectorAll('.work-item').forEach((item, i) => {
    item.style.setProperty('--index', i);
});

console.log('✨ Unshift-style interactions loaded');
