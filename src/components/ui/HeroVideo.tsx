'use client';

import { useRef, useEffect, useState } from 'react';

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.defaultMuted = true;
    vid.muted = true;
    vid.playbackRate = 0.7;

    const onPlaying = () => setPlaying(true);
    vid.addEventListener('playing', onPlaying);

    const tryPlay = () => {
      vid.play().catch(() => {});
    };

    tryPlay();
    vid.addEventListener('loadeddata', tryPlay);

    const onInteract = () => {
      vid.muted = true;
      tryPlay();
      document.removeEventListener('touchstart', onInteract);
      document.removeEventListener('scroll', onInteract);
    };
    document.addEventListener('touchstart', onInteract, { once: true, passive: true });
    document.addEventListener('scroll', onInteract, { once: true, passive: true });

    return () => {
      vid.removeEventListener('playing', onPlaying);
      vid.removeEventListener('loadeddata', tryPlay);
      document.removeEventListener('touchstart', onInteract);
      document.removeEventListener('scroll', onInteract);
    };
  }, []);

  return (
    <>
      {/* Poster: first frame shown immediately, hides once video plays */}
      <img
        src="/tink-hero-poster.png"
        alt=""
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${playing ? 'opacity-0' : 'opacity-100'}`}
      />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${playing ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src="/tink-hero-vid.mp4" type="video/mp4" />
      </video>
    </>
  );
}
