import React from 'react';
import { Camera, SplitSquareVertical, User, Sliders, Check, Sparkles, RefreshCw } from 'lucide-react';
import { CameraConfig, ViralClip } from '../types';

interface CameraAngleControlsProps {
  cameraConfig: CameraConfig;
  onUpdateConfig: (newConfig: Partial<CameraConfig>) => void;
  clip: ViralClip;
}

export const CameraAngleControls: React.FC<CameraAngleControlsProps> = ({
  cameraConfig,
  onUpdateConfig,
  clip,
}) => {
  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Pemindaian Angle Kamera Podcast</h3>
            <p className="text-[11px] text-neutral-400">Auto Reframe 9:16 untuk video multi-speaker</p>
          </div>
        </div>
        <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
          Smart Face Tracking
        </span>
      </div>

      {/* Mode Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => onUpdateConfig({ mode: 'auto' })}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            cameraConfig.mode === 'auto'
              ? 'bg-blue-600/20 border-blue-400 text-white shadow-sm ring-1 ring-blue-400/30'
              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {cameraConfig.mode === 'auto' && <Check className="w-3 h-3 text-blue-400" />}
          </div>
          <p className="text-xs font-bold text-white">Auto AI Switch</p>
          <p className="text-[10px] text-neutral-400">Pindah ke siapa yang bicara</p>
        </button>

        <button
          onClick={() => onUpdateConfig({ mode: 'speaker_a' })}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            cameraConfig.mode === 'speaker_a'
              ? 'bg-blue-600/20 border-blue-400 text-white shadow-sm ring-1 ring-blue-400/30'
              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <User className="w-4 h-4 text-blue-400" />
            {cameraConfig.mode === 'speaker_a' && <Check className="w-3 h-3 text-blue-400" />}
          </div>
          <p className="text-xs font-bold text-white">Fokus Host (Kiri)</p>
          <p className="text-[10px] text-neutral-400">Kunci sudut kamera ke Host</p>
        </button>

        <button
          onClick={() => onUpdateConfig({ mode: 'speaker_b' })}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            cameraConfig.mode === 'speaker_b'
              ? 'bg-blue-600/20 border-blue-400 text-white shadow-sm ring-1 ring-blue-400/30'
              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <User className="w-4 h-4 text-emerald-400" />
            {cameraConfig.mode === 'speaker_b' && <Check className="w-3 h-3 text-blue-400" />}
          </div>
          <p className="text-xs font-bold text-white">Fokus Tamu (Kanan)</p>
          <p className="text-[10px] text-neutral-400">Kunci sudut ke bintang tamu</p>
        </button>

        <button
          onClick={() => onUpdateConfig({ mode: 'split' })}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            cameraConfig.mode === 'split'
              ? 'bg-purple-600/20 border-purple-400 text-white shadow-sm ring-1 ring-purple-400/30'
              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <SplitSquareVertical className="w-4 h-4 text-purple-400" />
            {cameraConfig.mode === 'split' && <Check className="w-3 h-3 text-purple-400" />}
          </div>
          <p className="text-xs font-bold text-white">Split-Screen 50/50</p>
          <p className="text-[10px] text-neutral-400">Host atas, Tamu bawah</p>
        </button>
      </div>

      {/* Manual Fine-Tuning Calibration */}
      <div className="bg-neutral-950/80 rounded-xl p-3.5 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-neutral-400" />
            Kalibrasi Posisi Wajah Pembicara
          </span>
          <button
            onClick={() =>
              onUpdateConfig({
                speakerAPosition: 25,
                speakerBPosition: 75,
                zoom: 1.35,
              })
            }
            className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset Posisi
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="flex justify-between text-neutral-400 mb-1">
              <span>Posisi Horisontal Host</span>
              <span className="font-mono text-white">{cameraConfig.speakerAPosition}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={cameraConfig.speakerAPosition}
              onChange={(e) => onUpdateConfig({ speakerAPosition: Number(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-neutral-400 mb-1">
              <span>Posisi Horisontal Tamu</span>
              <span className="font-mono text-white">{cameraConfig.speakerBPosition}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={90}
              value={cameraConfig.speakerBPosition}
              onChange={(e) => onUpdateConfig({ speakerBPosition: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
            <input
              type="checkbox"
              checked={cameraConfig.smoothTransition}
              onChange={(e) => onUpdateConfig({ smoothTransition: e.target.checked })}
              className="rounded accent-blue-500"
            />
            <span>Gunakan transisi panning halus saat pergantian angle</span>
          </label>
        </div>
      </div>
    </div>
  );
};
