/**
 * Procedural Web Audio API Sound Synthesizer
 * Provides ticking sounds for wheel spins and celebratory sounds for winner selection.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.enabled = localStorage.getItem('decisionWheel_sound') !== 'false';
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('decisionWheel_sound', this.enabled);
    return this.enabled;
  }

  /**
   * Short mechanical ticker click sound effect
   * @param {number} speedRatio - 0.1 to 1.5 ratio based on wheel spin speed
   */
  playTick(speedRatio = 1) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;

      // Pitch variation based on velocity
      const baseFreq = 600 + Math.min(speedRatio * 400, 800);

      // Main click oscillator
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      // Handle browser audio policy edge cases silently
    }
  }

  /**
   * Fanfare sound effect played when the winner lands
   * Simulated beer glass clink + major triad chime
   */
  playWinFanfare() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;

      // 1. High-pitched glass clink (metallic bell resonance)
      const glassOsc = this.audioCtx.createOscillator();
      const glassGain = this.audioCtx.createGain();

      glassOsc.type = 'sine';
      glassOsc.frequency.setValueAtTime(2400, now);
      glassOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.3);

      glassGain.gain.setValueAtTime(0.4, now);
      glassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      glassOsc.connect(glassGain);
      glassGain.connect(this.audioCtx.destination);

      glassOsc.start(now);
      glassOsc.stop(now + 0.4);

      // 2. Celebratory arpeggio (C5 - E5 - G5 - C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const noteTime = now + (idx * 0.08);

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.45);
      });

    } catch (e) {
      // Audio fallback handling
    }
  }
}

// Global singleton instance
window.soundEngine = new SoundEngine();
