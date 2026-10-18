/**
 * BLACKOUT Audio Engine
 * - Cinematic horror suspense drone via Web Audio API
 * - Glitch intro SFX
 * - Click pool for UI tactile feedback
 */

class BlackoutAudioEngine {
  private ctx: AudioContext | null = null;
  private droneActive = false;
  private droneGain: GainNode | null = null;

  private introAudio: HTMLAudioElement | null = null;
  private ambientAudio: HTMLAudioElement | null = null;
  private clickPool: HTMLAudioElement[] = [];
  private clickIndex = 0;

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
        this.introAudio.volume = 0.4;
        this.introAudio.preload = "auto";
      }
      if (!this.ambientAudio) {
        this.ambientAudio = new Audio("/audio/ambient-suspense.wav");
        this.ambientAudio.loop = true;
        this.ambientAudio.volume = 1.0;
        this.ambientAudio.preload = "auto";
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
   * Cinematic horror suspense drone
   *
   * Layers:
   * 1. 28Hz infrasonic rumble  — subconscious dread, felt not heard
   * 2. 55Hz + 82Hz tritone     — the "devil's interval", inherently unsettling
   * 3. Filtered noise swell    — like a distant storm or crowd murmur
   * 4. 528Hz detuned shimmer   — thin, eerie, slightly out of tune
   * 5. Slow LFO tremolo        — makes everything breathe with unease
   * 6. Gradual pitch drift     — tension that never resolves
   */
  private startSuspenseDrone() {
    const ctx = this.getCtx();
    if (!ctx || this.droneActive) return;
    this.droneActive = true;

    const now = ctx.currentTime;

    // Master output with slow fade-in (4s)
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.75, now + 4);
    master.connect(ctx.destination);
    this.droneGain = master;

    // ── Layer 1: Infrasonic sub rumble (28Hz) ──────────────────────────────
    // Below hearing threshold but creates physical unease
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = "sine";
    sub.frequency.value = 28;
    subGain.gain.value = 1.0;
    sub.connect(subGain);
    subGain.connect(master);
    sub.start(now);

    // ── Layer 2: Tritone interval (55Hz + 82.5Hz = devil's interval) ───────
    // Tritone = 6 semitones apart, sounds inherently wrong to human brain
    const tri1 = ctx.createOscillator();
    const tri1Gain = ctx.createGain();
    tri1.type = "sawtooth";
    tri1.frequency.value = 55;
    tri1Gain.gain.value = 0.22;
    tri1.connect(tri1Gain);
    tri1Gain.connect(master);
    tri1.start(now);

    const tri2 = ctx.createOscillator();
    const tri2Gain = ctx.createGain();
    tri2.type = "sawtooth";
    tri2.frequency.value = 82.5; // tritone above 55Hz
    tri2Gain.gain.value = 0.18;
    tri2.connect(tri2Gain);
    tri2Gain.connect(master);
    tri2.start(now);

    // ── Layer 3: Filtered noise swell ──────────────────────────────────────
    // White noise through a low-pass filter = distant rumble / crowd murmur
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 180;
    noiseFilter.Q.value = 1.2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.12;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);

    // ── Layer 4: Detuned eerie shimmer (528Hz, slightly off) ───────────────
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = "sine";
    shimmer.frequency.value = 528;
    shimmer.detune.value = -14; // slightly flat = unsettling
    shimmerGain.gain.value = 0.04;
    shimmer.connect(shimmerGain);
    shimmerGain.connect(master);
    shimmer.start(now);

    // ── Layer 5: Slow tremolo LFO (0.3Hz) ─────────────────────────────────
    // Makes the whole thing breathe slowly — like something alive in the dark
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 0.28;
    lfo.connect(lfoGain);
    lfoGain.connect(subGain.gain);
    lfo.start(now);

    // ── Layer 6: Pitch drift — tension that never resolves ─────────────────
    // Tritone slowly drifts, never settles, brain keeps waiting for resolution
    tri1.frequency.linearRampToValueAtTime(52, now + 15);
    tri1.frequency.linearRampToValueAtTime(58, now + 35);
    tri1.frequency.linearRampToValueAtTime(50, now + 55);
    tri1.frequency.linearRampToValueAtTime(55, now + 75);

    tri2.frequency.linearRampToValueAtTime(79, now + 18);
    tri2.frequency.linearRampToValueAtTime(86, now + 38);
    tri2.frequency.linearRampToValueAtTime(77, now + 58);
    tri2.frequency.linearRampToValueAtTime(82.5, now + 78);

    // Noise filter sweeps slowly — like pressure building
    noiseFilter.frequency.linearRampToValueAtTime(280, now + 20);
    noiseFilter.frequency.linearRampToValueAtTime(120, now + 45);
    noiseFilter.frequency.linearRampToValueAtTime(220, now + 70);

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
    window.addEventListener("click", () => { onGesture(); this.playClick(); }, { capture: true, passive: true });
  }

  private _playAmbient() {
    if (this.isAmbientPlaying || this.isMuted) return;
    const ctx = this.getCtx();
    if (ctx) {
      ctx.resume().then(() => this.startSuspenseDrone()).catch(() => this._fallback());
    } else {
      this._fallback();
    }
  }

  private _fallback() {
    if (!this.ambientAudio || this.isAmbientPlaying) return;
    this.ambientAudio.currentTime = 0;
    this.ambientAudio.play().then(() => {
      this.isAmbientPlaying = true;
    }).catch(() => {
      this.pendingAmbient = true;
    });
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
    this.ambientAudio?.pause();
    this.isAmbientPlaying = false;
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
      this.ambientAudio?.pause();
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
