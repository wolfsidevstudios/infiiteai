
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Loader2, RotateCcw, ArrowUp, BarChart as BarChartIcon, FlaskConical, Play, RefreshCw, Youtube, ExternalLink, Maximize2, X, ChevronLeft, ChevronRight, Check, XCircle, ArrowDown, Move } from 'lucide-react';
import { createStudyChatSession } from '../services/geminiService';
import { Chat } from '@google/genai';
import { 
    LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell, ScatterChart, Scatter,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    RadialBarChart, RadialBar, ComposedChart
} from 'recharts';

// --- API Key for YouTube ---
const YOUTUBE_API_KEY = 'AIzaSyBd5o02cc1ArgEyHPRZZ_H0k0Ro_AqMbcY';

// --- Chart Colors ---
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#6366f1'];

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
}

interface ChartConfig {
    type: 'line' | 'bar' | 'area' | 'scatter' | 'pie' | 'radar' | 'radialBar' | 'composed';
    title: string;
    xLabel?: string;
    yLabel?: string;
    data: any[];
}

interface SimulationConfig {
    title: string;
    explanation: string;
    html: string;
}

interface YoutubeConfig {
    query: string;
    title: string;
}

interface FlashcardConfig {
    front: string;
    back: string;
}

// Expanded Interactive Quiz Types
type InteractiveQuizType = 
    | 'multiple-choice' | 'select-multiple' | 'true-false' 
    | 'short-answer' | 'fill-blank' 
    | 'ordering' | 'matching' 
    | 'number-line' | 'slider-estimation' | 'graph-plotting';

interface InteractiveQuizQuestion {
    type: InteractiveQuizType;
    question: string;
    explanation: string;
    // Polymorphic properties based on type
    options?: string[]; // MC, Select Multiple
    correctAnswer?: number | boolean | string | number[]; // Index, Bool, String, Index Array
    correctIndices?: number[]; // For select-multiple
    items?: string[]; // For Ordering
    correctOrder?: string[]; // For Ordering
    pairs?: { left: string; right: string }[]; // For Matching
    min?: number; // Number Line / Slider
    max?: number; // Number Line / Slider
    correctValue?: number; // Number Line / Slider
    tolerance?: number; // Number Line / Slider
    unit?: string; // Slider
    gridSize?: number; // Graphing
    targetPoint?: { x: number, y: number }; // Graphing
}

interface YoutubeVideo {
    id: { videoId: string };
    snippet: {
        title: string;
        thumbnails: {
            medium: { url: string };
        };
        channelTitle: string;
    };
}

// --- Confetti Easter Egg Component ---
const ConfettiOverlay = () => {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ffffff'];
    const pieces = Array.from({ length: 150 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: Math.random() * 3 + 2,
        bg: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
             {pieces.map(p => (
                 <div 
                    key={p.id}
                    className="absolute rounded-sm opacity-90"
                    style={{
                        left: `${p.left}vw`,
                        top: '-20px',
                        width: `${p.size}px`,
                        height: `${p.size * 0.6}px`,
                        backgroundColor: p.bg,
                        transform: `rotate(${p.rotation}deg)`,
                        animation: `confetti ${p.duration}s linear infinite ${p.delay}s`
                    }}
                 />
             ))}
             <style>{`
                 @keyframes confetti {
                     0% { transform: translateY(-10vh) rotate(0deg) translateX(0); opacity: 1; }
                     25% { transform: translateY(25vh) rotate(90deg) translateX(20px); }
                     50% { transform: translateY(50vh) rotate(180deg) translateX(-20px); }
                     75% { transform: translateY(75vh) rotate(270deg) translateX(10px); }
                     100% { transform: translateY(110vh) rotate(360deg) translateX(0); opacity: 0; }
                 }
             `}</style>
        </div>
    );
};

const ChartRenderer: React.FC<{ config: ChartConfig }> = ({ config }) => {
    // Helper to determine if X axis should be numeric (for accurate spacing)
    // We check if the 'x' values in data are numbers
    const isNumericX = config.data.length > 0 && typeof config.data[0].x === 'number';

    return (
        <div className="w-full bg-zinc-950/50 rounded-xl p-4 my-4 border border-zinc-700">
            <h4 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                <BarChartIcon size={14} className="text-blue-400" />
                {config.title}
            </h4>
            <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                        switch (config.type) {
                            case 'bar':
                                return (
                                    <BarChart data={config.data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis 
                                            dataKey="x" 
                                            stroke="#666" 
                                            label={{ value: config.xLabel, position: 'insideBottomRight', offset: -5 }} 
                                        />
                                        <YAxis stroke="#666" label={{ value: config.yLabel, angle: -90, position: 'insideLeft' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                                        <Bar dataKey="y" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                );
                            case 'area':
                                return (
                                    <AreaChart data={config.data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis 
                                            dataKey="x" 
                                            stroke="#666" 
                                            type={isNumericX ? "number" : "category"}
                                            domain={isNumericX ? ['auto', 'auto'] : undefined}
                                        />
                                        <YAxis stroke="#666" domain={['auto', 'auto']} />
                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                                        <Area type="monotone" dataKey="y" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                    </AreaChart>
                                );
                            case 'line':
                                return (
                                    <LineChart data={config.data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis 
                                            dataKey="x" 
                                            stroke="#666" 
                                            type={isNumericX ? "number" : "category"}
                                            domain={isNumericX ? ['auto', 'auto'] : undefined}
                                            allowDataOverflow={false} 
                                        />
                                        <YAxis stroke="#666" domain={['auto', 'auto']} />
                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                                        <Line type="monotone" dataKey="y" stroke="#8b5cf6" strokeWidth={2} dot={{r: 2}} activeDot={{r: 6}} />
                                    </LineChart>
                                );
                            case 'pie':
                                return (
                                    <PieChart>
                                        <Pie 
                                            data={config.data} 
                                            cx="50%" 
                                            cy="50%" 
                                            innerRadius={60} 
                                            outerRadius={80} 
                                            paddingAngle={5} 
                                            dataKey="value"
                                        >
                                          {config.data.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                                          ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                );
                            case 'scatter':
                                return (
                                     <ScatterChart>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis 
                                            type="number" 
                                            dataKey="x" 
                                            name={config.xLabel} 
                                            stroke="#666" 
                                            domain={['auto', 'auto']}
                                        />
                                        <YAxis 
                                            type="number" 
                                            dataKey="y" 
                                            name={config.yLabel} 
                                            stroke="#666"
                                            domain={['auto', 'auto']} 
                                        />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                                        <Scatter name={config.title} data={config.data} fill="#8b5cf6" />
                                     </ScatterChart>
                                );
                            case 'radar':
                                return (
                                     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={config.data}>
                                        <PolarGrid stroke="#333" />
                                        <PolarAngleAxis dataKey="subject" stroke="#999" tick={{ fill: '#888', fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#444" />
                                        <Radar name={config.title} dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                                     </RadarChart>
                                );
                            case 'radialBar':
                                return (
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={config.data}>
                                        <RadialBar
                                            minAngle={15}
                                            background={{ fill: '#333' }}
                                            clockWise
                                            dataKey="value"
                                            cornerRadius={10} 
                                            fill="#8b5cf6"
                                        />
                                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                                    </RadialBarChart>
                                );
                            case 'composed':
                                return (
                                      <ComposedChart data={config.data}>
                                         <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                         <XAxis 
                                            dataKey="x" 
                                            stroke="#666" 
                                            type={isNumericX ? "number" : "category"}
                                            domain={isNumericX ? ['auto', 'auto'] : undefined}
                                         />
                                         <YAxis stroke="#666" domain={['auto', 'auto']} />
                                         <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                                         <Legend />
                                         <Bar dataKey="barValue" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                         <Line type="monotone" dataKey="lineValue" stroke="#10b981" strokeWidth={2} dot={{r: 4}} />
                                      </ComposedChart>
                                );
                            default:
                                return <div className="text-zinc-500 flex items-center justify-center h-full">Unsupported chart type</div>;
                        }
                    })()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const SimulationRenderer: React.FC<{ config: SimulationConfig }> = ({ config }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    const FrameContent = () => (
        <iframe
            srcDoc={config.html}
            title={config.title}
            className="w-full h-full bg-black border-none"
            sandbox="allow-scripts allow-same-origin allow-popups"
        />
    );

    return (
        <>
            <div className="w-full bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden my-4 shadow-xl transition-all hover:border-zinc-600">
                {/* Header */}
                <div className="bg-zinc-900 p-3 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
                            <FlaskConical size={16} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm leading-tight">{config.title}</h4>
                            <p className="text-zinc-500 text-[10px] truncate max-w-[150px]">{config.explanation}</p>
                        </div>
                    </div>
                    <button 
                        onClick={toggleFullscreen}
                        className="p-1.5 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
                        title="Fullscreen"
                    >
                        <Maximize2 size={14} />
                    </button>
                </div>

                {/* Preview Container */}
                <div className="relative w-full h-[280px]">
                    <FrameContent />
                </div>
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full h-full max-w-6xl max-h-[90vh] bg-black rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden relative flex flex-col">
                        <div className="absolute top-4 right-4 z-50 flex gap-2">
                             <button 
                                onClick={toggleFullscreen}
                                className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg"
                             >
                                <X size={20} />
                             </button>
                        </div>
                        <FrameContent />
                    </div>
                </div>
            )}
        </>
    );
};

const YoutubeRenderer: React.FC<{ config: YoutubeConfig }> = ({ config }) => {
    const [videos, setVideos] = useState<YoutubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(config.query)}&key=${YOUTUBE_API_KEY}&type=video`);
                if (!res.ok) throw new Error("Failed to fetch youtube");
                const data = await res.json();
                setVideos(data.items || []);
            } catch (err) {
                console.error("YouTube Error", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [config.query]);

    return (
        <div className="w-full my-4">
            <h4 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                <Youtube size={16} className="text-red-500" />
                {config.title}
            </h4>
            
            {loading ? (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="min-w-[220px] h-32 bg-zinc-800/50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-zinc-500 text-xs bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                    Unable to load videos.
                </div>
            ) : (
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                    {videos.map((video) => (
                        <a 
                            key={video.id.videoId}
                            href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-[240px] w-[240px] group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all hover:scale-[1.02]"
                        >
                            <div className="relative aspect-video bg-black">
                                <img 
                                    src={video.snippet.thumbnails.medium.url} 
                                    alt={video.snippet.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                    <Play size={32} className="fill-white text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <div className="p-3">
                                <h5 className="text-white text-xs font-bold line-clamp-2 mb-1 group-hover:text-blue-300 transition-colors">
                                    {video.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                                </h5>
                                <p className="text-zinc-500 text-[10px] flex items-center gap-1">
                                    {video.snippet.channelTitle} <ExternalLink size={8} />
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

const ChatFlashcardDeck: React.FC<{ cards: FlashcardConfig[] }> = ({ cards }) => {
    // Robust check for cards array
    const safeCards = Array.isArray(cards) ? cards : [];
    
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    if (safeCards.length === 0) return null;

    const current = safeCards[index];
    if (!current) return null;

    return (
        <div className="my-4 w-full bg-zinc-950/50 rounded-xl border border-zinc-700 p-4">
             <div className="flex justify-between items-center mb-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                 <span>Flashcards</span>
                 <span>{index + 1} / {safeCards.length}</span>
             </div>

             <div 
                onClick={() => setFlipped(!flipped)}
                className="relative h-48 w-full cursor-pointer perspective-1000 group"
             >
                 <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ${flipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute w-full h-full bg-zinc-900 rounded-xl border border-zinc-800 p-6 flex flex-col items-center justify-center text-center backface-hidden shadow-inner">
                        <span className="text-[10px] text-zinc-600 font-bold uppercase mb-2">Front</span>
                        <p className="text-white font-medium">{current.front}</p>
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full bg-black rounded-xl border border-zinc-800 p-6 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-lg">
                        <span className="text-[10px] text-zinc-600 font-bold uppercase mb-2">Back</span>
                        <p className="text-zinc-200">{current.back}</p>
                    </div>
                 </div>
             </div>

             <div className="flex justify-center gap-4 mt-4">
                 <button 
                    onClick={() => { setIndex(i => Math.max(0, i - 1)); setFlipped(false); }}
                    disabled={index === 0}
                    className="p-2 rounded-full bg-zinc-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700"
                 >
                     <ChevronLeft size={16} />
                 </button>
                 <button 
                    onClick={() => setFlipped(!flipped)}
                    className="px-4 py-1.5 rounded-full bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                 >
                     Flip Card
                 </button>
                 <button 
                    onClick={() => { setIndex(i => Math.min(safeCards.length - 1, i + 1)); setFlipped(false); }}
                    disabled={index === safeCards.length - 1}
                    className="p-2 rounded-full bg-zinc-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700"
                 >
                     <ChevronRight size={16} />
                 </button>
             </div>
             
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};

const ChatQuiz: React.FC<{ questions: InteractiveQuizQuestion[] }> = ({ questions }) => {
    // Robust check for questions array
    const safeQuestions = Array.isArray(questions) ? questions : [];

    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    
    // State holders for different question types
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [textInput, setTextInput] = useState('');
    const [orderedList, setOrderedList] = useState<string[]>([]);
    const [matches, setMatches] = useState<Record<string, string>>({});
    const [activeMatchLeft, setActiveMatchLeft] = useState<string | null>(null);
    const [numericValue, setNumericValue] = useState<number | null>(null);
    const [plottedPoints, setPlottedPoints] = useState<{x: number, y: number}[]>([]);

    const current = safeQuestions[index];

    // Initialize state when question changes
    useEffect(() => {
        if (!current) return;

        setSelectedIndices([]);
        setTextInput('');
        setMatches({});
        setActiveMatchLeft(null);
        setNumericValue(current.min || 0);
        setPlottedPoints([]);
        
        if (current.type === 'ordering' && current.items) {
            // Shuffle for ordering
            setOrderedList([...current.items].sort(() => Math.random() - 0.5));
        }
    }, [index, current]);

    if (!current) return null;

    const checkAnswer = () => {
        let isCorrect = false;

        switch (current.type) {
            case 'multiple-choice':
            case 'true-false':
                if (selectedIndices.length > 0 && selectedIndices[0] === current.correctAnswer) isCorrect = true;
                break;
            case 'select-multiple':
                if (current.correctIndices) {
                    const sortedSelected = [...selectedIndices].sort().join(',');
                    const sortedCorrect = [...current.correctIndices].sort().join(',');
                    if (sortedSelected === sortedCorrect) isCorrect = true;
                }
                break;
            case 'short-answer':
            case 'fill-blank':
                if (typeof current.correctAnswer === 'string' && textInput.toLowerCase().trim() === current.correctAnswer.toLowerCase().trim()) isCorrect = true;
                break;
            case 'ordering':
                if (current.correctOrder && JSON.stringify(orderedList) === JSON.stringify(current.correctOrder)) isCorrect = true;
                break;
            case 'matching':
                // Check if all pairs match
                if (current.pairs) {
                    const correctPairs = current.pairs.reduce((acc, p) => ({...acc, [p.left]: p.right}), {} as Record<string, string>);
                    const userPairs = matches;
                    // Simply check if every key in userPairs matches correct value
                    isCorrect = Object.keys(correctPairs).length === Object.keys(userPairs).length && 
                                Object.entries(userPairs).every(([k, v]) => correctPairs[k] === v);
                }
                break;
            case 'number-line':
            case 'slider-estimation':
                if (current.correctValue !== undefined && numericValue !== null) {
                     const tolerance = current.tolerance || 0.1;
                     if (Math.abs(numericValue - current.correctValue) <= tolerance) isCorrect = true;
                }
                break;
            case 'graph-plotting':
                if (current.targetPoint && plottedPoints.length > 0) {
                     // Check if last plotted point is close enough
                     const last = plottedPoints[plottedPoints.length - 1];
                     if (Math.round(last.x) === current.targetPoint.x && Math.round(last.y) === current.targetPoint.y) isCorrect = true;
                }
                break;
        }

        if (isCorrect) setScore(s => s + 1);
        setShowResult(true);
    };

    const next = () => {
        if (index < safeQuestions.length - 1) {
            setIndex(index + 1);
            setShowResult(false);
        }
    };

    // --- Renderers for specific types ---

    const renderMultipleChoice = () => (
        <div className="space-y-2">
            {current.options?.map((opt, i) => {
                const isSelected = selectedIndices.includes(i);
                const isCorrect = showResult && (current.type === 'select-multiple' ? (current.correctIndices?.includes(i)) : i === current.correctAnswer);
                const isWrong = showResult && isSelected && !isCorrect;
                
                let style = "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800";
                if (showResult) {
                     if (isCorrect) style = "bg-green-900/30 border-green-900/50 text-green-400";
                     else if (isWrong) style = "bg-red-900/30 border-red-900/50 text-red-400";
                     else style = "bg-zinc-900/50 border-zinc-800 text-zinc-600";
                } else if (isSelected) {
                     style = "bg-white text-black border-white";
                }

                return (
                    <button
                        key={i}
                        disabled={showResult}
                        onClick={() => {
                            if (current.type === 'select-multiple') {
                                setSelectedIndices(prev => prev.includes(i) ? prev.filter(idx => idx !== i) : [...prev, i]);
                            } else {
                                setSelectedIndices([i]);
                            }
                        }}
                        className={`w-full text-left p-3 rounded-lg border text-sm transition-colors flex justify-between items-center ${style}`}
                    >
                        <span>{opt}</span>
                        {isCorrect && <Check size={16} />}
                        {isWrong && <XCircle size={16} />}
                    </button>
                );
            })}
        </div>
    );

    const renderTextInput = () => (
        <div className="space-y-2">
            {current.type === 'fill-blank' && (
                <p className="text-zinc-400 text-sm mb-2 italic">Fill in the blank: "{current.question.replace('{blank}', '______')}"</p>
            )}
            <input 
                type="text" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={showResult}
                placeholder="Type your answer..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
        </div>
    );

    const renderOrdering = () => (
        <div className="space-y-2">
            {orderedList.map((item, i) => (
                <div key={item} className="flex items-center gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="flex flex-col gap-1">
                        <button 
                            disabled={showResult || i === 0}
                            onClick={() => {
                                const newList = [...orderedList];
                                [newList[i - 1], newList[i]] = [newList[i], newList[i - 1]];
                                setOrderedList(newList);
                            }}
                            className="text-zinc-500 hover:text-white disabled:opacity-30"
                        >
                            <ArrowUp size={14} />
                        </button>
                        <button 
                             disabled={showResult || i === orderedList.length - 1}
                             onClick={() => {
                                const newList = [...orderedList];
                                [newList[i + 1], newList[i]] = [newList[i], newList[i + 1]];
                                setOrderedList(newList);
                            }}
                            className="text-zinc-500 hover:text-white disabled:opacity-30"
                        >
                            <ArrowDown size={14} />
                        </button>
                    </div>
                    <span className="text-sm text-zinc-300">{item}</span>
                </div>
            ))}
        </div>
    );

    const renderMatching = () => {
        if (!current.pairs) return null;
        const lefts = current.pairs.map(p => p.left);
        const rights = current.pairs.map(p => p.right); // Assuming these might be shuffled in a real app, simplified here

        return (
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    {lefts.map(l => (
                        <button 
                            key={l}
                            disabled={showResult || matches[l] !== undefined}
                            onClick={() => setActiveMatchLeft(l)}
                            className={`w-full p-2 text-xs rounded border text-left truncate ${
                                activeMatchLeft === l ? 'bg-blue-600 border-blue-500 text-white' : 
                                matches[l] ? 'bg-zinc-800 text-zinc-500 border-zinc-800' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
                <div className="space-y-2">
                    {rights.map(r => {
                         const isMatched = Object.values(matches).includes(r);
                         return (
                            <button 
                                key={r}
                                disabled={showResult || !activeMatchLeft || isMatched}
                                onClick={() => {
                                    if (activeMatchLeft) {
                                        setMatches({...matches, [activeMatchLeft]: r});
                                        setActiveMatchLeft(null);
                                    }
                                }}
                                className={`w-full p-2 text-xs rounded border text-left truncate ${
                                    isMatched ? 'bg-zinc-800 text-zinc-500 border-zinc-800' : 
                                    (activeMatchLeft && !isMatched) ? 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-blue-500' : 'bg-zinc-900/50 text-zinc-600 border-zinc-800'
                                }`}
                            >
                                {r}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderNumberLine = () => (
        <div className="py-6 px-2">
            <input 
                type="range" 
                min={current.min} 
                max={current.max} 
                step={(current.tolerance || 1) / 2}
                value={numericValue || 0}
                disabled={showResult}
                onChange={(e) => setNumericValue(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                <span>{current.min}</span>
                <span className="text-white font-bold text-lg">{numericValue} {current.unit}</span>
                <span>{current.max}</span>
            </div>
        </div>
    );

    const renderGraphPlotting = () => {
        const size = current.gridSize || 10;
        const handlePlot = (e: React.MouseEvent<SVGSVGElement>) => {
            if (showResult) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.round(((e.clientX - rect.left) / rect.width) * size);
            const y = Math.round((1 - (e.clientY - rect.top) / rect.height) * size);
            setPlottedPoints([{x, y}]);
        };

        return (
            <div className="flex flex-col items-center">
                <div className="relative w-64 h-64 bg-zinc-900 border border-zinc-700 rounded-lg cursor-crosshair overflow-hidden">
                    <svg width="100%" height="100%" onClick={handlePlot}>
                        {/* Grid */}
                        {Array.from({length: size + 1}).map((_, i) => (
                            <React.Fragment key={i}>
                                <line x1={i * (100/size) + "%"} y1="0" x2={i * (100/size) + "%"} y2="100%" stroke="#333" strokeWidth="1" />
                                <line x1="0" y1={i * (100/size) + "%"} x2="100%" y2={i * (100/size) + "%"} stroke="#333" strokeWidth="1" />
                            </React.Fragment>
                        ))}
                        {/* Points */}
                        {plottedPoints.map((p, i) => (
                             <circle key={i} cx={p.x * (100/size) + "%"} cy={(size - p.y) * (100/size) + "%"} r="6" fill="#3b82f6" />
                        ))}
                        {/* Target (Only on result) */}
                        {showResult && current.targetPoint && (
                            <circle cx={current.targetPoint.x * (100/size) + "%"} cy={(size - current.targetPoint.y) * (100/size) + "%"} r="6" fill="transparent" stroke="#10b981" strokeWidth="2" />
                        )}
                    </svg>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Click on grid to plot ({plottedPoints[0]?.x ?? '-'}, {plottedPoints[0]?.y ?? '-'})</p>
            </div>
        );
    };

    return (
        <div className="my-4 w-full bg-zinc-950/50 rounded-xl border border-zinc-700 p-4">
            <div className="flex justify-between items-center mb-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                 <span>Interactive Quiz</span>
                 <span>{score} / {safeQuestions.length} Correct</span>
             </div>

            <div className="mb-6">
                <h5 className="text-white font-bold mb-4 text-lg">{current.question}</h5>
                
                {/* Dynamic Body Based on Type */}
                <div className="mb-4">
                    {(current.type === 'multiple-choice' || current.type === 'select-multiple' || current.type === 'true-false') && renderMultipleChoice()}
                    {(current.type === 'short-answer' || current.type === 'fill-blank') && renderTextInput()}
                    {current.type === 'ordering' && renderOrdering()}
                    {current.type === 'matching' && renderMatching()}
                    {(current.type === 'number-line' || current.type === 'slider-estimation') && renderNumberLine()}
                    {current.type === 'graph-plotting' && renderGraphPlotting()}
                </div>

                {!showResult ? (
                    <button 
                        onClick={checkAnswer}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-500 transition-colors shadow-lg"
                    >
                        Check Answer
                    </button>
                ) : (
                    <div className="animate-fade-in">
                        <div className="p-3 bg-blue-900/20 border border-blue-900/30 rounded-lg text-xs text-blue-200 mb-3">
                            <span className="font-bold">Explanation: </span>{current.explanation}
                        </div>
                        {index < safeQuestions.length - 1 ? (
                            <button onClick={next} className="w-full py-2 bg-white text-black rounded-lg font-bold text-sm hover:scale-[1.02] transition-transform">
                                Next Question
                            </button>
                        ) : (
                            <div className="text-center py-2 text-sm font-bold text-zinc-400">Quiz Complete!</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const StudyBuddyChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        { 
            id: 'intro', 
            role: 'model', 
            text: "<p>Hi! I'm your <strong>Study Buddy</strong>.</p><p>I can help with math, science, and more.</p><div class='tip'>Try asking: 'Simulate free fall gravity', 'Graph y=x^2', or 'Quiz me on biology'</div>" 
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const chatSession = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatSession.current = createStudyChatSession();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !chatSession.current) return;

        // Confetti Easter Egg
        if (input.toLowerCase().includes('happy new year')) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 6000); // Confetti lasts 6 seconds
        }

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const result = await chatSession.current.sendMessage({ message: userMsg.text });
            const responseText = result.text || "<p>I'm having trouble connecting right now. Try again?</p>";
            
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "<p class='warning'>Sorry, I encountered an error. Please try again.</p>"
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleReset = () => {
        chatSession.current = createStudyChatSession();
        setMessages([{ 
            id: Date.now().toString(), 
            role: 'model', 
            text: "<p>Ready for a new topic! <strong>What's next?</strong></p>" 
        }]);
    };

    // Helper to split message into Text, Chart, Simulation, and Video parts
    const renderMessageContent = (text: string) => {
        // Regex looks for: ```json-chart ... ``` OR ```json-simulation ... ``` OR ```json-youtube ... ``` OR ```json-flashcards ... ``` OR ```json-quiz ... ```
        const parts = text.split(/```(json-chart|json-simulation|json-youtube|json-flashcards|json-quiz)\n([\s\S]*?)\n```/g);
        
        const elements: React.ReactNode[] = [];
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            // If it's a known type keyword, the NEXT element is the JSON content
            if (['json-chart', 'json-simulation', 'json-youtube', 'json-flashcards', 'json-quiz'].includes(part)) {
                const jsonContent = parts[i + 1];
                i++; // Skip next iteration as we consume it here
                
                try {
                    const config = JSON.parse(jsonContent);
                    if (part === 'json-chart') {
                        elements.push(<ChartRenderer key={`chart-${i}`} config={config} />);
                    } else if (part === 'json-simulation') {
                        elements.push(<SimulationRenderer key={`sim-${i}`} config={config} />);
                    } else if (part === 'json-youtube') {
                        elements.push(<YoutubeRenderer key={`yt-${i}`} config={config} />);
                    } else if (part === 'json-flashcards') {
                        elements.push(<ChatFlashcardDeck key={`fc-${i}`} cards={config} />);
                    } else if (part === 'json-quiz') {
                        elements.push(<ChatQuiz key={`qz-${i}`} questions={config} />);
                    }
                } catch (e) {
                    console.error(e);
                    elements.push(<div key={`err-${i}`} className="hidden">Invalid Visual Data</div>);
                }
            } else {
                // Regular text
                if (part.trim()) {
                    elements.push(
                        <div key={`text-${i}`} className="prose-custom" dangerouslySetInnerHTML={{ __html: part }} />
                    );
                }
            }
        }
        
        return elements;
    };

    return (
        <div className="flex flex-col h-full relative">
             {showConfetti && <ConfettiOverlay />}

             {/* Header */}
             <div className="p-4 flex items-center justify-between z-10">
                 <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-500/20 text-blue-400 rounded-full backdrop-blur-md border border-blue-500/10">
                         <Bot size={20} />
                     </div>
                     <div>
                         <h3 className="text-white font-bold text-lg drop-shadow-md">Study Buddy</h3>
                         <p className="text-xs text-zinc-400 font-medium">Step-by-step guidance</p>
                     </div>
                 </div>
                 <button 
                    onClick={handleReset}
                    className="p-2 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md"
                    title="Reset Chat"
                 >
                     <RotateCcw size={18} />
                 </button>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-40 md:pb-32 relative">
                 {messages.map((msg) => (
                     <div 
                        key={msg.id} 
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                     >
                         {msg.role === 'model' && (
                             <div className="w-8 h-8 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center shrink-0 border border-zinc-700/50 mt-2 shadow-lg">
                                 <Bot size={14} className="text-zinc-400" />
                             </div>
                         )}
                         
                         <div className={`
                             max-w-[85%] md:max-w-[70%] px-6 py-4 text-[15px] leading-relaxed backdrop-blur-md shadow-xl
                             ${msg.role === 'user' 
                                ? 'bg-white text-black rounded-[2rem] rounded-tr-none' 
                                : 'bg-zinc-900/80 text-zinc-100 rounded-[2rem] rounded-tl-none border border-zinc-700/50'}
                         `}>
                             {msg.role === 'model' ? (
                                renderMessageContent(msg.text)
                             ) : (
                                msg.text
                             )}
                         </div>
                     </div>
                 ))}
                 
                 {isTyping && (
                     <div className="flex gap-3 justify-start animate-fade-in">
                         <div className="w-8 h-8 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center shrink-0 border border-zinc-700/50 shadow-lg">
                             <Bot size={14} className="text-zinc-400" />
                         </div>
                         <div className="bg-zinc-900/80 backdrop-blur-md rounded-[2rem] rounded-tl-none px-6 py-4 flex items-center gap-2 border border-zinc-700/50 shadow-xl">
                             <Loader2 size={16} className="animate-spin text-zinc-500" />
                             <span className="text-xs text-zinc-500">Thinking...</span>
                         </div>
                     </div>
                 )}
                 <div ref={messagesEndRef} />
             </div>

             {/* Input - Floating Pill */}
             <div className="absolute bottom-24 md:bottom-6 left-0 right-0 px-4 flex justify-center z-20 pointer-events-none">
                 <form onSubmit={handleSend} className="relative flex items-center gap-2 max-w-lg w-full pointer-events-auto">
                     <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur opacity-75"></div>
                     <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 rounded-full pl-6 pr-14 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all shadow-2xl relative z-10"
                     />
                     <button 
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 p-2 bg-white text-black rounded-full hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg w-10 h-10 flex items-center justify-center z-20"
                     >
                         <ArrowUp size={20} strokeWidth={2.5} />
                     </button>
                 </form>
             </div>

            {/* Injected Styles for Generative UI */}
            <style>{`
                .prose-custom h3 { font-size: 1.1em; font-weight: 700; color: white; margin: 12px 0 8px 0; }
                .prose-custom p { margin-bottom: 8px; }
                .prose-custom ul { margin: 8px 0; padding-left: 0; list-style: none; }
                .prose-custom li { margin-bottom: 6px; position: relative; padding-left: 18px; }
                .prose-custom li::before { content: "•"; color: #60a5fa; position: absolute; left: 0; font-weight: bold; }
                .prose-custom strong { color: white; font-weight: 600; }
                
                .highlight {
                    background: rgba(59, 130, 246, 0.15);
                    color: #93c5fd;
                    padding: 2px 6px;
                    border-radius: 6px;
                    font-weight: 500;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                }
                
                .tip {
                    margin: 12px 0;
                    padding: 12px 16px;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 12px;
                    color: #d1fae5;
                    font-size: 0.95em;
                    display: flex;
                    gap: 8px;
                    align-items: flex-start;
                }
                .tip::before {
                    content: "💡";
                    font-size: 1.1em;
                }
                
                .warning {
                    margin: 12px 0;
                    padding: 12px 16px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 12px;
                    color: #fee2e2;
                    font-size: 0.95em;
                }

                .step-card {
                    margin: 8px 0;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    display: flex;
                    gap: 12px;
                }
                .step-number {
                    background: #27272a;
                    color: #e4e4e7;
                    border: 1px solid #3f3f46;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75em;
                    font-weight: bold;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .concept-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 12px;
                    margin: 12px 0;
                }
            `}</style>
        </div>
    );
};

export default StudyBuddyChat;
