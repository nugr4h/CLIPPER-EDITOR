export type CameraAngleType = 'speaker_a' | 'speaker_b' | 'split_screen' | 'wide_shot';

export interface CameraCut {
  startSec: number;
  endSec: number;
  angle: CameraAngleType;
  activeSpeaker: string;
  reason?: string;
}

export interface TimedWord {
  word: string;
  startSec: number;
  endSec: number;
  isKeyWord?: boolean;
  emoji?: string;
}

export interface TimedSentence {
  speakerId: string;
  speakerName: string;
  startSec: number;
  endSec: number;
  text: string;
  words: TimedWord[];
}

export interface ViralMetrics {
  hookStrength: number; // 0-100
  retentionScore: number; // 0-100
  emotionImpact: number; // 0-100
}

export interface VideoSpeaker {
  id: string;
  name: string;
  role: string; // 'Host' | 'Guest'
  position: 'left' | 'right' | 'center';
}

export interface ViralClip {
  id: string;
  title: string;
  viralScore: number; // 0-100
  viralReason: string;
  hookText: string;
  alternativeHooks: string[];
  hashtags: string[];
  metrics: ViralMetrics;
  startTime: number;
  endTime: number;
  cameraAngles: CameraCut[];
  transcript: TimedSentence[];
}

export interface SubtitleStyle {
  fontFamily: 'Montserrat' | 'Bebas Neue' | 'Anton' | 'Poppins' | 'Space Grotesk' | 'Inter';
  presetName: 'hormozi' | 'beast' | 'cyber' | 'minimal' | 'fire_red';
  fontSize: number; // 20-56
  textColor: string;
  highlightColor: string;
  secondaryHighlightColor: string;
  strokeColor: string;
  strokeWidth: number; // 0-8
  positionY: number; // 10% to 90%
  uppercase: boolean;
  showEmoji: boolean;
  wordsPerScreen: number; // 1 to 5
  boxBackground: boolean;
  boxBgColor: string;
  animationStyle: 'pop' | 'glow' | 'bounce' | 'fade';
}

export interface HookConfig {
  enabled: boolean;
  text: string;
  style: 'sticker_badge' | 'breaking_news' | 'yellow_marker' | 'neon_glow' | 'caution_tape';
  duration: number; // seconds (1 to 5)
  animation: 'zoom_pop' | 'slide_down' | 'rubber_bounce' | 'pulse';
  textColor: string;
  bgColor: string;
  playSound: boolean;
}

export interface CameraConfig {
  mode: 'auto' | 'speaker_a' | 'speaker_b' | 'split' | 'fit';
  speakerAPosition: number; // 0 - 100% horizontal center
  speakerBPosition: number; // 0 - 100% horizontal center
  zoom: number; // 1.0 - 1.8
  smoothTransition: boolean;
}

export interface VideoSourceData {
  type: 'youtube' | 'file' | 'sample';
  url: string;
  title: string;
  thumbnailUrl: string;
  videoId?: string;
  authorName?: string;
  file?: File;
  sampleId?: string;
}

export type MusicMood = 'dramatic' | 'motivational' | 'mysterious' | 'energetic' | 'ambient';

export interface BackgroundTrack {
  id: string;
  title: string;
  artist: string;
  mood: MusicMood;
  moodLabel: string;
  targetEmotionRange: [number, number]; // [minScore, maxScore] e.g. [90, 100]
  bpm: number;
  duration: number; // in seconds
  audioUrl: string;
  isAiGenerated?: boolean;
  tags: string[];
  description: string;
}

export interface MusicSettings {
  enabled: boolean;
  selectedTrackId: string | null;
  volume: number; // 0 to 1 (default 0.25)
  fadeInSec: number; // 0 to 4s
  fadeOutSec: number; // 0 to 4s
  autoDucking: boolean;
  loop: boolean;
}
