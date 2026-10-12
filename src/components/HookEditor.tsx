import React, { useState } from 'react';
import { Sparkles, Zap, Volume2, Wand2, RefreshCw, Check, Clock, Flame, AlertTriangle } from 'lucide-react';
import { HookConfig, ViralClip } from '../types';
import { playHookSfx } from '../utils/audioFx';

interface HookEditorProps {
  hookConfig: HookConfig;
  clip: ViralClip;
  onUpdateHook: (newHook: Partial<HookConfig>) => void;
  onReplayHook: () => void;
}

export const HookEditor: React.FC<HookEditorProps> = ({
  hookConfig,
  clip,
  onUpdateHook,
  onReplayHook,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customGeneratedHooks, setCustomGeneratedHooks] = useState<string[]>([]);

  const handleGenerateHooks = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: clip.title,
          clipTitle: clip.title,
          style: 'Viral TikTok / Reels Hook',
        }),
      });
      const data = await res.json();
      if (data.hooks && Array.isArray(data.hooks)) {
        const texts = data.hooks.map((h: any) => h.text);
        setCustomGeneratedHooks(texts);
      }
    } catch (e) {
      console.warn('Failed to generate extra hooks:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const hookStyles: Array<{ id: HookConfig['style']; label: string; previewClass: string }> = [
    { id: 'yellow_marker', label: 'Marker Kuning Viral', previewClass: 'bg-amber-400 text-black font-black' },
    { id: 'breaking_news', label: 'Breaking News Merah', previewClass: 'bg-red-600 text-white font-black' },
    { id: 'caution_tape', label: 'Peringatan / Caution', previewClass: 'bg-neutral-900 border border-amber-400 text-amber-300 font-bold' },
    { id: 'neon_glow', label: 'Cyber Neon Glow', previewClass: 'bg-cyan-950 border border-cyan-400 text-cyan-200 font-bold' },
    { id: 'sticker_badge', label: 'Pop Sticker Gradien', previewClass: 'bg-gradient-to-r from-violet-600 to-rose-600 text-white font-bold' },
  ];

  const allAvailableHooks = [
    clip.hookText,
    ...clip.alternativeHooks,
    ...customGeneratedHooks,
  ].filter(Boolean);

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Generator Hook Pembuka (0-3s)</h3>
            <p className="text-[11px] text-neutral-400">Pancing rasa penasaran penonton agar tidak skip video</p>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-neutral-400">Aktifkan Hook</span>
          <input
            type="checkbox"
            checked={hookConfig.enabled}
            onChange={(e) => onUpdateHook({ enabled: e.target.checked })}
            className="rounded accent-amber-400 w-4 h-4 cursor-pointer"
          />
        </label>
      </div>

      {hookConfig.enabled && (
        <>
          {/* Hook Text Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Teks Hook Pembuka
              </label>
              <button
                type="button"
                onClick={onReplayHook}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Zap className="w-3 h-3" /> Test Animasi Hook
              </button>
            </div>
            <textarea
              rows={2}
              value={hookConfig.text}
              onChange={(e) => onUpdateHook({ text: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors resize-none font-bold"
              placeholder="Ketik hook viral Anda di sini..."
            />
          </div>

          {/* Quick Select AI Hooks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pilihan Hook AI (Klik untuk Pakai)
              </label>
              <button
                onClick={handleGenerateHooks}
                disabled={isGenerating}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Wand2 className="w-3 h-3 text-amber-400" />
                {isGenerating ? 'Membuat...' : 'Buat Hook Baru'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {allAvailableHooks.map((hText, i) => {
                const isCurrent = hookConfig.text === hText;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onUpdateHook({ text: hText });
                      onReplayHook();
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <span className="truncate pr-2">{hText}</span>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hook Style Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Desain Banner Hook
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {hookStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    onUpdateHook({ style: style.id });
                    onReplayHook();
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    hookConfig.style === style.id
                      ? 'bg-neutral-800 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/30'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className={`text-[10px] py-1 px-1.5 rounded mb-1 truncate ${style.previewClass}`}>
                    HOOK PREVIEW
                  </div>
                  <span className="text-[11px] font-semibold block truncate">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings: Duration & Sound */}
          <div className="bg-neutral-950/80 rounded-xl p-3 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5" /> Durasi Hook:
              </span>
              <input
                type="range"
                min={1.5}
                max={5.0}
                step={0.5}
                value={hookConfig.duration}
                onChange={(e) => onUpdateHook({ duration: Number(e.target.value) })}
                className="w-24 accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-white text-[11px]">{hookConfig.duration}s</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-neutral-300 text-xs">
              <input
                type="checkbox"
                checked={hookConfig.playSound}
                onChange={(e) => {
                  onUpdateHook({ playSound: e.target.checked });
                  if (e.target.checked) playHookSfx('whoosh');
                }}
                className="rounded accent-amber-400"
              />
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Efek Suara Whoosh / Punch</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
};
