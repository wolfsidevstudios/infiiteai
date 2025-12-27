
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUp,
  Upload,
  FileText,
  Loader2,
  BookOpen,
  Brain,
  Calendar as CalendarIcon,
  X,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Zap,
  Layout,
  Plus,
  Image as ImageIcon,
  Paperclip,
  AtSign,
  Network,
  Home,
  ListTodo,
  CalendarDays,
  Plane,
  Menu,
  Check,
  Mic,
  Send,
  MoreVertical,
  Bot,
  Bell,
  Globe,
  Search,
  PenTool,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer2,
  Layers,
  Calculator,
  Hourglass,
  FlaskConical,
  MapPin,
  Map as MapIcon,
  Snowflake,
  ExternalLink,
  Clock,
  Notebook,
  Bold,
  Italic,
  Underline,
  Highlighter,
  Palette,
  Type,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading,
  BookA
} from 'lucide-react';

import { StudyMaterial, Flashcard, QuizQuestion, StudyPlan, ConceptMapNode, Task, StudyLocation, SearchResult } from './types';
import { 
  saveMaterial, 
  getMaterials, 
  deleteMaterial,
  saveFlashcards,
  getFlashcards,
  getQuizResults,
  getStats,
  updateStats,
  saveOverview,
  getOverview,
  saveConceptMap,
  getConceptMap,
  saveTask,
  getTasks,
  updateTask,
  deleteTask,
  saveLocations,
  getLocations,
  saveKeyTerms,
  getKeyTerms
} from './services/storageService';
import { generateSummary, generateFlashcards, generateQuiz, generateShortOverview, generateConceptMap, generateLocationData, performWebSearch, generateStructuredNotes, generateKeyTerms } from './services/geminiService';
import FlashcardDeck from './components/FlashcardDeck';
import QuizRunner from './components/QuizRunner';
import DictionarySlide from './components/DictionarySlide';

// --- Shared Liquid Glass Component ---
interface LiquidGlassProps {
    children?: React.ReactNode;
    className?: string;
    innerClassName?: string;
}

const LiquidGlass: React.FC<LiquidGlassProps> = ({ children, className = "", innerClassName = "p-4 flex items-center" }) => (
    <div className={`glass-container ${className}`}>
        <div className="glass-filter"></div>
        <div className="glass-overlay"></div>
        <div className="glass-specular"></div>
        <div className={`relative z-10 w-full h-full ${innerClassName}`}>
            {children}
        </div>
    </div>
);

// --- Snow Effect Component ---
const SnowOverlay = () => {
    // Generate flakes with random properties
    const flakes = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: Math.random() * 3 + 2, // 2-5s
        delay: Math.random() * 5,
        size: Math.random() * 10 + 10 // 10-20px
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden font-sans">
            {flakes.map((flake) => (
                <div 
                    key={flake.id}
                    className="absolute text-blue-200/60 animate-snowfall"
                    style={{
                        left: `${flake.left}vw`,
                        animationDuration: `${flake.duration}s`,
                        animationDelay: `${flake.delay}s`,
                        fontSize: `${flake.size}px`,
                        top: '-20px'
                    }}
                >
                    ❄
                </div>
            ))}
            <style>{`
                @keyframes snowfall {
                    0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0.8; }
                    100% { transform: translateY(110vh) translateX(20px) rotate(180deg); opacity: 0.2; }
                }
                .animate-snowfall {
                    animation-name: snowfall;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
};

// --- Shared 3D Carousel Component ---
const Carousel3D = ({ items, activeIndex, onNavigate, loading = false }: { items: React.ReactNode[], activeIndex: number, onNavigate: (i: number) => void, loading?: boolean }) => {
    return (
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{ perspective: '1000px' }}>
             {items.map((item, index) => {
                 const offset = index - activeIndex;
                 const isActive = index === activeIndex;
                 // Optimization: Only render visible or near-visible items
                 if (Math.abs(offset) > 2) return null;

                 return (
                     <div 
                        key={index}
                        onClick={() => !loading && onNavigate(index)}
                        className={`
                            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                            transition-all duration-700 cubic-bezier(0.25, 0.46, 0.45, 0.94)
                            w-[90%] md:w-[80%] max-w-5xl h-[70vh] md:h-[75vh] 
                            bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden
                            ${isActive ? 'z-20 opacity-100 shadow-[0_30px_60px_rgba(0,0,0,0.12)]' : 'z-10 opacity-40 cursor-pointer hover:opacity-60 blur-[1px]'}
                        `}
                        style={{
                            transform: `translate(-50%, -50%) translateX(${offset * 105}%) scale(${isActive ? 1 : 0.85}) rotateY(${offset * -15}deg)`,
                            pointerEvents: isActive ? 'auto' : (loading ? 'none' : 'auto')
                        }}
                     >
                         {item}
                     </div>
                 );
             })}
             
             {!loading && items.length > 1 && (
                 <>
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30 pointer-events-none">
                        {items.map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => onNavigate(i)}
                                className={`
                                    h-2 rounded-full transition-all pointer-events-auto shadow-sm
                                    ${i === activeIndex ? 'bg-black w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'}
                                `}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={() => activeIndex > 0 && onNavigate(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        className={`hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white shadow-lg text-black z-30 transition-opacity hover:scale-110 ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <button 
                        onClick={() => activeIndex < items.length - 1 && onNavigate(activeIndex + 1)}
                        disabled={activeIndex === items.length - 1}
                        className={`hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white shadow-lg text-black z-30 transition-opacity hover:scale-110 ${activeIndex === items.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ArrowRight size={24} />
                    </button>
                 </>
             )}
        </div>
    );
};

// --- Map Slide Component ---
const MapSlide = ({ locations }: { locations: StudyLocation[] }) => {
    // Basic scaling logic for demonstration since we don't have a real map library loaded.
    // In a real app, use a mapping library like Leaflet or Google Maps.
    // Here we use a static SVG world map background and normalize coordinates roughly.
    
    // Simple Mercator projection approximation for visual demo
    const normalize = (lat: number, lng: number) => {
        const x = (lng + 180) * (100 / 360);
        const y = ((-lat + 90) * (100 / 180)); 
        // Adjusting for map crop
        return { x, y: y * 0.9 + 5 }; 
    };

    return (
        <div className="w-full h-full relative bg-[#eef4f9] overflow-hidden flex flex-col">
            <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center bg-no-repeat pointer-events-none"></div>
            
            <div className="relative z-10 w-full h-full p-8 md:p-12 overflow-y-auto no-scrollbar">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Key Locations</h2>
                    <p className="text-gray-500">Places mentioned in your study material</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {locations.map(loc => (
                         <div key={loc.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                             <div className={`
                                 p-3 rounded-xl shrink-0 text-white
                                 ${loc.category === 'historical' ? 'bg-amber-500' : loc.category === 'scientific' ? 'bg-blue-500' : 'bg-emerald-500'}
                             `}>
                                 <MapPin size={20} />
                             </div>
                             <div>
                                 <h4 className="font-bold text-gray-900">{loc.name}</h4>
                                 <p className="text-sm text-gray-500 mt-1 leading-relaxed">{loc.description}</p>
                                 <div className="mt-2 text-xs text-gray-400 font-mono">
                                     {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                                 </div>
                             </div>
                         </div>
                     ))}
                </div>
            </div>
        </div>
    );
};

// --- Note Taker Page ---
const NoteTakerPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { query: string };
    const [loading, setLoading] = useState(true);
    const [noteContent, setNoteContent] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [showHighlightMenu, setShowHighlightMenu] = useState(false);
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [showSizeMenu, setShowSizeMenu] = useState(false);

    useEffect(() => {
        if (!state?.query) {
            navigate('/');
            return;
        }
        const fetchNotes = async () => {
            const result = await generateStructuredNotes(state.query);
            setNoteContent(result);
            setLoading(false);
        };
        fetchNotes();
    }, [state]);

    // Populate editor when content is ready and component is mounted
    useEffect(() => {
        if (!loading && editorRef.current && noteContent) {
            editorRef.current.innerHTML = noteContent;
        }
    }, [loading, noteContent]);

    // --- Rich Text Commands ---
    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        // Resync focus to editor to keep typing
        if (editorRef.current) editorRef.current.focus();
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        execCmd('foreColor', e.target.value);
    };

    const handleHighlight = (color: string) => {
        execCmd('hiliteColor', color);
        setShowHighlightMenu(false);
    };

    const handleFontChange = (font: string) => {
        execCmd('fontName', font);
        setShowFontMenu(false);
    };

    const handleSizeChange = (size: string) => {
        execCmd('fontSize', size);
        setShowSizeMenu(false);
    };

    if (loading) {
        return (
            <div className="h-screen w-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-gray-300 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Writing your notes...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-6 pb-40">
            <button onClick={() => navigate('/')} className="fixed top-6 left-6 p-2 hover:bg-gray-100 rounded-full z-50 transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            
            <div className="max-w-4xl mx-auto">
                <div className="mb-4 flex items-center justify-center gap-3 text-sm text-gray-400 font-medium uppercase tracking-widest">
                    <Notebook size={16} /> Note Taker v1
                </div>
                
                {/* Editable Content Area (Paper Style) */}
                <div className="bg-white shadow-xl ring-1 ring-gray-900/5 rounded-xl p-8 md:p-16 min-h-[70vh]">
                    <div 
                        ref={editorRef}
                        contentEditable
                        className="prose prose-lg md:prose-xl max-w-none focus:outline-none selection:bg-blue-100 selection:text-blue-900"
                        onKeyDown={(e) => {
                            // Prevent accidental back navigation on backspace if empty
                        }}
                    />
                </div>
            </div>

            {/* Floating Pill Toolbar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 animate-fade-in">
                
                {/* Highlight Colors Popover */}
                {showHighlightMenu && (
                    <div className="bg-white rounded-full shadow-xl border border-gray-200 p-2 flex gap-2 mb-2 animate-fade-in">
                        {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#ddd6fe'].map(color => (
                            <button 
                                key={color}
                                onClick={() => handleHighlight(color)}
                                className="w-8 h-8 rounded-full border border-gray-100 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        <button onClick={() => handleHighlight('transparent')} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-xs text-red-500 bg-white">
                            <X size={14}/>
                        </button>
                    </div>
                )}

                {/* Fonts Popover */}
                {showFontMenu && (
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-2 flex flex-col gap-1 mb-2 animate-fade-in w-40">
                        {['Inter', 'Serif', 'Monospace', 'Cursive'].map(font => (
                            <button 
                                key={font}
                                onClick={() => handleFontChange(font)}
                                className="text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium"
                                style={{ fontFamily: font }}
                            >
                                {font}
                            </button>
                        ))}
                    </div>
                )}

                {/* Size Popover */}
                {showSizeMenu && (
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-2 flex flex-col gap-1 mb-2 animate-fade-in w-32">
                        {[
                            { label: 'Small', val: '2' },
                            { label: 'Normal', val: '3' },
                            { label: 'Large', val: '5' },
                            { label: 'Huge', val: '7' },
                        ].map(item => (
                            <button 
                                key={item.label}
                                onClick={() => handleSizeChange(item.val)}
                                className="text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium w-full"
                            >
                                <span style={{ fontSize: item.label === 'Small' ? '12px' : item.label === 'Large' ? '20px' : item.label === 'Huge' ? '28px' : '16px' }}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Main Toolbar */}
                <div className="bg-white/90 backdrop-blur-xl shadow-2xl border border-gray-200/50 rounded-full px-4 py-2 flex items-center gap-1 md:gap-2">
                    <button onClick={() => execCmd('bold')} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors" title="Bold">
                        <Bold size={18} />
                    </button>
                    <button onClick={() => execCmd('italic')} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors" title="Italic">
                        <Italic size={18} />
                    </button>
                    <button onClick={() => execCmd('underline')} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors" title="Underline">
                        <Underline size={18} />
                    </button>
                    
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>

                    <button onClick={() => execCmd('justifyLeft')} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors" title="Align Left">
                        <AlignLeft size={18} />
                    </button>
                    <button onClick={() => execCmd('justifyCenter')} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors" title="Align Center">
                        <AlignCenter size={18} />
                    </button>
                    <button onClick={() => execCmd('justifyRight')} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors" title="Align Right">
                        <AlignRight size={18} />
                    </button>

                    <div className="w-px h-6 bg-gray-200 mx-1"></div>

                    <button 
                        onClick={() => setShowSizeMenu(!showSizeMenu)}
                        className={`p-2.5 rounded-full hover:bg-gray-100 transition-colors ${showSizeMenu ? 'bg-yellow-50 text-yellow-600' : 'text-gray-700'}`} 
                        title="Text Size"
                    >
                        <Heading size={18} />
                    </button>

                    <button 
                        onClick={() => setShowHighlightMenu(!showHighlightMenu)}
                        className={`p-2.5 rounded-full hover:bg-gray-100 transition-colors ${showHighlightMenu ? 'bg-yellow-50 text-yellow-600' : 'text-gray-700'}`} 
                        title="Highlight"
                    >
                        <Highlighter size={18} />
                    </button>
                    
                    {/* Native Color Picker Trigger */}
                    <div className="relative">
                        <input 
                            type="color" 
                            ref={colorInputRef} 
                            onChange={handleColorChange}
                            className="absolute opacity-0 inset-0 w-full h-full cursor-pointer" 
                        />
                        <button className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors pointer-events-none" title="Text Color">
                            <Palette size={18} />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-200 mx-1"></div>

                    <button 
                        onClick={() => setShowFontMenu(!showFontMenu)}
                        className={`p-2.5 rounded-full hover:bg-gray-100 transition-colors ${showFontMenu ? 'bg-gray-100 text-black' : 'text-gray-700'}`} 
                        title="Font"
                    >
                        <Type size={18} />
                    </button>
                    
                    <button onClick={() => execCmd('insertUnorderedList')} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors" title="List">
                        <List size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Search Results Page ---
const SearchResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { query: string };
    const [result, setResult] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        if (!state?.query) {
            navigate('/');
            return;
        }
        const fetchSearch = async () => {
            const data = await performWebSearch(state.query);
            setResult(data);
            setLoading(false);
        };
        fetchSearch();
    }, [state]);

    const handleConvertToKit = () => {
        if (!result) return;
        navigate('/configure', {
            state: {
                content: result.fullContent,
                title: state.query,
                context: "Generated from Web Search"
            }
        });
    };

    if (loading || !result) {
        return (
            <div className="h-screen w-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-gray-300 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Searching the web...</p>
            </div>
        );
    }

    const slides = [
        // Slide 1: Summary
        <div key="summary" className="w-full h-full flex flex-col p-8 md:p-12 overflow-hidden">
            <div className="flex items-center gap-4 mb-6 shrink-0 justify-center">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Sparkles size={24} /></div>
            </div>
            <h2 className="text-3xl font-bold text-center mb-8">Summary</h2>
            <div className="flex-1 flex items-center">
                <div className="prose prose-xl text-center mx-auto text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: result.summary }} />
            </div>
        </div>,

        // Slide 2: Sources
        <div key="sources" className="w-full h-full flex flex-col p-8 md:p-12 overflow-hidden">
            <div className="flex items-center gap-4 mb-6 shrink-0 justify-center">
                <div className="p-3 bg-green-50 text-green-600 rounded-full"><Globe size={24} /></div>
            </div>
            <h2 className="text-3xl font-bold text-center mb-8">Sources</h2>
            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 gap-4 content-start">
                {result.sources.length === 0 && <p className="text-center text-gray-400">No specific sources cited.</p>}
                {result.sources.map((source, i) => (
                    <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                            <ExternalLink size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate">{source.title}</h4>
                            <p className="text-xs text-gray-500 truncate">{source.uri}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>,

        // Slide 3: Timeline
        <div key="timeline" className="w-full h-full flex flex-col p-8 md:p-12 overflow-hidden">
            <div className="flex items-center gap-4 mb-6 shrink-0 justify-center">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><Clock size={24} /></div>
            </div>
            <h2 className="text-3xl font-bold text-center mb-8">Process</h2>
            <div className="flex-1 overflow-y-auto no-scrollbar pl-4">
                <div className="border-l-2 border-purple-100 ml-4 space-y-8 py-4">
                    {result.timeline.map((step, i) => (
                        <div key={i} className="relative pl-8">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-4 border-purple-200 rounded-full"></div>
                            <p className="text-lg font-medium text-gray-800">{step}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>,

        // Slide 4: Convert
        <div key="convert" className="w-full h-full flex flex-col items-center justify-center p-8 md:p-12 text-center">
            <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mb-8 shadow-xl">
                <BookOpen size={40} />
            </div>
            <h2 className="text-4xl font-bold mb-4">Deep Dive?</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md">Turn this search result into a full study kit with flashcards, quizzes, and a mind map.</p>
            <button 
                onClick={handleConvertToKit}
                className="px-8 py-4 bg-black text-white rounded-full text-lg font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
                Turn into Study Kit <ArrowRight size={20} />
            </button>
        </div>
    ];

    return (
        <div className="h-screen w-screen bg-white flex flex-col pt-20 overflow-hidden relative">
            <button onClick={() => navigate('/')} className="absolute top-6 left-6 z-50 p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white shadow-sm border border-gray-100">
                <X size={24} />
            </button>
            <div className="px-6 pb-2 text-center relative z-10">
                <h1 className="text-xl font-bold text-gray-900">{state.query}</h1>
            </div>
            <div className="flex-1 relative z-10">
                <Carousel3D 
                    items={slides} 
                    activeIndex={activeSlide} 
                    onNavigate={setActiveSlide} 
                />
            </div>
        </div>
    );
};

// --- Workspace Component ---
// (Kept as is, omitting for brevity in this XML block but it's part of the file - user has full content)
// Wait, I need to include the full file content.
const Workspace = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'tasks' | 'agenda' | 'pilot'>('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Tasks
  useEffect(() => {
    setTasks(getTasks());
  }, [activeTab]); // Refresh when changing tabs

  const handleCreateTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
        id: `task-${Date.now()}`,
        title: newTaskTitle,
        date: new Date().toISOString().split('T')[0],
        completed: false
    };
    saveTask(newTask);
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
  };

  const toggleTaskStatus = (task: Task) => {
      const updated = { ...task, completed: !task.completed };
      updateTask(updated);
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
  };

  const removeTask = (id: string) => {
      deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
  };

  const SidebarIcon = ({ icon: Icon, tab, label }: { icon: any, tab: string, label: string }) => (
    <button 
      onClick={() => setActiveTab(tab as any)}
      className={`
        p-3 rounded-xl transition-all duration-300 group relative
        ${activeTab === tab ? 'bg-white/20 text-white shadow-lg backdrop-blur-md' : 'text-white/60 hover:bg-white/10 hover:text-white'}
      `}
    >
      <Icon strokeWidth={1.5} size={24} />
      <span className="absolute left-full ml-4 px-2 py-1 bg-black/50 backdrop-blur-md text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          {label}
      </span>
    </button>
  );

  const WorkspaceHome = () => {
      const upcomingTasks = tasks.filter(t => !t.completed).slice(0, 4);
      
      return (
        <div className="flex flex-col items-center justify-center h-full relative">
            <div className="absolute top-[20%] flex flex-col items-center animate-float">
                <h1 className="font-chewy text-[8rem] md:text-[10rem] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-2xl filter backdrop-blur-sm">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/\s[AP]M/, '')}
                </h1>
                <p className="text-white/90 text-2xl md:text-3xl font-light tracking-wide mt-2">
                    {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div className="absolute bottom-[15%] w-full max-w-md px-6">
                <h3 className="text-white/80 text-lg font-medium mb-4 text-center tracking-wider uppercase text-xs">Upcoming Tasks</h3>
                <div className="flex flex-col gap-3">
                    {upcomingTasks.length === 0 ? (
                        <div className="glass-panel rounded-2xl p-4 text-center text-white/60 text-sm">
                            No tasks for today. Enjoy the waves! 🌊
                        </div>
                    ) : (
                        upcomingTasks.map(task => (
                            <LiquidGlass key={task.id} className="rounded-2xl !p-0 group hover:scale-[1.02] transition-transform" innerClassName="flex items-center justify-between px-4 py-3">
                                <span className="text-white font-medium truncate">{task.title}</span>
                                <button onClick={() => toggleTaskStatus(task)} className="text-white/50 hover:text-green-400 transition-colors">
                                    <CheckCircle2 size={18} />
                                </button>
                            </LiquidGlass>
                        ))
                    )}
                </div>
            </div>
        </div>
      );
  };

  const WorkspaceCalendar = () => {
      const [currentMonth, setCurrentMonth] = useState(new Date());
      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
      const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 is Sun

      const changeMonth = (offset: number) => {
          setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
      };

      return (
          <div className="h-full flex flex-col items-center justify-center p-4 z-10 relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 text-white w-full max-w-3xl px-4">
                  <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-white/20 rounded-full transition-all border border-white/30 backdrop-blur-md group">
                    <ArrowLeft strokeWidth={2.5} size={20} className="group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <h2 className="text-5xl font-chewy tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                    {currentMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                  </h2>
                  <button onClick={() => changeMonth(1)} className="p-3 hover:bg-white/20 rounded-full transition-all border border-white/30 backdrop-blur-md group">
                    <ArrowRight strokeWidth={2.5} size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
              
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-3 text-center mb-4 w-full max-w-3xl px-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="text-white/90 text-lg font-chewy tracking-widest uppercase drop-shadow-md">{d}</div>
                  ))}
              </div>
              
              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-3 w-full max-w-3xl px-2 perspective-1000">
                  {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                      const hasTask = tasks.some(t => t.date === dateStr);
                      const isToday = new Date().toISOString().split('T')[0] === dateStr;

                      return (
                          <div key={day} className={`
                              aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300
                              border 
                              ${isToday 
                                ? 'border-white bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105 z-10' 
                                : 'border-white/20 bg-transparent hover:border-white/60 hover:bg-white/5 hover:scale-105 hover:rotate-1'
                              }
                          `}>
                              <span className={`text-2xl font-chewy ${isToday ? 'text-white drop-shadow-lg' : 'text-white/70'}`}>{day}</span>
                              
                              {/* Task Indicator */}
                              {hasTask && (
                                  <div className={`
                                    absolute bottom-2 w-1.5 h-1.5 rounded-full 
                                    ${isToday ? 'bg-white animate-pulse' : 'bg-white/60'}
                                    shadow-[0_0_5px_rgba(255,255,255,0.8)]
                                  `}></div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  const WorkspaceTasks = () => {
      return (
          <div className="h-full flex flex-col items-center pt-24 px-6">
              <h2 className="text-white text-4xl font-light mb-10 tracking-widest">Tasks & Goals</h2>
              
              <div className="w-full max-w-2xl">
                  {/* Thinner Input with Reminder & Floating Plus */}
                  <div className="mb-10 w-full flex items-center gap-4">
                     <div className="flex-1 h-12">
                        <LiquidGlass className="rounded-full !p-0 h-full" innerClassName="flex items-center px-4">
                            <form onSubmit={handleCreateTask} className="w-full h-full relative flex items-center">
                                <input 
                                    type="text" 
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Add a new task..."
                                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/50 text-base h-full"
                                />
                                <button type="button" className="text-white/40 hover:text-white transition-colors ml-2">
                                    <Bell size={16} />
                                </button>
                            </form>
                        </LiquidGlass>
                     </div>
                     <button 
                        onClick={handleCreateTask}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:scale-105 transition-transform"
                     >
                        <Plus size={22} />
                     </button>
                  </div>

                  <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                      {tasks.length === 0 && <div className="text-white/50 text-center py-10">All clear! Relax and float on.</div>}
                      {tasks.map(task => (
                          <div key={task.id} className="glass-panel p-4 rounded-2xl flex items-center gap-4 group hover:translate-x-1 transition-transform">
                              <button onClick={() => toggleTaskStatus(task)} className={`
                                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                  ${task.completed ? 'bg-green-400 border-green-400' : 'border-white/50 hover:border-white'}
                              `}>
                                  {task.completed && <Check size={14} className="text-blue-900" />}
                              </button>
                              <div className="flex-1">
                                  <p className={`text-lg text-white transition-all ${task.completed ? 'line-through opacity-50' : ''}`}>
                                      {task.title}
                                  </p>
                                  <p className="text-white/40 text-xs">{task.date}</p>
                              </div>
                              <button onClick={() => removeTask(task.id)} className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-red-300 transition-all">
                                  <Trash2 size={18} />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const WorkspaceAgenda = () => {
    const agendaItems = [
        { time: '08:00', title: 'Morning Review', type: 'routine' },
        { time: '10:00', title: 'Deep Work: Physics', type: 'focus' },
        { time: '14:00', title: 'Quiz Prep', type: 'study' },
        ...tasks.filter(t => !t.completed).map(t => ({ time: 'To Do', title: t.title, type: 'task' }))
    ];

    return (
        <div className="h-full flex flex-col items-center pt-24 px-6">
            <h2 className="text-white text-4xl font-light mb-10 tracking-widest">Daily Agenda</h2>
            <div className="w-full max-w-2xl relative pl-8 border-l border-white/10 space-y-6 pb-20 overflow-y-auto no-scrollbar max-h-[70vh]">
                {agendaItems.map((item, i) => (
                    <div key={i} className="relative group">
                        <div className="absolute -left-[39px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0f172a] border-4 border-white/20 group-hover:border-white group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>
                        <LiquidGlass className="rounded-2xl group-hover:translate-x-2 transition-transform" innerClassName="p-5 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-white/50 font-mono mb-1">{item.time}</div>
                                <div className="text-white text-lg font-medium">{item.title}</div>
                            </div>
                            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] text-white/60 uppercase tracking-wider font-bold">{item.type}</span>
                        </LiquidGlass>
                    </div>
                ))}
                <div className="relative group opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/10 border-2 border-dashed border-white/30"></div>
                    <div className="ml-0 p-4 border border-dashed border-white/20 rounded-2xl flex items-center justify-center gap-2 text-white/50 hover:bg-white/5 transition-colors">
                        <Plus size={16} /> Add Event
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const WorkspacePilot = () => {
      const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, preview?: any}[]>([
          { role: 'ai', text: "Hey! I'm your Study Pilot. What can I do for you today?" }
      ]);
      const [inputText, setInputText] = useState('');
      const [isDropdownOpen, setIsDropdownOpen] = useState(false);
      const [isKitModalOpen, setIsKitModalOpen] = useState(false);
      const [selectedKitForEdit, setSelectedKitForEdit] = useState<StudyMaterial | null>(null);
      const [editPrompt, setEditPrompt] = useState('');
      
      const materials = getMaterials();
      const messagesEndRef = useRef<HTMLDivElement>(null);

      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      useEffect(() => {
        scrollToBottom();
      }, [messages]);

      const handleSendMessage = async () => {
          if (!inputText.trim()) return;
          
          const userMsg = inputText;
          setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
          setInputText('');
          
          // Simulate AI Response
          setTimeout(() => {
              let aiReply = '';
              const lowerMsg = userMsg.toLowerCase();
              
              if (lowerMsg.includes('task') || lowerMsg.includes('remind')) {
                  const newTask: Task = {
                      id: `task-${Date.now()}`,
                      title: userMsg.replace(/create task|add task|remind me to/i, '').trim() || "New Task",
                      date: new Date().toISOString().split('T')[0],
                      completed: false
                  };
                  saveTask(newTask);
                  // Force refresh tasks in other tabs
                  setTasks(getTasks()); 
                  aiReply = `I've added "${newTask.title}" to your tasks.`;
              } else if (lowerMsg.includes('agenda')) {
                   aiReply = "I've updated your agenda based on your recent activity.";
              } else {
                  aiReply = "I'm here to help. You can ask me to create tasks, check your agenda, or edit a study kit.";
              }
              
              setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
          }, 800);
      };

      const handleEditKit = () => {
          if (!selectedKitForEdit || !editPrompt) return;
          setIsKitModalOpen(false);
          setMessages(prev => [...prev, { role: 'user', text: `Edit kit "${selectedKitForEdit.title}": ${editPrompt}` }]);
          
          setTimeout(() => {
              setMessages(prev => [...prev, { 
                  role: 'ai', 
                  text: `I've updated "${selectedKitForEdit.title}" based on your request. Here is a preview:`,
                  preview: {
                      title: selectedKitForEdit.title,
                      summary: "Updated summary based on new context...",
                      tags: ["AI Edited", "Refined"]
                  }
              }]);
              setEditPrompt('');
              setSelectedKitForEdit(null);
          }, 1500);
      };

      return (
          <div className="h-full w-full relative overflow-hidden pilot-bg flex flex-col items-center justify-end pb-8">
              {/* Chat Area */}
              <div className="w-full max-w-4xl flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-6 mb-4">
                  {messages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <LiquidGlass 
                            className={`
                                !p-0 max-w-[85%] rounded-2xl
                                ${msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}
                            `}
                            innerClassName="p-4"
                          >
                             <div className="text-white text-sm md:text-base leading-relaxed">
                                {msg.text}
                             </div>
                          </LiquidGlass>
                          
                          {/* Preview Card for Study Kit Edits */}
                          {msg.preview && (
                              <div className="mt-2 w-64 glass-panel p-3 rounded-xl border border-white/30 animate-fade-in cursor-pointer hover:bg-white/10 transition-colors ml-2">
                                  <div className="flex items-center gap-2 mb-2">
                                      <div className="p-1.5 bg-white/20 rounded-lg"><BookOpen size={14} className="text-white"/></div>
                                      <span className="text-white font-bold text-sm truncate">{msg.preview.title}</span>
                                  </div>
                                  <p className="text-white/60 text-xs mb-2">{msg.preview.summary}</p>
                                  <div className="flex gap-1">
                                      {msg.preview.tags.map((t: string, i: number) => (
                                          <span key={i} className="text-[10px] bg-green-400/20 text-green-300 px-1.5 py-0.5 rounded">{t}</span>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  ))}
                  <div ref={messagesEndRef} />
              </div>

              {/* Big Box Input Area */}
              <div className="w-[95%] md:w-[750px] z-50 relative">
                  {/* Dropdown for extra options moved outside LiquidGlass to prevent clipping */}
                   {isDropdownOpen && (
                        <div className="absolute bottom-full left-6 mb-3 w-56 glass-panel rounded-2xl overflow-hidden flex flex-col animate-fade-in z-[60] shadow-2xl bg-[#0f172a]/90 backdrop-blur-xl border border-white/10">
                            <button 
                              onClick={() => { setIsKitModalOpen(true); setIsDropdownOpen(false); }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-yellow-300 text-sm transition-colors text-left font-medium"
                            >
                                <Sparkles size={16} /> Edit Study Kit
                            </button>
                            <div className="h-px bg-white/10 mx-2"></div>
                            <button className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white text-sm transition-colors text-left">
                                <FileText size={16} /> Upload Document
                            </button>
                        </div>
                    )}

                  <LiquidGlass 
                      className="!rounded-[2rem] !p-0 min-h-[160px] flex flex-col" 
                      innerClassName="flex flex-col p-6"
                  >
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Ask anything..."
                            className="w-full bg-transparent border-none outline-none text-white placeholder-white/50 text-xl font-light resize-none flex-1 mb-4 z-20 relative"
                        />
                        
                        {/* Toolbar */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-4 text-white/70">
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="hover:text-white transition-colors p-1"
                                >
                                    <Plus size={24} strokeWidth={1.5} />
                                </button>
                                <div className="w-px h-5 bg-white/20"></div>
                                
                                <button className="hover:text-white transition-colors p-1" title="Search">
                                    <Search size={20} strokeWidth={1.5} />
                                </button>
                                <button className="hover:text-white transition-colors p-1" title="Image">
                                    <ImageIcon size={20} strokeWidth={1.5} />
                                </button>
                                <button className="hover:text-white transition-colors p-1" title="File">
                                    <FileText size={20} strokeWidth={1.5} />
                                </button>
                                <button className="hover:text-white transition-colors p-1" title="Draw">
                                    <PenTool size={20} strokeWidth={1.5} />
                                </button>
                                <button className="hover:text-white transition-colors p-1" title="Web">
                                    <Globe size={20} strokeWidth={1.5} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="p-2 text-white/70 hover:text-white transition-colors">
                                    <Mic size={24} strokeWidth={1.5} />
                                </button>
                                <button 
                                    onClick={handleSendMessage}
                                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                >
                                    <ArrowUp size={24} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                  </LiquidGlass>
              </div>

              {/* Edit Kit Modal */}
              {isKitModalOpen && (
                  <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                      <div className="w-full max-w-md glass-panel rounded-3xl p-6 relative animate-fade-in border border-white/30 shadow-2xl bg-black/20">
                          <button 
                              onClick={() => { setIsKitModalOpen(false); setSelectedKitForEdit(null); }}
                              className="absolute top-4 right-4 text-white/50 hover:text-white"
                          >
                              <X size={20} />
                          </button>
                          
                          <h3 className="text-xl font-bold text-white mb-1">Edit Study Kit</h3>
                          <p className="text-white/60 text-sm mb-6">Select a kit and tell AI how to improve it.</p>

                          {!selectedKitForEdit ? (
                              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar mb-4">
                                  {materials.map(m => (
                                      <button 
                                          key={m.id}
                                          onClick={() => setSelectedKitForEdit(m)}
                                          className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center gap-3 transition-colors group"
                                      >
                                          <div className="p-2 bg-white/10 rounded-lg text-white group-hover:bg-white group-hover:text-black transition-colors">
                                              <BookOpen size={16} />
                                          </div>
                                          <div className="flex-1 truncate text-white text-sm font-medium">{m.title}</div>
                                      </button>
                                  ))}
                                  {materials.length === 0 && <div className="text-white/40 text-center py-4">No kits found.</div>}
                              </div>
                          ) : (
                              <div className="mb-4">
                                  <div className="p-3 bg-white/10 rounded-xl flex items-center gap-3 mb-4 border border-white/20">
                                      <BookOpen size={18} className="text-white"/>
                                      <span className="text-white font-medium">{selectedKitForEdit.title}</span>
                                      <button onClick={() => setSelectedKitForEdit(null)} className="ml-auto text-xs text-white/50 hover:text-white underline">Change</button>
                                  </div>
                                  <textarea 
                                      value={editPrompt}
                                      onChange={(e) => setEditPrompt(e.target.value)}
                                      placeholder="Ex: Make the flashcards harder, add more details about..."
                                      className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/10 resize-none"
                                  />
                              </div>
                          )}

                          <button 
                              onClick={handleEditKit}
                              disabled={!selectedKitForEdit || !editPrompt}
                              className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                          >
                              <div className="flex items-center justify-center gap-2">
                                  <Sparkles size={16} /> Update Kit
                              </div>
                          </button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-cover bg-center transition-all duration-1000"
         style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop")' }}>
        
        {/* Overlay for tint and blur only if needed, mostly handled by components */}
        <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[2px]"></div>

        {/* Sidebar */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col items-center py-6 z-50 border-r border-white/20 bg-transparent">
            <button onClick={() => navigate('/')} className="mb-8 text-white/80 hover:text-white transition-colors">
                <X strokeWidth={1.5} size={28} />
            </button>
            
            <div className="flex flex-col gap-6 flex-1 justify-center">
                <SidebarIcon icon={Home} tab="home" label="Home" />
                <SidebarIcon icon={CalendarDays} tab="calendar" label="Calendar" />
                <SidebarIcon icon={ListTodo} tab="tasks" label="Tasks" />
                <SidebarIcon icon={Menu} tab="agenda" label="Agenda" />
                <SidebarIcon icon={Bot} tab="pilot" label="Study Pilot" />
            </div>
        </div>

        {/* Header Branding */}
        <div className="absolute top-8 right-8 z-40 text-white/80 font-light text-xl tracking-[0.2em] uppercase">
            Workspace
        </div>

        {/* Main Content Area */}
        <div className="absolute inset-0 pl-16 z-30">
            {activeTab === 'home' && <WorkspaceHome />}
            {activeTab === 'calendar' && <WorkspaceCalendar />}
            {activeTab === 'tasks' && <WorkspaceTasks />}
            {activeTab === 'agenda' && <WorkspaceAgenda />}
            {activeTab === 'pilot' && <WorkspacePilot />}
        </div>
    </div>
  );
};


// --- Components ---

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  // Do not render navbar if in workspace
  if (location.pathname === '/workspace') return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-center pt-6 pb-4 pointer-events-none">
      <div className={`
        px-6 py-2 rounded-full flex items-center gap-6 transition-colors duration-300 pointer-events-auto
        bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm
        text-black
      `}>
        <div className="hidden md:flex items-center gap-2 mr-2 cursor-pointer" onClick={() => navigate('/')}>
            <Sparkles size={16} className="text-black" />
            <span className="font-bold text-sm tracking-tight">Infinite Study AI</span>
        </div>
        <div className="w-px h-4 hidden md:block bg-gray-300/50"></div>
        
        <button 
          onClick={() => navigate('/')} 
          className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Home
        </button>
        <button 
          onClick={() => navigate('/library')} 
          className={`text-sm font-medium transition-colors ${isActive('/library') ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Library
        </button>
        
        <div className="w-px h-4 bg-gray-300/50"></div>

        <button 
          onClick={() => navigate('/workspace')} 
          className="text-sm font-medium px-3 py-1 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
           <Layout size={14} /> Workspace
        </button>
      </div>
    </nav>
  );
};

// --- Interactive Concept Map Visualization ---
// Allows pan, zoom, and collapsible nodes for "Big Picture" vs "Details"
const InteractiveMindMap = ({ rootNode }: { rootNode: ConceptMapNode }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const delta = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.2, scale + delta), 3);
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Recursive node renderer
    const RenderNode = ({ node, level = 0 }: { node: ConceptMapNode, level?: number }) => {
        const [expanded, setExpanded] = useState(true);
        const hasChildren = node.children && node.children.length > 0;
        
        // Visual styles based on depth
        const sizeClasses = level === 0 ? "w-32 h-32 text-xl border-4" : level === 1 ? "w-24 h-24 text-sm border-2" : "w-20 h-20 text-xs border";
        const colorClasses = level === 0 ? "bg-black text-white border-white/20" : "bg-white text-black border-gray-200 shadow-lg";

        return (
            <div className="flex flex-col items-center mx-4">
                <div 
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    className={`
                        ${sizeClasses} ${colorClasses}
                        rounded-full flex flex-col items-center justify-center text-center p-2
                        transition-all duration-300 hover:scale-105 cursor-pointer z-10 relative
                    `}
                >
                    <span className="font-bold line-clamp-3">{node.label}</span>
                    {level === 0 && <span className="text-[10px] opacity-70 mt-1">Root</span>}
                    {hasChildren && (
                        <div className="absolute -bottom-3 bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 text-[10px] font-bold">
                            {expanded ? '-' : `+${node.children?.length}`}
                        </div>
                    )}
                </div>

                {hasChildren && expanded && (
                    <div className="flex flex-col items-center">
                        <div className="h-8 w-px bg-gray-300"></div>
                        <div className="flex relative pt-4 before:content-[''] before:absolute before:top-0 before:h-px before:bg-gray-300 before:w-[calc(100%-2rem)] before:left-[1rem]">
                            {node.children!.map((child, idx) => (
                                <div key={idx} className="relative flex flex-col items-center">
                                     <div className="absolute -top-4 h-4 w-px bg-gray-300"></div>
                                     <RenderNode node={child} level={level + 1} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-gray-50 rounded-3xl border border-gray-200 select-none group">
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-white rounded-lg shadow-md p-1">
                <button onClick={() => setScale(s => Math.min(s + 0.2, 3))} className="p-2 hover:bg-gray-100 rounded text-gray-600"><ZoomIn size={20}/></button>
                <button onClick={() => setScale(s => Math.max(s - 0.2, 0.2))} className="p-2 hover:bg-gray-100 rounded text-gray-600"><ZoomOut size={20}/></button>
                <button onClick={() => { setScale(1); setPosition({x:0,y:0}); }} className="p-2 hover:bg-gray-100 rounded text-gray-600"><Move size={20}/></button>
            </div>

            <div className="absolute top-4 left-4 z-50 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-500 pointer-events-none flex items-center gap-2">
                <MousePointer2 size={12}/> Drag to pan • Scroll to zoom • Click nodes to collapse
            </div>

            <div 
                ref={containerRef}
                className={`w-full h-full flex items-center justify-center cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div 
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                    className="flex items-center justify-center p-20"
                >
                    <RenderNode node={rootNode} />
                </div>
            </div>
        </div>
    );
};

// --- Configuration Page (New Step) ---
const ConfigurePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { content: string, title: string, context?: string, images?: string[], selectedSubject?: string };
    
    // Tools State
    const [selectedTools, setSelectedTools] = useState<string[]>(['summary', 'flashcards', 'quiz', 'map', 'dictionary']);

    useEffect(() => {
        if (!state) navigate('/');
    }, [state, navigate]);

    const toggleTool = (id: string) => {
        setSelectedTools(prev => 
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleGenerate = () => {
        navigate('/generating', { 
            state: { 
                ...state,
                selectedTools 
            } 
        });
    };

    const tools = [
        { id: 'summary', label: 'Study Guide', icon: FileText, desc: 'Comprehensive summary & notes' },
        { id: 'flashcards', label: 'Flashcards', icon: BookOpen, desc: 'Active recall practice' },
        { id: 'quiz', label: 'Practice Quiz', icon: Brain, desc: 'Test your knowledge' },
        { id: 'map', label: 'Mind Map', icon: Network, desc: 'Visual knowledge tree' },
        { id: 'dictionary', label: 'Dictionary', icon: BookA, desc: 'Key terms definitions' },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
             {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gray-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

            <div className="max-w-4xl w-full z-10">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={24} /></button>
                    <h1 className="text-3xl font-bold">Customize Your Kit</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {tools.map((tool) => {
                        const isSelected = selectedTools.includes(tool.id);
                        return (
                            <button 
                                key={tool.id}
                                onClick={() => toggleTool(tool.id)}
                                className={`
                                    relative p-6 rounded-3xl text-left transition-all duration-300 border-2 shadow-sm
                                    ${isSelected 
                                        ? 'bg-black text-white border-black scale-[1.02] shadow-xl' 
                                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <tool.icon size={32} strokeWidth={1.5} />
                                    <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                        ${isSelected ? 'bg-white border-white' : 'border-gray-300'}
                                    `}>
                                        {isSelected && <Check size={14} className="text-black" />}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-1">{tool.label}</h3>
                                <p className={`text-sm ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>{tool.desc}</p>
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={handleGenerate}
                        disabled={selectedTools.length === 0}
                        className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full text-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                    >
                        Generate Study Kit <Sparkles size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Home / Landing Page ---
const LandingPage = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  
  // Context & Uploads
  const [contextText, setContextText] = useState<string>('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<'kit' | 'search' | 'note'>('kit');
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  
  // Refs for file inputs and backdrop syncing
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contextInputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const subjects = [
    { id: 'math', label: 'Math', icon: Calculator },
    { id: 'writing', label: 'Writing', icon: PenTool },
    { id: 'history', label: 'History', icon: Hourglass },
    { id: 'geography', label: 'Geography', icon: Globe },
    { id: 'science', label: 'Science', icon: FlaskConical },
  ];

  const handleAction = () => {
    if (!prompt.trim() && attachedImages.length === 0) return;
    
    if (selectedTool === 'search') {
        navigate('/search', { state: { query: prompt }});
    } else if (selectedTool === 'note') {
        navigate('/notes', { state: { query: prompt }});
    } else {
        // Study Kit (Default)
        navigate('/configure', { 
            state: { 
                content: prompt, 
                title: "New Study Kit", 
                context: contextText,
                images: attachedImages,
                selectedSubject
            } 
        });
    }
  };

  const handleFileRead = (file: File, type: 'context' | 'image' | 'text') => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'context') {
            setContextText(prev => prev + "\n\n" + result);
        } else if (type === 'text') {
            setPrompt(result);
        } else if (type === 'image') {
            setAttachedImages(prev => [...prev, result]);
        }
    };
    if (type === 'image') {
        reader.readAsDataURL(file);
    } else {
        reader.readAsText(file);
    }
  };
  
  // Function to highlight URLs in the backdrop
  const highlightLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            return <span key={i} className="text-blue-500 bg-blue-50 rounded px-1">{part}</span>;
        }
        return part;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (backdropRef.current) {
          backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      }
  };

  const toolLabels = {
      kit: "Study Kit",
      search: "Deep Search",
      note: "Note Taker v1"
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gray-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden pointer-events-none">
          <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-cyan-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
          <div className="absolute -bottom-48 left-1/3 w-96 h-96 bg-purple-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
          <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-blue-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
      </div>

      <div className="max-w-2xl w-full text-center z-10 space-y-8 relative">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-8">
           What do you want to learn?
        </h1>

        <div 
          className={`
            relative bg-white rounded-[2rem] border border-gray-200 shadow-lg transition-all duration-300
            hover:shadow-xl hover:border-gray-300
            flex flex-col min-h-[160px] text-left overflow-hidden
          `}
        >
          {/* Main Input Area with Overlay Highlighting */}
          <div className="flex-1 relative">
            {/* Backdrop for highlighting */}
            <div 
                ref={backdropRef}
                className="absolute inset-0 p-6 text-lg text-gray-800 whitespace-pre-wrap break-words font-sans bg-transparent pointer-events-none z-0 overflow-hidden"
                style={{ lineHeight: '1.625' }}
            >
                {highlightLinks(prompt)}
                {/* Add a trailing space to fix height issues if prompt ends with newline */}
                {prompt.endsWith('\n') && <br />}
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onScroll={handleScroll}
              placeholder={selectedTool === 'search' ? "What do you want to research?" : "Ask anything or paste a URL..."}
              className="relative z-10 w-full h-full bg-transparent border-none outline-none text-lg text-transparent caret-gray-800 placeholder-gray-400 resize-none font-sans p-6"
              style={{ minHeight: '120px', lineHeight: '1.625' }}
              spellCheck={false}
            />
          </div>
          
           {/* Context Chips Positioned Above Toolbar */}
             {(contextText || attachedImages.length > 0 || selectedSubject) && (
                 <div className="px-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar relative z-20">
                     {selectedSubject && (
                        <div className="flex items-center gap-1 text-xs bg-black text-white px-3 py-1.5 rounded-full font-bold shrink-0 shadow-md">
                            {(() => {
                                const subj = subjects.find(s => s.id === selectedSubject);
                                if (!subj) return null;
                                return (
                                    <>
                                        <subj.icon size={12} /> {subj.label}
                                    </>
                                )
                            })()}
                            <button onClick={() => setSelectedSubject('')} className="ml-1 hover:text-gray-300"><X size={12}/></button>
                        </div>
                     )}
                     {contextText && (
                         <div className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium shrink-0">
                             <AtSign size={12} /> Context Added
                             <button onClick={() => setContextText('')} className="ml-1 hover:text-purple-900"><X size={10}/></button>
                         </div>
                     )}
                     {attachedImages.map((_, i) => (
                         <div key={i} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium shrink-0">
                             <ImageIcon size={12} /> Image {i+1}
                             <button onClick={() => setAttachedImages(prev => prev.filter((__, idx) => idx !== i))} className="ml-1 hover:text-blue-900"><X size={10}/></button>
                         </div>
                     ))}
                 </div>
             )}

          {/* Action Toolbar */}
          <div className="px-4 pb-4 flex items-center justify-between relative z-20 bg-white rounded-b-[2rem]">
            
            {/* Left Tools & Tool Dropdown */}
            <div className="flex items-center gap-2 relative">
                {isToolMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-50">
                        <button 
                            onClick={() => { setSelectedTool('kit'); setIsToolMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"
                        >
                            <BookOpen size={16} /> Study Kit
                        </button>
                        <button 
                            onClick={() => { setSelectedTool('search'); setIsToolMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"
                        >
                            <Globe size={16} /> Search
                        </button>
                        <button 
                            onClick={() => { setSelectedTool('note'); setIsToolMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"
                        >
                            <Notebook size={16} /> Note Taker v1
                        </button>
                    </div>
                )}

                <button 
                    onClick={() => setIsToolMenuOpen(!isToolMenuOpen)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-900 transition-colors flex items-center gap-2 pr-4 bg-gray-50"
                >
                    <Plus size={20} strokeWidth={2} />
                    <span className="text-xs font-bold uppercase tracking-wider">{toolLabels[selectedTool]}</span>
                </button>

                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                {/* Hidden Inputs */}
                <input type="file" ref={fileInputRef} accept=".txt,.md,.js,.py,.html,.css,.json" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0], 'text')} />
                <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0], 'image')} />
                <input type="file" ref={contextInputRef} accept=".txt,.md" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0], 'context')} />

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    title="Upload File"
                >
                    <Paperclip size={20} strokeWidth={1.5} />
                </button>
                
                 <button 
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors" 
                    title="Image"
                >
                     <ImageIcon size={20} strokeWidth={1.5} />
                 </button>

                 <button 
                    onClick={() => contextInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors" 
                    title="Context"
                >
                     <AtSign size={20} strokeWidth={1.5} />
                 </button>
            </div>
            
             {/* Right Tools */}
            <div className="flex items-center gap-3">
               <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <Mic size={22} strokeWidth={1.5} />
               </button>

                <button
                onClick={handleAction}
                disabled={!prompt.trim() && attachedImages.length === 0}
                className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                    ${(!prompt.trim() && attachedImages.length === 0) ? 'bg-gray-100 text-gray-300' : 'bg-black text-white hover:scale-105 shadow-md'}
                `}
                >
                <ArrowUp size={20} strokeWidth={2.5} />
                </button>
            </div>
          </div>
        </div>
        
        {/* Subject Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
             {subjects.map((subj) => (
                 <button 
                    key={subj.id}
                    onClick={() => setSelectedSubject(subj.id)}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border border-transparent
                        ${selectedSubject === subj.id 
                            ? 'bg-black text-white scale-105' 
                            : 'bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:-translate-y-1'
                        }
                    `}
                 >
                     <subj.icon size={16} />
                     {subj.label}
                 </button>
             ))}
        </div>
      </div>
    </div>
  );
};

// --- Generation / Loading Screen ---
const LoadingScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { 
      content: string, 
      title: string, 
      context?: string, 
      images?: string[],
      selectedTools?: string[],
      selectedSubject?: string
  };
  const [step, setStep] = useState(0);

  // Filter steps based on selection
  const allSteps = [
    { id: 'summary', title: "Analyzing Content", desc: "Processing your inputs...", icon: <FileText size={40} /> },
    { id: 'map', title: "Building Concepts", desc: "Mapping out the knowledge tree...", icon: <Network size={40} /> },
    { id: 'flashcards', title: "Creating Flashcards", desc: "Generating active recall cards...", icon: <BookOpen size={40} /> },
    { id: 'quiz', title: "Finalizing Quiz", desc: "Preparing your assessment...", icon: <Brain size={40} /> },
    { id: 'dictionary', title: "Scanning Vocabulary", desc: "Finding key terms...", icon: <BookA size={40} /> },
    { id: 'locations', title: "Mapping Locations", desc: "Finding key places...", icon: <Globe size={40} /> },
  ];
  
  const tools = state.selectedTools || ['summary', 'flashcards', 'quiz', 'map', 'dictionary'];
  
  // Check if we should attempt to generate locations map based on subject or user intent
  const shouldGenerateMap = state.selectedSubject === 'geography' || state.selectedSubject === 'history' || state.content.toLowerCase().includes('map') || state.content.toLowerCase().includes('location');

  const stepsToShow = [
      ...allSteps.filter(s => tools.includes(s.id)),
      ...(shouldGenerateMap ? [allSteps.find(s => s.id === 'locations')!] : []),
      { id: 'done', title: "Ready", desc: "Your study kit is ready!", icon: <CheckCircle2 size={40} /> }
  ];

  useEffect(() => {
    if (!state?.content && (!state?.images || state.images.length === 0)) {
      navigate('/');
      return;
    }

    const process = async () => {
      try {
        const newMaterial = {
          id: `mat-${Date.now()}`,
          title: state.title || "Untitled Study Kit",
          content: state.content,
          context: state.context,
          subject: state.selectedSubject,
          images: state.images,
          type: 'text' as const,
          createdAt: Date.now()
        };
        
        // Fix: Don't let the interval reach the last step ('Ready') automatically
        // It should cycle through or stop at the last processing step until actually done.
        const maxProcessingStep = stepsToShow.length - 2; 
        const stepInterval = setInterval(() => {
          setStep(prev => {
            // Stay on the last processing step, do not advance to 'done' (last index) automatically
            if (prev < maxProcessingStep) return prev + 1;
            return prev;
          });
        }, 2000); // Slower interval for better UX

        // Always generate summary as base context
        const summary = await generateSummary(state.content, state.context, state.images);
        
        const augmentedContext = (state.context || '') + "\n\n=== GENERATED SUMMARY OF CONTENT ===\n" + summary;
        if(state.selectedSubject) {
             // Add subject hint to context
             // Note: We don't modify augmentedContext string reference for parallel calls, but we pass it.
        }
        
        const promises: Promise<any>[] = [];
        
        if (tools.includes('flashcards')) {
            promises.push(generateFlashcards(state.content, augmentedContext, state.images));
        } else {
            promises.push(Promise.resolve([])); 
        }

        if (tools.includes('quiz')) {
            promises.push(generateQuiz(state.content, augmentedContext, state.images));
        } else {
            promises.push(Promise.resolve([]));
        }

        if (tools.includes('map')) {
            promises.push(generateConceptMap(state.content, augmentedContext, state.images));
        } else {
            promises.push(Promise.resolve(null));
        }

        if (tools.includes('dictionary')) {
            promises.push(generateKeyTerms(state.content, augmentedContext, state.images));
        } else {
            promises.push(Promise.resolve([]));
        }

        // New Map Generation
        if (shouldGenerateMap) {
            promises.push(generateLocationData(state.content, augmentedContext, state.images));
        } else {
            promises.push(Promise.resolve([]));
        }

        const [cards, quiz, conceptMap, keyTerms, locations] = await Promise.all(promises);
        
        // Save
        saveMaterial({ ...newMaterial, content: state.content });
        if (tools.includes('flashcards')) saveFlashcards(newMaterial.id, cards);
        if (tools.includes('map')) saveConceptMap(newMaterial.id, conceptMap);
        if (tools.includes('dictionary')) saveKeyTerms(newMaterial.id, keyTerms);
        if (locations.length > 0) saveLocations(newMaterial.id, locations);
             
        clearInterval(stepInterval);
        // Explicitly set to Done step only now
        setStep(stepsToShow.length - 1);
        
        setTimeout(() => {
           navigate(`/study/${newMaterial.id}`, { state: { 
               preloadedSummary: tools.includes('summary') ? summary : null,
               preloadedQuiz: quiz,
               preloadedMap: conceptMap,
               preloadedLocations: locations,
               preloadedKeyTerms: keyTerms,
               selectedTools: tools
           }});
        }, 1500); // Small delay to show "Ready"

      } catch (error) {
        console.error(error);
        alert("Something went wrong with AI generation.");
        navigate('/');
      }
    };

    process();
  }, []);

  const stepCards = stepsToShow.map((s, index) => {
      const isProcessing = index === step && s.id !== 'done';
      
      return (
      <div key={index} className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-transparent">
          <div className={`
            w-24 h-24 mb-8 rounded-full flex items-center justify-center
            ${index === step ? 'bg-black text-white scale-110 shadow-xl' : 'bg-gray-100 text-gray-500'}
            transition-all duration-500
          `}>
                {index === step ? (
                    s.id === 'done' ? s.icon : <div className="animate-spin"><Loader2 size={40} /></div> 
                ) : s.icon}
          </div>
          <h2 className={`text-3xl font-bold mb-4 ${index === step ? 'text-gray-900' : 'text-gray-400'}`}>
            {s.title}
          </h2>
          <p className={`text-lg max-w-md ${index === step ? 'text-gray-600' : 'text-gray-300'}`}>
            {s.desc}
          </p>
          
          {/* Skeleton Animation for active processing step */}
          {isProcessing && (
              <div className="mt-12 w-full max-w-sm space-y-3 opacity-50">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded-full w-1/2 mx-auto animate-pulse delay-75"></div>
                  <div className="h-4 bg-gray-100 rounded-full w-2/3 mx-auto animate-pulse delay-150"></div>
              </div>
          )}

          <div className="mt-auto w-64 h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
              <div 
                  className={`h-full bg-black transition-all duration-1000 ease-out`}
                  style={{ width: index < step ? '100%' : index === step ? '60%' : '0%' }}
              />
          </div>
      </div>
  )});

  return (
    <div className="h-screen w-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gray-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden pointer-events-none">
            <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-cyan-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
            <div className="absolute -bottom-48 left-1/3 w-96 h-96 bg-purple-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
            <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-blue-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
        </div>

        {/* Carousel Container with explicit flex growth */}
        <div className="w-full flex-1 relative z-10 flex items-center justify-center">
            <Carousel3D 
                activeIndex={step} 
                onNavigate={() => {}} 
                loading={true}
                items={stepCards} 
            />
        </div>
    </div>
  );
};

// --- Library View ---
const Library = () => {
    const materials = getMaterials();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white pt-24 px-6 pb-12">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Your Library</h1>
                
                {materials.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-6">You haven't created any study kits yet.</p>
                        <button onClick={() => navigate('/')} className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium">Create New</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map(m => (
                            <div key={m.id} onClick={() => navigate(`/study/${m.id}`)} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-6 cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteMaterial(m.id); window.location.reload(); }}
                                        className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
                                    <FileText size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 line-clamp-1">{m.title}</h3>
                                <p className="text-gray-400 text-sm mb-4">{new Date(m.createdAt).toLocaleDateString()}</p>
                                <div className="flex items-center text-sm font-medium text-gray-900 group-hover:translate-x-2 transition-transform">
                                    Study Now <ChevronRight size={16} className="ml-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Study Detail (Main Carousel View) ---
const StudyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Data Containers
  const [summary, setSummary] = useState(location.state?.preloadedSummary || '');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(location.state?.preloadedQuiz || []);
  const [conceptMap, setConceptMap] = useState<ConceptMapNode | null>(location.state?.preloadedMap || null);
  const [locations, setLocations] = useState<StudyLocation[]>(location.state?.preloadedLocations || []);
  const [keyTerms, setKeyTerms] = useState<string[]>(location.state?.preloadedKeyTerms || []);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    const mats = getMaterials();
    const found = mats.find(m => m.id === id);
    if (found) {
      setMaterial(found);
      
      // Load saved data
      const savedCards = getFlashcards(found.id);
      if (savedCards.length > 0) setFlashcards(savedCards);
      
      const savedMap = getConceptMap(found.id);
      if (savedMap) setConceptMap(savedMap);

      const savedLocs = getLocations(found.id);
      if (savedLocs.length > 0) setLocations(savedLocs);

      const savedTerms = getKeyTerms(found.id);
      if (savedTerms.length > 0) setKeyTerms(savedTerms);

      if (!summary && !loadingSummary) {
          setLoadingSummary(true);
          generateSummary(found.content, found.context, found.images).then(res => {
              setSummary(res);
              setLoadingSummary(false);
          });
      }
      
    } else {
        const timer = setTimeout(() => {
            const retryMats = getMaterials();
            const retryFound = retryMats.find(m => m.id === id);
            if (retryFound) {
                setMaterial(retryFound);
            } else {
                navigate('/');
            }
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [id]);

  if (!material) {
    return (
        <div className="h-screen w-screen bg-white flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-gray-300 mb-4" size={40} />
            <p className="text-gray-500 font-medium">Loading Study Kit...</p>
        </div>
    );
  }

  // Construct slides based on available data
  const slides: React.ReactNode[] = [];

  // Helper for title overlay
  const TitleOverlay = () => (
      <div className="absolute top-6 left-0 right-0 text-center pointer-events-none z-20">
          <div className="inline-block px-3 py-1 rounded-full bg-black/5 backdrop-blur-sm border border-black/5">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{material.title}</span>
          </div>
      </div>
  );

  // 1. Concept Map Slide (only if map exists)
  if (conceptMap) {
      slides.push(
        <div key="map" className="w-full h-full flex flex-col p-4 md:p-6 overflow-hidden relative">
            <TitleOverlay />
            <div className="flex items-center gap-4 mb-2 shrink-0 justify-center mt-8">
                <div className="p-2 bg-gray-100 rounded-full text-black"><Network size={20} /></div>
            </div>
            <h2 className="text-xl font-bold text-center mb-1">Concept Map</h2>
            
            <div className="flex-1 overflow-hidden pt-4 h-full relative">
                <InteractiveMindMap rootNode={conceptMap} />
            </div>
        </div>
      );
  }

  // 2. Summary Slide (only if summary exists and is not empty string)
  if (summary) {
      slides.push(
        <div key="summary" className="w-full h-full flex flex-col p-8 md:p-10 overflow-hidden relative">
            <TitleOverlay />
            <div className="flex items-center gap-4 mb-4 shrink-0 justify-center mt-6">
                <div className="p-3 bg-gray-100 rounded-full text-black"><FileText size={24} /></div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-1">Study Guide</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Key concepts & details</p>
            
            <div className="flex-1 overflow-y-auto no-scrollbar pr-4 mask-fade-bottom">
                {loadingSummary ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-500">
                        <Loader2 className="animate-spin" size={32} /> Analyzing text...
                    </div>
                ) : (
                    <div className="prose prose-lg md:prose-xl prose-headings:font-extrabold prose-p:text-gray-600 max-w-none text-gray-800 prose-mark:bg-yellow-100 prose-mark:text-yellow-900 prose-mark:px-1 prose-mark:rounded-md prose-strong:font-extrabold prose-strong:text-black">
                        <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }} />
                    </div>
                )}
            </div>
        </div>
      );
  }

  // 3. Dictionary Slide
  if (keyTerms.length > 0) {
      slides.push(
        <div key="dictionary" className="w-full h-full flex flex-col p-8 md:p-10 relative">
            <TitleOverlay />
            <div className="flex items-center gap-4 mb-4 shrink-0 justify-center mt-6">
                <div className="p-3 bg-gray-100 rounded-full text-black"><BookA size={24} /></div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-1">Dictionary</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Definitions for key terms</p>

            <div className="flex-1 flex items-center justify-center relative w-full overflow-hidden">
                <DictionarySlide terms={keyTerms} />
            </div>
        </div>
      );
  }

  // 4. Flashcards Slide (only if cards exist)
  if (flashcards.length > 0) {
      slides.push(
        <div key="cards" className="w-full h-full flex flex-col p-8 md:p-10 relative">
            <TitleOverlay />
            <div className="flex items-center gap-4 mb-4 shrink-0 justify-center mt-6">
                <div className="p-3 bg-gray-100 rounded-full text-black"><BookOpen size={24} /></div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-1">Flashcards</h2>
            <p className="text-gray-400 text-sm text-center mb-6">{flashcards.length} cards</p>

            <div className="flex-1 flex items-center justify-center relative">
                <FlashcardDeck cards={flashcards} onUpdateCard={(updated) => {
                    const newCards = flashcards.map(c => c.id === updated.id ? updated : c);
                    setFlashcards(newCards);
                    saveFlashcards(material.id, newCards);
                }} />
            </div>
        </div>
      );
  }

  // 5. Quiz Slide (only if questions exist)
  if (quizQuestions.length > 0) {
      slides.push(
        <div key="quiz" className="w-full h-full flex flex-col p-8 md:p-10 relative">
            <TitleOverlay />
            <div className="flex items-center gap-4 mb-4 shrink-0 justify-center mt-6">
                <div className="p-3 bg-gray-100 rounded-full text-black"><Brain size={24} /></div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-1">10-Min Quiz</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Test your knowledge</p>
            
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <QuizRunner questions={quizQuestions} materialId={material.id} onComplete={() => {}} />
            </div>
        </div>
      );
  }

  // 6. Locations Map Slide (only if locations exist)
  if (locations.length > 0) {
      slides.push(
        <div key="locations" className="w-full h-full flex flex-col p-4 md:p-6 overflow-hidden relative">
             <TitleOverlay />
             <div className="flex items-center gap-4 mb-2 shrink-0 justify-center mt-8">
                <div className="p-2 bg-gray-100 rounded-full text-black"><MapIcon size={20} /></div>
            </div>
            <h2 className="text-xl font-bold text-center mb-1">Interactive Map</h2>
            
            <div className="flex-1 overflow-hidden pt-4 h-full relative rounded-3xl border border-gray-100">
                <MapSlide locations={locations} />
            </div>
        </div>
      );
  }

  // If no slides available (should rare unless only summary selected and it failed)
  if (slides.length === 0) {
      return (
          <div className="h-screen w-screen flex items-center justify-center bg-white flex-col">
              <p className="text-gray-500 mb-4">No study tools generated.</p>
              <button onClick={() => navigate('/')} className="px-6 py-2 bg-black text-white rounded-full">Go Back</button>
          </div>
      );
  }

  return (
    <div className="h-screen w-screen bg-white flex flex-col pt-20 overflow-hidden relative">
        <div className="px-6 pb-2 text-center relative z-10">
            {/* Main title still exists outside but now also included inside cards for context */}
            <h1 className="text-xl font-bold text-gray-900">{material.title}</h1>
        </div>
        <div className="flex-1 relative z-10">
            <Carousel3D 
                items={slides} 
                activeIndex={activeSlide} 
                onNavigate={setActiveSlide} 
            />
        </div>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [showSnow, setShowSnow] = useState(false);

  return (
    <Router>
      {showSnow && <SnowOverlay />}
      
      {/* Easter Egg Button */}
      <button 
        onClick={() => setShowSnow(!showSnow)}
        className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur text-xs font-bold text-blue-400 px-4 py-2 rounded-2xl shadow-lg border border-blue-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        <Snowflake size={14} className={showSnow ? 'animate-spin' : ''} />
        Let it snow
      </button>

      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/configure" element={<ConfigurePage />} />
        <Route path="/generating" element={<LoadingScreen />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/notes" element={<NoteTakerPage />} />
        <Route path="/library" element={<Library />} />
        <Route path="/study/:id" element={<StudyDetail />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
