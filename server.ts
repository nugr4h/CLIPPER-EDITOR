import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));

// Server-side Gemini initialization with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// 1. YouTube info endpoint
app.post('/api/fetch-youtube-info', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'URL YouTube tidak valid. Mohon periksa kembali link video Anda.' });
    }

    // Try fetching title & thumbnail from YouTube oEmbed API
    let title = 'Podcast / Video YouTube';
    let authorName = 'Kreator';
    let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        title = oembedData.title || title;
        authorName = oembedData.author_name || authorName;
        if (oembedData.thumbnail_url) {
          thumbnailUrl = oembedData.thumbnail_url;
        }
      }
    } catch (e) {
      console.warn('oEmbed fetch error:', e);
    }

    return res.json({
      videoId,
      title,
      authorName,
      thumbnailUrl,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    });
  } catch (error: any) {
    console.error('fetch-youtube-info error:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses link YouTube' });
  }
});

// 2. Video Viral Analysis & Multi-Angle Scan
app.post('/api/analyze-video', async (req, res) => {
  try {
    const { url, title, transcriptText, customPrompt, durationEstimate } = req.body;

    const videoId = extractYouTubeId(url || '');
    const videoTitle = title || 'Podcast / Talk Show Episode';

    const systemInstruction = `Anda adalah spesialis kurasi video pendek viral (Shorts, TikTok, Reels) dan video editor podcast tingkat dunia.
Tugas Anda adalah menganalisa isi podcast/video, menemukan momen-momen dengan potensi viral tertinggi (Viral Score 80-99), menyusun potongan klip optimal (30 hingga 60 detik), melakukan deteksi pergantian angle kamera podcast (Speaker A, Speaker B, Split Screen), membuat hook pembuka yang memicu rasa penasaran tinggi (FOMO, contrarian, shock factor), dan menghasilkan transkrip kata-per-kata yang akurat lengkap dengan emoji yang relevan.

Format respons WAJIB JSON yang mematuhi skema yang diberikan.
Gunakan Bahasa Indonesia yang menarik, kasual namun tajam khas kreator konten viral.`;

    const prompt = `Analisa video/podcast berikut:
Judul: ${videoTitle}
URL: ${url || 'Video Unggahan'}
ID Video: ${videoId || 'N/A'}
Durasi Estimasi: ${durationEstimate || '15 - 45 menit'}
Konteks / Transkrip Tambahan: ${transcriptText || 'Podcast diskusi dua orang tentang rahasia sukses, mindset kontroversial, kebiasaan miliarder, dan kegagalan yang jarang dibahas di publik.'}
Instruksi Khusus Pengguna: ${customPrompt || 'Fokus pada klip yang paling emosional, mengejutkan, dan memicu debat di kolom komentar TikTok/Reels.'}

Hasilkan minimal 3 hingga 5 klip terbaik dengan:
1. Skor viralitas (viralScore 80-99) dan breakdown faktor (hookStrength, retentionScore, emotionImpact).
2. Alasan mengapa klip ini bisa viral (viralReason).
3. Timestamp start dan end (dalam detik, durasi 30-60 detik tiap klip).
4. Hook pembuka (teks tajam yang ditampilkan di 3 detik pertama).
5. 3 variasi hook alternatif.
6. Hashtag viral relevan.
7. Deteksi kamera (cameraAngles) untuk format 9:16 podcast: kapan harus fokus ke "speaker_a" (Host), "speaker_b" (Bintang Tamu), atau "split_screen" (keduanya bicara / reaksi).
8. Transkrip kalimat & kata-kata berurutan dengan penanda timestamp relatif (dari 0 detik klip) dan kata yang perlu di-highlight!`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            videoSummary: { type: Type.STRING, description: 'Ringkasan esensi video podcast' },
            speakers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  role: { type: Type.STRING, description: 'Host atau Guest' },
                  position: { type: Type.STRING, description: 'left, right, center' },
                },
                required: ['id', 'name', 'role', 'position'],
              },
            },
            clips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  viralScore: { type: Type.INTEGER },
                  viralReason: { type: Type.STRING },
                  hookText: { type: Type.STRING },
                  alternativeHooks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  hashtags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  metrics: {
                    type: Type.OBJECT,
                    properties: {
                      hookStrength: { type: Type.INTEGER },
                      retentionScore: { type: Type.INTEGER },
                      emotionImpact: { type: Type.INTEGER },
                    },
                    required: ['hookStrength', 'retentionScore', 'emotionImpact'],
                  },
                  startTime: { type: Type.NUMBER, description: 'Waktu mulai dalam detik dari video asli' },
                  endTime: { type: Type.NUMBER, description: 'Waktu akhir dalam detik dari video asli' },
                  cameraAngles: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        startSec: { type: Type.NUMBER, description: 'Detik mulai perubahan angle relatif klip' },
                        endSec: { type: Type.NUMBER, description: 'Detik akhir perubahan angle relatif klip' },
                        angle: { type: Type.STRING, description: 'speaker_a, speaker_b, split_screen, wide_shot' },
                        activeSpeaker: { type: Type.STRING },
                        reason: { type: Type.STRING },
                      },
                      required: ['startSec', 'endSec', 'angle', 'activeSpeaker'],
                    },
                  },
                  transcript: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        speakerId: { type: Type.STRING },
                        speakerName: { type: Type.STRING },
                        startSec: { type: Type.NUMBER },
                        endSec: { type: Type.NUMBER },
                        text: { type: Type.STRING },
                        words: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              word: { type: Type.STRING },
                              startSec: { type: Type.NUMBER },
                              endSec: { type: Type.NUMBER },
                              isKeyWord: { type: Type.BOOLEAN },
                              emoji: { type: Type.STRING },
                            },
                            required: ['word', 'startSec', 'endSec'],
                          },
                        },
                      },
                      required: ['speakerId', 'speakerName', 'startSec', 'endSec', 'text', 'words'],
                    },
                  },
                },
                required: [
                  'id',
                  'title',
                  'viralScore',
                  'viralReason',
                  'hookText',
                  'alternativeHooks',
                  'hashtags',
                  'metrics',
                  'startTime',
                  'endTime',
                  'cameraAngles',
                  'transcript',
                ],
              },
            },
          },
          required: ['videoSummary', 'speakers', 'clips'],
        },
      },
    });

    const rawJson = response.text || '{}';
    const parsedData = JSON.parse(rawJson);

    return res.json(parsedData);
  } catch (error: any) {
    console.error('analyze-video error:', error);
    return res.status(500).json({ error: error.message || 'Gagal menganalisa video dengan AI' });
  }
});

// 3. Generate Extra Hooks Endpoint
app.post('/api/generate-hooks', async (req, res) => {
  try {
    const { topic, clipTitle, style } = req.body;

    const prompt = `Buat 6 variasi hook pembuka video pendek (Shorts/TikTok/Reels) yang sangat memikat untuk video:
Topik: ${topic || 'Podcast clip'}
Judul Klip: ${clipTitle || 'Diskusi Rahasia'}
Gaya Hook: ${style || 'Agresif, Penasaran, Emosional, Contrarian'}

Hasilkan respon JSON dengan array of object berisi { text: string, type: string, psychology: string }.
Tipe hook: 'Curiosity Loop', 'Shock Value', 'Contrarian Truth', 'Direct Question', 'Warning/FOMO', 'Personal Confession'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              type: { type: Type.STRING },
              psychology: { type: Type.STRING },
            },
            required: ['text', 'type', 'psychology'],
          },
        },
      },
    });

    const hooks = JSON.parse(response.text || '[]');
    return res.json({ hooks });
  } catch (error: any) {
    console.error('generate-hooks error:', error);
    return res.status(500).json({ error: error.message || 'Gagal membuat hook baru' });
  }
});

// 4. AI Music Recommendation Endpoint based on Emotional Score
app.post('/api/recommend-music', async (req, res) => {
  try {
    const { emotionScore, clipTitle, clipReason, duration } = req.body;

    const prompt = `Analisis skor emosi klip video podcast berikut:
Judul Klip: ${clipTitle || 'Podcast Viral Moment'}
Alasan Viral: ${clipReason || 'Kontroversi dan opini mendalam'}
Skor Dampak Emosi (Emotion Impact): ${emotionScore || 90} / 100
Durasi: ${duration || 35} detik

Sebagai sound designer dan music supervisor untuk video viral (Shorts/Reels/TikTok), berikan rekomendasi musik latar yang paling pas untuk memaksimalkan retensi dan kedalaman emosi.
Tentukan:
1. mood: salah satu dari ['dramatic', 'motivational', 'mysterious', 'energetic', 'ambient']
2. recommendedBpm: angka BPM ideal (misal 115)
3. keyInstruments: array instrumen (misal ["Sub Bass 808", "Low Piano", "Ticking Clock"])
4. emotionAnalysis: penjelasan mendalam mengapa musik ini cocok dengan skor emosi ${emotionScore}%
5. suggestedPrompts: 3 prompt deskriptif untuk generator musik AI Lyria (misal: "Deep dramatic synth pulse with low sub-bass for a shocking revelation clip, 110 bpm")
6. recommendedVolume: persentase volume latar belakang yang disarankan (biasanya 20-28% agar suara vokal tetap jernih)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            recommendedBpm: { type: Type.INTEGER },
            keyInstruments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            emotionAnalysis: { type: Type.STRING },
            suggestedPrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedVolume: { type: Type.INTEGER },
          },
          required: [
            'mood',
            'recommendedBpm',
            'keyInstruments',
            'emotionAnalysis',
            'suggestedPrompts',
            'recommendedVolume',
          ],
        },
      },
    });

    const analysis = JSON.parse(response.text || '{}');
    return res.json(analysis);
  } catch (error: any) {
    console.error('recommend-music error:', error);
    return res.status(500).json({ error: error.message || 'Gagal menganalisis rekomendasi musik' });
  }
});

// 5. Generate Custom Music using Lyria (lyria-3-clip-preview)
app.post('/api/generate-music', async (req, res) => {
  try {
    const { prompt, duration } = req.body;
    const finalPrompt = prompt || 'Cinematic 30-second dramatic background track with subtle piano and deep bass for viral podcast clip';

    console.log(`Generating music with lyria-3-clip-preview: "${finalPrompt}"`);

    const response = await ai.models.generateContentStream({
      model: 'lyria-3-clip-preview',
      contents: finalPrompt,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({
        error: 'Tidak ada data audio yang dihasilkan dari model Lyria.',
      });
    }

    return res.json({
      audioUrl: `data:${mimeType};base64,${audioBase64}`,
      mimeType,
      lyrics,
      prompt: finalPrompt,
    });
  } catch (error: any) {
    console.error('generate-music error with Lyria:', error);
    return res.status(500).json({
      error: error.message || 'Gagal menghasilkan musik dengan Lyria AI.',
      code: error.code || 'LYRIA_ERROR',
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    app.use(express.static('dist'));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`AutoClip AI Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
