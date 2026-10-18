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
   * Cinematic suspense pad — soft Dm chord with reverb
   * Warm, dark, dramatic. Like a thriller movie score.
   */
  private startSuspenseDrone() {
    const ctx = this.getCtx();
    if (!ctx || this.droneActive) return;
    this.droneActive = true;

    const now = ctx.currentTime;

    // Reverb convolver
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
      g.connect(master);
      g.connect(convolver);
      osc.start(now);
      return osc;
    };

    // Dm chord — dark, cinematic, melancholic
    const root  = makePad(73.4,  0.55);
    const fifth = makePad(110,   0.35);
    const minor = makePad(130.8, 0.22);
    makePad(146.8, 0.10, -8);

    // Slow breathing swell LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start(now);

    // Gentle pitch drift
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
