import React from 'react';
import { Video, Sparkles, Youtube, Wand2, Download, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenInputModal: () => void;
  onOpenExportModal: () => void;
  onReset: () => void;
  hasActiveClip: boolean;
  isAnalyzing: boolean;
  videoTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenInputModal,
  onOpenExportModal,
  onReset,
  hasActiveClip,
  isAnalyzing,
  videoTitle,
}) => {
  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-950/40">
          <Video className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
              AutoClip <span className="text-amber-400">AI</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
              Podcast & YouTube Shorts
            </span>
          </div>
          <p className="text-xs text-neutral-400 hidden sm:block truncate max-w-md">
            {videoTitle ? `Sedang mengedit: ${videoTitle}` : 'Auto Multi-Angle Reframe · Viral Cut · Subtitle Karaoke'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenInputModal}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700/80 rounded-lg transition-all"
        >
          <Youtube className="w-4 h-4 text-red-500" />
          <span className="hidden xs:inline">Ganti Video / Link</span>
          <span className="xs:hidden">Video</span>
        </button>

        {hasActiveClip && (
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 active:scale-95 shadow-md shadow-amber-500/20 rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export 9:16</span>
          </button>
        )}
      </div>
    </header>
  );
};
