import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VideoInputModal } from './components/VideoInputModal';
import { ClipSelector } from './components/ClipSelector';
import { VideoPlayer916 } from './components/VideoPlayer916';
import { TimelineTrimmer } from './components/TimelineTrimmer';
import { CameraAngleControls } from './components/CameraAngleControls';
import { SubtitleCustomizer } from './components/SubtitleCustomizer';
import { HookEditor } from './components/HookEditor';
import { TranscriptEditor } from './components/TranscriptEditor';
import { ExportModal } from './components/ExportModal';
import { MusicRecommendationModule } from './components/MusicRecommendationModule';

import { SAMPLE_PODCASTS, SamplePodcast } from './data/samplePodcasts';
import { SUBTITLE_PRESETS, DEFAULT_HOOK_CONFIG } from './data/subtitlePresets';
import { DEFAULT_TRACKS, getRecommendedMoodForScore } from './data/recommendedTracks';
import {
  ViralClip,
  SubtitleStyle,
  HookConfig,
  CameraConfig,
  VideoSourceData,
  MusicSettings,
  BackgroundTrack,
} from './types';
import { Flame, Type, Zap, Camera, FileText, Sparkles, Youtube, CheckCircle2, Music } from 'lucide-react';

export default function App() {
  // Initial demo podcast
  const initialPodcast = SAMPLE_PODCASTS[0];

  const [currentVideoSource, setCurrentVideoSource] = useState<VideoSourceData>({
    type: 'sample',
    url: initialPodcast.videoUrl,
    title: initialPodcast.title,
    thumbnailUrl: initialPodcast.thumbnail,
    sampleId: initialPodcast.id,
  });

  const [clips, setClips] = useState<ViralClip[]>(initialPodcast.clips);
  const [selectedClip, setSelectedClip] = useState<ViralClip>(initialPodcast.clips[0]);

  // Video playback state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(38);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Subtitle, Hook, Camera, and Music settings
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>(SUBTITLE_PRESETS.hormozi);
  const [hookConfig, setHookConfig] = useState<HookConfig>({
    ...DEFAULT_HOOK_CONFIG,
    text: initialPodcast.clips[0].hookText,
  });
  const [cameraConfig, setCameraConfig] = useState<CameraConfig>({
    mode: 'auto',
    speakerAPosition: 25,
    speakerBPosition: 75,
    zoom: 1.35,
    smoothTransition: true,
  });
  const [musicSettings, setMusicSettings] = useState<MusicSettings>({
    enabled: true,
    selectedTrackId: DEFAULT_TRACKS[0].id,
    volume: 0.25,
    fadeInSec: 1.5,
    fadeOutSec: 2.0,
    autoDucking: true,
    loop: true,
  });
  const [allTracks, setAllTracks] = useState<BackgroundTrack[]>(DEFAULT_TRACKS);

  // UI state
  const [activeTab, setActiveTab] = useState<'clips' | 'subtitles' | 'hooks' | 'camera' | 'music' | 'transcript'>('clips');
  const [isInputModalOpen, setIsInputModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisNotification, setAnalysisNotification] = useState<string | null>(null);

  // When selected clip changes, update hook text and reset playback time
  const handleSelectClip = (clip: ViralClip) => {
    setSelectedClip(clip);
    setHookConfig((prev) => ({
      ...prev,
      text: clip.hookText,
    }));
    setCurrentTime(0);
    const clipDuration = Math.max(15, clip.endTime - clip.startTime);
    setDuration(clipDuration);

    // Auto align background music with new clip's emotional impact score
    const rec = getRecommendedMoodForScore(clip.metrics?.emotionImpact ?? 90);
    const matchTrack = allTracks.find((t) => t.mood === rec.mood);
    if (matchTrack) {
      setMusicSettings((prev) => ({ ...prev, selectedTrackId: matchTrack.id }));
    }
  };

  // Switch sample podcast
  const handleSelectSample = (sample: SamplePodcast) => {
    setCurrentVideoSource({
      type: 'sample',
      url: sample.videoUrl,
      title: sample.title,
      thumbnailUrl: sample.thumbnail,
      sampleId: sample.id,
    });
    setClips(sample.clips);
    handleSelectClip(sample.clips[0]);
    setIsPlaying(false);
  };

  // Upload local video
  const handleUploadFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setCurrentVideoSource({
      type: 'file',
      url: objectUrl,
      title: file.name.replace(/\.[^/.]+$/, ''),
      thumbnailUrl: '',
      file,
    });

    // Create realistic clips based on the uploaded video
    const dynamicClip: ViralClip = {
      id: `clip-${Date.now()}`,
      title: `${file.name.slice(0, 30)} - Momen Viral Terdeteksi`,
      viralScore: 95,
      viralReason: 'Pola suara intens dan perubahan mimik wajah dinilai AI memiliki retensi tinggi.',
      hookText: '🔥 LIHAT APA YANG TERJADI DISINI...',
      alternativeHooks: [
        'Jangan skip bagian ini!',
        'Kenyataan yang belum pernah kamu dengar',
        'Fakta penting di detik ke 10',
      ],
      hashtags: ['#shorts', '#viralvideo', '#podcastclip', '#trending'],
      metrics: {
        hookStrength: 94,
        retentionScore: 96,
        emotionImpact: 92,
      },
      startTime: 0,
      endTime: 35,
      cameraAngles: [
        { startSec: 0, endSec: 5, angle: 'speaker_a', activeSpeaker: 'Speaker 1' },
        { startSec: 5, endSec: 18, angle: 'speaker_b', activeSpeaker: 'Speaker 2' },
        { startSec: 18, endSec: 25, angle: 'split_screen', activeSpeaker: 'Keduanya' },
        { startSec: 25, endSec: 35, angle: 'speaker_b', activeSpeaker: 'Speaker 2' },
      ],
      transcript: [
        {
          speakerId: 'spk-1',
          speakerName: 'Speaker 1',
          startSec: 0,
          endSec: 5,
          text: 'Ini adalah momen paling penting yang harus kamu tahu!',
          words: [
            { word: 'Ini', startSec: 0, endSec: 1 },
            { word: 'momen', startSec: 1, endSec: 2.2, isKeyWord: true },
            { word: 'paling', startSec: 2.2, endSec: 3.2 },
            { word: 'penting!', startSec: 3.2, endSec: 5, isKeyWord: true, emoji: '🔥' },
          ],
        },
        {
          speakerId: 'spk-2',
          speakerName: 'Speaker 2',
          startSec: 5,
          endSec: 18,
          text: 'Banyak orang melewatkan kesempatan ini karena takut mengambil keputusan berani.',
          words: [
            { word: 'Banyak', startSec: 5, endSec: 7 },
            { word: 'orang', startSec: 7, endSec: 9 },
            { word: 'takut', startSec: 9, endSec: 12, isKeyWord: true, emoji: '😱' },
            { word: 'mengambil', startSec: 12, endSec: 15 },
            { word: 'keputusan!', startSec: 15, endSec: 18, isKeyWord: true, emoji: '⚡' },
          ],
        },
      ],
    };

    setClips([dynamicClip]);
    handleSelectClip(dynamicClip);
    setIsPlaying(false);
  };

  // Submit YouTube URL & Analyze with Gemini
  const handleSubmitUrl = async (url: string, customPrompt: string) => {
    setIsAnalyzing(true);
    setAnalysisNotification('Sedang mengambil data video YouTube & menganalisis viralitas...');

    try {
      // 1. Fetch YouTube info
      const infoRes = await fetch('/api/fetch-youtube-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      let videoTitle = 'Podcast YouTube Viral';
      let thumbUrl = '';
      let videoId = '';

      if (infoRes.ok) {
        const infoData = await infoRes.json();
        videoTitle = infoData.title || videoTitle;
        thumbUrl = infoData.thumbnailUrl || '';
        videoId = infoData.videoId || '';
      }

      // 2. Call Gemini AI to analyze viral moments, camera angles, hooks, and subtitles
      const analyzeRes = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          title: videoTitle,
          customPrompt,
          durationEstimate: '35 menit',
        }),
      });

      if (!analyzeRes.ok) {
        throw new Error('Gagal menganalisis video dengan AI');
      }

      const analyzedData = await analyzeRes.json();

      if (analyzedData.clips && analyzedData.clips.length > 0) {
        setCurrentVideoSource({
          type: 'youtube',
          url,
          title: videoTitle,
          thumbnailUrl: thumbUrl,
          videoId,
        });

        setClips(analyzedData.clips);
        handleSelectClip(analyzedData.clips[0]);
        setIsInputModalOpen(false);
        setAnalysisNotification(`Berhasil mendeteksi ${analyzedData.clips.length} klip viral potensial!`);
        setTimeout(() => setAnalysisNotification(null), 4000);
      } else {
        throw new Error('Tidak ada klip viral yang ditemukan.');
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Edit transcript word in current clip
  const handleUpdateTranscriptWord = (sIdx: number, wIdx: number, newWord: string) => {
    setSelectedClip((prev) => {
      const updatedTranscript = [...prev.transcript];
      const targetSentence = { ...updatedTranscript[sIdx] };
      const targetWords = [...targetSentence.words];
      targetWords[wIdx] = { ...targetWords[wIdx], word: newWord };
      targetSentence.words = targetWords;
      updatedTranscript[sIdx] = targetSentence;
      return {
        ...prev,
        transcript: updatedTranscript,
      };
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* Top Navbar */}
      <Navbar
        onOpenInputModal={() => setIsInputModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onReset={() => handleSelectSample(SAMPLE_PODCASTS[0])}
        hasActiveClip={Boolean(selectedClip)}
        isAnalyzing={isAnalyzing}
        videoTitle={currentVideoSource.title}
      />

      {/* Notification Toast */}
      {analysisNotification && (
        <div className="fixed top-20 right-4 z-50 bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border-2 border-black animate-bounce-short">
          <CheckCircle2 className="w-4 h-4" />
          <span>{analysisNotification}</span>
        </div>
      )}

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5 items-start">
        {/* Left: 9:16 Vertical Video Studio Stage */}
        <section className="w-full lg:w-[420px] shrink-0 flex flex-col items-center space-y-3">
          <div className="w-full">
            <VideoPlayer916
              clip={selectedClip}
              videoSrc={currentVideoSource.url}
              isYouTube={currentVideoSource.type === 'youtube'}
              youTubeId={currentVideoSource.videoId}
              subtitleStyle={subtitleStyle}
              hookConfig={hookConfig}
              cameraConfig={cameraConfig}
              musicSettings={musicSettings}
              backgroundTrack={allTracks.find((t) => t.id === musicSettings.selectedTrackId) || allTracks[0]}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onDurationChange={(d) => setDuration(d)}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSeek={(t) => setCurrentTime(t)}
            />
          </div>

          {/* Timeline Scrubber & Camera Cut Track */}
          <div className="w-full max-w-sm">
            <TimelineTrimmer
              clip={selectedClip}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              hookConfig={hookConfig}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSeek={(t) => setCurrentTime(t)}
              onTrimChange={(startDelta, endDelta) => {
                console.log('Trim change', startDelta, endDelta);
              }}
            />
          </div>
        </section>

        {/* Right: Studio Control Tabs */}
        <section className="w-full flex-1 flex flex-col min-w-0 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 shadow-xl">
          {/* Studio Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-neutral-800/80 no-scrollbar">
            <button
              onClick={() => setActiveTab('clips')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'clips'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>Klip Viral ({clips.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'music'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Musik Latar AI</span>
            </button>

            <button
              onClick={() => setActiveTab('subtitles')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'subtitles'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Subtitle & Font</span>
            </button>

            <button
              onClick={() => setActiveTab('hooks')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'hooks'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Hook Pembuka (0-3s)</span>
            </button>

            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'camera'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Angle Kamera 9:16</span>
            </button>

            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'transcript'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Transkrip Kata</span>
            </button>
          </div>

          {/* Active Tab Views */}
          <div className="flex-1">
            {activeTab === 'clips' && (
              <ClipSelector
                clips={clips}
                selectedClipId={selectedClip.id}
                onSelectClip={handleSelectClip}
              />
            )}

            {activeTab === 'music' && (
              <MusicRecommendationModule
                clip={selectedClip}
                settings={musicSettings}
                onUpdateSettings={(newSettings) =>
                  setMusicSettings((prev) => ({ ...prev, ...newSettings }))
                }
              />
            )}

            {activeTab === 'subtitles' && (
              <SubtitleCustomizer
                style={subtitleStyle}
                onUpdateStyle={(newStyle) =>
                  setSubtitleStyle((prev) => ({ ...prev, ...newStyle }))
                }
              />
            )}

            {activeTab === 'hooks' && (
              <HookEditor
                hookConfig={hookConfig}
                clip={selectedClip}
                onUpdateHook={(newHook) =>
                  setHookConfig((prev) => ({ ...prev, ...newHook }))
                }
                onReplayHook={() => {
                  setCurrentTime(0);
                  setIsPlaying(true);
                }}
              />
            )}

            {activeTab === 'camera' && (
              <CameraAngleControls
                cameraConfig={cameraConfig}
                onUpdateConfig={(newConfig) =>
                  setCameraConfig((prev) => ({ ...prev, ...newConfig }))
                }
                clip={selectedClip}
              />
            )}

            {activeTab === 'transcript' && (
              <TranscriptEditor
                clip={selectedClip}
                currentTime={currentTime}
                onSeek={(t) => setCurrentTime(t)}
                onUpdateTranscriptWord={handleUpdateTranscriptWord}
              />
            )}
          </div>
        </section>
      </main>

      {/* Input Modal */}
      <VideoInputModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onSelectSample={handleSelectSample}
        onSubmitUrl={handleSubmitUrl}
        onUploadFile={handleUploadFile}
        isLoading={isAnalyzing}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        clip={selectedClip}
        videoSrc={currentVideoSource.url}
        subtitleStyle={subtitleStyle}
        hookConfig={hookConfig}
        cameraConfig={cameraConfig}
        musicSettings={musicSettings}
        backgroundTrack={allTracks.find((t) => t.id === musicSettings.selectedTrackId) || allTracks[0]}
      />
    </div>
  );
}
