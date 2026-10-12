import React, { useRef } from 'react';
import { Scissors, Play, Pause, RotateCcw, Sparkles, Video, SplitSquareVertical, User } from 'lucide-react';
import { ViralClip, CameraAngleType, HookConfig } from '../types';

interface TimelineTrimmerProps {
  clip: ViralClip;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  hookConfig: HookConfig;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onTrimChange: (startDelta: number, endDelta: number) => void;
}

export const TimelineTrimmer: React.FC<TimelineTrimmerProps> = ({
  clip,
  currentTime,
  duration,
  isPlaying,
  hookConfig,
  onTogglePlay,
  onSeek,
  onTrimChange,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const safeDuration = duration > 0 ? duration : 35;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));
  const hookWidthPercent = Math.min(100, (hookConfig.duration / safeDuration) * 100);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * safeDuration);
  };

  const getAngleColor = (angle: CameraAngleType) => {
    switch (angle) {
      case 'speaker_a':
        return 'bg-blue-600/70 border-blue-400 text-blue-200';
      case 'speaker_b':
        return 'bg-emerald-600/70 border-emerald-400 text-emerald-200';
      case 'split_screen':
        return 'bg-purple-600/70 border-purple-400 text-purple-200';
      default:
        return 'bg-neutral-600/70 border-neutral-400 text-neutral-200';
    }
  };

  const getAngleLabel = (angle: CameraAngleType) => {
    switch (angle) {
      case 'speaker_a':
        return 'Host Cam';
      case 'speaker_b':
        return 'Guest Cam';
      case 'split_screen':
        return 'Split 50/50';
      default:
        return 'Wide Shot';
    }
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5 space-y-3">
      {/* Timeline Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="w-7 h-7 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-bold hover:bg-amber-300 active:scale-95 transition-all shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
          <div className="font-mono text-neutral-200 text-xs">
            <span className="text-amber-400 font-bold">{currentTime.toFixed(1)}s</span>
            <span className="text-neutral-500"> / {safeDuration.toFixed(1)}s</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span>Host</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Guest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
            <span>Split</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span>Hook Intro</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Track Timeline */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative h-16 bg-neutral-950 rounded-xl border border-neutral-800 cursor-pointer overflow-hidden select-none"
      >
        {/* Track 1: Hook Segment Indicator */}
        {hookConfig.enabled && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-amber-400/20 border-r-2 border-amber-400 z-10 pointer-events-none flex items-start p-1"
            style={{ width: `${hookWidthPercent}%` }}
          >
            <span className="text-[9px] font-black uppercase text-amber-300 tracking-wider bg-black/70 px-1 py-0.5 rounded leading-none">
              🎯 HOOK ({hookConfig.duration}s)
            </span>
          </div>
        )}

        {/* Track 2: Simulated Waveform Bars */}
        <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none opacity-25">
          {Array.from({ length: 64 }).map((_, i) => {
            const heightFactor = Math.sin(i * 0.4) * 0.5 + 0.5;
            const h = 20 + heightFactor * 55;
            return (
              <div
                key={i}
                className="w-1 bg-neutral-400 rounded-full"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>

        {/* Track 3: Camera Cut Angles */}
        <div className="absolute bottom-1 inset-x-1 h-6 flex gap-0.5 z-10 pointer-events-none">
          {clip.cameraAngles.map((cut, idx) => {
            const cutWidth = Math.max(5, ((cut.endSec - cut.startSec) / safeDuration) * 100);
            return (
              <div
                key={idx}
                className={`h-full rounded text-[10px] font-bold border flex items-center justify-center px-1 truncate shadow-sm ${getAngleColor(
                  cut.angle
                )}`}
                style={{ width: `${cutWidth}%` }}
                title={`${getAngleLabel(cut.angle)}: ${cut.activeSpeaker} (${cut.startSec}s - ${cut.endSec}s)`}
              >
                <span className="truncate">{getAngleLabel(cut.angle)}</span>
              </div>
            );
          })}
        </div>

        {/* Scrubber Playhead Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none shadow-[0_0_10px_white]"
          style={{ left: `${progressPercent}%` }}
        >
          <div className="w-3 h-3 bg-white border border-neutral-900 rounded-full -ml-[5px] -mt-0.5 shadow-md" />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
        <span className="flex items-center gap-1">
          <Scissors className="w-3.5 h-3.5 text-neutral-500" />
          Klip otomatis dipotong pada jeda kalimat alami (30-60 detik)
        </span>
        <span className="text-neutral-500">Klik timeline untuk lompat ke detik yang dipilih</span>
      </div>
    </div>
  );
};
