import * as THREE from 'three';

// ==================== WARP TRANSITION ====================

const warpCanvas = document.getElementById('warpCanvas');
const warpOverlay = document.getElementById('warpOverlay');
const starCanvas = document.getElementById('starCanvas');

// Create warp scene
const warpScene = new THREE.Scene();
const warpCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const warpRenderer = new THREE.WebGLRenderer({ canvas: warpCanvas, antialias: true, alpha: true });

warpRenderer.setSize(window.innerWidth, window.innerHeight);
warpRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

warpCamera.position.z = 500;

// Create stars for warp effect
const starCount = 2000;
const starsGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
const starVelocities = [];

for (let i = 0; i < starCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 50 + Math.random() * 400;

    starPositions[i * 3] = Math.cos(angle) * radius;
    starPositions[i * 3 + 1] = Math.sin(angle) * radius;
    starPositions[i * 3 + 2] = Math.random() * 2000 - 1000;

    starVelocities.push(2 + Math.random() * 8);
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 3,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
});

const stars = new THREE.Points(starsGeometry, starMaterial);
warpScene.add(stars);

// Add colored accent stars
const accentStarCount = 200;
const accentGeometry = new THREE.BufferGeometry();
const accentPositions = new Float32Array(accentStarCount * 3);
const accentColors = new Float32Array(accentStarCount * 3);

for (let i = 0; i < accentStarCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 50 + Math.random() * 300;

    accentPositions[i * 3] = Math.cos(angle) * radius;
    accentPositions[i * 3 + 1] = Math.sin(angle) * radius;
    accentPositions[i * 3 + 2] = Math.random() * 2000 - 1000;

    const colors = [
        [0.78, 1, 0],    // Accent lime
        [1, 0.5, 0.7],   // Pink
        [0.7, 0.85, 1],  // Light blue
        [1, 0.9, 0.6]    // Peach
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    accentColors[i * 3] = color[0];
    accentColors[i * 3 + 1] = color[1];
    accentColors[i * 3 + 2] = color[2];
}

accentGeometry.setAttribute('position', new THREE.BufferAttribute(accentPositions, 3));
accentGeometry.setAttribute('color', new THREE.BufferAttribute(accentColors, 3));

const accentMaterial = new THREE.PointsMaterial({
    size: 5,
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    sizeAttenuation: true
});

const accentStars = new THREE.Points(accentGeometry, accentMaterial);
warpScene.add(accentStars);

// Animation state
let warpSpeed = 0;
let targetSpeed = 50;
let animationStartTime = performance.now();
const warpDuration = 2500;

function animateWarp() {
    const elapsed = performance.now() - animationStartTime;
    const progress = Math.min(elapsed / warpDuration, 1);

    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    if (progress < 0.6) {
        warpSpeed = easeInOutCubic(progress / 0.6) * targetSpeed;
    } else {
        warpSpeed = targetSpeed * (1 - easeInOutCubic((progress - 0.6) / 0.4));
    }

    const positions = starsGeometry.attributes.position.array;
    for (let i = 0; i < starCount; i++) {
        positions[i * 3 + 2] += warpSpeed * starVelocities[i] * 0.1;
        if (positions[i * 3 + 2] > 500) {
            positions[i * 3 + 2] = -1500;
        }
    }
    starsGeometry.attributes.position.needsUpdate = true;

    const accentPos = accentGeometry.attributes.position.array;
    for (let i = 0; i < accentStarCount; i++) {
        accentPos[i * 3 + 2] += warpSpeed * 0.8;
        if (accentPos[i * 3 + 2] > 500) {
            accentPos[i * 3 + 2] = -1500;
        }
    }
    accentGeometry.attributes.position.needsUpdate = true;

    starMaterial.size = 3 + warpSpeed * 0.1;
    accentMaterial.size = 5 + warpSpeed * 0.15;

    if (warpSpeed > 20) {
        warpCamera.position.x = (Math.random() - 0.5) * warpSpeed * 0.02;
        warpCamera.position.y = (Math.random() - 0.5) * warpSpeed * 0.02;
    }

    warpRenderer.render(warpScene, warpCamera);

    if (progress < 1) {
        requestAnimationFrame(animateWarp);
    } else {
        warpOverlay.classList.add('fade-out');
        document.getElementById('projectsPage').classList.add('visible');

        setTimeout(() => {
            initPersistentStars();
            animateProjectCards();
        }, 300);
    }
}

animateWarp();

// ==================== PERSISTENT STAR BACKGROUND ====================

const bgScene = new THREE.Scene();
const bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
let bgRenderer;

function initPersistentStars() {
    bgRenderer = new THREE.WebGLRenderer({ canvas: starCanvas, antialias: true, alpha: true });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    bgRenderer.setClearColor(0x0a0a0a, 1);

    bgCamera.position.z = 300;

    // Static background stars
    const bgStarCount = 800;
    const bgStarsGeometry = new THREE.BufferGeometry();
    const bgStarPositions = new Float32Array(bgStarCount * 3);
    const bgStarSizes = new Float32Array(bgStarCount);

    for (let i = 0; i < bgStarCount; i++) {
        bgStarPositions[i * 3] = (Math.random() - 0.5) * 1000;
        bgStarPositions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
        bgStarPositions[i * 3 + 2] = (Math.random() - 0.5) * 500 - 200;
        bgStarSizes[i] = Math.random() * 2 + 0.5;
    }

    bgStarsGeometry.setAttribute('position', new THREE.BufferAttribute(bgStarPositions, 3));

    const bgStarMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    const bgStars = new THREE.Points(bgStarsGeometry, bgStarMaterial);
    bgScene.add(bgStars);

    // Accent colored stars (fewer, subtle)
    const accentCount = 100;
    const accentBgGeometry = new THREE.BufferGeometry();
    const accentBgPositions = new Float32Array(accentCount * 3);
    const accentBgColors = new Float32Array(accentCount * 3);

    for (let i = 0; i < accentCount; i++) {
        accentBgPositions[i * 3] = (Math.random() - 0.5) * 800;
        accentBgPositions[i * 3 + 1] = (Math.random() - 0.5) * 800;
        accentBgPositions[i * 3 + 2] = (Math.random() - 0.5) * 400 - 100;

        const colors = [
            [0.78, 1, 0],    // Lime accent
            [0.5, 0.7, 1],   // Light blue
            [1, 0.6, 0.8],   // Pink
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        accentBgColors[i * 3] = color[0];
        accentBgColors[i * 3 + 1] = color[1];
        accentBgColors[i * 3 + 2] = color[2];
    }

    accentBgGeometry.setAttribute('position', new THREE.BufferAttribute(accentBgPositions, 3));
    accentBgGeometry.setAttribute('color', new THREE.BufferAttribute(accentBgColors, 3));

    const accentBgMaterial = new THREE.PointsMaterial({
        size: 2,
        transparent: true,
        opacity: 0.5,
        vertexColors: true,
        sizeAttenuation: true
    });

    const accentBgStars = new THREE.Points(accentBgGeometry, accentBgMaterial);
    bgScene.add(accentBgStars);

    // Start background animation
    animateBackground(bgStars, accentBgStars);
}

function animateBackground(stars, accentStars) {
    let time = 0;

    function render() {
        requestAnimationFrame(render);
        time += 0.001;

        // Gentle rotation of star field
        stars.rotation.y = time * 0.05;
        stars.rotation.x = Math.sin(time * 0.3) * 0.02;

        accentStars.rotation.y = time * 0.08;
        accentStars.rotation.x = Math.sin(time * 0.5) * 0.03;

        // Subtle camera movement
        bgCamera.position.x = Math.sin(time * 2) * 5;
        bgCamera.position.y = Math.cos(time * 3) * 3;

        bgRenderer.render(bgScene, bgCamera);
    }

    render();
}

// ==================== PROJECT CARDS ANIMATION ====================

function animateProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, index * 100);
    });
}

// ==================== FILTER FUNCTIONALITY ====================

const filterTabs = document.querySelectorAll('.filter-tab');
const projectCards = document.querySelectorAll('.project-card');

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;

        projectCards.forEach(card => {
            const category = card.dataset.category;

            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                setTimeout(() => card.classList.add('visible'), 50);
            } else {
                card.classList.remove('visible');
                setTimeout(() => card.style.display = 'none', 500);
            }
        });
    });
});

// ==================== WINDOW RESIZE ====================

window.addEventListener('resize', () => {
    warpCamera.aspect = window.innerWidth / window.innerHeight;
    warpCamera.updateProjectionMatrix();
    warpRenderer.setSize(window.innerWidth, window.innerHeight);

    if (bgRenderer) {
        bgCamera.aspect = window.innerWidth / window.innerHeight;
        bgCamera.updateProjectionMatrix();
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
    }
});

console.log('🚀 Projects page loaded with persistent dark theme!');
