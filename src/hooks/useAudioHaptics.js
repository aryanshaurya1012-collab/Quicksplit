import { useState, useCallback, useRef } from "react";

// Pentatonic note frequencies for tip feedback
const TIP_NOTE_MAP = {
  0: 523.25,  // C5
  5: 587.33,  // D5
  10: 659.25, // E5
  15: 783.99, // G5
  18: 880.00, // A5
  20: 987.77, // B5
  25: 1046.50 // C6
};

/**
 * High-performance Web Audio API synthesizer for tactile UI audio haptics.
 */
export function useAudioHaptics() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem("quicksplit-sound") !== "false";
    } catch {
      return true;
    }
  });

  const audioCtxRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Play a soft synthetic tone
  const playTone = useCallback((freq = 600, duration = 0.04, type = "sine", gainAmount = 0.07) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.4), ctx.currentTime + duration);

      gain.gain.setValueAtTime(gainAmount, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio errors safely swallowed
    }
  }, [soundEnabled, getAudioContext]);

  // Musical tip note
  const playTipChime = useCallback((percent) => {
    const freq = TIP_NOTE_MAP[percent] || 600;
    playTone(freq, 0.08, "sine", 0.09);
  }, [playTone]);

  // Celebratory ascending chime for copy / share / success
  const playSuccessChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 1046.50]; // C5, E5, C6
      notes.forEach((f, i) => {
        setTimeout(() => {
          playTone(f, 0.1, "triangle", 0.08);
        }, i * 65);
      });
    } catch {}
  }, [soundEnabled, getAudioContext, playTone]);

  // Soft tactile tick
  const playTick = useCallback(() => {
    playTone(650, 0.03, "sine", 0.06);
  }, [playTone]);

  // Delete / Clear tone
  const playBlipDown = useCallback(() => {
    playTone(320, 0.06, "triangle", 0.07);
  }, [playTone]);

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("quicksplit-sound", String(next));
      } catch {}
      if (next) {
        // play confirmation sound
        setTimeout(() => playTone(880, 0.06, "sine", 0.09), 10);
      }
      return next;
    });
  }, [playTone]);

  return {
    soundEnabled,
    toggleSound,
    playTone,
    playTipChime,
    playSuccessChime,
    playTick,
    playBlipDown
  };
}
