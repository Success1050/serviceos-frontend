/**
 * Web Audio API synthesizer for clean, zero-asset notification chimes.
 * Plays a pleasant double-tone notification chime with smooth gain envelope.
 */
export function playNotificationSound(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Primary Tone: D5 (587.33 Hz) transitioning quickly to A5 (880 Hz)
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(880, now + 0.08); // Harmonics
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);

    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);

    // Clean up AudioContext after sound finishes
    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        // Ignore close errors
      }
    }, 600);
  } catch (err) {
    // Graceful silent fallback if AudioContext policy blocks autoplay
    console.debug("[NotificationSound] Audio playback suppressed:", err);
  }
}
