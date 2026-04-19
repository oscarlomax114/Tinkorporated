'use client';

import { useRef, useEffect } from 'react';

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = true;
    vid.playbackRate = 0.7;

    vid.play().catch(() => {
      // Retry on user interaction if autoplay is blocked
      const handleInteraction = () => {
        vid.play().catch(() => {});
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('click', handleInteraction);
      };
      document.addEventListener('touchstart', handleInteraction, { once: true });
      document.addEventListener('click', handleInteraction, { once: true });
    });
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className="absolute inset-0 w-full h-full object-cover"
      style={{ WebkitMediaPlaybackRequiresUserAction: false } as React.CSSProperties}
    >
      <source src="/tink-hero-vid.mp4" type="video/mp4" />
    </video>
  );
}
