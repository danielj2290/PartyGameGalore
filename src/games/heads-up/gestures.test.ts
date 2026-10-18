import { describe, expect, it } from 'vitest';
import { screenElevation, TiltDetector } from './gestures';

describe('phone tilt geometry', () => {
  it('distinguishes sky-facing, upright, and ground-facing screens', () => {
    expect(screenElevation(0, 0)).toBeCloseTo(90);
    expect(screenElevation(180, 0)).toBeCloseTo(-90);
    expect(screenElevation(90, 0)).toBeCloseTo(0);
  });
  it('works with either landscape edge at the top and does not depend on compass heading', () => {
    expect(screenElevation(0, 90)).toBeCloseTo(0);
    expect(screenElevation(0, -90)).toBeCloseTo(0);
    expect(screenElevation(0, 30)).toBeCloseTo(60);
    expect(screenElevation(0, -30)).toBeCloseTo(60);
    expect(screenElevation(180, 30)).toBeCloseTo(-60);
    expect(screenElevation(180, -30)).toBeCloseTo(-60);
  });
  it('rejects missing and non-finite sensor values', () => {
    expect(screenElevation(null, 0)).toBeNull(); expect(screenElevation(0, null)).toBeNull();
    expect(screenElevation(NaN, 0)).toBeNull(); expect(screenElevation(0, Infinity)).toBeNull();
  });
});

describe('gesture filtering', () => {
  it('requires a stable upright hold first, then a deliberate held upward tilt', () => {
    const detector = new TiltDetector();
    expect(detector.sample(60, 0)).toBeNull(); expect(detector.sample(60, 300)).toBeNull();
    detector.sample(0, 400); detector.sample(0, 650);
    expect(detector.sample(60, 700)).toBeNull(); expect(detector.sample(60, 900)).toBe('correct');
    expect(detector.sample(60, 1200)).toBeNull();
  });
  it('requires returning upright between gestures and respects a cooldown', () => {
    const detector = new TiltDetector();
    detector.sample(0, 0); detector.sample(0, 250); detector.sample(60, 300);
    expect(detector.sample(60, 500)).toBe('correct');
    expect(detector.sample(-60, 800)).toBeNull(); expect(detector.sample(-60, 1100)).toBeNull();
    detector.sample(0, 1200); detector.sample(0, 1450); detector.sample(-60, 1500);
    expect(detector.sample(-60, 1700)).toBe('skipped');
  });
  it('rejects jitter and brief swings; reset prevents paused/startup gestures leaking into play', () => {
    const detector = new TiltDetector();
    detector.sample(0, 0); detector.sample(0, 250);
    expect(detector.sample(25, 300)).toBeNull(); expect(detector.sample(-25, 500)).toBeNull();
    detector.sample(60, 700); expect(detector.sample(0, 750)).toBeNull();
    detector.sample(60, 800); expect(detector.sample(-60, 850)).toBeNull();
    detector.reset(); expect(detector.sample(-60, 2000)).toBeNull();
    detector.sample(0, 2200); detector.sample(0, 2450); detector.sample(-60, 2500);
    expect(detector.sample(-60, 2700)).toBe('skipped');
  });
});
