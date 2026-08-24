/**
 * Web Audio API based Security Sound Synthesizer
 * Generates alarm sirens, beeps, and chimes without external audio file dependencies
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays high-urgency alternating two-tone security siren for weapon alerts
 */
export function playWeaponAlertSiren(volumePercent: number = 80): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const gainNode = ctx.createGain();
    const vol = (volumePercent / 100) * 0.35;
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    // Siren pulse 1 (880 Hz High Alarm)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.linearRampToValueAtTime(1100, now + 0.15);
    osc1.frequency.linearRampToValueAtTime(880, now + 0.3);
    osc1.frequency.linearRampToValueAtTime(1100, now + 0.45);
    osc1.frequency.linearRampToValueAtTime(880, now + 0.6);

    osc1.connect(gainNode);
    osc1.start(now);
    osc1.stop(now + 0.7);

    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  } catch (e) {
    console.warn('Audio alert playback error:', e);
  }
}

/**
 * Plays acknowledgement confirmation chime
 */
export function playAcknowledgeChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {
    console.warn('Chime audio error:', e);
  }
}

/**
 * Plays short ping for radar scan cycle
 */
export function playScanPulse(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {
    // silent fail
  }
}
