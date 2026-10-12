import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye, Maximize, Sparkles, Film, SplitSquareVertical } from 'lucide-react';
import {
  ViralClip,
  SubtitleStyle,
  HookConfig,
  CameraConfig,
  TimedWord,
  TimedSentence,
  CameraAngleType,
  MusicSettings,
  BackgroundTrack,
} from '../types';
import { playHookSfx } from '../utils/audioFx';
import { Music } from 'lucide-react';

interface VideoPlayer916Props {
  clip: ViralClip;
  videoSrc: string;
  isYouTube?: boolean;
  youTubeId?: string;
  subtitleStyle: SubtitleStyle;
  hookConfig: HookConfig;
  cameraConfig: CameraConfig;
  musicSettings?: MusicSettings;
  backgroundTrack?: BackgroundTrack;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
}

export const VideoPlayer916: React.FC<VideoPlayer916Props> = ({
  clip,
  videoSrc,
  isYouTube,
  youTubeId,
  subtitleStyle,
  hookConfig,
  cameraConfig,
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onDurationChange,
  onTogglePlay,
  onSeek,
  musicSettings,
  backgroundTrack,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasPlayedHookSound, setHasPlayedHookSound] = useState(false);

  // Sync HTML5 video element with parent state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && video.paused) {
      video.play().catch((err) => console.warn('Video play error:', err));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying]);

  // Sync background music with play/pause state
  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    if (!bgAudio) return;

    if (isPlaying && musicSettings?.enabled && backgroundTrack) {
      bgAudio.play().catch((err) => console.warn('Background audio play error:', err));
    } else if (!isPlaying && !bgAudio.paused) {
      bgAudio.pause();
    }
  }, [isPlaying, musicSettings?.enabled, backgroundTrack]);

  // Sync background music volume with fade-in, fade-out, and voice auto-ducking
  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    if (!bgAudio || !musicSettings?.enabled) return;

    let targetVol = musicSettings.volume;

    // Fade-in envelope
    if (musicSettings.fadeInSec > 0 && currentTime < musicSettings.fadeInSec) {
      const fadeProgress = Math.max(0, currentTime / musicSettings.fadeInSec);
      targetVol = targetVol * fadeProgress;
    }

    // Fade-out envelope
    const remainingTime = duration - currentTime;
    if (musicSettings.fadeOutSec > 0 && remainingTime < musicSettings.fadeOutSec) {
      const fadeProgress = Math.max(0, remainingTime / musicSettings.fadeOutSec);
      targetVol = targetVol * fadeProgress;
    }

    // Auto-ducking: if speech is active at currentTime, duck music by 35%
    const isSpeechActive = clip.transcript.some(
      (s) => currentTime >= s.startSec && currentTime <= s.endSec
    );
    if (isSpeechActive && musicSettings.autoDucking) {
      targetVol = targetVol * 0.65;
    }

    bgAudio.volume = isMuted ? 0 : Math.max(0, Math.min(1, targetVol));
  }, [currentTime, duration, musicSettings, isMuted, clip.transcript]);

  // Hook sound trigger at start of clip
  useEffect(() => {
    if (currentTime < 0.3 && isPlaying && hookConfig.enabled && hookConfig.playSound && !hasPlayedHookSound) {
      playHookSfx('whoosh');
      setHasPlayedHookSound(true);
    } else if (currentTime > 1.0 && hasPlayedHookSound) {
      setHasPlayedHookSound(false);
    }
  }, [currentTime, isPlaying, hookConfig, hasPlayedHookSound]);

  // Calculate active camera angle based on current time & mode
  const currentAngleInfo = useMemo(() => {
    if (cameraConfig.mode !== 'auto') {
      return {
        angle: cameraConfig.mode as CameraAngleType,
        speaker: cameraConfig.mode === 'speaker_a' ? 'Speaker A (Host)' : cameraConfig.mode === 'speaker_b' ? 'Speaker B (Guest)' : 'Manual Mode',
      };
    }

    // In auto mode, find angle from clip.cameraAngles
    const activeCut = clip.cameraAngles.find(
      (c) => currentTime >= c.startSec && currentTime <= c.endSec
    );

    if (activeCut) {
      return {
        angle: activeCut.angle,
        speaker: activeCut.activeSpeaker,
      };
    }

    // Default alternate based on transcript speaker
    const currentSentence = clip.transcript.find(
      (s) => currentTime >= s.startSec && currentTime <= s.endSec
    );
    if (currentSentence) {
      const isHost = currentSentence.speakerId.includes('1') || currentSentence.speakerId.includes('a');
      return {
        angle: isHost ? ('speaker_a' as CameraAngleType) : ('speaker_b' as CameraAngleType),
        speaker: currentSentence.speakerName,
      };
    }

    return {
      angle: 'speaker_b' as CameraAngleType,
      speaker: 'Speaker',
    };
  }, [cameraConfig.mode, clip, currentTime]);

  // Find active sentence and active words for karaoke subtitle
  const activeSubtitle = useMemo(() => {
    const sentence = clip.transcript.find(
      (s) => currentTime >= s.startSec && currentTime <= s.endSec
    );
    if (!sentence) return null;

    // Words grouped by wordsPerScreen
    const words = sentence.words;
    if (!words || words.length === 0) return null;

    const activeWordIndex = words.findIndex(
      (w) => currentTime >= w.startSec && currentTime <= w.endSec
    );

    const safeIndex = activeWordIndex !== -1 ? activeWordIndex : 0;
    const groupSize = subtitleStyle.wordsPerScreen || 3;
    const groupStartIndex = Math.floor(safeIndex / groupSize) * groupSize;
    const currentGroup = words.slice(groupStartIndex, groupStartIndex + groupSize);

    return {
      sentence,
      words: currentGroup,
      activeWord: words[activeWordIndex] || null,
    };
  }, [clip.transcript, currentTime, subtitleStyle.wordsPerScreen]);

  // Check if hook overlay is active
  const isHookActive = hookConfig.enabled && currentTime <= hookConfig.duration;

  // Camera Pan X translation calculation for 9:16 crop from 16:9
  // 16:9 video scaled to fill 9:16 height requires horizontal shift
  const getCameraTransform = (angle: CameraAngleType) => {
    const zoom = cameraConfig.zoom || 1.35;

    if (angle === 'speaker_a') {
      // Pan to left speaker (Host)
      const posX = cameraConfig.speakerAPosition ?? 26; // percentage
      const offsetPercent = (posX - 50) * 0.8;
      return {
        transform: `scale(${zoom}) translateX(${-offsetPercent}%)`,
        transition: cameraConfig.smoothTransition ? 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
      };
    }

    if (angle === 'speaker_b') {
      // Pan to right speaker (Guest)
      const posX = cameraConfig.speakerBPosition ?? 74; // percentage
      const offsetPercent = (posX - 50) * 0.8;
      return {
        transform: `scale(${zoom}) translateX(${-offsetPercent}%)`,
        transition: cameraConfig.smoothTransition ? 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
      };
    }

    if (angle === 'wide_shot') {
      return {
        transform: `scale(1.05) translateX(0%)`,
        transition: 'transform 0.4s ease-out',
      };
    }

    return {
      transform: `scale(${zoom}) translateX(0%)`,
      transition: 'transform 0.4s ease-out',
    };
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const vidTime = videoRef.current.currentTime;
      onTimeUpdate(vidTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      onDurationChange(videoRef.current.duration);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const restartClip = () => {
    onSeek(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const isSplitScreen = currentAngleInfo.angle === 'split_screen';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-sm mx-auto">
      {/* 9:16 Canvas Phone Frame */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-neutral-800 ring-1 ring-neutral-700/50 select-none group"
      >
        {/* Dynamic Camera Angle Badge */}
        <div className="absolute top-3.5 left-3.5 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium shadow-lg pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-semibold text-amber-300">
            {isSplitScreen ? 'SPLIT CAM (50/50)' : currentAngleInfo.angle === 'speaker_a' ? 'CAM 1: HOST' : 'CAM 2: GUEST'}
          </span>
          <span className="text-neutral-400 text-[10px]">· {currentAngleInfo.speaker}</span>
        </div>

        {/* Background Music Active Badge */}
        {musicSettings?.enabled && backgroundTrack && (
          <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-bold shadow-lg pointer-events-none">
            <Music className="w-3 h-3 text-amber-400" />
            <span className="truncate max-w-[90px]">{backgroundTrack.title}</span>
            <span className="text-neutral-400 font-normal">({Math.round(musicSettings.volume * 100)}%)</span>
          </div>
        )}

        {/* Background Music Audio Element */}
        {musicSettings?.enabled && backgroundTrack && (
          <audio
            ref={bgAudioRef}
            src={backgroundTrack.audioUrl}
            loop={musicSettings.loop ?? true}
            preload="auto"
          />
        )}

        {/* Video Screen Content */}
        {!isSplitScreen ? (
          // Single Video with Smart Pan & Crop
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-neutral-950">
            <video
              ref={videoRef}
              src={videoSrc}
              playsInline
              muted={isMuted}
              loop
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={handleVideoLoadedMetadata}
              onClick={onTogglePlay}
              className="absolute w-[280%] h-full max-w-none object-cover cursor-pointer"
              style={getCameraTransform(currentAngleInfo.angle)}
            />
          </div>
        ) : (
          // Split Screen Mode: Top Half = Host, Bottom Half = Guest
          <div className="relative w-full h-full flex flex-col bg-neutral-950">
            {/* Top View: Speaker A (Host) */}
            <div className="relative w-full h-1/2 overflow-hidden border-b-2 border-amber-400/80 shadow-md">
              <video
                src={videoSrc}
                playsInline
                muted
                loop
                className="absolute w-[240%] h-[200%] max-w-none object-cover"
                style={{
                  transform: 'scale(1.2) translateX(24%) translateY(-10%)',
                }}
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-amber-300 font-bold border border-amber-500/30">
                HOST
              </div>
            </div>

            {/* Bottom View: Speaker B (Guest) */}
            <div className="relative w-full h-1/2 overflow-hidden">
              <video
                src={videoSrc}
                playsInline
                muted
                loop
                className="absolute w-[240%] h-[200%] max-w-none object-cover"
                style={{
                  transform: 'scale(1.2) translateX(-24%) translateY(-60%)',
                }}
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-amber-300 font-bold border border-amber-500/30">
                GUEST
              </div>
            </div>
          </div>
        )}

        {/* --- PUNCHY HOOK OVERLAY --- */}
        {isHookActive && (
          <div className="absolute top-14 inset-x-3 z-30 pointer-events-none flex flex-col items-center animate-bounce-short">
            {hookConfig.style === 'yellow_marker' && (
              <div className="bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm text-center shadow-2xl border-2 border-black transform -rotate-1 ring-4 ring-amber-300/40">
                <span className="block text-[10px] tracking-widest uppercase text-black/70 font-extrabold mb-0.5">
                  🔥 VIRAL HOOK ALERT
                </span>
                <span className="leading-tight drop-shadow-sm">{hookConfig.text}</span>
              </div>
            )}

            {hookConfig.style === 'breaking_news' && (
              <div className="w-full bg-red-600 text-white p-2.5 rounded-lg font-black text-xs sm:text-sm text-center shadow-2xl border border-red-400 ring-2 ring-red-500/40">
                <span className="inline-block bg-white text-red-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-black mr-1.5">
                  BREAKING
                </span>
                <span className="tracking-wide uppercase">{hookConfig.text}</span>
              </div>
            )}

            {hookConfig.style === 'caution_tape' && (
              <div className="bg-neutral-900 border-2 border-amber-400 text-amber-300 px-4 py-2 rounded-lg font-black text-xs text-center shadow-xl ring-2 ring-black">
                <span className="text-[10px] text-amber-400 font-mono block">⚠️ PERHATIAN KHUSUS</span>
                <span className="text-white">{hookConfig.text}</span>
              </div>
            )}

            {hookConfig.style === 'neon_glow' && (
              <div className="bg-cyan-950/90 text-cyan-200 border-2 border-cyan-400 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-center shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                <span className="text-[10px] text-cyan-400 block tracking-widest">⚡ WATCH TILL END</span>
                <span>{hookConfig.text}</span>
              </div>
            )}

            {hookConfig.style === 'sticker_badge' && (
              <div className="bg-gradient-to-r from-violet-600 to-rose-600 text-white px-4 py-2.5 rounded-2xl font-extrabold text-xs text-center shadow-xl border border-white/20 transform rotate-1">
                {hookConfig.text}
              </div>
            )}
          </div>
        )}

        {/* --- DYNAMIC KARAOKE SUBTITLE OVERLAY --- */}
        {activeSubtitle && (
          <div
            className="absolute inset-x-4 z-20 pointer-events-none flex flex-col items-center text-center transition-all duration-100"
            style={{
              top: `${subtitleStyle.positionY}%`,
              transform: 'translateY(-50%)',
            }}
          >
            <div
              className={`inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                subtitleStyle.boxBackground ? 'backdrop-blur-sm' : ''
              }`}
              style={{
                backgroundColor: subtitleStyle.boxBackground ? subtitleStyle.boxBgColor : 'transparent',
                fontFamily: subtitleStyle.fontFamily,
              }}
            >
              {activeSubtitle.words.map((wordObj, i) => {
                const isCurrentWord =
                  currentTime >= wordObj.startSec && currentTime <= wordObj.endSec;
                const isKeyWord = wordObj.isKeyWord;

                let wordColor = subtitleStyle.textColor;
                let scaleClass = 'scale-100';

                if (isCurrentWord) {
                  wordColor = subtitleStyle.highlightColor;
                  scaleClass = 'scale-115 font-black drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]';
                } else if (isKeyWord) {
                  wordColor = subtitleStyle.secondaryHighlightColor;
                }

                const displayText = subtitleStyle.uppercase
                  ? wordObj.word.toUpperCase()
                  : wordObj.word;

                return (
                  <span
                    key={`${wordObj.word}-${i}`}
                    className={`inline-block transition-transform duration-100 font-extrabold tracking-tight ${scaleClass}`}
                    style={{
                      fontSize: `${subtitleStyle.fontSize}px`,
                      color: wordColor,
                      WebkitTextStroke: `${subtitleStyle.strokeWidth}px ${subtitleStyle.strokeColor}`,
                      textShadow: '0 3px 6px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.9)',
                      lineHeight: 1.15,
                    }}
                  >
                    {displayText}
                    {subtitleStyle.showEmoji && wordObj.emoji && (
                      <span className="ml-1 text-base inline-block transform scale-110">
                        {wordObj.emoji}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Center Play/Pause button on hover */}
        <div
          onClick={onTogglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/25 transition-opacity cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-amber-400/90 text-neutral-950 flex items-center justify-center shadow-xl transform active:scale-90 transition-transform">
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </div>
        </div>

        {/* Bottom Quick Controls Bar */}
        <div className="absolute bottom-3 inset-x-3 z-30 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="p-1 hover:text-amber-400 transition-colors"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={restartClip}
              className="p-1 hover:text-amber-400 transition-colors"
              title="Ulangi Klip dari Awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleMute}
              className="p-1 hover:text-amber-400 transition-colors"
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="text-[11px] font-mono text-neutral-300">
            {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
          </div>
        </div>
      </div>
    </div>
  );
};
