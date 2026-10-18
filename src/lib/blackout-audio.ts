/**
 * BLACKOUT Audio Engine
 * - Cinematic suspense pad via Web Audio API
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
        this.introAudio.volume = 0.6;
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
   * Cinematic suspense pad — soft Dm chord with reverb
   * Warm, dark, dramatic. Like a thriller movie score.
   * No noise, no harsh tones. Just quiet dread.
   */
  private startSuspenseDrone() {
    const ctx = this.getCtx();
    if (!ctx || this.droneActive) return;
    this.droneActive = true;

    const now = ctx.currentTime;

    // Reverb convolver — gives it that big cinematic hall sound
    const convolver = ctx.createConvolver();
    const reverbLen = ctx.sampleRate * 3;
    const reverbBuf = ctx.createBuffer(2, reverbLen, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = reverbBuf.getChannelData(c);
      for (let i = 0; i < reverbLen; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2.5);
    }
    convolver.buffer = reverbBuf;

    // Master — slow cinematic fade in over 6s
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(1.0, now + 6);
    master.connect(ctx.destination);
    this.droneGain = master;

    // Wet reverb bus
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.55;
    convolver.connect(reverbGain);
    reverbGain.connect(master);

    const makePad = (freq: number, gain: number, detune = 0) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      g.gain.value = gain;
      osc.connect(g);
      g.connect(master);     // dry signal
      g.connect(convolver);  // wet reverb
      osc.start(now);
      return osc;
    };

    // Dm chord — dark, cinematic, melancholic
    const root  = makePad(73.4,  0.55);      // D2 — deep warm root
    const fifth = makePad(110,   0.35);       // A2 — open fifth, adds space
    const minor = makePad(130.8, 0.22);       // C3 — minor 7th, melancholic
    makePad(146.8, 0.10, -8);                 // D3 slightly flat — ghostly overtone

    // Slow breathing swell LFO (one breath every ~10s)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start(now);

    // Gentle pitch drift — barely perceptible, keeps it alive
    root.frequency.linearRampToValueAtTime(72,   now + 25);
    root.frequency.linearRampToValueAtTime(74,   now + 55);
    fifth.frequency.linearRampToValueAtTime(109, now + 30);
    fifth.frequency.linearRampToValueAtTime(111, now + 60);
    minor.frequency.linearRampToValueAtTime(129, now + 35);
    minor.frequency.linearRampToValueAtTime(131, now + 65);

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
