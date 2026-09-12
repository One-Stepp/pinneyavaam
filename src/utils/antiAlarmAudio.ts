/**
 * AntiAlarmAudioEngine
 * 
 * Generates procedural Heavy Metal Rock when the alarm is set (to ensure extreme difficulty falling asleep)
 * and gradually morphs into a soothing, sleep-inducing hypnotic lullaby as the wake-up time approaches
 * (to ensure the user cannot possibly wake up).
 */

class AntiAlarmAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private volumeNode: GainNode | null = null;
  private metalGainNode: GainNode | null = null;
  private lullabyGainNode: GainNode | null = null;

  // Metal components
  private metalFilterNode: BiquadFilterNode | null = null;
  private metalDistortionNode: WaveShaperNode | null = null;
  private metalIntervalId: number | null = null;

  // Lullaby components
  private lullabyFilterNode: BiquadFilterNode | null = null;
  private lullabyDroneOsc1: OscillatorNode | null = null;
  private lullabyDroneOsc2: OscillatorNode | null = null;
  private lullabyDroneGain: GainNode | null = null;
  private lullabyTimeoutId: number | null = null;
  private lullabyHarpIntervalId: number | null = null;
  private rainGainNode: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;

  // Lullaby movement tracking
  public currentMovementName: string = 'Movement I: Evening Wiegenlied';
  private onMovementChangeCallbacks: Set<(movement: string) => void> = new Set();

  public onMovementChange(cb: (movement: string) => void) {
    this.onMovementChangeCallbacks.add(cb);
    return () => {
      this.onMovementChangeCallbacks.delete(cb);
    };
  }

  private notifyMovementChange(name: string) {
    this.currentMovementName = name;
    this.onMovementChangeCallbacks.forEach((cb) => {
      try {
        cb(name);
      } catch {
        // Callback safeguard
      }
    });
  }

  private currentProgress: number = 0; // 0.0 (pure metal) -> 1.0 (pure soothing lullaby)
  public enabled: boolean = true;
  private userMuted: boolean = false;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Generate distortion curve for heavy metal crunch
  private makeDistortionCurve(amount = 40): Float32Array {
    const k = typeof amount === 'number' ? amount : 40;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      // High gain soft clipping curve with rich harmonics
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // Create soft brown noise for ambient gentle sleep rain
  private createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 2.5; // boost
    }
    return buffer;
  }

  /**
   * Start the anti-alarm audio engine
   * @param initialProgress 0.0 to 1.0 (defaults to 0.0: full heavy metal)
   */
  public start(initialProgress = 0) {
    if (this.isPlaying) {
      this.setProgress(initialProgress);
      return;
    }

    const ctx = this.initCtx();
    if (!ctx) return;

    this.isPlaying = true;
    this.currentProgress = Math.max(0, Math.min(1, initialProgress));

    // Master Volume
    this.volumeNode = ctx.createGain();
    this.volumeNode.gain.setValueAtTime(this.userMuted ? 0 : 0.22, ctx.currentTime);
    this.volumeNode.connect(ctx.destination);

    // 1. Setup Metal Audio Sub-tree
    this.metalGainNode = ctx.createGain();
    this.metalDistortionNode = ctx.createWaveShaper();
    this.metalDistortionNode.curve = this.makeDistortionCurve(65) as unknown as Float32Array<ArrayBuffer>;
    this.metalDistortionNode.oversample = '4x';

    this.metalFilterNode = ctx.createBiquadFilter();
    this.metalFilterNode.type = 'lowpass';
    this.metalFilterNode.frequency.setValueAtTime(3800, ctx.currentTime);
    this.metalFilterNode.Q.setValueAtTime(4, ctx.currentTime);

    this.metalDistortionNode.connect(this.metalFilterNode);
    this.metalFilterNode.connect(this.metalGainNode);
    this.metalGainNode.connect(this.volumeNode);

    // 2. Setup Lullaby Audio Sub-tree
    this.lullabyGainNode = ctx.createGain();
    this.lullabyFilterNode = ctx.createBiquadFilter();
    this.lullabyFilterNode.type = 'lowpass';
    this.lullabyFilterNode.frequency.setValueAtTime(1400, ctx.currentTime);
    this.lullabyFilterNode.Q.setValueAtTime(1.2, ctx.currentTime);

    this.lullabyFilterNode.connect(this.lullabyGainNode);
    this.lullabyGainNode.connect(this.volumeNode);

    // Warm ambient sleep drone
    this.setupLullabyDrones(ctx);

    // Start procedural rhythmic loops
    this.startMetalSequence(ctx);
    this.startLullabySequence(ctx);

    // Set initial crossfade blend
    this.setProgress(this.currentProgress);
  }

  private setupLullabyDrones(ctx: AudioContext) {
    if (!this.lullabyFilterNode) return;

    this.lullabyDroneGain = ctx.createGain();
    this.lullabyDroneGain.gain.setValueAtTime(0.09, ctx.currentTime);

    // Dual soothing warm sine drones tuned to create a scientifically relaxing 4 Hz Delta sleep binaural pulse
    // 174.0 Hz (Solfeggio pain/stress release tone) + 178.0 Hz (+4 Hz delta brainwave induction)
    this.lullabyDroneOsc1 = ctx.createOscillator();
    this.lullabyDroneOsc1.type = 'sine';
    this.lullabyDroneOsc1.frequency.setValueAtTime(174.0, ctx.currentTime);

    this.lullabyDroneOsc2 = ctx.createOscillator();
    this.lullabyDroneOsc2.type = 'sine';
    this.lullabyDroneOsc2.frequency.setValueAtTime(178.0, ctx.currentTime); // Creates 4 Hz binaural beat

    // Slow LFO for calming diaphragmatic breathing pulse (~8 sec breath cycle)
    const droneLfo = ctx.createOscillator();
    droneLfo.frequency.setValueAtTime(0.11, ctx.currentTime);
    const droneLfoGain = ctx.createGain();
    droneLfoGain.gain.setValueAtTime(0.045, ctx.currentTime);
    droneLfo.connect(droneLfoGain);
    droneLfoGain.connect(this.lullabyDroneGain.gain);
    droneLfo.start();

    this.lullabyDroneOsc1.connect(this.lullabyDroneGain);
    this.lullabyDroneOsc2.connect(this.lullabyDroneGain);
    this.lullabyDroneGain.connect(this.lullabyFilterNode);

    this.lullabyDroneOsc1.start();
    this.lullabyDroneOsc2.start();

    // Gentle sleep white/brown noise (distant soothing rain)
    try {
      const noiseBuffer = this.createBrownNoiseBuffer(ctx);
      this.rainSource = ctx.createBufferSource();
      this.rainSource.buffer = noiseBuffer;
      this.rainSource.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(500, ctx.currentTime);

      this.rainGainNode = ctx.createGain();
      this.rainGainNode.gain.setValueAtTime(0.035, ctx.currentTime);

      this.rainSource.connect(rainFilter);
      rainFilter.connect(this.rainGainNode);
      this.rainGainNode.connect(this.lullabyFilterNode);
      this.rainSource.start();
    } catch {
      // Noise buffer fallback
    }
  }

  // Procedural Heavy Metal riffing loop (~145 BPM, 105ms 16th notes)
  private startMetalSequence(ctx: AudioContext) {
    const metalScale = [
      82.41,  // E2 (Power Root)
      82.41,  // E2
      98.00,  // G2
      110.00, // A2
      116.54, // Bb2 (Blues/Metal tritone tension)
      110.00, // A2
      98.00,  // G2
      73.42,  // D2 (Drop D power)
    ];

    let step = 0;
    const beatInterval = 135; // ms per 16th note

    this.metalIntervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.metalDistortionNode || this.currentProgress >= 0.96) {
        return;
      }

      const now = ctx.currentTime;
      const freq = metalScale[step % metalScale.length];
      const isChug = step % 2 === 0;

      // Heavy Metal Guitar Chug / Power Note
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = isChug ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq, now);

      // Add a higher fifth harmonic for authentic power chord feel
      const fifthOsc = ctx.createOscillator();
      fifthOsc.type = 'sawtooth';
      fifthOsc.frequency.setValueAtTime(freq * 1.498, now);

      const noteDuration = isChug ? 0.09 : 0.18;
      const velocity = isChug ? 0.35 : 0.45;

      noteGain.gain.setValueAtTime(velocity, now);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration);

      osc.connect(noteGain);
      fifthOsc.connect(noteGain);
      noteGain.connect(this.metalDistortionNode);

      osc.start(now);
      fifthOsc.start(now);
      osc.stop(now + noteDuration);
      fifthOsc.stop(now + noteDuration);

      // Heavy Drum Beat: Double Kick Drum on 0, 4, 8, 12, Snare on 4, 12
      if (step % 2 === 0) {
        this.playMetalKick(ctx, now);
      }
      if (step % 4 === 2) {
        this.playMetalSnare(ctx, now);
      }

      step++;
    }, beatInterval);
  }

  // Punchy Double Kick Drum
  private playMetalKick(ctx: AudioContext, time: number) {
    if (!this.metalGainNode) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.08);

    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(gain);
    gain.connect(this.metalGainNode);

    osc.start(time);
    osc.stop(time + 0.09);
  }

  // High-velocity rock snare
  private playMetalSnare(ctx: AudioContext, time: number) {
    if (!this.metalGainNode) return;
    // Tonal body
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.07);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(this.metalGainNode);

    osc.start(time);
    osc.stop(time + 0.08);
  }

  // Procedural Sleep-Inducing Lullaby Suite (Extended 4-Movement Multi-Layered Sleep Symphony)
  private startLullabySequence(ctx: AudioContext) {
    // 56-note expansive classical & ambient lullaby suite across 4 rich musical movements
    const lullabySuite: { freq: number; duration: number; movement: string }[] = [
      // MOVEMENT I: Brahms' Wiegenlied Theme (The Bedtime Call)
      { freq: 392.00, duration: 0.85, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // G4
      { freq: 392.00, duration: 0.85, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // G4
      { freq: 440.00, duration: 1.45, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // A4
      { freq: 392.00, duration: 1.45, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // G4
      { freq: 523.25, duration: 1.60, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // C5
      { freq: 493.88, duration: 2.30, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // B4
      { freq: 392.00, duration: 0.85, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // G4
      { freq: 392.00, duration: 0.85, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // G4
      { freq: 440.00, duration: 1.45, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // A4
      { freq: 392.00, duration: 1.45, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // G4
      { freq: 587.33, duration: 1.60, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // D5
      { freq: 523.25, duration: 2.30, movement: 'Movement I: Evening Wiegenlied (Theme)' }, // C5

      // MOVEMENT I (Part B: The Gentle Lullaby Refrain)
      { freq: 392.00, duration: 0.85, movement: 'Movement I: Wiegenlied Refrain' }, // G4
      { freq: 783.99, duration: 1.60, movement: 'Movement I: Wiegenlied Refrain' }, // G5
      { freq: 659.25, duration: 1.25, movement: 'Movement I: Wiegenlied Refrain' }, // E5
      { freq: 523.25, duration: 1.25, movement: 'Movement I: Wiegenlied Refrain' }, // C5
      { freq: 493.88, duration: 1.25, movement: 'Movement I: Wiegenlied Refrain' }, // B4
      { freq: 440.00, duration: 1.45, movement: 'Movement I: Wiegenlied Refrain' }, // A4
      { freq: 349.23, duration: 0.95, movement: 'Movement I: Wiegenlied Refrain' }, // F4
      { freq: 698.46, duration: 1.55, movement: 'Movement I: Wiegenlied Refrain' }, // F5
      { freq: 587.33, duration: 1.25, movement: 'Movement I: Wiegenlied Refrain' }, // D5
      { freq: 493.88, duration: 1.25, movement: 'Movement I: Wiegenlied Refrain' }, // B4
      { freq: 523.25, duration: 2.40, movement: 'Movement I: Wiegenlied Refrain' }, // C5

      // MOVEMENT II: Celestial Music Box & Starlight Variations
      { freq: 523.25, duration: 1.15, movement: 'Movement II: Celestial Music Box' }, // C5
      { freq: 659.25, duration: 1.15, movement: 'Movement II: Celestial Music Box' }, // E5
      { freq: 783.99, duration: 1.45, movement: 'Movement II: Celestial Music Box' }, // G5
      { freq: 987.77, duration: 1.85, movement: 'Movement II: Celestial Music Box' }, // B5
      { freq: 880.00, duration: 1.25, movement: 'Movement II: Celestial Music Box' }, // A5
      { freq: 783.99, duration: 1.25, movement: 'Movement II: Celestial Music Box' }, // G5
      { freq: 659.25, duration: 1.45, movement: 'Movement II: Celestial Music Box' }, // E5
      { freq: 587.33, duration: 1.45, movement: 'Movement II: Celestial Music Box' }, // D5
      { freq: 523.25, duration: 2.10, movement: 'Movement II: Celestial Music Box' }, // C5
      { freq: 440.00, duration: 1.25, movement: 'Movement II: Celestial Music Box' }, // A4
      { freq: 392.00, duration: 2.50, movement: 'Movement II: Celestial Music Box' }, // G4

      // MOVEMENT III: Satie's Hypnotic Meditation (Floating Dorian Dream)
      { freq: 369.99, duration: 1.65, movement: 'Movement III: Satie Hypnotic Meditation' }, // F#4
      { freq: 554.37, duration: 2.05, movement: 'Movement III: Satie Hypnotic Meditation' }, // C#5
      { freq: 493.88, duration: 1.85, movement: 'Movement III: Satie Hypnotic Meditation' }, // B4
      { freq: 415.30, duration: 1.65, movement: 'Movement III: Satie Hypnotic Meditation' }, // G#4
      { freq: 329.63, duration: 2.25, movement: 'Movement III: Satie Hypnotic Meditation' }, // E4
      { freq: 369.99, duration: 1.65, movement: 'Movement III: Satie Hypnotic Meditation' }, // F#4
      { freq: 440.00, duration: 1.65, movement: 'Movement III: Satie Hypnotic Meditation' }, // A4
      { freq: 415.30, duration: 1.85, movement: 'Movement III: Satie Hypnotic Meditation' }, // G#4
      { freq: 329.63, duration: 2.25, movement: 'Movement III: Satie Hypnotic Meditation' }, // E4
      { freq: 311.13, duration: 1.85, movement: 'Movement III: Satie Hypnotic Meditation' }, // D#4
      { freq: 277.18, duration: 2.50, movement: 'Movement III: Satie Hypnotic Meditation' }, // C#4

      // MOVEMENT IV: The Deep Delta Cradle (Slumber Lock & Gentle Descent)
      { freq: 311.13, duration: 1.25, movement: 'Movement IV: Delta Slumber Lock' }, // Eb4
      { freq: 392.00, duration: 1.25, movement: 'Movement IV: Delta Slumber Lock' }, // G4
      { freq: 466.16, duration: 1.45, movement: 'Movement IV: Delta Slumber Lock' }, // Bb4
      { freq: 622.25, duration: 1.85, movement: 'Movement IV: Delta Slumber Lock' }, // Eb5
      { freq: 587.33, duration: 1.45, movement: 'Movement IV: Delta Slumber Lock' }, // D5
      { freq: 523.25, duration: 1.45, movement: 'Movement IV: Delta Slumber Lock' }, // C5
      { freq: 466.16, duration: 1.45, movement: 'Movement IV: Delta Slumber Lock' }, // Bb4
      { freq: 415.30, duration: 1.45, movement: 'Movement IV: Delta Slumber Lock' }, // Ab4
      { freq: 392.00, duration: 1.65, movement: 'Movement IV: Delta Slumber Lock' }, // G4
      { freq: 349.23, duration: 1.65, movement: 'Movement IV: Delta Slumber Lock' }, // F4
      { freq: 311.13, duration: 2.80, movement: 'Movement IV: Delta Slumber Lock' }, // Eb4 (Deep cradle resolution)
    ];

    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.isPlaying || !this.lullabyFilterNode) {
        return;
      }

      const item = lullabySuite[noteIdx % lullabySuite.length];

      // Update movement description if changed
      if (this.currentMovementName !== item.movement) {
        this.notifyMovementChange(item.movement);
      }

      const now = ctx.currentTime;

      // Only play audible melody when progress is above 0.04
      if (this.currentProgress > 0.04) {
        // Dual-harmonic Celesta Bell
        const osc = ctx.createOscillator();
        const overtoneOsc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(item.freq, now);

        // Subtle 2nd harmonic (octave) adds glassy acoustic music-box presence
        overtoneOsc.type = 'sine';
        overtoneOsc.frequency.setValueAtTime(item.freq * 2, now);

        // Bell chime attack with natural sleepy acoustic decay
        const bellVolume = 0.24 * Math.min(1, this.currentProgress * 1.3);
        gain.gain.setValueAtTime(bellVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + item.duration * 1.15);

        osc.connect(gain);
        overtoneOsc.connect(gain);
        gain.connect(this.lullabyFilterNode);

        osc.start(now);
        overtoneOsc.start(now);
        osc.stop(now + item.duration * 1.2);
        overtoneOsc.stop(now + item.duration * 1.2);
      }

      noteIdx++;
      const nextDelayMs = Math.round(item.duration * 720);
      this.lullabyTimeoutId = window.setTimeout(playNextNote, nextDelayMs);
    };

    // Kick off lead melody
    playNextNote();

    // Start parallel polyphonic sleep harp arpeggiator
    this.startLullabyHarpArpeggios(ctx);
  }

  // Parallel Polyphonic Sleep Harp Arpeggios (provides harmonic depth and lush cradle warmth)
  private startLullabyHarpArpeggios(ctx: AudioContext) {
    // Calming chord arpeggio banks: Eb, Bb, Ab, Fm, Cm, Gm, Eb
    const chords = [
      [155.56, 196.00, 233.08, 311.13], // Eb maj (Eb3, G3, Bb3, Eb4)
      [116.54, 174.61, 233.08, 293.66], // Bb/D (Bb2, F3, Bb3, D4)
      [103.83, 155.56, 207.65, 261.63], // Ab maj7 (Ab2, Eb3, Ab3, C4)
      [87.31, 130.81, 174.61, 207.65],  // Fm7 (F2, C3, F3, Ab3)
      [130.81, 196.00, 261.63, 311.13], // Cm7 (C3, G3, C4, Eb4)
      [98.00, 146.83, 196.00, 233.08],  // Gm (G2, D3, G3, Bb3)
      [103.83, 155.56, 207.65, 261.63], // Ab (Ab2, Eb3, Ab3, C4)
      [116.54, 174.61, 233.08, 349.23], // Bb sus (Bb2, F3, Bb3, F4)
    ];

    let chordIdx = 0;
    let noteInChord = 0;
    const arpInterval = 540; // Gentle slow harp arpeggio pace

    this.lullabyHarpIntervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.lullabyFilterNode || this.currentProgress <= 0.15) {
        return;
      }

      const now = ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];
      const freq = currentChord[noteInChord % currentChord.length];

      // Warm acoustic plucked harp / Rhodes tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = noteInChord === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const arpVol = 0.14 * Math.min(1, (this.currentProgress - 0.12) * 1.5);
      gain.gain.setValueAtTime(arpVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.2);

      osc.connect(gain);
      gain.connect(this.lullabyFilterNode);

      osc.start(now);
      osc.stop(now + 1.25);

      noteInChord++;
      if (noteInChord >= currentChord.length) {
        noteInChord = 0;
        chordIdx++;
      }
    }, arpInterval);
  }

  /**
   * Adjust the progress balance between Heavy Metal and Sleep Lullaby
   * @param progress 0.0 = 100% Metal, 0.5 = 50/50 blend, 1.0 = 100% Sleep Lullaby
   */
  public setProgress(progress: number) {
    this.currentProgress = Math.max(0, Math.min(1, progress));
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Equal-power crossfade curve with enhanced early emergence for the soothing lullaby
    const metalVol = Math.cos(this.currentProgress * 0.5 * Math.PI);
    const lullabyVol = Math.sin(this.currentProgress * 0.5 * Math.PI);

    if (this.metalGainNode) {
      this.metalGainNode.gain.cancelScheduledValues(now);
      this.metalGainNode.gain.linearRampToValueAtTime(metalVol, now + 0.1);
    }

    if (this.lullabyGainNode) {
      this.lullabyGainNode.gain.cancelScheduledValues(now);
      this.lullabyGainNode.gain.linearRampToValueAtTime(lullabyVol, now + 0.1);
    }

    // Dynamic filtering: As we near sleep, metal filter softens & lullaby opens up
    if (this.metalFilterNode) {
      const metalFreq = 4200 * (1 - this.currentProgress * 0.7);
      this.metalFilterNode.frequency.linearRampToValueAtTime(Math.max(600, metalFreq), now + 0.1);
    }

    if (this.lullabyFilterNode) {
      const lullabyFreq = 800 + this.currentProgress * 1100;
      this.lullabyFilterNode.frequency.linearRampToValueAtTime(lullabyFreq, now + 0.1);
    }
  }

  public getProgress(): number {
    return this.currentProgress;
  }

  public toggleMute(): boolean {
    this.userMuted = !this.userMuted;
    if (this.volumeNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.volumeNode.gain.linearRampToValueAtTime(this.userMuted ? 0 : 0.22, now + 0.08);
    }
    return this.userMuted;
  }

  public isMuted(): boolean {
    return this.userMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public stop() {
    this.isPlaying = false;
    if (this.metalIntervalId) {
      clearInterval(this.metalIntervalId);
      this.metalIntervalId = null;
    }
    if (this.lullabyTimeoutId) {
      clearTimeout(this.lullabyTimeoutId);
      this.lullabyTimeoutId = null;
    }
    if (this.lullabyHarpIntervalId) {
      clearInterval(this.lullabyHarpIntervalId);
      this.lullabyHarpIntervalId = null;
    }

    try {
      if (this.lullabyDroneOsc1) {
        this.lullabyDroneOsc1.stop();
        this.lullabyDroneOsc1.disconnect();
        this.lullabyDroneOsc1 = null;
      }
      if (this.lullabyDroneOsc2) {
        this.lullabyDroneOsc2.stop();
        this.lullabyDroneOsc2.disconnect();
        this.lullabyDroneOsc2 = null;
      }
      if (this.rainSource) {
        this.rainSource.stop();
        this.rainSource.disconnect();
        this.rainSource = null;
      }
      if (this.volumeNode && this.ctx) {
        this.volumeNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      }
    } catch {
      // Audio cleanup safely handled
    }
  }
}

export const antiAlarmAudio = new AntiAlarmAudioEngine();
