import React from 'react';
import { Flame, Clock, Sparkles, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { ViralClip } from '../types';

interface ClipSelectorProps {
  clips: ViralClip[];
  selectedClipId: string;
  onSelectClip: (clip: ViralClip) => void;
}

export const ClipSelector: React.FC<ClipSelectorProps> = ({
  clips,
  selectedClipId,
  onSelectClip,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Hasil Analisis Klip Viral</h3>
            <p className="text-[11px] text-neutral-400">{clips.length} momen berpotensi tinggi terdeteksi</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-800 px-2.5 py-1 rounded-md">
          Format 9:16 Shorts/Reels
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
        {clips.map((clip, index) => {
          const isSelected = clip.id === selectedClipId;
          const duration = Math.round(clip.endTime - clip.startTime);

          return (
            <div
              key={clip.id}
              onClick={() => onSelectClip(clip)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-neutral-800/90 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30'
                  : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-neutral-500 font-bold">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    <Zap className="w-3 h-3 fill-current" />
                    <span>Viral Score: {clip.viralScore}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{duration}s</span>
                  <span>({formatTime(clip.startTime)} - {formatTime(clip.endTime)})</span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-white mt-2 line-clamp-2 leading-relaxed">
                {clip.title}
              </h4>

              {/* Hook snippet */}
              <div className="mt-1.5 text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-800/40 rounded px-2 py-1 line-clamp-1 font-medium">
                🎯 Hook: {clip.hookText}
              </div>

              {/* Reason */}
              <p className="mt-1.5 text-[11px] text-neutral-400 line-clamp-2 leading-tight">
                {clip.viralReason}
              </p>

              {/* Mini Metrics */}
              <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-400">
                <div className="flex items-center gap-3">
                  <span>Hook: <strong className="text-neutral-200">{clip.metrics.hookStrength}%</strong></span>
                  <span>Retensi: <strong className="text-neutral-200">{clip.metrics.retentionScore}%</strong></span>
                  <span>Emosi: <strong className="text-neutral-200">{clip.metrics.emotionImpact}%</strong></span>
                </div>
                {isSelected && (
                  <span className="text-amber-400 font-bold flex items-center gap-0.5">
                    Aktif <ChevronRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
