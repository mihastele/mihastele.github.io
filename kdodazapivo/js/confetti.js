/**
 * Confetti Particle System for Celebrations
 */

class ConfettiSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    this.displayWidth = rect.width || 300;
    this.displayHeight = rect.height || 300;

    this.canvas.width = Math.round(this.displayWidth * dpr);
    this.canvas.height = Math.round(this.displayHeight * dpr);

    if (this.ctx.resetTransform) {
      this.ctx.resetTransform();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.scale(dpr, dpr);
  }

  burst(particleCount = 120) {
    this.resizeCanvas();
    this.particles = [];
    const colors = ['#f59e0b', '#fbbf24', '#fef3c7', '#ef4444', '#10b981', '#3b82f6', '#ec4899'];
    const centerX = this.displayWidth / 2;
    const centerY = this.displayHeight / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;

      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4, // Initial upward pop
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        gravity: 0.25,
        friction: 0.98,
        shape: Math.random() > 0.3 ? 'rect' : 'circle'
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    if (!this.animating) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let activeCount = 0;

    for (let p of this.particles) {
      if (p.opacity <= 0) continue;

      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;

      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;
      p.opacity -= 0.008;

      if (p.opacity > 0) {
        activeCount++;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }
    }

    if (activeCount > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Global instance
window.confettiSystem = new ConfettiSystem('confettiCanvas');
