import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Check,
  Flame,
  Wand2,
  RefreshCw,
  TrendingUp,
  Headphones,
  Radio,
  Zap,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { BackgroundTrack, MusicMood, MusicSettings, ViralClip } from '../types';
import { DEFAULT_TRACKS, getRecommendedMoodForScore } from '../data/recommendedTracks';

interface MusicRecommendationModuleProps {
  clip: ViralClip;
  settings: MusicSettings;
  onUpdateSettings: (newSettings: Partial<MusicSettings>) => void;
  onPreviewTrackInPlayer?: (trackUrl: string) => void;
}

export const MusicRecommendationModule: React.FC<MusicRecommendationModuleProps> = ({
  clip,
  settings,
  onUpdateSettings,
}) => {
  const [tracks, setTracks] = useState<BackgroundTrack[]>(DEFAULT_TRACKS);
  const [activeMoodFilter, setActiveMoodFilter] = useState<MusicMood | 'all'>('all');
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);

  // Lyria Generation states
  const [isGeneratingLyria, setIsGeneratingLyria] = useState<boolean>(false);
  const [lyriaPrompt, setLyriaPrompt] = useState<string>('');
  const [lyriaError, setLyriaError] = useState<string | null>(null);
  const [showLyriaGenerator, setShowLyriaGenerator] = useState<boolean>(false);

  // Audio element for standalone card preview
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const emotionScore = clip.metrics?.emotionImpact ?? 90;
  const recommendedMood = getRecommendedMoodForScore(emotionScore);

  // Fetch AI emotion analysis on clip change
  useEffect(() => {
    let isMounted = true;
    const fetchAnalysis = async () => {
      setIsLoadingAnalysis(true);
      try {
        const res = await fetch('/api/recommend-music', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emotionScore,
            clipTitle: clip.title,
            clipReason: clip.viralReason,
            duration: Math.round(clip.endTime - clip.startTime),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAiAnalysis(data);
            if (data.suggestedPrompts && data.suggestedPrompts.length > 0) {
              setLyriaPrompt(data.suggestedPrompts[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch AI music analysis:', err);
      } finally {
        if (isMounted) setIsLoadingAnalysis(false);
      }
    };

    fetchAnalysis();

    // Default select the best matching track if none selected
    if (!settings.selectedTrackId) {
      const bestTrack = DEFAULT_TRACKS.find((t) => t.mood === recommendedMood.mood) || DEFAULT_TRACKS[0];
      onUpdateSettings({ selectedTrackId: bestTrack.id });
    }

    return () => {
      isMounted = false;
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, [clip.id]);

  // Audio card preview toggle
  const toggleTrackPreview = (track: BackgroundTrack) => {
    if (previewingTrackId === track.id) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setPreviewingTrackId(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      const audio = new Audio(track.audioUrl);
      audio.volume = Math.max(0.2, settings.volume * 1.5);
      audio.play().catch((err) => console.warn('Preview audio play error:', err));
      audio.onended = () => setPreviewingTrackId(null);
      audioPreviewRef.current = audio;
      setPreviewingTrackId(track.id);
    }
  };

  // Generate with Lyria
  const handleGenerateLyria = async () => {
    if (!lyriaPrompt.trim()) return;
    setIsGeneratingLyria(true);
    setLyriaError(null);

    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: lyriaPrompt.trim(),
          duration: 30,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghasilkan musik dengan Lyria AI.');
      }

      if (data.audioUrl) {
        const newTrack: BackgroundTrack = {
          id: `lyria-${Date.now()}`,
          title: `Lyria AI: ${lyriaPrompt.slice(0, 28)}...`,
          artist: 'Google Lyria 3 Clip',
          mood: aiAnalysis?.mood || recommendedMood.mood,
          moodLabel: 'AI Generated',
          targetEmotionRange: [emotionScore - 5, emotionScore + 5],
          bpm: aiAnalysis?.recommendedBpm || 115,
          duration: 30,
          audioUrl: data.audioUrl,
          isAiGenerated: true,
          tags: ['#lyria3', '#aimusic', '#viralscore', '#customclip'],
          description: `Dihasilkan khusus dengan prompt: "${lyriaPrompt}"`,
        };

        setTracks((prev) => [newTrack, ...prev]);
        onUpdateSettings({ selectedTrackId: newTrack.id, enabled: true });
        setShowLyriaGenerator(false);
      }
    } catch (err: any) {
      console.error(err);
      setLyriaError(err.message || 'Gagal generate audio. Pastikan API key mendukung model Lyria.');
    } finally {
      setIsGeneratingLyria(false);
    }
  };

  const filteredTracks = activeMoodFilter === 'all'
    ? tracks
    : tracks.filter((t) => t.mood === activeMoodFilter);

  const selectedTrack = tracks.find((t) => t.id === settings.selectedTrackId);

  const getMoodBadgeColor = (mood: MusicMood) => {
    switch (mood) {
      case 'dramatic':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'energetic':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'motivational':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'mysterious':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'ambient':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Music className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Rekomendasi Background Music AI</h3>
            <p className="text-[11px] text-neutral-400">
              Menyesuaikan ritme & emosi video dengan auto-ducking vokal
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-neutral-400">Aktifkan Musik</span>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onUpdateSettings({ enabled: e.target.checked })}
            className="rounded accent-amber-400 w-4 h-4 cursor-pointer"
          />
        </label>
      </div>

      {/* 1. Emotion Score & AI Recommendation Insight */}
      <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800/90 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Emotional Impact: {emotionScore}%</span>
            </div>
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              Klip: "{clip.title.slice(0, 32)}..."
            </span>
          </div>

          <button
            onClick={() => setShowLyriaGenerator(!showLyriaGenerator)}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 transition-all hover:bg-amber-400/20"
          >
            <Sparkles className="w-3 h-3" />
            <span>Generate Lyria 3</span>
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          {aiAnalysis?.emotionAnalysis || recommendedMood.reason}
        </p>

        {aiAnalysis?.keyInstruments && (
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-1 text-neutral-400 border-t border-neutral-900">
            <span className="text-neutral-500">Instrumen Rekomendasi:</span>
            {aiAnalysis.keyInstruments.map((inst: string, i: number) => (
              <span key={i} className="bg-neutral-900 px-2 py-0.5 rounded text-neutral-300 font-medium">
                {inst}
              </span>
            ))}
            <span className="ml-auto font-mono text-amber-400/90 font-bold">
              Tempo: {aiAnalysis.recommendedBpm || 115} BPM
            </span>
          </div>
        )}
      </div>

      {/* 2. Lyria AI Music Generator Drawer */}
      {showLyriaGenerator && (
        <div className="p-3.5 bg-gradient-to-b from-amber-950/20 to-neutral-950 border border-amber-500/30 rounded-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              Generator Musik Google Lyria (lyria-3-clip-preview)
            </span>
            <span className="text-[10px] text-neutral-400">Durasi Klip: 30 Detik</span>
          </div>

          <textarea
            rows={2}
            value={lyriaPrompt}
            onChange={(e) => setLyriaPrompt(e.target.value)}
            placeholder="Deskripsikan musik latar yang diinginkan (misal: Heavy synth pulse with dark 808 sub-bass, 120 bpm)..."
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
          />

          {aiAnalysis?.suggestedPrompts && (
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-400 block font-semibold">
                Prompt Cepat Sesuai Emosi Klip:
              </span>
              <div className="flex flex-col gap-1">
                {aiAnalysis.suggestedPrompts.slice(0, 2).map((p: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLyriaPrompt(p)}
                    className="text-left text-[11px] text-amber-300/80 hover:text-amber-200 bg-neutral-900/60 hover:bg-neutral-900 px-2 py-1 rounded truncate border border-neutral-800 transition-colors"
                  >
                    💡 "{p}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {lyriaError && (
            <div className="p-2 bg-red-950/50 border border-red-800/80 rounded text-[11px] text-red-300 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <span>{lyriaError}</span>
            </div>
          )}

          <button
            onClick={handleGenerateLyria}
            disabled={isGeneratingLyria}
            className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGeneratingLyria ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menghasilkan Musik 30s dengan Lyria...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate Custom Track Sekarang</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 3. Filter Mood Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setActiveMoodFilter('all')}
          className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
            activeMoodFilter === 'all'
              ? 'bg-amber-400 text-neutral-950 shadow-sm'
              : 'bg-neutral-950 text-neutral-400 hover:text-white'
          }`}
        >
          Semua Track ({tracks.length})
        </button>
        {(['dramatic', 'energetic', 'motivational', 'mysterious', 'ambient'] as MusicMood[]).map((mood) => {
          const isMoodSelected = activeMoodFilter === mood;
          const count = tracks.filter((t) => t.mood === mood).length;
          return (
            <button
              key={mood}
              onClick={() => setActiveMoodFilter(mood)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all capitalize shrink-0 ${
                isMoodSelected
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white'
              }`}
            >
              {mood} ({count})
            </button>
          );
        })}
      </div>

      {/* 4. Track List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {filteredTracks.map((track) => {
          const isSelected = settings.selectedTrackId === track.id;
          const isPreviewing = previewingTrackId === track.id;

          return (
            <div
              key={track.id}
              className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-neutral-800/90 border-amber-400 ring-1 ring-amber-400/30 shadow-md shadow-amber-500/10'
                  : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
              }`}
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                {/* Audio Preview Play/Pause button */}
                <button
                  type="button"
                  onClick={() => toggleTrackPreview(track)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md ${
                    isPreviewing
                      ? 'bg-amber-400 text-neutral-950'
                      : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
                  title={isPreviewing ? 'Stop Preview' : 'Dengarkan Preview'}
                >
                  {isPreviewing ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getMoodBadgeColor(track.mood)}`}>
                      {track.moodLabel}
                    </span>
                    {track.isAiGenerated && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        Lyria 3
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {track.description}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono mt-1">
                    <span>{track.bpm} BPM</span>
                    <span>·</span>
                    <span>{track.duration}s</span>
                    <span>·</span>
                    <span>Emosi {track.targetEmotionRange[0]}-{track.targetEmotionRange[1]}%</span>
                  </div>
                </div>
              </div>

              {/* Select Button */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ selectedTrackId: track.id, enabled: true })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Terpilih</span>
                    </>
                  ) : (
                    <span>Pilih Track</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Music Mixer: Volume & Fade-in / Fade-out Envelope Controls */}
      <div className="bg-neutral-950/80 rounded-xl p-3.5 border border-neutral-800 space-y-3.5">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Mixer & Efek Envelope Musik
          </span>
          {selectedTrack && (
            <span className="text-[11px] text-amber-300 truncate max-w-xs font-medium">
              Aktif: {selectedTrack.title}
            </span>
          )}
        </div>

        {/* Volume Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
              Volume Background Musik
            </span>
            <span className="font-mono text-white font-bold">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={settings.volume}
              onChange={(e) => onUpdateSettings({ volume: Number(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            {/* Quick volume presets */}
            <div className="flex gap-1 shrink-0">
              {[
                { label: 'Lembut', val: 0.15 },
                { label: 'Ideal (25%)', val: 0.25 },
                { label: 'Tinggi', val: 0.45 },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onUpdateSettings({ volume: p.val })}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    Math.abs(settings.volume - p.val) < 0.03
                      ? 'bg-amber-400 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fade In & Fade Out Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          {/* Fade-in */}
          <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Fade-In Awal Klip
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {settings.fadeInSec.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={4}
              step={0.5}
              value={settings.fadeInSec}
              onChange={(e) => onUpdateSettings({ fadeInSec: Number(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-neutral-500">
              Volume naik perlahan dari 0 ke {Math.round(settings.volume * 100)}% di detik pertama.
            </p>
          </div>

          {/* Fade-out */}
          <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Fade-Out Akhir Klip
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {settings.fadeOutSec.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={4}
              step={0.5}
              value={settings.fadeOutSec}
              onChange={(e) => onUpdateSettings({ fadeOutSec: Number(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-neutral-500">
              Volume mengecil menjelang video selesai agar tidak terpotong kasar.
            </p>
          </div>
        </div>

        {/* Auto Ducking Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
            <input
              type="checkbox"
              checked={settings.autoDucking}
              onChange={(e) => onUpdateSettings({ autoDucking: e.target.checked })}
              className="rounded accent-amber-400 w-4 h-4 cursor-pointer"
            />
            <span>
              <strong>Auto-Ducking Vokal</strong> (Volume musik turun otomatis saat ada suara dialog)
            </span>
          </label>
          <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline">
            Standar Podcast Pro (-35dB)
          </span>
        </div>
      </div>
    </div>
  );
};
