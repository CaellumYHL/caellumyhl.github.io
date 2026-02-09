import * as THREE from 'three';

// Scene Setup
const scene = new THREE.Scene();

// Set a light pastel background color matching reference
scene.background = new THREE.Color(0xc5d8f0); // Light blue-lavender

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('canvas-container').appendChild(renderer.domElement);

camera.position.z = 12;
camera.position.y = 0;

// Create gradient background plane
function createGradientBackground() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Soft pastel gradient like reference (light blue to pink to peach)
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#a8c8f0');    // Light blue
    gradient.addColorStop(0.3, '#d4b8d8');  // Soft lavender  
    gradient.addColorStop(0.5, '#f0c8d8');  // Light pink
    gradient.addColorStop(0.7, '#f8d8c0');  // Soft peach
    gradient.addColorStop(1, '#f0e8a8');    // Soft yellow

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
}

createGradientBackground();

// Create environment map for soft reflections
function createEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();

    const envGeometry = new THREE.SphereGeometry(50, 64, 64);

    // Create gradient texture for environment
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Soft pastel gradient for reflections
    const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
    gradient.addColorStop(0, '#d0e8ff');
    gradient.addColorStop(0.25, '#ffe0f0');
    gradient.addColorStop(0.5, '#fff0e0');
    gradient.addColorStop(0.75, '#e0ffe0');
    gradient.addColorStop(1, '#d0e8ff');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);

    // Add soft light spots
    const colors = ['#ffffff', '#fff8f0', '#f0f8ff', '#fff0f8'];
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const radius = 80 + Math.random() * 120;
        const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const color = colors[Math.floor(Math.random() * colors.length)];
        radialGradient.addColorStop(0, color);
        radialGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = radialGradient;
        ctx.fillRect(0, 0, 1024, 512);
    }

    const envMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(canvas),
        side: THREE.BackSide
    });

    const envMesh = new THREE.Mesh(envGeometry, envMaterial);
    envScene.add(envMesh);

    // Add bright lights
    const light1 = new THREE.PointLight(0xffffff, 150, 100);
    light1.position.set(10, 10, 10);
    envScene.add(light1);

    const light2 = new THREE.PointLight(0xfff0f0, 100, 100);
    light2.position.set(-10, 5, 10);
    envScene.add(light2);

    const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    pmremGenerator.dispose();

    return envMap;
}

const envMap = createEnvironment();
scene.environment = envMap;

// Bright studio lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

// Key light - bright white
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(5, 8, 5);
scene.add(keyLight);

// Fill light - soft
const fillLight = new THREE.DirectionalLight(0xfff8f0, 1.5);
fillLight.position.set(-5, 3, 5);
scene.add(fillLight);

// Rim light - pink tint
const rimLight = new THREE.DirectionalLight(0xffc0cb, 1.0);
rimLight.position.set(0, -3, -5);
scene.add(rimLight);

// Top light
const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
topLight.position.set(0, 10, 0);
scene.add(topLight);

// Floating Objects Array
let floatingObjects = [];

// Settings
const settings = {
    floatIntensity: 0.5,
    rotationSpeed: 0.3,
    waveMotion: 0.6,
    objectCount: 6,
    materialShine: 0.7
};

// Premium Material Presets - Solid glossy look like reference
function createIridescentSphere() {
    // Yellow-green iridescent like the main sphere in reference
    return new THREE.MeshPhysicalMaterial({
        color: 0xc8e830,  // Yellow-green base
        metalness: 0.0,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        iridescence: 1.0,
        iridescenceIOR: 1.5,
        iridescenceThicknessRange: [200, 500],
        envMapIntensity: 1.2,
        sheen: 0.8,
        sheenColor: new THREE.Color(0xff80b0), // Pink sheen
        sheenRoughness: 0.2
    });
}

function createPinkMetallic() {
    // Coral pink metallic like the ribbons in reference
    return new THREE.MeshPhysicalMaterial({
        color: 0xff6080,  // Coral pink
        metalness: 0.85,
        roughness: 0.15,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.5
    });
}

function createCopperMetallic() {
    // Copper/salmon metallic like the wavy ribbon
    return new THREE.MeshPhysicalMaterial({
        color: 0xd08050,  // Copper/salmon
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 0.4,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.8
    });
}

function createCreamGlossy() {
    // Cream/pale pink for coral - solid opaque
    return new THREE.MeshPhysicalMaterial({
        color: 0xf8e8e0,  // Cream/pale pink
        metalness: 0.0,
        roughness: 0.2,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        envMapIntensity: 0.8
    });
}

// Geometry Generators - matching reference objects
function createSphere() {
    const geometry = new THREE.SphereGeometry(2, 128, 128);
    const material = createIridescentSphere();
    return new THREE.Mesh(geometry, material);
}

function createTorusKnot() {
    // Large pink intertwined loops like reference
    const geometry = new THREE.TorusKnotGeometry(1.5, 0.35, 200, 32, 2, 3);
    const material = createPinkMetallic();
    return new THREE.Mesh(geometry, material);
}

function createRibbon() {
    // Flowing copper ribbon
    const points = [];
    for (let i = 0; i < 80; i++) {
        const t = i / 79;
        const x = Math.sin(t * Math.PI * 2.5) * 2;
        const y = (t - 0.5) * 5;
        const z = Math.cos(t * Math.PI * 3) * 1;
        points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 150, 0.2, 24, false);
    const material = createCopperMetallic();
    return new THREE.Mesh(geometry, material);
}

function createCoral() {
    // Organic coral-like shape - cream colored
    const group = new THREE.Group();
    const material = createCreamGlossy();

    // Main base
    const base = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 64, 64),
        material.clone()
    );
    group.add(base);

    // Organic branches
    const branchPositions = [
        { pos: [0.35, 0.9, 0.15], scale: [0.45, 0.6, 0.45] },
        { pos: [-0.45, 1.0, -0.15], scale: [0.4, 0.55, 0.4] },
        { pos: [0.15, 1.4, 0.25], scale: [0.35, 0.5, 0.35] },
        { pos: [-0.25, 0.7, 0.45], scale: [0.5, 0.6, 0.5] },
        { pos: [0.55, 0.5, -0.25], scale: [0.42, 0.55, 0.42] },
        { pos: [0, 1.7, 0.1], scale: [0.3, 0.45, 0.3] },
        { pos: [-0.55, 1.25, 0.25], scale: [0.32, 0.48, 0.32] }
    ];

    branchPositions.forEach(({ pos, scale }) => {
        const branch = new THREE.Mesh(
            new THREE.SphereGeometry(1, 48, 48),
            material.clone()
        );
        branch.position.set(...pos);
        branch.scale.set(...scale);
        group.add(branch);
    });

    return group;
}

function createBigPinkLoop() {
    // Large flowing pink torus knot like reference
    const geometry = new THREE.TorusKnotGeometry(2, 0.4, 256, 32, 3, 2);
    const material = createPinkMetallic();
    return new THREE.Mesh(geometry, material);
}

function createTorus() {
    const geometry = new THREE.TorusGeometry(1.2, 0.4, 64, 128);
    const material = createPinkMetallic();
    return new THREE.Mesh(geometry, material);
}

// Object Factory
const objectTypes = [
    createSphere,
    createTorusKnot,
    createRibbon,
    createCoral,
    createBigPinkLoop,
    createTorus
];

function createFloatingObject(type = null) {
    const typeIndex = type !== null ? type : Math.floor(Math.random() * objectTypes.length);
    const obj = objectTypes[typeIndex]();

    // Position objects nicely spread
    obj.position.x = (Math.random() - 0.5) * 18;
    obj.position.y = (Math.random() - 0.5) * 10;
    obj.position.z = (Math.random() - 0.5) * 6 - 3;

    // Random scale
    const scale = 0.5 + Math.random() * 0.7;
    obj.scale.set(scale, scale, scale);

    // Random rotation
    obj.rotation.x = Math.random() * Math.PI;
    obj.rotation.y = Math.random() * Math.PI;
    obj.rotation.z = Math.random() * Math.PI;

    // Animation properties
    obj.userData = {
        originalY: obj.position.y,
        originalX: obj.position.x,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.3 + Math.random() * 0.4,
        rotationAxis: new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize(),
        rotationSpeed: (Math.random() - 0.5) * 0.012
    };

    return obj;
}

// Initialize Scene with Objects
function initializeObjects(count) {
    floatingObjects.forEach(obj => scene.remove(obj));
    floatingObjects = [];

    for (let i = 0; i < count; i++) {
        const obj = createFloatingObject();
        scene.add(obj);
        floatingObjects.push(obj);
    }
}

initializeObjects(settings.objectCount);

// Animation Loop
let time = 0;
let lastTime = performance.now();
let frameCount = 0;
let fps = 60;

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    frameCount++;

    if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        document.getElementById('fpsCounter').textContent = fps;
        frameCount = 0;
        lastTime = currentTime;
    }

    time += 0.01;

    // Animate floating objects - gentle motion
    floatingObjects.forEach(obj => {
        const data = obj.userData;

        // Smooth floating
        const floatAmount = settings.floatIntensity * 1.2;
        obj.position.y = data.originalY + Math.sin(time * data.floatSpeed + data.floatOffset) * floatAmount;

        // Gentle wave
        const waveAmount = settings.waveMotion * 0.3;
        obj.position.x = data.originalX + Math.sin(time * 0.2 + data.floatOffset * 2) * waveAmount;

        // Slow smooth rotation
        const rotSpeed = settings.rotationSpeed * 0.06;
        obj.rotation.x += data.rotationAxis.x * data.rotationSpeed * rotSpeed;
        obj.rotation.y += data.rotationAxis.y * data.rotationSpeed * rotSpeed;
        obj.rotation.z += data.rotationAxis.z * data.rotationSpeed * rotSpeed;
    });

    // Subtle camera sway
    camera.position.x = Math.sin(time * 0.06) * 0.2;
    camera.position.y = Math.cos(time * 0.08) * 0.15;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

animate();

// Event Listeners for Controls
document.getElementById('floatIntensity').addEventListener('input', (e) => {
    settings.floatIntensity = e.target.value / 100;
});

document.getElementById('rotationSpeed').addEventListener('input', (e) => {
    settings.rotationSpeed = e.target.value / 100;
});

document.getElementById('waveMotion').addEventListener('input', (e) => {
    settings.waveMotion = e.target.value / 100;
});

document.getElementById('objectCount').addEventListener('input', (e) => {
    const newCount = parseInt(e.target.value);
    if (newCount !== settings.objectCount) {
        settings.objectCount = newCount;
        initializeObjects(newCount);
    }
});

document.getElementById('materialShine').addEventListener('input', (e) => {
    settings.materialShine = e.target.value / 100;
    floatingObjects.forEach(obj => {
        const updateMaterial = (mat) => {
            if (mat && mat.isMeshPhysicalMaterial) {
                mat.clearcoat = settings.materialShine;
                mat.needsUpdate = true;
            }
        };

        if (obj.material) updateMaterial(obj.material);
        if (obj.children) {
            obj.children.forEach(child => {
                if (child.material) updateMaterial(child.material);
            });
        }
    });
});

document.getElementById('addObjectBtn').addEventListener('click', () => {
    const obj = createFloatingObject();
    obj.position.x = (Math.random() - 0.5) * 4;
    obj.position.y = (Math.random() - 0.5) * 2;
    obj.position.z = 3;
    obj.userData.originalX = obj.position.x;
    obj.userData.originalY = obj.position.y;
    scene.add(obj);
    floatingObjects.push(obj);
    settings.objectCount++;
    document.getElementById('objectCount').value = Math.min(settings.objectCount, 15);
});

// Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Mouse interaction
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
});

setInterval(() => {
    floatingObjects.forEach((obj, i) => {
        const influence = 0.15 / (i + 1);
        obj.userData.originalX += (mouseX * 1.2 - obj.userData.originalX) * 0.006 * influence;
    });
}, 50);

console.log('🎨 3D Physics Renderer - Pastel aesthetic loaded!');
