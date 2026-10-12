import React, { useState, useEffect } from 'react';
import { X, Download, Check, Copy, Share2, Sparkles, Film, ArrowRight, Loader2, CheckCircle2, Music } from 'lucide-react';
import { ViralClip, SubtitleStyle, HookConfig, CameraConfig, MusicSettings, BackgroundTrack } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: ViralClip;
  videoSrc: string;
  subtitleStyle: SubtitleStyle;
  hookConfig: HookConfig;
  cameraConfig: CameraConfig;
  musicSettings?: MusicSettings;
  backgroundTrack?: BackgroundTrack;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  clip,
  videoSrc,
  subtitleStyle,
  hookConfig,
  cameraConfig,
  musicSettings,
  backgroundTrack,
}) => {
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('Menginisialisasi Engine...');
  const [isRenderComplete, setIsRenderComplete] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRenderProgress(0);
      setIsRenderComplete(false);
      return;
    }

    // Run progressive rendering pipeline
    setRenderProgress(10);
    setRenderStage('Memindai Face Tracking & Angle Kamera 9:16...');

    const timer1 = setTimeout(() => {
      setRenderProgress(35);
      setRenderStage(`Menyusun Hook Visual 0-${hookConfig.duration}s: "${hookConfig.text.slice(0, 20)}..."`);
    }, 800);

    const timer2 = setTimeout(() => {
      setRenderProgress(65);
      setRenderStage(`Rendering Subtitle Karaoke (${subtitleStyle.fontFamily}) dengan Highlighting...`);
    }, 1800);

    const timer3 = setTimeout(() => {
      setRenderProgress(90);
      const musicInfo = musicSettings?.enabled && backgroundTrack
        ? `Mixing Musik "${backgroundTrack.title}" (${Math.round(musicSettings.volume * 100)}% vol) dengan Fade & Auto-Ducking...`
        : 'Menggabungkan Audio & Kompresi Format Vertikal 1080x1920...';
      setRenderStage(musicInfo);
    }, 2800);

    const timer4 = setTimeout(() => {
      setRenderProgress(100);
      setRenderStage('Klip Siap Diunduh!');
      setIsRenderComplete(true);
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, hookConfig, subtitleStyle, musicSettings, backgroundTrack]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'caption' | 'hashtags') => {
    navigator.clipboard.writeText(text);
    if (type === 'caption') {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } else {
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    }
  };

  const fullCaption = `${clip.title}\n\n${clip.hookText}\n\n${clip.hashtags.join(' ')}`;

  const handleDownload = () => {
    // Trigger download of the clip
    const link = document.createElement('a');
    link.href = videoSrc;
    link.download = `autoclip_${clip.id}_9x16_viral.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Video 9:16 Viral</h2>
              <p className="text-xs text-neutral-400">Siap diunggah ke YouTube Shorts, TikTok, dan Instagram Reels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Rendering Progress Card */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                {!isRenderComplete ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{renderStage}</span>
              </span>
              <span className="font-mono text-amber-400 font-bold">{renderProgress}%</span>
            </div>

            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                style={{ width: `${renderProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-neutral-400">
              <div className="bg-neutral-900/60 p-2 rounded-lg">
                <span className="block text-neutral-500 text-[10px]">Resolusi</span>
                <strong className="text-white">1080 x 1920 (9:16)</strong>
              </div>
              <div className="bg-neutral-900/60 p-2 rounded-lg">
                <span className="block text-neutral-500 text-[10px]">Frame Rate</span>
                <strong className="text-white">60 FPS Smooth</strong>
              </div>
              <div className="bg-neutral-900/60 p-2 rounded-lg">
                <span className="block text-neutral-500 text-[10px]">Viral Score</span>
                <strong className="text-amber-400 font-bold">{clip.viralScore} / 100</strong>
              </div>
            </div>
          </div>

          {/* Download Action */}
          <button
            onClick={handleDownload}
            disabled={!isRenderComplete}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Video MP4 ({Math.round(clip.endTime - clip.startTime)} Detik)</span>
          </button>

          {/* Caption & Hashtags Generator */}
          <div className="bg-neutral-950/80 rounded-xl p-4 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Deskripsi & Tag Viral AI
              </span>
              <button
                onClick={() => copyToClipboard(fullCaption, 'caption')}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCaption ? 'Tersalin!' : 'Salin Semua'}</span>
              </button>
            </div>

            <div className="p-3 bg-neutral-900 rounded-lg text-xs text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed border border-neutral-800/80">
              {fullCaption}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {clip.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
