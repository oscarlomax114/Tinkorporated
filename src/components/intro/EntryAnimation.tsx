'use client';

import { useState, useEffect } from 'react';

/**
 * First-entry landing animation.
 *
 * Dark frosted glass doors slide open from center, revealing the homepage.
 * Plays once per session (sessionStorage flag).
 *
 * --- TIMING ADJUSTMENTS ---
 * FLICKER_DURATION:  how long the fluorescent flicker phase lasts (ms)
 * DOOR_DELAY:        when doors start opening after mount (ms)
 * DOOR_DURATION:     how long the door slide takes (ms, also in CSS below)
 * FADE_OUT_DELAY:    when the overlay starts fading out (ms)
 * TOTAL_DURATION:    when the overlay is fully removed from DOM (ms)
 */
const FLICKER_DURATION = 400;   // flicker phase length
const DOOR_DELAY = 350;         // delay before doors begin opening
const DOOR_DURATION = 900;      // door slide duration (match CSS transition)
const FADE_OUT_DELAY = 1000;    // when overlay begins fading
const TOTAL_DURATION = 1600;    // when overlay is removed from DOM

const SESSION_KEY = 'tink-entry-seen';

export default function EntryAnimation() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<'flicker' | 'opening' | 'fading' | 'done'>('flicker');

  useEffect(() => {
    // Respect prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    // Only play once per session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    sessionStorage.setItem(SESSION_KEY, '1');
    setShow(true);

    // Phase: flicker → opening → fading → done
    const t1 = setTimeout(() => setPhase('opening'), DOOR_DELAY);
    const t2 = setTimeout(() => setPhase('fading'), FADE_OUT_DELAY);
    const t3 = setTimeout(() => setPhase('done'), TOTAL_DURATION);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (!show || phase === 'done') return null;

  return (
    <div
      className="entry-overlay"
      data-phase={phase}
      aria-hidden="true"
    >
      {/* Fluorescent flicker layer */}
      <div className="entry-flicker" />

      {/* Left door */}
      <div className="entry-door entry-door-left">
        <div className="entry-door-surface" />
      </div>

      {/* Right door */}
      <div className="entry-door entry-door-right">
        <div className="entry-door-surface" />
      </div>

      {/* CCTV inset — bottom-right corner
          --- CCTV ADJUSTMENTS ---
          Change opacity, size, or position here */}
      <div className="entry-cctv">
        <div className="entry-cctv-inner">
          <div className="entry-cctv-scanlines" />
          <div className="entry-cctv-content">
            <div className="entry-cctv-dot" />
            <div className="entry-cctv-timestamp">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </div>
          <div className="entry-cctv-noise" />
        </div>
      </div>

      {/* Subtle center seam line */}
      <div className="entry-seam" />
    </div>
  );
}
