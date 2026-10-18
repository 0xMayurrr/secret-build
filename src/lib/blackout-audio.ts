/**
 * BLACKOUT Audio Engine
 * - Pure suspense sine tone via Web Audio API
 * - Glitch intro SFX
 * - Click sound
 */

class BlackoutAudioEngine {
  private ctx: AudioContext | null = null;
  private droneActive = false;
  private droneGain: GainNode | null = null;

  private introAudio: HTMLAudioElement | null = null;
  private clickPool: HTMLAudioElement[] = [];
  private clickIndex = 0;

  private isMuted = false;
  private isAmbientPlaying = false;
  private pendingAmbient = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initElements();
    }
  }

  private initElements() {
    if (typeof window === "undefined") return;
    try {
      if (!this.introAudio) {
        this.introAudio = new Audio("/audio/blackout-glitch.wav");
        this.introAudio.volume = 0.3;
        this.introAudio.preload = "auto";
      }
      if (this.clickPool.length === 0) {
        this.clickPool = Array.from({ length: 4 }, () => {
          const a = new Audio("/audio/click.wav");
          a.volume = 0.4;
          a.preload = "auto";
          return a;
        });
      }
    } catch {}
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  private startSuspenseDrone() {
    if (this.droneActive) return;
    this.droneActive = true;

    const ctx = this.getCtx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.75, now + 5);
    master.connect(ctx.destination);
    this.droneGain = master;

    // Single eerie sine tone — pure suspense, no chords no drums
    const tone = ctx.createOscillator();
    const toneGain = ctx.createGain();
    tone.type = "sine";
    tone.frequency.value = 55;
    toneGain.gain.value = 0.8;
    tone.connect(toneGain);
    toneGain.connect(master);
    tone.start(now);

    // Slow breathing swell
    const swell = ctx.createOscillator();
    const swellGain = ctx.createGain();
    swell.type = "sine";
    swell.frequency.value = 0.12;
    swellGain.gain.value = 0.3;
    swell.connect(swellGain);
    swellGain.connect(master.gain);
    swell.start(now);

    // Pitch creep — never resolves
    tone.frequency.linearRampToValueAtTime(52, now + 20);
    tone.frequency.linearRampToValueAtTime(58, now + 45);
    tone.frequency.linearRampToValueAtTime(54, now + 70);
    tone.frequency.linearRampToValueAtTime(56, now + 95);

    this.isAmbientPlaying = true;
  }

  private stopDrone() {
    if (!this.ctx || !this.droneGain) return;
    this.droneGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
    this.droneGain = null;
    this.droneActive = false;
    this.isAmbientPlaying = false;
  }

  /** Call this directly inside a user gesture handler */
  public playGlitchIntro() {
    if (this.isMuted) return;
    // Resume Web Audio context inside gesture
    try { this.getCtx().resume(); } catch {}
    // Play glitch wav
    if (this.introAudio) {
      this.introAudio.currentTime = 0;
      this.introAudio.play().catch(() => {});
    }
  }

  /** Call this after glitch — starts suspense drone */
  public startAmbientMusic() {
    if (this.isMuted) return;
    this.pendingAmbient = true;
    try {
      const ctx = this.getCtx();
      ctx.resume().then(() => {
        if (this.pendingAmbient && !this.isAmbientPlaying) {
          this.startSuspenseDrone();
        }
      }).catch(() => {});
    } catch {}
  }

  public stopAmbientMusic() {
    this.pendingAmbient = false;
    this.stopDrone();
  }

  public playClick() {
    if (this.isMuted || this.clickPool.length === 0) return;
    try {
      const a = this.clickPool[this.clickIndex % this.clickPool.length];
      this.clickIndex = (this.clickIndex + 1) % this.clickPool.length;
      if (!a) return;
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopDrone();
      this.introAudio?.pause();
    } else {
      this.startAmbientMusic();
    }
    return this.isMuted;
  }

  public getIsMuted() { return this.isMuted; }
}

export const blackoutAudio = new BlackoutAudioEngine();
