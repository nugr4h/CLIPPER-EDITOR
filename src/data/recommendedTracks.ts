import { BackgroundTrack, MusicMood } from '../types';

export const DEFAULT_TRACKS: BackgroundTrack[] = [
  {
    id: 'track-dramatic-1',
    title: 'Dark Revelation & Deep Bass',
    artist: 'CinemaPulse Audio',
    mood: 'dramatic',
    moodLabel: 'Dramatis & Tegang',
    targetEmotionRange: [92, 100],
    bpm: 110,
    duration: 45,
    audioUrl: 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3',
    tags: ['#viralphonk', '#tension', '#shock', '#kontroversi'],
    description: 'Sub-bass mendalam dengan ketukan lambat yang memicu ketegangan maksimal untuk momen kontroversial atau pengakuan mengejutkan.',
  },
  {
    id: 'track-motivational-1',
    title: 'Rise of the 1% (Epic Drive)',
    artist: 'Mindset Records',
    mood: 'motivational',
    moodLabel: 'Motivasi & Inspirasi',
    targetEmotionRange: [85, 95],
    bpm: 125,
    duration: 50,
    audioUrl: 'https://cdn.freesound.org/previews/618/618247_11861866-lq.mp3',
    tags: ['#hustle', '#inspirasi', '#sukses', '#miliarder'],
    description: 'Ketukan dinamis dengan melodi penuh harapan yang cocok untuk nasihat hidup, tips bisnis, dan pembentukan kebiasaan sukses.',
  },
  {
    id: 'track-mysterious-1',
    title: 'Investigative Lo-Fi Curiosity',
    artist: 'DeepDive Soundlab',
    mood: 'mysterious',
    moodLabel: 'Misteri & Penasaran',
    targetEmotionRange: [88, 96],
    bpm: 95,
    duration: 40,
    audioUrl: 'https://cdn.freesound.org/previews/568/568114_11861866-lq.mp3',
    tags: ['#curiosityloop', '#faktagilap', '#rahasia', '#investigasi'],
    description: 'Instrumen atmosferik dengan petikan misterius yang membangkitkan rasa penasaran penonton agar bertahan hingga detik terakhir.',
  },
  {
    id: 'track-energetic-1',
    title: 'TikTok Viral Phonk Pulse',
    artist: 'SpeedyBeats',
    mood: 'energetic',
    moodLabel: 'Energi Tinggi & Hype',
    targetEmotionRange: [90, 100],
    bpm: 135,
    duration: 35,
    audioUrl: 'https://cdn.freesound.org/previews/608/608645_11861866-lq.mp3',
    tags: ['#phonk', '#viralshorts', '#fastcut', '#highintensity'],
    description: 'Bass 808 menggelegar dan hi-hat cepat yang meningkatkan denyut video, sangat cocok untuk format Shorts dengan editing cepat.',
  },
  {
    id: 'track-ambient-1',
    title: 'Late Night Talk Show Piano',
    artist: 'ChillRoom Audio',
    mood: 'ambient',
    moodLabel: 'Ambient & Deep Talk',
    targetEmotionRange: [75, 87],
    bpm: 80,
    duration: 60,
    audioUrl: 'https://cdn.freesound.org/previews/615/615856_11861866-lq.mp3',
    tags: ['#podcastsantai', '#deeptalk', '#refleksi', '#cerita'],
    description: 'Alunan piano lembut di latar belakang yang tidak mengganggu suara dialog pembicara, memberikan nuansa obrolan mendalam.',
  },
];

// Helper to get recommended mood based on emotional score
export function getRecommendedMoodForScore(emotionScore: number): {
  mood: MusicMood;
  reason: string;
} {
  if (emotionScore >= 93) {
    return {
      mood: 'dramatic',
      reason: `Skor emosi sangat tinggi (${emotionScore}%): Audiens merasakan intensitas atau kejutan kuat. Musik dramatis dengan sub-bass lambat akan memperkuat dampak psikologis.`,
    };
  } else if (emotionScore >= 89) {
    return {
      mood: 'energetic',
      reason: `Skor emosi tinggi (${emotionScore}%): Klip memiliki tempo cepat dan debat berapi-api. Musik berenergi tinggi / Phonk akan menjaga retensi audiens agar tidak skip.`,
    };
  } else if (emotionScore >= 84) {
    return {
      mood: 'motivational',
      reason: `Skor emosi seimbang (${emotionScore}%): Klip berfokus pada wawasan hidup dan solusi bernilai. Musik bernuansa inspiratif sangat cocok membangun mood pendengar.`,
    };
  } else if (emotionScore >= 80) {
    return {
      mood: 'mysterious',
      reason: `Skor emosi investigatif (${emotionScore}%): Pembicara membeberkan fakta rahasia. Musik misterius lo-fi akan membuat penonton penasaran hingga akhir.`,
    };
  } else {
    return {
      mood: 'ambient',
      reason: `Skor emosi rileks (${emotionScore}%): Dialog panjang dan reflektif. Musik ambient lembut memastikan vokal tetap jernih dan fokus.`,
    };
  }
}
