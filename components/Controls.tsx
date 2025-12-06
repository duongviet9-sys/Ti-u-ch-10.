import React from 'react';
import { Upload, RotateCcw, Save, Trash2 } from 'lucide-react';

interface ControlsProps {
  studentsText: string;
  setStudentsText: (text: string) => void;
  questionsText: string;
  setQuestionsText: (text: string) => void;
  studentCount: number;
  questionCount: number;
  onReset: () => void;
  onClear: () => void;
  onAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasCustomAudio: boolean;
  clearCustomAudio: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  studentsText,
  setStudentsText,
  questionsText,
  setQuestionsText,
  studentCount,
  questionCount,
  onReset,
  onClear,
  onAudioUpload,
  hasCustomAudio,
  clearCustomAudio
}) => {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Students Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-[200px]">
        <div className="bg-indigo-50 p-3 border-b border-indigo-100 flex justify-between items-center">
          <h2 className="font-bold text-indigo-900 flex items-center gap-2">
            👨‍🎓 Danh sách học sinh
            <span className="bg-indigo-200 text-indigo-800 text-xs px-2 py-0.5 rounded-full">{studentCount}</span>
          </h2>
        </div>
        <textarea
          className="flex-1 w-full p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          value={studentsText}
          onChange={(e) => setStudentsText(e.target.value)}
          placeholder="Nhập tên học sinh, mỗi tên một dòng..."
        />
      </div>

      {/* Questions Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-[200px]">
        <div className="bg-amber-50 p-3 border-b border-amber-100 flex justify-between items-center">
          <h2 className="font-bold text-amber-900 flex items-center gap-2">
            ❓ Danh sách câu hỏi
            <span className="bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full">{questionCount}</span>
          </h2>
        </div>
        <textarea
          className="flex-1 w-full p-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          value={questionsText}
          onChange={(e) => setQuestionsText(e.target.value)}
          placeholder="Nhập câu hỏi, mỗi câu một dòng..."
        />
      </div>

      {/* Settings / Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Cài đặt</h3>
        
        <div className="space-y-4">
          {/* Audio Control */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Âm thanh khi quay</label>
             <div className="flex items-center gap-2">
               <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                 <Upload size={16} />
                 <span>{hasCustomAudio ? "Đổi file khác" : "Upload MP3/WAV"}</span>
                 <input type="file" accept="audio/*" className="hidden" onChange={onAudioUpload} />
               </label>
               {hasCustomAudio && (
                 <button 
                  onClick={clearCustomAudio}
                  className="text-red-500 text-xs hover:underline"
                 >
                   Xóa file riêng
                 </button>
               )}
             </div>
             <p className="text-xs text-gray-400 mt-1">
               {hasCustomAudio ? "✅ Đang dùng âm thanh tùy chỉnh" : "🔊 Đang dùng âm thanh mặc định"}
             </p>
          </div>

          <div className="h-px bg-gray-100 my-2"></div>

          {/* Reset Buttons */}
          <div className="flex gap-2">
             <button 
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
             >
               <RotateCcw size={16} /> Reset Mặc định
             </button>
             <button 
              onClick={onClear}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
             >
               <Trash2 size={16} /> Xóa Trắng
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
