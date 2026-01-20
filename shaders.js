/**
 * WebGL Shader Background
 * Matrix-style particle rain with mouse-reactive glow effects
 */

class ShaderBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        
        // Configuration
        this.config = {
            particleCount: 150,
            particleColor: '#00ff88',
            particleGlow: 'rgba(0, 255, 136, 0.3)',
            backgroundColor: '#050a05',
            trailLength: 0.15,
            mouseInfluenceRadius: 200,
            mouseGlowIntensity: 0.4
        };
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        const { particleCount } = this.config;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle(resetY = false) {
        return {
            x: Math.random() * this.canvas.width,
            y: resetY ? -20 : Math.random() * this.canvas.height,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            character: this.getRandomCharacter(),
            wobble: Math.random() * 0.5 - 0.25,
            glowIntensity: Math.random()
        };
    }
    
    getRandomCharacter() {
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        return chars[Math.floor(Math.random() * chars.length)];
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });
        
        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = e.clientX;
            this.targetMouseY = e.clientY;
        });
        
        // Touch support
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.targetMouseX = e.touches[0].clientX;
                this.targetMouseY = e.touches[0].clientY;
            }
        });
    }
    
    updateMousePosition() {
        // Smooth mouse following
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.1;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.1;
    }
    
    drawMouseGlow() {
        const { mouseInfluenceRadius, mouseGlowIntensity } = this.config;
        
        const gradient = this.ctx.createRadialGradient(
            this.mouseX, this.mouseY, 0,
            this.mouseX, this.mouseY, mouseInfluenceRadius
        );
        
        gradient.addColorStop(0, `rgba(0, 255, 136, ${mouseGlowIntensity})`);
        gradient.addColorStop(0.5, `rgba(0, 255, 136, ${mouseGlowIntensity * 0.3})`);
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawGridLines() {
        const gridSize = 50;
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.03)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawParticles() {
        const { particleColor, mouseInfluenceRadius } = this.config;
        
        this.particles.forEach((particle, index) => {
            // Calculate distance from mouse
            const dx = particle.x - this.mouseX;
            const dy = particle.y - this.mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Mouse influence
            let mouseEffect = 0;
            if (distance < mouseInfluenceRadius) {
                mouseEffect = 1 - (distance / mouseInfluenceRadius);
            }
            
            // Update position
            particle.y += particle.speed;
            particle.x += particle.wobble + (mouseEffect * dx * 0.01);
            
            // Reset particle if it goes off screen
            if (particle.y > this.canvas.height + 20) {
                this.particles[index] = this.createParticle(true);
                return;
            }
            
            // Draw particle
            const opacity = particle.opacity + (mouseEffect * 0.3);
            const size = particle.size + (mouseEffect * 2);
            
            // Glow effect
            if (mouseEffect > 0.3 || particle.glowIntensity > 0.7) {
                this.ctx.shadowColor = particleColor;
                this.ctx.shadowBlur = 10 + (mouseEffect * 20);
            } else {
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.font = `${size * 8}px JetBrains Mono, monospace`;
            this.ctx.fillStyle = `rgba(0, 255, 136, ${opacity})`;
            this.ctx.fillText(particle.character, particle.x, particle.y);
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
            
            // Occasionally change character
            if (Math.random() < 0.01) {
                particle.character = this.getRandomCharacter();
            }
        });
    }
    
    drawVignette() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) * 0.7
        );
        
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawScanlines() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        for (let y = 0; y < this.canvas.height; y += 4) {
            this.ctx.fillRect(0, y, this.canvas.width, 2);
        }
    }
    
    animate() {
        const { backgroundColor, trailLength } = this.config;
        
        // Clear with trail effect
        this.ctx.fillStyle = `rgba(5, 10, 5, ${1 - trailLength})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateMousePosition();
        this.drawGridLines();
        this.drawMouseGlow();
        this.drawParticles();
        this.drawVignette();
        this.drawScanlines();
        
        requestAnimationFrame(() => this.animate());
    }
}

// Floating orbs effect
class FloatingOrbs {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.orbs = [];
        this.orbCount = 5;
        
        this.createOrbs();
    }
    
    createOrbs() {
        for (let i = 0; i < this.orbCount; i++) {
            this.orbs.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 150 + 100,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.1 + 0.05
            });
        }
    }
    
    update() {
        this.orbs.forEach(orb => {
            orb.x += orb.speedX;
            orb.y += orb.speedY;
            
            // Bounce off edges
            if (orb.x < -orb.radius) orb.x = this.canvas.width + orb.radius;
            if (orb.x > this.canvas.width + orb.radius) orb.x = -orb.radius;
            if (orb.y < -orb.radius) orb.y = this.canvas.height + orb.radius;
            if (orb.y > this.canvas.height + orb.radius) orb.y = -orb.radius;
        });
    }
    
    draw() {
        this.orbs.forEach(orb => {
            const gradient = this.ctx.createRadialGradient(
                orb.x, orb.y, 0,
                orb.x, orb.y, orb.radius
            );
            
            gradient.addColorStop(0, `rgba(0, 255, 136, ${orb.opacity})`);
            gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(orb.x - orb.radius, orb.y - orb.radius, orb.radius * 2, orb.radius * 2);
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const shaderBg = new ShaderBackground('shader-canvas');
    const orbs = new FloatingOrbs(shaderBg.canvas);
    
    // Integrate orbs into animation
    const originalAnimate = shaderBg.animate.bind(shaderBg);
    shaderBg.animate = function() {
        const { trailLength } = this.config;
        
        this.ctx.fillStyle = `rgba(5, 10, 5, ${1 - trailLength})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateMousePosition();
        orbs.update();
        orbs.draw();
        this.drawGridLines();
        this.drawMouseGlow();
        this.drawParticles();
        this.drawVignette();
        this.drawScanlines();
        
        requestAnimationFrame(() => this.animate());
    };
});
