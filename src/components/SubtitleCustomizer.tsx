import React from 'react';
import { Type, Palette, Sparkles, Smile, AlignVerticalSpaceAround, Eye } from 'lucide-react';
import { SubtitleStyle } from '../types';
import { SUBTITLE_PRESETS } from '../data/subtitlePresets';

interface SubtitleCustomizerProps {
  style: SubtitleStyle;
  onUpdateStyle: (newStyle: Partial<SubtitleStyle>) => void;
}

export const SubtitleCustomizer: React.FC<SubtitleCustomizerProps> = ({
  style,
  onUpdateStyle,
}) => {
  const fontFamilies: Array<SubtitleStyle['fontFamily']> = [
    'Montserrat',
    'Bebas Neue',
    'Anton',
    'Poppins',
    'Space Grotesk',
    'Inter',
  ];

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Type className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Kustomisasi Teks & Subtitle</h3>
            <p className="text-[11px] text-neutral-400">Subtitle dinamis gaya karaoke Alex Hormozi & Submagic</p>
          </div>
        </div>
        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
          Karaoke Pop
        </span>
      </div>

      {/* Preset Cards */}
      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-2">
          Pilih Gaya Preset Populer
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(SUBTITLE_PRESETS).map(([key, preset]) => {
            const isSelected = style.presetName === key;
            return (
              <button
                key={key}
                onClick={() => onUpdateStyle(preset)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/30'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <div
                  className="text-xs font-black truncate px-1 py-1 rounded bg-black/60 mb-1"
                  style={{
                    fontFamily: preset.fontFamily,
                    color: preset.highlightColor,
                    WebkitTextStroke: `1px ${preset.strokeColor}`,
                  }}
                >
                  VIRAL TEXT
                </div>
                <span className="text-[11px] font-bold capitalize block text-neutral-300">
                  {key.replace('_', ' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Family Selector */}
      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-2">
          Pilihan Font Tipografi
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {fontFamilies.map((font) => (
            <button
              key={font}
              onClick={() => onUpdateStyle({ fontFamily: font })}
              className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all truncate ${
                style.fontFamily === font
                  ? 'bg-neutral-800 border-amber-400 text-amber-300 ring-1 ring-amber-400/30'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Colors & Appearance */}
      <div className="bg-neutral-950/80 rounded-xl p-3.5 border border-neutral-800 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
          <Palette className="w-3.5 h-3.5 text-neutral-400" />
          <span>Warna & Efek Highlight Kata</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1 text-[11px]">Warna Kata Aktif</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.highlightColor}
                onChange={(e) => onUpdateStyle({ highlightColor: e.target.value })}
                className="w-7 h-7 rounded border border-neutral-700 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-neutral-300 text-[11px]">{style.highlightColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 text-[11px]">Kata Kunci (Secondary)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.secondaryHighlightColor}
                onChange={(e) => onUpdateStyle({ secondaryHighlightColor: e.target.value })}
                className="w-7 h-7 rounded border border-neutral-700 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-neutral-300 text-[11px]">{style.secondaryHighlightColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 text-[11px]">Warna Garis Tepi (Stroke)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.strokeColor}
                onChange={(e) => onUpdateStyle({ strokeColor: e.target.value })}
                className="w-7 h-7 rounded border border-neutral-700 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-neutral-300 text-[11px]">{style.strokeColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 text-[11px]">Ukuran Font (Size)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={22}
                max={48}
                value={style.fontSize}
                onChange={(e) => onUpdateStyle({ fontSize: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-white text-[11px] w-6">{style.fontSize}px</span>
            </div>
          </div>
        </div>

        {/* Position Y & Words Per Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div>
            <div className="flex justify-between text-neutral-400 mb-1">
              <span>Posisi Vertikal Layar (Y)</span>
              <span className="font-mono text-white">{style.positionY}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={88}
              value={style.positionY}
              onChange={(e) => onUpdateStyle({ positionY: Number(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-neutral-400 mb-1">
              <span>Kata Per Tampilan Layar</span>
              <span className="font-mono text-white">{style.wordsPerScreen} kata</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => onUpdateStyle({ wordsPerScreen: num })}
                  className={`flex-1 py-1 rounded-md text-xs font-bold transition-colors ${
                    style.wordsPerScreen === num
                      ? 'bg-amber-400 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-neutral-800/80 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
            <input
              type="checkbox"
              checked={style.showEmoji}
              onChange={(e) => onUpdateStyle({ showEmoji: e.target.checked })}
              className="rounded accent-amber-400"
            />
            <span>Tampilkan Emoji Otomatis (🔥 🧠 💰 😱)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
            <input
              type="checkbox"
              checked={style.uppercase}
              onChange={(e) => onUpdateStyle({ uppercase: e.target.checked })}
              className="rounded accent-amber-400"
            />
            <span>HURUF KAPITAL SEMUA (ALL CAPS)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
            <input
              type="checkbox"
              checked={style.boxBackground}
              onChange={(e) => onUpdateStyle({ boxBackground: e.target.checked })}
              className="rounded accent-amber-400"
            />
            <span>Kotak Background Transparan</span>
          </label>
        </div>
      </div>
    </div>
  );
};
