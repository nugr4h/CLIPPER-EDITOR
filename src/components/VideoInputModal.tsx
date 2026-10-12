import React, { useState } from 'react';
import { X, Youtube, Upload, Sparkles, Film, ArrowRight, Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SAMPLE_PODCASTS, SamplePodcast } from '../data/samplePodcasts';
import { VideoSourceData } from '../types';

interface VideoInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SamplePodcast) => void;
  onSubmitUrl: (url: string, customPrompt: string) => Promise<void>;
  onUploadFile: (file: File) => void;
  isLoading: boolean;
}

export const VideoInputModal: React.FC<VideoInputModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  onSubmitUrl,
  onUploadFile,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'sample' | 'upload'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Fokus cari momen paling kontroversial, emosional, dan cocok untuk TikTok/Reels.');
  const [inputError, setInputError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setInputError('Harap masukkan URL YouTube');
      return;
    }
    setInputError(null);
    try {
      await onSubmitUrl(urlInput.trim(), customPrompt);
    } catch (err: any) {
      setInputError(err.message || 'Gagal memproses link YouTube');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) {
        setInputError('Ukuran file maksimal 200MB untuk preview cepat di browser.');
        return;
      }
      onUploadFile(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Input Video & Podcast</h2>
              <p className="text-xs text-neutral-400">Pilih sumber video untuk dipindai otomatis oleh AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-4 flex gap-2 border-b border-neutral-800/60 pb-3">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-500" />
            <span>Link YouTube</span>
          </button>
          <button
            onClick={() => setActiveTab('sample')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sample'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Film className="w-4 h-4 text-amber-500" />
            <span>Podcast Contoh (Instan)</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload File Video</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {inputError && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{inputError}</span>
            </div>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Link Video YouTube (Podcast / Wawancara / Talk Show)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Youtube className="w-4 h-4 text-red-500" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px] text-neutral-400">
                  <span>Contoh cepat:</span>
                  <button
                    type="button"
                    onClick={() => setUrlInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                    className="text-amber-400 hover:underline"
                  >
                    Podcast Clip 1
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setUrlInput('https://www.youtube.com/watch?v=kXYiU_JCYtU')}
                    className="text-amber-400 hover:underline"
                  >
                    Tech Interview
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Instruksi Khusus untuk AI (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Contoh: Fokus cari momen saat pembicara membahas rahasia gagal dan quotes inspiratif..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-400 space-y-1">
                <p className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Apa yang dilakukan AI secara otomatis?
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
                  <li>Memindai dan memberi skor potensi viralitas (Viral Score 0-100)</li>
                  <li>Mendeteksi pergantian angle kamera podcast (Host vs Tamu vs Split)</li>
                  <li>Membuat hook pembuka dramatis (Curiosity Loop / Contrarian)</li>
                  <li>Menyusun subtitle karaoke interaktif dengan highlight kata kunci</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang Menganalisis Video dengan Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Mulai Pindai Potensi Viral & Reframe Kamera</span>
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'sample' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-400">
                Gunakan podcast contoh yang sudah memiliki video resolusi tinggi untuk melihat cara kerja deteksi multi-kamera dan subtitle secara langsung:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_PODCASTS.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => {
                      onSelectSample(sample);
                      onClose();
                    }}
                    className="group border border-neutral-800 hover:border-amber-500/60 bg-neutral-950 rounded-xl p-3.5 cursor-pointer transition-all hover:shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-2.5 bg-neutral-800">
                        <img
                          src={sample.thumbnail}
                          alt={sample.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] text-white font-mono px-1.5 py-0.5 rounded">
                          {sample.duration}
                        </span>
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                          <div className="w-8 h-8 rounded-full bg-amber-400/90 text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
                        {sample.title}
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                        {sample.summary}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">{sample.channel}</span>
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        {sample.clips.length} Klip Viral <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-neutral-700 hover:border-amber-400/80 bg-neutral-950 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-neutral-800 group-hover:bg-amber-400/20 text-neutral-400 group-hover:text-amber-400 flex items-center justify-center mb-3 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white">
                  Klik untuk unggah file video podcast
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Mendukung MP4, WebM (Maksimal 200MB untuk pemrosesan lokal lancar)
                </p>
              </label>

              <div className="bg-neutral-950/60 rounded-xl p-3 border border-neutral-800 text-xs text-neutral-400">
                💡 AI akan mendeteksi pergantian wajah pembicara dan suara dari video yang Anda unggah secara otomatis.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
