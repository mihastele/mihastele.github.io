/**
 * Canvas Decision Wheel Engine
 * Renders weighted wheel slices, pointer collision ticking, dynamic colors, and physics easing.
 */

class DecisionWheel {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.members = [];
    this.currentAngle = 0; // Radians
    this.isSpinning = false;
    this.spinStartTime = 0;
    this.spinDuration = 4800; // ms
    this.startAngle = 0;
    this.targetAngle = 0;
    this.lastTickSliceIndex = -1;

    this.onSpinComplete = options.onSpinComplete || null;

    // Palette generator for segments
    this.colors = [
      { fill: '#f59e0b', text: '#000000' }, // Amber Gold
      { fill: '#1e293b', text: '#f8fafc' }, // Slate Obsidian
      { fill: '#d97706', text: '#ffffff' }, // Deep Amber
      { fill: '#0f172a', text: '#fbbf24' }, // Midnight
      { fill: '#b45309', text: '#ffffff' }, // Warm Bronze
      { fill: '#334155', text: '#fef3c7' }, // Steel Slate
      { fill: '#f59e0b', text: '#000000' }, // Re-cycle palette
      { fill: '#475569', text: '#ffffff' }
    ];

    this.initHighDPI();
    
    // Resize Observer for flawless responsive scaling
    if (window.ResizeObserver && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.initHighDPI();
        this.draw();
      });
      this.resizeObserver.observe(this.canvas.parentElement);
    } else {
      window.addEventListener('resize', () => {
        this.initHighDPI();
        this.draw();
      });
    }
  }

  initHighDPI() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    let displaySize = rect.width || this.canvas.clientWidth || 360;
    if (rect.height && rect.height > 50 && rect.height < displaySize) {
      displaySize = rect.height;
    }
    displaySize = Math.max(260, Math.min(displaySize, 560));

    this.canvas.width = Math.round(displaySize * dpr);
    this.canvas.height = Math.round(displaySize * dpr);

    if (this.ctx.resetTransform) {
      this.ctx.resetTransform();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.scale(dpr, dpr);

    this.width = displaySize;
    this.height = displaySize;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = Math.max(80, this.width / 2 - 14);
  }

  setMembers(members) {
    this.members = (members || []).filter(m => m && m.active);
    this.draw();
  }

  getTotalWeight() {
    return this.members.reduce((acc, m) => acc + (Number(m.weight) || 1), 0);
  }

  /**
   * Main render method for the canvas wheel
   */
  draw() {
    if (!this.ctx || this.width === 0) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (!this.members || this.members.length === 0) {
      this.drawEmptyState();
      return;
    }

    const totalWeight = this.getTotalWeight();
    let accumulatedAngle = 0;

    // Draw Outer Shadow & Rim
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius + 6, 0, Math.PI * 2);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    this.ctx.shadowBlur = 20;
    this.ctx.fill();
    this.ctx.restore();

    // Outer Golden Ring
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius + 3, 0, Math.PI * 2);
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 6;
    this.ctx.stroke();
    this.ctx.restore();

    // Draw Weighted Slices
    for (let i = 0; i < this.members.length; i++) {
      const member = this.members[i];
      const weightNum = Number(member.weight) || 1;
      const sliceAngle = (weightNum / totalWeight) * (Math.PI * 2);
      
      const startAngle = accumulatedAngle + this.currentAngle;
      const endAngle = startAngle + sliceAngle;

      const colorScheme = this.colors[i % this.colors.length];
      const fillColor = member.color || colorScheme.fill;

      // Draw Slice Sector
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
      this.ctx.closePath();

      // Gradient Fill for slice depth
      try {
        const grad = this.ctx.createRadialGradient(
          this.centerX, this.centerY, 20,
          this.centerX, this.centerY, this.radius
        );
        grad.addColorStop(0, this.lightenColor(fillColor, 18));
        grad.addColorStop(1, fillColor);
        this.ctx.fillStyle = grad;
      } catch (e) {
        this.ctx.fillStyle = fillColor;
      }

      this.ctx.fill();

      // Slice Divider Line
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Slice Label Text & Icon
      const contrastTextColor = this.getContrastColor(fillColor);
      this.drawSliceLabel(member, startAngle, sliceAngle, contrastTextColor);

      this.ctx.restore();

      accumulatedAngle += sliceAngle;
    }

    // Inner Decorative Cap
    this.drawCenterCap();
  }

  drawEmptyState() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fill();
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();

    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '600 18px Outfit, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Dodajte člane za vrtenje!', this.centerX, this.centerY);
    this.ctx.restore();
  }

  drawSliceLabel(member, startAngle, sliceAngle, textColor) {
    const midAngle = startAngle + sliceAngle / 2;
    const textRadius = this.radius * 0.65;

    const x = this.centerX + Math.cos(midAngle) * textRadius;
    const y = this.centerY + Math.sin(midAngle) * textRadius;

    this.ctx.save();
    this.ctx.translate(x, y);
    // Rotate text outwards cleanly along slice line
    let rotation = midAngle;
    if (midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2) {
      rotation += Math.PI;
    }
    this.ctx.rotate(rotation);

    this.ctx.fillStyle = textColor;
    const fontSize = Math.max(11, Math.min(17, Math.round(this.radius * 0.07)));
    this.ctx.font = `700 ${fontSize}px Outfit, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Truncate long names cleanly based on wheel radius
    let name = member.name;
    const maxChars = Math.max(7, Math.min(14, Math.round(this.radius * 0.05) + 3));
    if (name.length > maxChars) {
      name = name.substring(0, maxChars - 1) + '…';
    }

    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    this.ctx.shadowBlur = 4;
    this.ctx.fillText(name, 0, 0);

    // Show weight percentage below name if sector is wide enough
    if (sliceAngle > 0.26) {
      const percentage = Math.round((member.weight / this.getTotalWeight()) * 100);
      const subFontSize = Math.max(9, Math.min(12, Math.round(this.radius * 0.052)));
      this.ctx.font = `600 ${subFontSize}px Plus Jakarta Sans, sans-serif`;
      this.ctx.fillStyle = textColor === '#000000' ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.75)';
      this.ctx.fillText(`(${percentage}%)`, 0, fontSize + 3);
    }

    this.ctx.restore();
  }

  drawCenterCap() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 38, 0, Math.PI * 2);
    
    const capGrad = this.ctx.createRadialGradient(
      this.centerX - 10, this.centerY - 10, 5,
      this.centerX, this.centerY, 40
    );
    capGrad.addColorStop(0, '#fef3c7');
    capGrad.addColorStop(0.5, '#f59e0b');
    capGrad.addColorStop(1, '#92400e');

    this.ctx.fillStyle = capGrad;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    this.ctx.shadowBlur = 12;
    this.ctx.fill();

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Center Beer Icon
    this.ctx.font = '22px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🍺', this.centerX, this.centerY + 1);

    this.ctx.restore();
  }

  /**
   * Returns index of member currently located under the top pointer peg (at -90 deg / 1.5 * PI)
   */
  getSliceUnderPointer() {
    if (this.members.length === 0) return -1;
    const totalWeight = this.getTotalWeight();

    // Top pointer is at 1.5 * PI (270 degrees)
    const pointerAngle = 1.5 * Math.PI;

    // Normalize current angle to [0, 2*PI)
    const normalizedWheelAngle = ((this.currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Calculate relative pointer angle in wheel coordinate system
    let localPointerAngle = (pointerAngle - normalizedWheelAngle + 2 * Math.PI) % (2 * Math.PI);

    let accumulated = 0;
    for (let i = 0; i < this.members.length; i++) {
      const sliceAngle = (this.members[i].weight / totalWeight) * (Math.PI * 2);
      if (localPointerAngle >= accumulated && localPointerAngle < accumulated + sliceAngle) {
        return i;
      }
      accumulated += sliceAngle;
    }

    return 0;
  }

  /**
   * Trigger wheel spin animation with weighted probability
   */
  spin() {
    if (this.isSpinning || this.members.length === 0) return;

    this.isSpinning = true;
    const totalWeight = this.getTotalWeight();

    // 1. Pick winner based on weighted probability
    let randomVal = Math.random() * totalWeight;
    let selectedIndex = 0;
    let weightSum = 0;

    for (let i = 0; i < this.members.length; i++) {
      weightSum += Number(this.members[i].weight);
      if (randomVal <= weightSum) {
        selectedIndex = i;
        break;
      }
    }

    const winnerMember = this.members[selectedIndex];

    // 2. Calculate slice start & slice end in normalized wheel relative angle
    let startAcc = 0;
    for (let i = 0; i < selectedIndex; i++) {
      startAcc += (this.members[i].weight / totalWeight) * (Math.PI * 2);
    }
    const winnerSliceAngle = (winnerMember.weight / totalWeight) * (Math.PI * 2);

    // Randomize stopping point within slice (15% to 85% into the slice to avoid edge deadlocks)
    const offsetInSlice = (0.15 + Math.random() * 0.7) * winnerSliceAngle;
    const targetLocalAngle = startAcc + offsetInSlice;

    // 3. Compute final wheel rotation needed to bring `targetLocalAngle` under pointer (1.5 * PI)
    const pointerAngle = 1.5 * Math.PI;
    const currentNormalized = ((this.currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Additional full rotations for drama (6 to 9 full turns)
    const fullTurns = (6 + Math.floor(Math.random() * 3)) * (Math.PI * 2);

    let deltaAngle = (pointerAngle - targetLocalAngle) - currentNormalized;
    while (deltaAngle < 0) {
      deltaAngle += Math.PI * 2;
    }

    this.startAngle = this.currentAngle;
    this.targetAngle = this.currentAngle + fullTurns + deltaAngle;
    this.spinStartTime = performance.now();
    this.lastTickSliceIndex = this.getSliceUnderPointer();

    this.animateSpin(winnerMember);
  }

  animateSpin(winnerMember) {
    const now = performance.now();
    const elapsed = now - this.spinStartTime;
    const progress = Math.min(elapsed / this.spinDuration, 1);

    // Ease-out cubic curve for realistic friction deceleration
    const easeOutProgress = 1 - Math.pow(1 - progress, 3.5);

    this.currentAngle = this.startAngle + (this.targetAngle - this.startAngle) * easeOutProgress;
    this.draw();

    // Check pointer tick collision
    const currentSlice = this.getSliceUnderPointer();
    if (currentSlice !== this.lastTickSliceIndex) {
      this.lastTickSliceIndex = currentSlice;

      // Animate peg bounce element in DOM
      const pointerEl = document.getElementById('wheelPointer');
      if (pointerEl) {
        pointerEl.classList.remove('tick');
        void pointerEl.offsetWidth; // Force reflow
        pointerEl.classList.add('tick');
      }

      // Play tick audio
      const speedRatio = 1 - progress;
      if (window.soundEngine) {
        window.soundEngine.playTick(speedRatio);
      }
    }

    if (progress < 1) {
      requestAnimationFrame(() => this.animateSpin(winnerMember));
    } else {
      this.isSpinning = false;
      
      // Winner celebratory fanfare sound
      if (window.soundEngine) {
        window.soundEngine.playWinFanfare();
      }

      // Confetti burst
      if (window.confettiSystem) {
        window.confettiSystem.burst();
      }

      if (this.onSpinComplete) {
        this.onSpinComplete(winnerMember);
      }
    }
  }

  getContrastColor(hexColor) {
    if (!hexColor || typeof hexColor !== 'string') return '#ffffff';
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 145) ? '#000000' : '#ffffff';
  }

  lightenColor(hex, percent) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
      return '#f59e0b';
    }
    try {
      let cleanHex = hex.replace('#', '');
      if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
      }
      const num = parseInt(cleanHex, 16);
      if (isNaN(num)) return '#f59e0b';
      const amt = Math.round(2.55 * percent);
      const R = Math.min(255, Math.max(0, (num >> 16) + amt));
      const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
      const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
      return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
    } catch (e) {
      return hex;
    }
  }
}
