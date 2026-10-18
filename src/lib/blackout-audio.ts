/**
 * BLACKOUT Audio Engine — bulletproof for deployed sites
 */

class BlackoutAudioEngine {
  private ctx: AudioContext | null = null;
  private droneActive = false;
  private masterGain: GainNode | null = null;
  private introAudio: HTMLAudioElement | null = null;
  private clickPool: HTMLAudioElement[] = [];
  private clickIndex = 0;
  private isMuted = false;
  private started = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.introAudio = new Audio("/audio/blackout-glitch.wav");
      this.introAudio.volume = 0.3;
      this.introAudio.preload = "auto";

      this.clickPool = Array.from({ length: 4 }, () => {
        const a = new Audio("/audio/click.wav");
        a.volume = 0.4;
        a.preload = "auto";
        return a;
      });
    }
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  /** Build and start the suspense drone — MUST be called inside a user gesture */
  private buildDrone() {
    if (this.droneActive) return;
    this.droneActive = true;

    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Master gain — fade in over 4s
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.8, now + 4);
    master.connect(ctx.destination);
    this.masterGain = master;

    // Tone 1: deep eerie base (55Hz)
    const t1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    t1.type = "sine";
    t1.frequency.value = 55;
    g1.gain.value = 0.7;
    t1.connect(g1); g1.connect(master);
    t1.start(now);

    // Tone 2: slightly detuned twin (56.5Hz) — creates natural beating/wavering
    const t2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    t2.type = "sine";
    t2.frequency.value = 56.5;
    g2.gain.value = 0.5;
    t2.connect(g2); g2.connect(master);
    t2.start(now);

    // Slow volume swell (breathes every ~8s)
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.12;
    lfoG.gain.value = 0.25;
    lfo.connect(lfoG); lfoG.connect(master.gain);
    lfo.start(now);

    // Pitch drift — never resolves, keeps tension
    t1.frequency.linearRampToValueAtTime(52, now + 18);
    t1.frequency.linearRampToValueAtTime(57, now + 40);
    t1.frequency.linearRampToValueAtTime(53, now + 65);
    t1.frequency.linearRampToValueAtTime(55, now + 90);

    t2.frequency.linearRampToValueAtTime(54, now + 22);
    t2.frequency.linearRampToValueAtTime(58.5, now + 44);
    t2.frequency.linearRampToValueAtTime(55, now + 68);
    t2.frequency.linearRampToValueAtTime(56.5, now + 92);
  }

  /** Call this DIRECTLY inside a click/touch handler — unlocks audio context */
  public playGlitchIntro() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    // Resume must happen synchronously inside gesture
    ctx.resume();
    if (this.introAudio) {
      this.introAudio.currentTime = 0;
      this.introAudio.play().catch(() => {});
    }
  }

  /** Call this after glitch sequence ends */
  public startAmbientMusic() {
    if (this.isMuted || this.started) return;
    this.started = true;
    const ctx = this.getCtx();
    ctx.resume().then(() => this.buildDrone()).catch(() => {});
  }

  public stopAmbientMusic() {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
    this.droneActive = false;
    this.started = false;
  }

  public playClick() {
    if (this.isMuted || !this.clickPool.length) return;
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
      this.stopAmbientMusic();
      this.introAudio?.pause();
    } else {
      this.started = false;
      this.droneActive = false;
      this.startAmbientMusic();
    }
    return this.isMuted;
  }

  public getIsMuted() { return this.isMuted; }
}

export const blackoutAudio = new BlackoutAudioEngine();
