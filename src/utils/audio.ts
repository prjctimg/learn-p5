// Audio utility for minigame sounds
// Plays retro beeps via the Web Audio API inside the game WebView.
// Returns early (no-op) when running outside a browser/WebView context.

type AudioCtxLike = {
  createOscillator(): {
    connect(n: unknown): void;
    start(t: number): void;
    stop(t: number): void;
    frequency: { value: number };
    type: string;
  };
  createGain(): {
    connect(n: unknown): void;
    gain: { setValueAtTime(v: number, t: number): void; exponentialRampToValueAtTime(v: number, t: number): void };
  };
  currentTime: number;
  destination: unknown;
};

declare const window: {
  AudioContext?: new () => AudioCtxLike;
  webkitAudioContext?: new () => AudioCtxLike;
} | undefined;

let audioContext: AudioCtxLike | null = null;

function getAudioContext(): AudioCtxLike | null {
  if (typeof window === "undefined") {
    return null; // Not in browser/WebView environment
  }

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    console.warn("AudioContext not available");
    return null;
  }

  if (!audioContext) {
    try {
      audioContext = new AudioCtor();
    } catch (error) {
      console.warn("AudioContext not available:", error);
      return null;
    }
  }
  return audioContext;
}

export function playBeep(
  frequency: number = 440,
  duration: number = 0.1,
  type: string = "square",
  volume: number = 0.3
): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn("Audio playback failed:", error);
  }
}

export function playSuccessSound(): void {
  playBeep(523.25, 0.1, "square", 0.2); // C5
  setTimeout(() => playBeep(659.25, 0.1, "square", 0.2), 100); // E5
  setTimeout(() => playBeep(783.99, 0.2, "square", 0.2), 200); // G5
}

export function playGameOverSound(): void {
  playBeep(392, 0.2, "square", 0.2); // G4
  setTimeout(() => playBeep(329.63, 0.2, "square", 0.2), 200); // E4
  setTimeout(() => playBeep(261.63, 0.4, "square", 0.2), 400); // C4
}

export function playClickSound(): void {
  playBeep(800, 0.05, "square", 0.1);
}

export function playScoreSound(): void {
  playBeep(600, 0.05, "square", 0.15);
}

export function playUnlockSound(): void {
  playBeep(440, 0.1, "sine", 0.2);
  setTimeout(() => playBeep(554.37, 0.1, "sine", 0.2), 150);
  setTimeout(() => playBeep(659.25, 0.1, "sine", 0.2), 300);
  setTimeout(() => playBeep(880, 0.2, "sine", 0.3), 450);
}
