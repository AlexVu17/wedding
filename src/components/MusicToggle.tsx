import React, { useState, useRef, useEffect } from "react";

interface MusicToggleProps {
  audioUrl: string;
  shouldAutoPlay?: boolean;
}

export const MusicToggle: React.FC<MusicToggleProps> = ({
  audioUrl,
  shouldAutoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasManualInteractionRef = useRef(false);

  const handleToggle = async () => {
    if (!audioRef.current) return;
    hasManualInteractionRef.current = true;
    setErrorMessage("");

    try {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.muted = false;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setErrorMessage("Chưa phát được nhạc. Bạn bấm thử lại nhé.");
      console.error("Lỗi phát nhạc:", err);
    }
  };

  // Try to autoplay when shouldAutoPlay is true
  useEffect(() => {
    if (!shouldAutoPlay || !audioRef.current) return;

    const tryAutoplay = async () => {
      if (!audioRef.current || hasManualInteractionRef.current) return;
      try {
        audioRef.current.muted = false;
        await audioRef.current.play();
        window.removeEventListener("pointerdown", handleFirstInteraction);
      } catch {
        // The visible button lets guests start playback if autoplay is blocked.
      }
    };

    const handleFirstInteraction = async (event: Event) => {
      if (!audioRef.current || hasManualInteractionRef.current) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(".music-button")) return;
      try {
        audioRef.current.muted = false;
        await audioRef.current.play();
        window.removeEventListener("pointerdown", handleFirstInteraction);
      } catch (err) {
        // ignore
      }
    };

    // Delay autoplay slightly to ensure browser readiness
    const timer = setTimeout(tryAutoplay, 500);
    window.addEventListener("pointerdown", handleFirstInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", handleFirstInteraction);
    };
  }, [shouldAutoPlay]);

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setErrorMessage("Chưa tải được nhạc. Bạn bấm thử lại nhé.");
        }}
      />
      <button
        type="button"
        onClick={handleToggle}
        className={`music-button fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#741d35] md:right-6 md:top-6 ${
          isPlaying ? "playing" : "paused"
        }`}
        title={isPlaying ? "Tắt nhạc" : "Bật nhạc"}
        aria-pressed={isPlaying}
      >
        <span className="music-icon relative flex h-5 w-5 items-center justify-center" aria-hidden="true">
          <svg
            className="note w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        </span>
        <span>{isPlaying ? "Tắt nhạc" : "Bật nhạc"}</span>
      </button>
      {errorMessage && (
        <p role="status" className="fixed right-3 top-[calc(max(0.75rem,env(safe-area-inset-top))+3.25rem)] z-50 max-w-60 rounded-xl bg-[#fffdf9] px-3 py-2 text-xs text-[#741d35] shadow-lg md:right-6 md:top-20">
          {errorMessage}
        </p>
      )}
    </>
  );
};
