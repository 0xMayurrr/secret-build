/**
 * BLACKOUT Audio Engine
 */

class BlackoutAudioEngine {
  private introAudio: HTMLAudioElement | null = null;
  private ambientAudio: HTMLAudioElement | null = null;
  private clickPool: HTMLAudioElement[] = [];
  private clickIndex = 0;
  private isMuted = false;
  private unlocked = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.ambientAudio = new Audio("/audio/ambient-suspenseee.mp3");
      this.ambientAudio.loop = true;
      this.ambientAudio.volume = 0.4;
      this.ambientAudio.preload = "auto";

      this.clickPool = Array.from({ length: 4 }, () => {
        const a = new Audio("/audio/click.wav");
        a.volume = 0.4;
        a.preload = "auto";
        return a;
      });
    }
  }

  // Must be called synchronously inside a user gesture event handler
  public playGlitchIntro() {
    if (this.isMuted) return;
    // Always create a fresh Audio element inside the gesture — most reliable on iOS/Android
    const a = new Audio("/audio/blackout-glitch.wav");
    a.volume = 0.3;
    this.introAudio = a;
    a.play().catch(() => {});
  }

  public startAmbientMusic() {
    if (this.isMuted || !this.ambientAudio) return;
    this.ambientAudio.currentTime = 0;
    this.ambientAudio.play().catch(() => {});
  }

  public stopAmbientMusic() {
    this.ambientAudio?.pause();
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
      this.ambientAudio?.pause();
      this.introAudio?.pause();
    } else {
      this.startAmbientMusic();
    }
    return this.isMuted;
  }

  public getIsMuted() { return this.isMuted; }
}

export const blackoutAudio = new BlackoutAudioEngine();
