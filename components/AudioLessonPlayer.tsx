
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Youtube, CheckCircle, XCircle, ArrowRight, Award, SkipForward, Volume2, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { AudioLesson, AudioLessonSegment, QuizQuestion } from '../types';
import { generateSpeech } from '../services/elevenLabsService';

// Reusing Key from StudyBuddyChat for convenience since user didn't provide separate one for search
const YOUTUBE_API_KEY = 'AIzaSyBd5o02cc1ArgEyHPRZZ_H0k0Ro_AqMbcY';

interface Props {
  lesson: AudioLesson;
  onComplete: () => void;
  onBack: () => void;
}

const AudioLessonPlayer: React.FC<Props> = ({ lesson, onComplete, onBack }) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showFinalTest, setShowFinalTest] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  
  // Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);

  // Final Test State
  const [finalTestIndex, setFinalTestIndex] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTestFinished, setFinalTestFinished] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentSegment = lesson.segments[currentSegmentIndex];

  // Load Audio for current segment
  useEffect(() => {
    const loadSegment = async () => {
      setLoadingAudio(true);
      setIsPlaying(false);
      setAudioUrl(null);
      setVideoData(null);
      
      // Check if we already have url stored (optimization for real app: cache these)
      // Here we generate fresh
      const url = await generateSpeech(currentSegment.text);
      if (url) {
        setAudioUrl(url);
        // Auto play
        setTimeout(() => {
             if(audioRef.current) {
                 audioRef.current.play().catch(e => console.log("Autoplay blocked"));
                 setIsPlaying(true);
             }
        }, 500);
      }
      setLoadingAudio(false);

      // Pre-fetch video
      if (currentSegment.youtubeQuery) {
          try {
            const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(currentSegment.youtubeQuery)}&key=${YOUTUBE_API_KEY}&type=video&videoDuration=short`);
            const data = await res.json();
            if (data.items && data.items.length > 0) {
                setVideoData(data.items[0]);
            }
          } catch(e) { console.error(e); }
      }
    };

    if (currentSegment && !showFinalTest) {
        loadSegment();
    }
  }, [currentSegmentIndex, currentSegment, showFinalTest]);

  const handleAudioEnd = () => {
      setIsPlaying(false);
      setShowQuiz(true);
  };

  const togglePlay = () => {
      if (!audioRef.current) return;
      if (isPlaying) {
          audioRef.current.pause();
      } else {
          audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
  };

  const handleQuizAnswer = (idx: number) => {
      if (quizResult) return;
      setSelectedOption(idx);
      const isCorrect = idx === currentSegment.quiz?.correctAnswer;
      setQuizResult(isCorrect ? 'correct' : 'wrong');
  };

  const handleQuizNext = () => {
      setShowQuiz(false);
      setQuizResult(null);
      setSelectedOption(null);
      
      if (videoData) {
          setShowVideo(true);
      } else {
          advanceSegment();
      }
  };

  const advanceSegment = () => {
      setShowVideo(false);
      if (currentSegmentIndex < lesson.segments.length - 1) {
          setCurrentSegmentIndex(prev => prev + 1);
      } else {
          setShowFinalTest(true);
      }
  };

  // Final Test Logic
  const handleFinalAnswer = (idx: number) => {
      if (selectedOption !== null) return;
      setSelectedOption(idx);
      const isCorrect = idx === lesson.finalTest[finalTestIndex].correctAnswer;
      if (isCorrect) setFinalScore(s => s + 1);
      
      setTimeout(() => {
          if (finalTestIndex < lesson.finalTest.length - 1) {
              setFinalTestIndex(prev => prev + 1);
              setSelectedOption(null);
          } else {
              setFinalTestFinished(true);
              onComplete();
          }
      }, 1000);
  };

  // --- RENDERS ---

  if (showFinalTest) {
      if (finalTestFinished) {
          return (
              <div className="flex flex-col items-center justify-center h-full bg-black text-white p-6">
                  <div className="w-24 h-24 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                      <Award size={48} />
                  </div>
                  <h2 className="text-4xl font-bold mb-4">Lesson Complete!</h2>
                  <p className="text-xl text-zinc-400 mb-8">You scored {finalScore} / {lesson.finalTest.length}</p>
                  <button onClick={onBack} className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform">
                      Return to Library
                  </button>
              </div>
          );
      }

      const q = lesson.finalTest[finalTestIndex];
      return (
          <div className="flex flex-col h-full bg-black text-white p-6 md:p-12 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                   <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${((finalTestIndex + 1) / lesson.finalTest.length) * 100}%` }}
                   ></div>
               </div>
               
               <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
                   <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-4">Final Test • Question {finalTestIndex + 1}/{lesson.finalTest.length}</h3>
                   <h2 className="text-2xl font-bold mb-8">{q.question}</h2>
                   <div className="space-y-3">
                       {q.options.map((opt, i) => (
                           <button
                                key={i}
                                disabled={selectedOption !== null}
                                onClick={() => handleFinalAnswer(i)}
                                className={`w-full p-4 rounded-xl text-left border transition-all ${
                                    selectedOption === i 
                                        ? i === q.correctAnswer ? 'bg-green-900/50 border-green-500 text-green-200' : 'bg-red-900/50 border-red-500 text-red-200'
                                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                                }`}
                           >
                               {opt}
                           </button>
                       ))}
                   </div>
               </div>
          </div>
      );
  }

  // --- Main Player ---
  
  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center font-sans">
      <audio 
        ref={audioRef} 
        src={audioUrl || undefined} 
        onEnded={handleAudioEnd}
        className="hidden"
      />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 to-black pointer-events-none"></div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-4xl px-6 flex-1 flex flex-col justify-center items-center text-center">
         
         {loadingAudio && (
             <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                 <div className="flex flex-col items-center gap-3">
                     <div className="w-12 h-12 border-4 border-zinc-700 border-t-white rounded-full animate-spin"></div>
                     <p className="text-zinc-400 text-sm">Synthesizing Voice...</p>
                 </div>
             </div>
         )}

         {/* Captions Display */}
         <div className="mb-12 transition-all duration-500">
             <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6">
                 {lesson.title} • Segment {currentSegmentIndex + 1}/{lesson.segments.length}
             </h4>
             <p className="text-2xl md:text-4xl font-medium leading-relaxed text-white max-w-2xl mx-auto">
                 {currentSegment.text}
             </p>
         </div>

         {/* Floating Controls */}
         <div className="flex items-center gap-6 bg-zinc-900/80 backdrop-blur-md px-8 py-4 rounded-full border border-zinc-800 shadow-2xl transition-all hover:scale-105 hover:bg-zinc-800">
             <button onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 5; }} className="text-zinc-400 hover:text-white transition-colors">
                 <RotateCcw size={20} />
             </button>
             
             <button 
                onClick={togglePlay}
                className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
             >
                 {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
             </button>

             <button onClick={() => { handleAudioEnd(); }} className="text-zinc-400 hover:text-white transition-colors">
                 <SkipForward size={20} />
             </button>
         </div>
      </div>

      {/* Quiz Overlay */}
      {showQuiz && currentSegment.quiz && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
              <div className="max-w-xl w-full">
                  <div className="mb-8 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-900/50 text-xs font-bold uppercase mb-4">
                          <CheckCircle size={14} /> Knowledge Check
                      </div>
                      <h3 className="text-2xl font-bold text-white">{currentSegment.quiz.question}</h3>
                  </div>

                  <div className="space-y-3 mb-8">
                      {currentSegment.quiz.options.map((opt, i) => (
                          <button
                            key={i}
                            disabled={quizResult !== null}
                            onClick={() => handleQuizAnswer(i)}
                            className={`
                                w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between
                                ${selectedOption === i 
                                    ? i === currentSegment.quiz!.correctAnswer ? 'bg-green-900/20 border-green-500 text-green-200' : 'bg-red-900/20 border-red-500 text-red-200'
                                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                                }
                            `}
                          >
                              <span>{opt}</span>
                              {selectedOption === i && (
                                  i === currentSegment.quiz!.correctAnswer ? <CheckCircle size={20} /> : <XCircle size={20} />
                              )}
                          </button>
                      ))}
                  </div>

                  {quizResult && (
                      <div className="animate-fade-in">
                          <p className="text-zinc-400 text-sm mb-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                              <span className="text-white font-bold">Explanation:</span> {currentSegment.quiz.explanation}
                          </p>
                          <button 
                            onClick={handleQuizNext}
                            className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                          >
                              {videoData ? 'Watch Related Video' : 'Continue Lesson'} <ArrowRight size={18} />
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Video Overlay */}
      {showVideo && videoData && (
           <div className="absolute inset-0 z-50 bg-black flex flex-col animate-fade-in">
               <div className="flex-1 flex items-center justify-center relative">
                   <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${videoData.id.videoId}?autoplay=1&controls=0&rel=0`}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="pointer-events-none md:pointer-events-auto"
                   ></iframe>
                   
                   {/* Overlay Controls */}
                   <div className="absolute bottom-12 left-0 right-0 flex justify-center pb-safe">
                       <button 
                            onClick={advanceSegment}
                            className="px-8 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-colors flex items-center gap-2"
                       >
                           Skip / Continue <ChevronRight size={18} />
                       </button>
                   </div>
               </div>
           </div>
      )}
      
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 p-2 text-zinc-500 hover:text-white transition-colors z-50"
      >
          <XCircle size={24} />
      </button>

    </div>
  );
};

export default AudioLessonPlayer;
