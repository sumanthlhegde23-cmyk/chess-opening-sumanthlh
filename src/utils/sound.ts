// Web Audio API procedural chess sound generator (no external audio assets required)

export interface SoundSystemDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  playMove: (ctx: AudioContext) => void;
  playCapture: (ctx: AudioContext) => void;
}

// Noise buffer helper for realistic wood, stone, mechanical, and tactile textures
function playFilteredNoise(
  ctx: AudioContext,
  time: number,
  duration: number,
  filterType: BiquadFilterType,
  frequency: number,
  q: number,
  initialGain: number
) {
  try {
    const bufferSize = Math.max(256, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, time);
    filter.Q.setValueAtTime(q, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(initialGain, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + duration);
  } catch {
    // Audio context may be restricted
  }
}

export const SOUND_SYSTEMS: SoundSystemDefinition[] = [
  {
    id: 'wood',
    name: 'Classic Wood',
    category: 'Traditional',
    description: 'Warm natural wood knock & heavy Staunton piece snap',
    playMove: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      // Resonant wood body
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.08);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);

      // Wood surface friction click
      playFilteredNoise(ctx, t, 0.02, 'bandpass', 700, 1.8, 0.15);
    },
    playCapture: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      // Initial piece strike
      playFilteredNoise(ctx, t, 0.025, 'bandpass', 1100, 2.0, 0.28);

      // Deep wood reverberation
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(48, t + 0.12);

      gain.gain.setValueAtTime(0.42, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    },
  },
  {
    id: 'digital',
    name: 'Modern Digital',
    category: 'Electronic',
    description: 'Crisp, contemporary UI clicks with clean harmonic feedback',
    playMove: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.045);

      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    },
    playCapture: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      // High click + low punch
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, t);
      osc1.frequency.exponentialRampToValueAtTime(440, t + 0.05);
      gain1.gain.setValueAtTime(0.28, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.06);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(320, t);
      osc2.frequency.exponentialRampToValueAtTime(90, t + 0.08);
      gain2.gain.setValueAtTime(0.35, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.09);
    },
  },
  {
    id: 'marble',
    name: 'Marble & Stone',
    category: 'Material',
    description: 'Solid heavy mineral clack & polished stone collision',
    playMove: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      playFilteredNoise(ctx, t, 0.02, 'bandpass', 950, 3.2, 0.3);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(190, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.07);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    },
    playCapture: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      playFilteredNoise(ctx, t, 0.035, 'bandpass', 1500, 2.5, 0.35);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.11);
    },
  },
  {
    id: 'arcade',
    name: 'Retro 8-Bit Arcade',
    category: 'Vintage',
    description: 'Nostalgic chiptune arpeggios & classic video game crunch',
    playMove: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.setValueAtTime(783.99, t + 0.025); // G5

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    },
    playCapture: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.09);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);

      playFilteredNoise(ctx, t, 0.05, 'highpass', 800, 1.0, 0.22);
    },
  },
  {
    id: 'scifi',
    name: 'Sci-Fi Cyberpunk',
    category: 'Futuristic',
    description: 'Holographic laser sweeps & futuristic energy pulse impacts',
    playMove: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.linearRampToValueAtTime(700, t + 0.03);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.08);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    },
    playCapture: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.11);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.11);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    },
  },
  {
    id: 'mechanical',
    name: 'Mechanical Switch',
    category: 'Tactile',
    description: 'Crisp mechanical switch actuation click & spring bottom-out',
    playMove: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      // High tactile click
      playFilteredNoise(ctx, t, 0.012, 'highpass', 2800, 2.5, 0.25);

      // Keycap bottoming out
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    },
    playCapture: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      // Dual actuation click
      playFilteredNoise(ctx, t, 0.012, 'highpass', 2400, 2.0, 0.28);
      playFilteredNoise(ctx, t + 0.018, 0.02, 'bandpass', 1200, 2.0, 0.32);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.07);
      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    },
  },
  {
    id: 'soft_felt',
    name: 'Soft Velvet & Felt',
    category: 'Gentle',
    description: 'Whisper-quiet library set with muffled felt dampening',
    playMove: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.06);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    },
    playCapture: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    },
  },
  {
    id: 'crystal_glass',
    name: 'Crystal Glass',
    category: 'Harmonic',
    description: 'Pure crystalline glass bell chime & shimmering harmonic clink',
    playMove: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, t); // C6

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.17);
    },
    playCapture: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      // Dual harmonic bell ring
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, t); // C6
      gain1.gain.setValueAtTime(0.25, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.23);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1567.98, t); // G6
      gain2.gain.setValueAtTime(0.2, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.25);
    },
  },
  {
    id: 'bubble',
    name: 'Bubble Water Pop',
    category: 'Playful',
    description: 'Satisfying liquid bubble sweep & double water droplet pop',
    playMove: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(680, t + 0.04);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    },
    playCapture: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      // Bubble 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(260, t);
      osc1.frequency.exponentialRampToValueAtTime(480, t + 0.035);
      gain1.gain.setValueAtTime(0.3, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.05);

      // Bubble 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(380, t + 0.02);
      osc2.frequency.exponentialRampToValueAtTime(780, t + 0.06);
      gain2.gain.setValueAtTime(0.32, t + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t + 0.02);
      osc2.stop(t + 0.08);
    },
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster Tournament',
    category: 'Tournament',
    description: 'Heavy weighted Staunton wood tap & authoritative clock punch strike',
    playMove: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      playFilteredNoise(ctx, t, 0.025, 'bandpass', 500, 1.5, 0.22);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(175, t);
      osc.frequency.exponentialRampToValueAtTime(58, t + 0.1);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.11);
    },
    playCapture: (ctx: AudioContext) => {
      const t = ctx.currentTime;
      // Aggressive slide-and-strike
      playFilteredNoise(ctx, t, 0.03, 'bandpass', 900, 2.0, 0.32);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);

      gain.gain.setValueAtTime(0.46, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    },
  },
];

class ChessAudio {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private currentSystemId: string = 'wood';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('chess-openings-sound-system');
        if (stored && SOUND_SYSTEMS.some((s) => s.id === stored)) {
          this.currentSystemId = stored;
        }
      } catch {
        // LocalStorage might be restricted
      }
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public getCurrentSoundSystem(): string {
    return this.currentSystemId;
  }

  public setSoundSystem(systemId: string) {
    if (SOUND_SYSTEMS.some((s) => s.id === systemId)) {
      this.currentSystemId = systemId;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('chess-openings-sound-system', systemId);
        }
      } catch {}
    }
  }

  public getSoundSystems(): SoundSystemDefinition[] {
    return SOUND_SYSTEMS;
  }

  public playMove(systemId?: string) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const targetId = systemId || this.currentSystemId;
    const system = SOUND_SYSTEMS.find((s) => s.id === targetId) || SOUND_SYSTEMS[0];
    try {
      system.playMove(this.ctx);
    } catch {
      // Audio context might be restricted before gesture
    }
  }

  public playCapture(systemId?: string) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const targetId = systemId || this.currentSystemId;
    const system = SOUND_SYSTEMS.find((s) => s.id === targetId) || SOUND_SYSTEMS[0];
    try {
      system.playCapture(this.ctx);
    } catch {}
  }

  public playSystemPreview(systemId: string, type: 'move' | 'capture' | 'both' = 'both') {
    this.init();
    if (!this.ctx) return;

    if (type === 'move') {
      this.playMove(systemId);
    } else if (type === 'capture') {
      this.playCapture(systemId);
    } else {
      this.playMove(systemId);
      setTimeout(() => {
        this.playCapture(systemId);
      }, 160);
    }
  }

  public playCheck() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.18); // A5

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.23);
    } catch {}
  }

  public playSuccess() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const t = this.ctx!.currentTime + idx * 0.07;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch {}
  }
}

export const chessAudio = new ChessAudio();
