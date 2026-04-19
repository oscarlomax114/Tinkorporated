'use client';

import { useRef, useEffect } from 'react';

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    // Ensure muted is set as property (required for iOS autoplay)
    vid.defaultMuted = true;
    vid.muted = true;
    vid.playbackRate = 0.7;

    // Force play
    const tryPlay = () => {
      vid.play().catch(() => {});
    };

    tryPlay();

    // Retry when video data is loaded
    vid.addEventListener('loadeddata', tryPlay);

    // Last resort: play on first user interaction
    const onInteract = () => {
      vid.muted = true;
      tryPlay();
      document.removeEventListener('touchstart', onInteract);
      document.removeEventListener('scroll', onInteract);
    };
    document.addEventListener('touchstart', onInteract, { once: true, passive: true });
    document.addEventListener('scroll', onInteract, { once: true, passive: true });

    return () => {
      vid.removeEventListener('loadeddata', tryPlay);
      document.removeEventListener('touchstart', onInteract);
      document.removeEventListener('scroll', onInteract);
    };
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    >
      <source src="/tink-hero-vid.mp4" type="video/mp4" />
    </video>
  );
}
