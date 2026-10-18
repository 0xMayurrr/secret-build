/**
 * BLACKOUT Audio Engine
 * - Cinematic suspense pad via Web Audio API
 * - Glitch intro SFX only (no click sounds)
 */

class BlackoutAudioEngine {
  private ctx: AudioContext | null = null;
  private droneActive = false;
  private droneGain: GainNode | null = null;

  private introAudio: HTMLAudioElement | null = null;

  private isMuted = false;
  private isAmbientPlaying = false;
  private listenersAttached = false;
  private unlocked = false;
  private pendingAmbient = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initElements();
      this.attachListeners();
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
    } catch {}
  }

  private getCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Pure suspense tone — single eerie sine wave with slow swell
   * No chords, no drums, no noise. Just tension.
   */
  private startSuspenseDrone() {
    const ctx = this.getCtx();
    if (!ctx || this.droneActive) return;
    this.droneActive = true;

    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.7, now + 5);
    master.connect(ctx.destination);
    this.droneGain = master;

    // Single low eerie tone (55Hz) — pure suspense
    const tone = ctx.createOscillator();
    const toneGain = ctx.createGain();
    tone.type = "sine";
    tone.frequency.value = 55;
    toneGain.gain.value = 0.8;
    tone.connect(toneGain);
    toneGain.connect(master);
    tone.start(now);

    // Very slow swell — breathes in and out every 8s
    const swell = ctx.createOscillator();
    const swellGain = ctx.createGain();
    swell.type = "sine";
    swell.frequency.value = 0.12;
    swellGain.gain.value = 0.3;
    swell.connect(swellGain);
    swellGain.connect(master.gain);
    swell.start(now);

    // Barely noticeable pitch creep — never resolves, keeps tension alive
    tone.frequency.linearRampToValueAtTime(52, now + 20);
    tone.frequency.linearRampToValueAtTime(58, now + 45);
    tone.frequency.linearRampToValueAtTime(54, now + 70);
    tone.frequency.linearRampToValueAtTime(56, now + 95);

    this.isAmbientPlaying = true;
  }

  private stopDrone() {
    const ctx = this.getCtx();
    if (!ctx || !this.droneGain) return;
    this.droneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    this.droneGain = null;
    this.droneActive = false;
    this.isAmbientPlaying = false;
  }

  private attachListeners() {
    if (typeof window === "undefined" || this.listenersAttached) return;
    this.listenersAttached = true;

    const onGesture = () => {
      if (!this.unlocked) {
        this.unlocked = true;
        this.ctx?.resume();
        if (this.pendingAmbient && !this.isMuted && !this.isAmbientPlaying) {
          this._playAmbient();
        }
      }
    };

    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture, { passive: true });
    window.addEventListener("touchstart", onGesture, { passive: true });
  }

  private _playAmbient() {
    if (this.isAmbientPlaying || this.isMuted) return;
    const ctx = this.getCtx();
    if (ctx) {
      ctx.resume().then(() => this.startSuspenseDrone()).catch(() => {});
    }
  }

  public playGlitchIntro() {
    if (this.isMuted || !this.introAudio) return;
    this.introAudio.currentTime = 0;
    this.introAudio.play().then(() => {
      this.unlocked = true;
      this.ctx?.resume();
    }).catch(() => {});
  }

  public startAmbientMusic() {
    if (this.isMuted) return;
    this.pendingAmbient = true;
    if (this.unlocked) this._playAmbient();
  }

  public stopAmbientMusic() {
    this.pendingAmbient = false;
    this.stopDrone();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopDrone();
      this.introAudio?.pause();
    } else {
      this._playAmbient();
    }
    return this.isMuted;
  }

  public getIsMuted() { return this.isMuted; }
  public isUnlocked() { return this.unlocked; }
}

export const blackoutAudio = new BlackoutAudioEngine();
