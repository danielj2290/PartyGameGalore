// Screen-normal elevation above the horizon: +90 = screen faces sky,
// -90 = screen faces ground. Works with either landscape edge on top.
export function screenElevation(beta: number | null, gamma: number | null): number | null {
  if (beta === null || gamma === null || !Number.isFinite(beta) || !Number.isFinite(gamma)) return null;
  const radians = Math.PI / 180;
  return Math.asin(Math.max(-1, Math.min(1, Math.cos(beta * radians) * Math.cos(gamma * radians)))) / radians;
}

export class TiltDetector {
  private armed = false;
  private neutralSince: number | null = null;
  private candidate: 'correct' | 'skipped' | null = null;
  private candidateSince = 0;
  private lastGesture = -Infinity;
  reset() { this.armed = false; this.neutralSince = null; this.candidate = null; this.lastGesture = -Infinity; }
  sample(elevation: number | null, now: number): 'correct' | 'skipped' | null {
    if (elevation === null || !Number.isFinite(elevation)) return null;
    if (Math.abs(elevation) <= 18) {
      this.candidate = null;
      this.neutralSince ??= now;
      if (now - this.neutralSince >= 220 && now - this.lastGesture >= 700) this.armed = true;
      return null;
    }
    this.neutralSince = null;
    const candidate = elevation >= 40 ? 'correct' : elevation <= -40 ? 'skipped' : null;
    if (!this.armed || candidate === null) { this.candidate = null; return null; }
    if (this.candidate !== candidate) { this.candidate = candidate; this.candidateSince = now; return null; }
    if (now - this.candidateSince < 180) return null;
    this.armed = false; this.candidate = null; this.lastGesture = now;
    return candidate;
  }
}

export type DeviceMode = 'phone' | 'keyboard';
export function detectDevice(): DeviceMode {
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const touchTablet = navigator.maxTouchPoints > 1 && (window.matchMedia?.('(pointer: coarse)').matches ?? false);
  return mobile || touchTablet ? 'phone' : 'keyboard';
}
