export class GameAudio {
  private context: AudioContext | null = null;
  private muted = false;
  private active = new Set<OscillatorNode>();

  unlock() {
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
    } catch { /* Visual timer cues remain available when browser audio is unavailable. */ }
  }
  setMuted(muted: boolean) { this.muted = muted; if (muted) this.stop(); }
  stop() { this.active.forEach(oscillator => { try { oscillator.stop(); } catch { /* Already stopped. */ } }); this.active.clear(); }
  play(cue: 'warning' | 'countdown' | 'end') {
    const context = this.context;
    if (this.muted || !context || context.state !== 'running') return;
    const notes = cue === 'end' ? [660, 440, 220] : cue === 'warning' ? [660, 880] : [880];
    notes.forEach((frequency, i) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + i * .16;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(.13, start + .015);
      gain.gain.exponentialRampToValueAtTime(.001, start + .14);
      oscillator.connect(gain); gain.connect(context.destination);
      this.active.add(oscillator);
      oscillator.onended = () => { this.active.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start); oscillator.stop(start + .15);
    });
  }
  close() { this.stop(); void this.context?.close().catch(() => {}); this.context = null; }
}
