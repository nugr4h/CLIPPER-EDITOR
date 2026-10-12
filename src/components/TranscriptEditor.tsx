import React, { useState } from 'react';
import { FileText, Play, Edit2, Check, User, Sparkles } from 'lucide-react';
import { ViralClip, TimedSentence, TimedWord } from '../types';

interface TranscriptEditorProps {
  clip: ViralClip;
  currentTime: number;
  onSeek: (time: number) => void;
  onUpdateTranscriptWord: (sentenceIdx: number, wordIdx: number, newWord: string) => void;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  clip,
  currentTime,
  onSeek,
  onUpdateTranscriptWord,
}) => {
  const [editingPos, setEditingPos] = useState<{ sIdx: number; wIdx: number } | null>(null);
  const [editWordValue, setEditWordValue] = useState('');

  const startEdit = (sIdx: number, wIdx: number, currentWord: string) => {
    setEditingPos({ sIdx, wIdx });
    setEditWordValue(currentWord);
  };

  const saveEdit = () => {
    if (editingPos && editWordValue.trim()) {
      onUpdateTranscriptWord(editingPos.sIdx, editingPos.wIdx, editWordValue.trim());
    }
    setEditingPos(null);
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-3 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Transkrip & Subtitle Interaktif</h3>
            <p className="text-[11px] text-neutral-400">Klik kata untuk lompat video atau edit teks</p>
          </div>
        </div>
        <span className="text-[10px] text-neutral-400 font-mono">
          Sinkron Otomatis
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[380px]">
        {clip.transcript.map((sentence, sIdx) => {
          const isSentenceActive =
            currentTime >= sentence.startSec && currentTime <= sentence.endSec;

          return (
            <div
              key={sIdx}
              className={`p-3 rounded-xl border transition-all ${
                isSentenceActive
                  ? 'bg-neutral-800/90 border-amber-500/50 ring-1 ring-amber-500/20'
                  : 'bg-neutral-950/60 border-neutral-800/80 hover:bg-neutral-900/40'
              }`}
            >
              {/* Speaker Header */}
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{sentence.speakerName}</span>
                </div>
                <button
                  onClick={() => onSeek(sentence.startSec)}
                  className="text-[11px] font-mono text-neutral-500 hover:text-amber-400 flex items-center gap-1"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{sentence.startSec.toFixed(1)}s</span>
                </button>
              </div>

              {/* Words */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {sentence.words.map((wordObj, wIdx) => {
                  const isWordActive =
                    currentTime >= wordObj.startSec && currentTime <= wordObj.endSec;
                  const isBeingEdited =
                    editingPos?.sIdx === sIdx && editingPos?.wIdx === wIdx;

                  if (isBeingEdited) {
                    return (
                      <span key={wIdx} className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          autoFocus
                          value={editWordValue}
                          onChange={(e) => setEditWordValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') setEditingPos(null);
                          }}
                          className="px-1.5 py-0.5 bg-neutral-900 border border-amber-400 rounded text-xs text-amber-300 font-bold focus:outline-none w-20"
                        />
                        <button
                          onClick={saveEdit}
                          className="p-1 bg-amber-400 text-neutral-950 rounded hover:bg-amber-300"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  }

                  return (
                    <span
                      key={wIdx}
                      onClick={() => onSeek(wordObj.startSec)}
                      onDoubleClick={() => startEdit(sIdx, wIdx, wordObj.word)}
                      className={`cursor-pointer px-1 py-0.5 rounded transition-all select-none ${
                        isWordActive
                          ? 'bg-amber-400 text-neutral-950 font-black shadow-sm scale-105'
                          : wordObj.isKeyWord
                          ? 'text-amber-300 font-bold hover:bg-neutral-800'
                          : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                      }`}
                      title="Klik untuk putar, klik 2x untuk edit"
                    >
                      {wordObj.word}
                      {wordObj.emoji && <span className="ml-0.5">{wordObj.emoji}</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-800 flex items-center justify-between">
        <span>💡 Klik 2x pada kata apa pun untuk mengedit ejaan kata.</span>
        <span>{clip.transcript.reduce((acc, s) => acc + s.words.length, 0)} kata</span>
      </div>
    </div>
  );
};
