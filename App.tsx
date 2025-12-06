import React, { useState, useRef, useEffect, useMemo } from 'react';
import Wheel from './components/Wheel';
import Controls from './components/Controls';
import WinnerModal from './components/WinnerModal';
import { DEFAULT_STUDENTS, DEFAULT_QUESTIONS, WheelResult } from './types';
import { Volume2, VolumeX } from 'lucide-react';

const PALETTE = [
  "#f87171", // red-400
  "#fbbf24", // amber-400
  "#34d399", // emerald-400
  "#60a5fa", // blue-400
  "#a78bfa", // violet-400
  "#f472b6", // pink-400
];

export default function App() {
  // --- State ---
  const [studentsText, setStudentsText] = useState(DEFAULT_STUDENTS.join("\n"));
  const [questionsText, setQuestionsText] = useState(DEFAULT_QUESTIONS.join("\n"));
  
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Derived State ---
  const students = useMemo(() => 
    studentsText.split(/\r?\n/).map(s => s.trim()).filter(Boolean), 
  [studentsText]);

  const questions = useMemo(() => 
    questionsText.split(/\r?\n/).map(q => q.trim()).filter(Boolean), 
  [questionsText]);

  // --- Logic ---

  // Default "tick" sound effect created with minimal encoded data or just empty logic handled by UI
  // Since we can't reliably link external MP3s, we will default to silent if no file uploaded, 
  // or use a simple oscillator if I were to write a synth, but simple HTML Audio is requested.
  // I will use a very short, reliable base64 tick sound for the "default" if user hasn't uploaded.
  // Actually, to keep it clean, let's just use the custom upload as the primary sound source. 
  // If no custom source, it stays silent or we can simulate a tick later.
  // For this implementation, I will play the audioRef if src exists.
  
  const handleSpin = () => {
    if (isSpinning || students.length === 0) return;

    setIsSpinning(true);
    setShowModal(false);

    // 1. Determine Winner Index
    const winnerIndex = Math.floor(Math.random() * students.length);
    const winnerName = students[winnerIndex];

    // 2. Pick Random Question
    const questionIndex = questions.length > 0 
      ? Math.floor(Math.random() * questions.length) 
      : null;
    const selectedQuestion = questionIndex !== null ? questions[questionIndex] : null;

    // 3. Calculate Rotation
    // Segment size
    const segmentAngle = 360 / students.length;
    
    // Position of winner: 
    // Wheel is drawn clockwise starting at 12 o'clock (via transform -90).
    // The pointer is at 12 o'clock.
    // To get index i to 12 o'clock:
    // We need to rotate the wheel counter-clockwise by (i * segmentAngle) + centerOffset?
    // Actually, simpler: Total rotation must end such that the item is at top.
    
    // Let's rely on standard logic: 
    // currentRotation + (min_spins * 360) + offset
    const minSpins = 5;
    const randomOffset = Math.random() * segmentAngle * 0.8 - (segmentAngle * 0.4); // Add a bit of randomness within the slice
    
    // Target Angle Calculation:
    // We want the winner index to land at Angle 0 (Top).
    // If the wheel starts at 0, item 0 is at 0->segmentAngle. Center is segmentAngle/2.
    // To get item i to top: Rotation = - (i * segmentAngle + segmentAngle/2).
    // Add 360 * spins.
    
    // Current rotation modulo 360 might be anything. Let's just add cumulative rotation.
    const currentRot = rotation;
    const itemCenterAngle = (winnerIndex * segmentAngle) + (segmentAngle / 2);
    
    // We need to rotate against the index direction. 
    // Visual index increases CLOCKWISE. So to bring index i to top, we rotate COUNTER-CLOCKWISE (negative) or calculate Target.
    // Let's rotate Clockwise physically.
    // Target position = (360 - itemCenterAngle) % 360.
    
    const nextRotation = currentRot + (360 * minSpins) + (360 - (currentRot % 360)) + (360 - itemCenterAngle);

    // Play Audio
    if (audioRef.current && !isMuted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {}); // catch autoplay policies
    }

    setRotation(nextRotation);

    // Prepare Result
    setTimeout(() => {
      // Allow a small delay after animation finishes before showing modal
      setResult({ student: winnerName, question: selectedQuestion });
    }, 3900); // Slightly before animation ends (4s)
  };

  const handleTransitionEnd = () => {
    setIsSpinning(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setShowModal(true);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioSrc(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-800 font-sans selection:bg-indigo-100 pb-10">
      <audio ref={audioRef} src={audioSrc || undefined} loop />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎡</span>
            <h1 className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              LuckyWheel<span className="font-light text-gray-500">Classroom</span>
            </h1>
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-gray-200 text-gray-500' : 'bg-indigo-100 text-indigo-600'}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-6rem)]">
        
        {/* Left Column: Wheel Area */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[500px] bg-white/50 rounded-3xl border border-white shadow-xl p-8 backdrop-blur-sm">
          
          <div className="absolute top-4 left-4 z-10 bg-white/90 px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-gray-500 border border-gray-100">
            Tổng số: <span className="text-indigo-600 font-bold">{students.length}</span> học sinh
          </div>

          <Wheel 
            items={students} 
            rotation={rotation} 
            onTransitionEnd={handleTransitionEnd} 
            colors={PALETTE}
          />

          <div className="mt-8 w-full max-w-sm">
             <button
               onClick={handleSpin}
               disabled={isSpinning || students.length === 0}
               className={`w-full py-4 rounded-2xl font-black text-xl text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                 ${isSpinning || students.length === 0 
                   ? 'bg-gray-300 cursor-not-allowed' 
                   : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-indigo-300/50 hover:-translate-y-1'
                 }`}
             >
               {isSpinning ? 'Đang quay...' : 'QUAY NGAY! 🚀'}
             </button>
             {students.length === 0 && (
               <p className="text-center text-red-500 text-sm mt-2 font-medium">Vui lòng nhập danh sách học sinh bên phải</p>
             )}
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="lg:col-span-5 h-full">
           <Controls 
             studentsText={studentsText}
             setStudentsText={setStudentsText}
             questionsText={questionsText}
             setQuestionsText={setQuestionsText}
             studentCount={students.length}
             questionCount={questions.length}
             onReset={() => {
                setStudentsText(DEFAULT_STUDENTS.join("\n"));
                setQuestionsText(DEFAULT_QUESTIONS.join("\n"));
             }}
             onClear={() => {
               setStudentsText("");
               setQuestionsText("");
             }}
             onAudioUpload={handleAudioUpload}
             hasCustomAudio={!!audioSrc}
             clearCustomAudio={() => setAudioSrc(null)}
           />
        </div>

      </main>

      {/* Result Modal */}
      <WinnerModal 
        isOpen={showModal} 
        result={result} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
}
