import React, { useState } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Video, 
  FileText, 
  User, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight,
  Columns
} from 'lucide-react';

interface DeciTaskProps {
  onBack: () => void;
}

interface Topic {
  id: number;
  title: string;
  subtitle: string;
  fileName: string;
  videoName: string;
}

const topics: Topic[] = [
  {
    id: 1,
    title: "Project Overview",
    subtitle: "Topic 11.1 — DigitaMart",
    fileName: "1.html",
    videoName: "1.mp4"
  },
  {
    id: 2,
    title: "Set Up Your Notebook & Explore",
    subtitle: "Topic 11.2 — Task 1",
    fileName: "2.html",
    videoName: "2.mp4"
  },
  {
    id: 3,
    title: "Inspect and Clean the Data",
    subtitle: "Topic 11.3 — Task 2",
    fileName: "3.html",
    videoName: "3.mp4"
  },
  {
    id: 4,
    title: "Analyse and Visualise the Data",
    subtitle: "Topic 11.4 — Task 3",
    fileName: "4.html",
    videoName: "4.mp4"
  },
  {
    id: 5,
    title: "Project Overview (Cont.)",
    subtitle: "Topic 11.1 — DigitaMart",
    fileName: "5.html",
    videoName: "5.mp4"
  },
  {
    id: 6,
    title: "Recap on Project Requirements",
    subtitle: "Topic 12.1",
    fileName: "6.html",
    videoName: "6.mp4"
  },
  {
    id: 7,
    title: "The Evaluation Rubric",
    subtitle: "Topic 12.2",
    fileName: "7.html",
    videoName: "7.mp4"
  },
  {
    id: 8,
    title: "Project Submission Guide",
    subtitle: "Submission Process",
    fileName: "8.html",
    videoName: "8.mp4"
  }
];

const DeciTask: React.FC<DeciTaskProps> = ({ onBack }) => {
  const [activeTopicId, setActiveTopicId] = useState<number>(1);
  const [layout, setLayout] = useState<'split' | 'video' | 'notes'>('split');

  const activeTopic = topics.find(t => t.id === activeTopicId) || topics[0];

  const handleNext = () => {
    if (activeTopicId < topics.length) {
      setActiveTopicId(activeTopicId + 1);
    }
  };

  const handlePrev = () => {
    if (activeTopicId > 1) {
      setActiveTopicId(activeTopicId - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-indigo-500/30 flex flex-col overflow-x-hidden relative">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Banner / Student Information */}
      <header className="relative z-10 w-full border-b border-white/5 bg-[#08080a]/60 backdrop-blur-xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand/Back */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
          >
            <ArrowLeft size={18} className="text-gray-400 group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
                DECI Project
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight mt-0.5">
              Task Hub & Study Portal
            </h1>
          </div>
        </div>

        {/* Student Information Card */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-950/40 to-cyan-950/40 border border-indigo-500/20 rounded-2xl p-3 px-5 shadow-[0_0_25px_rgba(99,102,241,0.08)] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <User size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">Student / الطالب</div>
              <div className="font-bold text-sm text-white tracking-wide">
                يس أحمد صالح عبدالخالق محمد <span className="text-gray-400 font-normal">(Yasen Ahmed Saleh)</span>
              </div>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3 hidden sm:flex">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">ID / المعرّف</div>
              <div className="font-mono text-xs font-semibold text-cyan-300">
                EYOUTH-30901290101397
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        
        {/* Sidebar - Topics List */}
        <aside className="w-full lg:w-80 border-r border-white/5 bg-[#050507]/40 backdrop-blur-sm shrink-0 flex flex-col max-h-[40vh] lg:max-h-none overflow-y-auto">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <BookOpen size={14} className="text-indigo-400" />
              Course Syllabus ({topics.length} Topics)
            </div>
          </div>

          <div className="p-2 space-y-1">
            {topics.map((topic) => {
              const isActive = topic.id === activeTopicId;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopicId(topic.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-start gap-3 relative overflow-hidden group ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border border-indigo-500/30 text-white shadow-lg' 
                      : 'border border-transparent text-gray-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Left accent line for active item */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                  )}

                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isActive 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'bg-white/[0.04] text-gray-500 group-hover:text-gray-300 group-hover:bg-white/[0.08] transition-colors'
                  }`}>
                    {topic.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold tracking-wider text-indigo-400/80 uppercase">
                      {topic.subtitle}
                    </div>
                    <div className="font-bold text-sm mt-0.5 truncate">
                      {topic.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Viewer Area */}
        <main className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
          
          {/* Controls toolbar */}
          <div className="p-4 border-b border-white/5 bg-[#08080a]/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight">
                {activeTopic.subtitle}: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{activeTopic.title}</span>
              </span>
            </div>

            {/* Layout Toggles & Navigation */}
            <div className="flex items-center gap-3">
              {/* Layout Selectors */}
              <div className="flex items-center p-0.5 rounded-xl bg-white/[0.03] border border-white/5">
                <button
                  onClick={() => setLayout('split')}
                  title="Split Screen"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    layout === 'split' 
                      ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Columns size={13} />
                  <span className="hidden sm:inline">Split</span>
                </button>
                <button
                  onClick={() => setLayout('video')}
                  title="Focus Video"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    layout === 'video' 
                      ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Video size={13} />
                  <span className="hidden sm:inline">Video</span>
                </button>
                <button
                  onClick={() => setLayout('notes')}
                  title="Focus Notes"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    layout === 'notes' 
                      ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileText size={13} />
                  <span className="hidden sm:inline">Notes</span>
                </button>
              </div>

              <div className="h-6 w-[1px] bg-white/10" />

              {/* Prev / Next buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  disabled={activeTopicId === 1}
                  className="p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-mono text-gray-500 px-1">
                  {activeTopicId} / {topics.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={activeTopicId === topics.length}
                  className="p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Core Panel Split/Flex Area */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative p-4 gap-4">
            
            {/* Video container */}
            <div className={`transition-all duration-500 flex flex-col ${
              layout === 'video' 
                ? 'w-full h-full' 
                : layout === 'notes' 
                  ? 'hidden' 
                  : 'w-full md:w-[45%] h-[40vh] md:h-full shrink-0'
            }`}>
              <div className="relative w-full h-full bg-black/60 border border-white/5 rounded-2xl overflow-hidden flex flex-col group shadow-2xl">
                {/* Custom Overlay details */}
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-mono text-indigo-300 border border-indigo-500/10 pointer-events-none">
                  DECI_Task/Videos/{activeTopic.videoName}
                </div>

                <div className="flex-1 flex items-center justify-center bg-[#010102] relative">
                  <video
                    key={activeTopic.id}
                    src={`/DECI_Task/Videos/${activeTopic.videoName}`}
                    controls
                    className="w-full h-full object-contain"
                    poster=""
                  />
                </div>
              </div>
            </div>

            {/* HTML Notes container */}
            <div className={`transition-all duration-500 flex flex-col ${
              layout === 'notes' 
                ? 'w-full h-full' 
                : layout === 'video' 
                  ? 'hidden' 
                  : 'w-full md:flex-1 h-full'
            }`}>
              <div className="w-full h-full bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                {/* Notes title bar */}
                <div className="px-4 py-2 border-b border-white/5 bg-[#0e0e12]/60 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} className="text-cyan-400" />
                    Lecture Notes Frame
                  </span>
                  <span className="font-mono text-[10px]">
                    DECI_Task/Files/{activeTopic.fileName}
                  </span>
                </div>

                {/* Embed file inside iframe */}
                <iframe
                  key={activeTopic.id}
                  src={`/DECI_Task/Files/${activeTopic.fileName}`}
                  title={activeTopic.title}
                  className="w-full flex-1 bg-white border-0"
                />
              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
};

export default DeciTask;
