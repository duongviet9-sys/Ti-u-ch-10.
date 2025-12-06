import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WheelResult } from '../types';
import { X, Sparkles, HelpCircle, Eye, CheckCircle2, AlertCircle, Trophy } from 'lucide-react';

interface WinnerModalProps {
  isOpen: boolean;
  result: WheelResult | null;
  onClose: () => void;
}

interface ParsedQuiz {
  type: 'quiz' | 'text';
  question: string;
  options?: { key: string; text: string }[];
  correctAnswerKey?: string;
  answerText?: string;
}

// --- SOUND ASSETS (Base64 Encoded for portability) ---
const CORRECT_SOUND = "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"; 
// Note: For brevity in this specific snippet, these are short placeholders. 
// In a real production app, we would load fuller MP3 files. 
// Below are functional short sound blobs.

// "Ding" sound for correct answer
const PLAY_CORRECT = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
  osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};

// "Buzz" sound for wrong answer
const PLAY_WRONG = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
};

const WinnerModal: React.FC<WinnerModalProps> = ({ isOpen, result, onClose }) => {
  // State for Text Mode
  const [showAnswerText, setShowAnswerText] = useState(false);

  // State for Quiz Mode
  const [attempts, setAttempts] = useState(0); // 0 = start, 1 = 1 wrong, 2 = 2 wrong (game over)
  const [failedKeys, setFailedKeys] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowAnswerText(false);
      setAttempts(0);
      setFailedKeys([]);
      setIsSuccess(false);
    }
  }, [isOpen, result]);

  // Logic to parse the question string
  const content: ParsedQuiz = useMemo(() => {
    if (!result?.question) return { type: 'text', question: '', answerText: '' };

    const fullText = result.question;
    
    // 1. Extract Answer Key (Expect format "(Đáp án: X)" or similar)
    // Regex matches "(Đáp án: A)" or "Đáp án: A" case insensitive
    const answerRegex = /[\(\[]?\s*Đáp án:\s*([A-D])\s*[\)\]]?/i;
    const answerMatch = fullText.match(answerRegex);
    const correctAnswerKey = answerMatch ? answerMatch[1].toUpperCase() : undefined;

    // 2. Extract plain text answer for fallback
    // Everything after the last answer marker
    const simpleAnswerRegex = /^(.*?)(\(?\s*Đáp án:.*)$/i;
    const simpleMatch = fullText.match(simpleAnswerRegex);
    let simpleAnswerText = simpleMatch ? simpleMatch[2].trim() : "";
    if (simpleAnswerText.startsWith('(') && simpleAnswerText.endsWith(')')) {
      simpleAnswerText = simpleAnswerText.slice(1, -1).trim();
    }

    // 3. Remove answer part from text to get the "Question + Options" blob
    // We use the simpler regex split for content to avoid stripping too much
    let questionContent = simpleMatch ? simpleMatch[1].trim() : fullText;

    // 4. Try to parse Options (A. ... | B. ... | ...)
    // Check if it contains "|" and "A."
    if (correctAnswerKey && questionContent.includes('|') && questionContent.includes('A.')) {
        // Splitting logic
        // Find where the options start (first occurrence of "A.")
        const optionsStartIndex = questionContent.indexOf('A.');
        
        if (optionsStartIndex !== -1) {
            const questionStem = questionContent.substring(0, optionsStartIndex).trim();
            const optionsString = questionContent.substring(optionsStartIndex);
            
            const rawOptions = optionsString.split('|').map(s => s.trim());
            const parsedOptions: { key: string; text: string }[] = [];
            
            for (const opt of rawOptions) {
                // Match "A. Content"
                const match = opt.match(/^([A-D])\.\s*(.*)/);
                if (match) {
                    parsedOptions.push({ key: match[1], text: match[2] });
                }
            }

            if (parsedOptions.length >= 2) {
                return {
                    type: 'quiz',
                    question: questionStem,
                    options: parsedOptions,
                    correctAnswerKey: correctAnswerKey
                };
            }
        }
    }

    // Fallback to text mode
    return {
        type: 'text',
        question: questionContent,
        answerText: simpleAnswerText || "Không có đáp án"
    };
  }, [result]);

  const handleOptionClick = (key: string) => {
    if (isSuccess || attempts >= 2 || !content.correctAnswerKey) return;

    if (key === content.correctAnswerKey) {
      // Correct!
      try {
        PLAY_CORRECT();
      } catch (e) {
        console.error("Audio play failed", e);
      }
      setIsSuccess(true);
    } else {
      // Wrong!
      if (!failedKeys.includes(key)) {
        try {
            PLAY_WRONG();
        } catch (e) {
            console.error("Audio play failed", e);
        }
        setFailedKeys(prev => [...prev, key]);
        setAttempts(prev => prev + 1);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-300 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 p-4 text-center relative shrink-0">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]" />
               <div className="flex items-center justify-center gap-2">
                 <Sparkles className="text-white w-6 h-6 animate-pulse" />
                 <h2 className="text-2xl font-black text-white drop-shadow-md uppercase tracking-wide">
                   Chúc mừng
                 </h2>
                 <Sparkles className="text-white w-6 h-6 animate-pulse" />
               </div>
               <button 
                onClick={onClose}
                className="absolute top-1/2 -translate-y-1/2 right-4 text-white/80 hover:text-white transition-colors bg-white/20 p-1 rounded-full"
               >
                 <X size={20} />
               </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Student Name */}
              <div className="text-center mb-6">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Người may mắn</p>
                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 break-words py-1">
                  {result.student}
                </div>
              </div>

              {/* Question Box */}
              {content.question && (
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-inner">
                  <div className="flex gap-3 mb-4">
                    <div className="shrink-0 w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 font-bold shadow-sm">
                      ?
                    </div>
                    <div className="flex-1">
                      <p className="text-lg text-gray-800 font-medium leading-relaxed">
                        {content.question}
                      </p>
                    </div>
                  </div>

                  {/* --- QUIZ MODE --- */}
                  {content.type === 'quiz' && content.options && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {content.options.map((opt) => {
                          const isFailed = failedKeys.includes(opt.key);
                          const isCorrectKey = opt.key === content.correctAnswerKey;
                          const showCorrect = (isSuccess || attempts >= 2) && isCorrectKey;
                          
                          let btnClass = "bg-white border-2 border-amber-100 hover:border-amber-300 text-gray-700 hover:bg-amber-50";
                          if (isFailed) btnClass = "bg-red-50 border-2 border-red-200 text-red-400 cursor-not-allowed opacity-60";
                          if (showCorrect) btnClass = "bg-green-50 border-2 border-green-500 text-green-700 shadow-md ring-2 ring-green-200 ring-offset-1";
                          if (isSuccess && !isCorrectKey) btnClass = "bg-gray-50 border-gray-100 text-gray-300 opacity-50"; // Dim others on success

                          return (
                            <motion.button
                              key={opt.key}
                              whileHover={!isFailed && !isSuccess && attempts < 2 ? { scale: 1.02 } : {}}
                              whileTap={!isFailed && !isSuccess && attempts < 2 ? { scale: 0.98 } : {}}
                              onClick={() => handleOptionClick(opt.key)}
                              disabled={isFailed || isSuccess || attempts >= 2}
                              className={`relative p-4 rounded-xl text-left transition-all duration-200 flex items-start gap-3 ${btnClass}`}
                            >
                              <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${showCorrect ? 'bg-green-500 border-green-500 text-white' : isFailed ? 'bg-red-100 border-red-200 text-red-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                {opt.key}
                              </span>
                              <span className="font-semibold">{opt.text}</span>
                              {showCorrect && <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 right-3 text-green-500" size={20} />}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Feedback Messages */}
                      <div className="min-h-[3rem] flex items-center justify-center">
                        <AnimatePresence mode='wait'>
                          {isSuccess && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 font-bold shadow-sm"
                            >
                              <Trophy size={18} /> Chính xác! Tuyệt vời!
                            </motion.div>
                          )}
                          {!isSuccess && attempts === 1 && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 font-bold"
                            >
                              <AlertCircle size={18} /> Sai rồi! Bạn còn 1 cơ hội nữa.
                            </motion.div>
                          )}
                          {!isSuccess && attempts >= 2 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-full border border-red-100 font-bold"
                            >
                              <X size={18} /> Hết lượt! Đáp án đúng là {content.correctAnswerKey}.
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* --- TEXT MODE (Fallback) --- */}
                  {content.type === 'text' && content.answerText && (
                    <div className="mt-6 pt-6 border-t border-amber-200/50 text-center">
                       {!showAnswerText ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowAnswerText(true)}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-full text-sm font-bold transition-colors shadow-sm"
                        >
                          <Eye size={18} /> Xem đáp án
                        </motion.button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="inline-flex items-center justify-center gap-2 text-green-700 bg-green-100 px-6 py-3 rounded-xl border border-green-200 shadow-inner"
                        >
                          <CheckCircle2 size={24} />
                          <span className="font-bold text-lg">{content.answerText}</span>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
               <button
                onClick={onClose}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSuccess || attempts >= 2 ? 'Tiếp tục quay vòng mới ➜' : 'Đóng cửa sổ'}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WinnerModal;