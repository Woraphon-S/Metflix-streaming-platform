'use client';

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string | null;
  title?: string;
  initialSeconds?: number;
  onProgress?: (progressSeconds: number, durationSeconds: number) => void;
  onEnded?: () => void;
}

const PROGRESS_INTERVAL_MS = 5000;

export function VideoPlayer({
  src,
  poster,
  title,
  initialSeconds,
  onProgress,
  onEnded,
}: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const onLoaded = () => {
      if (initialSeconds && initialSeconds > 1 && initialSeconds < video.duration - 10) {
        try {
          video.currentTime = initialSeconds;
        } catch {
          /* noop */
        }
      }
    };

    video.addEventListener('loadedmetadata', onLoaded);
    return () => video.removeEventListener('loadedmetadata', onLoaded);
  }, [initialSeconds, src]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !onProgress) return;

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastSentRef.current < PROGRESS_INTERVAL_MS) return;
      lastSentRef.current = now;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      onProgress(Math.floor(video.currentTime), Math.floor(duration));
    };

    const handleEnded = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      onProgress(Math.floor(duration), Math.floor(duration));
      onEnded?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onEnded]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black ring-1 ring-white/5">
      <video
        ref={ref}
        src={src}
        poster={poster ?? undefined}
        controls
        playsInline
        className="aspect-video w-full"
        aria-label={title ?? 'Video player'}
      />
    </div>
  );
}
