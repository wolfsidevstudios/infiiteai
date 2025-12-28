
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
  BookA,
  Settings,
  Save,
  Key,
  ChevronDown,
  HelpCircle,
  MessageSquare
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
import { generateSummary, generateFlashcards, generateQuiz, generateShortOverview, generateConceptMap, generateLocationData, performWebSearch, generateStructuredNotes, generateKeyTerms, setApiKey, getApiKey } from './services/geminiService';
import FlashcardDeck from './components/FlashcardDeck';
import QuizRunner from './components/QuizRunner';
import DictionarySlide from './components/DictionarySlide';
import StudyBuddyChat from './components/StudyBuddyChat';

// --- Shared Liquid Glass Component ---
interface LiquidGlassProps {
    children?: React.ReactNode;
    className?: string;
    innerClassName?: string;
}

const LiquidGlass: React.FC<LiquidGlassProps> = ({ children, className = "", innerClassName = "p-4 flex items-center" }) => (
    <div className="glass-container" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
        <div className={`glass-container ${className}`}>
             <div className="glass-filter"></div>
             <div className="glass-overlay"></div>
             <div className="glass-specular"></div>
             <div className={`relative z-10 w-full h-full ${innerClassName}`}>
                 {children}
             </div>
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
                            bg-zinc-900 rounded-[3rem] shadow-2xl border border-zinc-800 overflow-hidden
                            ${isActive ? 'z-20 opacity-100 shadow-[0_30px_60px_rgba(0,0,0,0.5)]' : 'z-10 opacity-40 cursor-pointer hover:opacity-60 blur-[1px]'}
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
                                    ${i === activeIndex ? 'bg-white w-8' : 'bg-zinc-700 w-2 hover:bg-zinc-600'}
                                `}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={() => activeIndex > 0 && onNavigate(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        className={`hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-800 border border-zinc-700 shadow-lg text-white z-30 transition-opacity hover:scale-110 ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <button 
                        onClick={() => activeIndex < items.length - 1 && onNavigate(activeIndex + 1)}
                        disabled={activeIndex === items.length - 1}
                        className={`hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-800 border border-zinc-700 shadow-lg text-white z-30 transition-opacity hover:scale-110 ${activeIndex === items.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
    return (
        <div className="w-full h-full relative bg-zinc-900 overflow-hidden flex flex-col">
            <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center bg-no-repeat pointer-events-none invert"></div>
            
            <div className="relative z-10 w-full h-full p-8 md:p-12 overflow-y-auto no-scrollbar">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Key Locations</h2>
                    <p className="text-zinc-400">Places mentioned in your study material</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {locations.map(loc => (
                         <div key={loc.id} className="bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-800 flex items-start gap-4 hover:shadow-md hover:border-zinc-700 transition-all">
                             <div className={`
                                 p-3 rounded-xl shrink-0 text-white
                                 ${loc.category === 'historical' ? 'bg-amber-600' : loc.category === 'scientific' ? 'bg-blue-600' : 'bg-emerald-600'}
                             `}>
                                 <MapPin size={20} />
                             </div>
                             <div>
                                 <h4 className="font-bold text-white">{loc.name}</h4>
                                 <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{loc.description}</p>
                                 <div className="mt-2 text-xs text-zinc-600 font-mono">
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

// --- Settings Modal (Extracted) ---
const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [apiKeyInput, setApiKeyInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            setApiKeyInput(getApiKey() || '');
        }
    }, [isOpen]);

    const handleSave = () => {
        setApiKey(apiKeyInput);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl relative border border-zinc-800">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white text-black rounded-xl">
                        <Key size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">API Settings</h2>
                </div>

                <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
                    Enter your Google Gemini API key to enable AI features. The key is stored locally in your browser.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">API Key</label>
                        <input 
                            type="password" 
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="sk-..."
                            className="w-full p-4 bg-black rounded-xl border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-600 font-mono text-sm text-white placeholder-zinc-700"
                        />
                    </div>
                    
                    <button 
                        onClick={handleSave}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                        <Save size={18} /> Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Workspace Component ---
const Workspace = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'tasks' | 'agenda'>('home');
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
  }, [activeTab]); 

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
                            <div key={task.id} className="rounded-2xl !p-0 group hover:scale-[1.02] transition-transform glass-panel">
                                 <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-white font-medium truncate">{task.title}</span>
                                    <button onClick={() => toggleTaskStatus(task)} className="text-white/50 hover:text-green-400 transition-colors">
                                        <CheckCircle2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      );
  };
  
  const WorkspaceCalendar = () => <div className="text-white text-center mt-20">Calendar View</div>;
  const WorkspaceTasks = () => <div className="text-white text-center mt-20">Tasks View</div>;
  const WorkspaceAgenda = () => <div className="text-white text-center mt-20">Agenda View</div>;


  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-cover bg-center transition-all duration-1000"
         style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop")' }}>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

        {/* Sidebar */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col items-center py-6 z-50 border-r border-white/10 bg-black/20 backdrop-blur-xl">
            <button onClick={() => navigate('/')} className="mb-8 text-white/80 hover:text-white transition-colors">
                <X strokeWidth={1.5} size={28} />
            </button>
            
            <div className="flex flex-col gap-6 flex-1 justify-center">
                <SidebarIcon icon={Home} tab="home" label="Home" />
                <SidebarIcon icon={CalendarDays} tab="calendar" label="Calendar" />
                <SidebarIcon icon={ListTodo} tab="tasks" label="Tasks" />
                <SidebarIcon icon={Menu} tab="agenda" label="Agenda" />
            </div>
        </div>

        {/* Header Branding & Settings */}
        <div className="absolute top-8 right-8 z-40 flex items-center gap-6">
            <div className="text-white/80 font-light text-xl tracking-[0.2em] uppercase cursor-default">
                Workspace
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <button 
                onClick={onOpenSettings}
                className="text-white/60 hover:text-white transition-colors"
                title="Settings"
            >
                <Settings strokeWidth={1.5} size={24} />
            </button>
        </div>

        {/* Main Content Area */}
        <div className="absolute inset-0 pl-16 z-30">
            {activeTab === 'home' && <WorkspaceHome />}
            {activeTab === 'calendar' && <WorkspaceCalendar />}
            {activeTab === 'tasks' && <WorkspaceTasks />}
            {activeTab === 'agenda' && <WorkspaceAgenda />}
        </div>
    </div>
  );
};


// --- Components ---

const MobileNavbar = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Don't show in workspace
  if (location.pathname === '/workspace') return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-black/80 backdrop-blur-xl border-t border-zinc-800 pb-safe">
      <div className="flex justify-around items-center p-3 pb-5">
        <button 
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive('/') ? 'text-white' : 'text-zinc-500'}`}
        >
          <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
        </button>
        <button 
          onClick={() => navigate('/library')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive('/library') ? 'text-white' : 'text-zinc-500'}`}
        >
          <BookOpen size={24} strokeWidth={isActive('/library') ? 2.5 : 2} />
        </button>
        <button 
          onClick={() => navigate('/chat')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive('/chat') ? 'text-white' : 'text-zinc-500'}`}
        >
          <MessageSquare size={24} strokeWidth={isActive('/chat') ? 2.5 : 2} />
        </button>
        <button 
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-zinc-500 active:text-white transition-colors"
        >
          <Settings size={24} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

const Navbar = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  // Do not render navbar if in workspace
  if (location.pathname === '/workspace') return null;

  return (
    <nav className="hidden md:flex fixed top-0 left-0 w-full z-50 justify-center pt-6 pb-4 pointer-events-none">
      <div className={`
        px-6 py-2 rounded-full flex items-center gap-6 transition-colors duration-300 pointer-events-auto
        bg-zinc-900/80 backdrop-blur-md border border-zinc-800 shadow-xl
        text-white
      `}>
        <div className="hidden md:flex items-center gap-2 mr-2 cursor-pointer" onClick={() => navigate('/')}>
            <Sparkles size={16} className="text-white" />
            <span className="font-bold text-sm tracking-tight">Infinite Study AI</span>
        </div>
        <div className="w-px h-4 hidden md:block bg-zinc-700"></div>
        
        <button 
          onClick={() => navigate('/')} 
          className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-zinc-400 hover:text-zinc-300'}`}
        >
          Home
        </button>
        <button 
          onClick={() => navigate('/library')} 
          className={`text-sm font-medium transition-colors ${isActive('/library') ? 'text-white' : 'text-zinc-400 hover:text-zinc-300'}`}
        >
          Library
        </button>
        <button 
          onClick={() => navigate('/chat')} 
          className={`text-sm font-medium transition-colors ${isActive('/chat') ? 'text-white' : 'text-zinc-400 hover:text-zinc-300'}`}
        >
          Chat
        </button>

        <div className="w-px h-4 bg-zinc-700"></div>

        <button 
          onClick={onOpenSettings}
          className="text-sm font-medium transition-colors text-zinc-400 hover:text-white flex items-center gap-2"
          title="Settings"
        >
          <Settings size={18} />
        </button>
        
        <div className="w-px h-4 bg-zinc-700"></div>

        <button 
          onClick={() => navigate('/workspace')} 
          className="text-sm font-medium px-3 py-1 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
           <Layout size={14} /> Workspace
        </button>
      </div>
    </nav>
  );
};

// --- Chat Page ---
const ChatPage = () => {
    return (
        <div className="h-screen bg-black pt-6 md:pt-24 pb-6 px-6 flex flex-col">
            <div className="flex-1 max-w-5xl mx-auto w-full relative">
                <StudyBuddyChat />
            </div>
        </div>
    );
};

// --- Search Results Page ---
const SearchResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { query } = location.state || { query: '' };
    const [result, setResult] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
             navigate('/');
             return;
        }

        const fetchData = async () => {
             const data = await performWebSearch(query);
             setResult(data);
             setLoading(false);
        };
        fetchData();
    }, [query, navigate]);

    if (loading) {
         return (
             <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                 <Loader2 size={48} className="animate-spin mb-4 text-zinc-500" />
                 <p className="text-zinc-400 animate-pulse">Searching the deep web...</p>
             </div>
         );
    }

    if (!result) return null;

    return (
        <div className="min-h-screen bg-black text-white pt-6 md:pt-24 px-6 pb-24 md:pb-12">
            <div className="max-w-4xl mx-auto">
                 <button onClick={() => navigate('/')} className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
                     <ArrowLeft size={20} /> Back
                 </button>

                 <h1 className="text-4xl font-bold mb-8 capitalize">{query}</h1>

                 <div className="grid gap-8">
                     {/* Summary Card */}
                     <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
                         <div className="flex items-center gap-3 mb-6">
                             <Sparkles className="text-yellow-400" />
                             <h2 className="text-xl font-bold">AI Summary</h2>
                         </div>
                         <div className="prose prose-invert max-w-none text-lg leading-relaxed text-zinc-300" 
                              dangerouslySetInnerHTML={{ __html: result.summary }} 
                         />
                     </div>

                     {/* Timeline */}
                     {result.timeline.length > 0 && (
                         <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
                             <div className="flex items-center gap-3 mb-6">
                                 <Clock className="text-blue-400" />
                                 <h2 className="text-xl font-bold">Search Journey</h2>
                             </div>
                             <div className="space-y-4">
                                 {result.timeline.map((step, i) => (
                                     <div key={i} className="flex gap-4">
                                         <div className="flex flex-col items-center">
                                             <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                             {i !== result.timeline.length - 1 && <div className="w-px h-full bg-zinc-800 my-1"></div>}
                                         </div>
                                         <p className="text-zinc-400 pb-4">{step}</p>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}

                     {/* Sources */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {result.sources.map((source, i) => (
                             <a 
                                 key={i} 
                                 href={source.uri} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between group"
                             >
                                 <div className="flex-1 min-w-0">
                                     <h4 className="font-bold truncate text-zinc-300 group-hover:text-white">{source.title}</h4>
                                     <p className="text-xs text-zinc-500 truncate">{source.uri}</p>
                                 </div>
                                 <ExternalLink size={16} className="text-zinc-600 group-hover:text-white" />
                             </a>
                         ))}
                     </div>
                 </div>
            </div>
        </div>
    );
};

// --- Note Taker Page ---
const NoteTakerPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { query } = location.state || { query: '' };
    const [notes, setNotes] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) { navigate('/'); return; }
        const generate = async () => {
            const html = await generateStructuredNotes(query);
            setNotes(html);
            setLoading(false);
        };
        generate();
    }, [query, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <Loader2 size={48} className="animate-spin mb-4 text-emerald-500" />
                <p className="text-zinc-400 animate-pulse">Drafting structured notes...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-6 md:pt-24 px-6 pb-24 md:pb-12">
            <div className="max-w-3xl mx-auto">
                 <button onClick={() => navigate('/')} className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
                     <ArrowLeft size={20} /> Back
                 </button>
                 
                 <div className="bg-white text-black p-8 md:p-12 rounded-[2px] shadow-2xl min-h-[80vh]">
                     <div className="prose max-w-none prose-headings:font-serif prose-p:font-serif" dangerouslySetInnerHTML={{ __html: notes }} />
                 </div>
            </div>
        </div>
    );
};

// --- Configure Page ---
const ConfigurePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState(location.state?.title || "New Study Set");
  
  if (!location.state) return <Navigate to="/" />;

  const handleStart = () => {
      navigate('/generating', {
          state: { ...location.state, title }
      });
  };

  return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-6">Setup your Study Kit</h2>
              
              <div className="space-y-6">
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Title</label>
                      <input 
                          type="text" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-white/50 transition-colors"
                      />
                  </div>

                  <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800">
                      <div className="flex items-center gap-3 mb-2">
                          <Brain size={20} className="text-purple-400" />
                          <span className="text-sm font-medium text-zinc-300">AI Will Generate:</span>
                      </div>
                      <ul className="text-sm text-zinc-500 space-y-2 ml-8 list-disc">
                          <li>Comprehensive Summary</li>
                          <li>Flashcards & Quiz</li>
                          <li>Concept Map</li>
                          <li>Key Terms Dictionary</li>
                          <li>Related Locations (if applicable)</li>
                      </ul>
                  </div>

                  <button 
                      onClick={handleStart}
                      className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                  >
                      <Sparkles size={20} /> Generate Kit
                  </button>
                  
                  <button onClick={() => navigate('/')} className="w-full text-zinc-500 hover:text-white text-sm">Cancel</button>
              </div>
          </div>
      </div>
  );
};

// --- Loading Screen ---
const LoadingScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState("Initializing AI...");

    useEffect(() => {
        const process = async () => {
            const { content, title, context, images, selectedSubject } = location.state;
            
            try {
                // Parallel generation for speed
                setStatus("Reading and understanding content...");
                
                // We create promises for independent tasks
                const summaryPromise = generateSummary(content, context, images);
                const cardsPromise = generateFlashcards(content, context, images);
                const quizPromise = generateQuiz(content, context, images);
                const mapPromise = generateConceptMap(content, context, images);
                const locPromise = generateLocationData(content, context, images);
                const termsPromise = generateKeyTerms(content, context, images);
                const overviewPromise = generateShortOverview(content, context, images);
                
                setStatus("Synthesizing Study Materials...");
                
                const [summary, cards, quiz, map, locations, terms, overview] = await Promise.all([
                    summaryPromise, cardsPromise, quizPromise, mapPromise, locPromise, termsPromise, overviewPromise
                ]);

                setStatus("Finalizing...");

                const newMaterial: StudyMaterial = {
                    id: `mat-${Date.now()}`,
                    title: title || "Untitled Study Set",
                    content: summary, // The generated summary becomes the main content view
                    context: context,
                    images: images,
                    createdAt: Date.now(),
                    type: 'text',
                    subject: selectedSubject
                };

                saveMaterial(newMaterial);
                saveFlashcards(newMaterial.id, cards);
                localStorage.setItem(`sb_quiz_${newMaterial.id}`, JSON.stringify(quiz));
                
                saveConceptMap(newMaterial.id, map);
                saveLocations(newMaterial.id, locations);
                saveKeyTerms(newMaterial.id, terms);
                saveOverview(newMaterial.id, overview);

                navigate(`/study/${newMaterial.id}`);

            } catch (e) {
                console.error(e);
                alert("Something went wrong. Please check API Key.");
                navigate('/');
            }
        };

        if (location.state) {
            process();
        } else {
            navigate('/');
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-white rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">{status}</h2>
            <p className="text-zinc-500">This might take a few seconds...</p>
        </div>
    );
};

// --- Library Page ---
const Library = () => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);

    useEffect(() => {
        setMaterials(getMaterials().sort((a, b) => b.createdAt - a.createdAt));
    }, []);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Delete this study set?")) {
            deleteMaterial(id);
            setMaterials(prev => prev.filter(m => m.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-8 md:pt-24 px-6 pb-24 md:pb-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Your Library</h1>
                    <button onClick={() => navigate('/')} className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold hover:scale-105 transition-transform">
                        + New Study Set
                    </button>
                </div>

                {materials.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl">
                        <BookOpen size={48} className="mx-auto text-zinc-600 mb-4" />
                        <h3 className="text-xl font-bold text-zinc-400 mb-2">Library is empty</h3>
                        <p className="text-zinc-600 mb-6">Create your first study set to get started.</p>
                        <button onClick={() => navigate('/')} className="text-white underline hover:text-zinc-300">Create Now</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map(m => {
                            const date = new Date(m.createdAt).toLocaleDateString();
                            return (
                                <div 
                                    key={m.id}
                                    onClick={() => navigate(`/study/${m.id}`)}
                                    className="group relative bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all cursor-pointer shadow-lg"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover:scale-110 transition-transform">
                                            <BookOpen size={24} className="text-white" />
                                        </div>
                                        <button 
                                            onClick={(e) => handleDelete(e, m.id)}
                                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-900/20 rounded-full transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold mb-2 line-clamp-1 text-white group-hover:text-blue-200 transition-colors">{m.title}</h3>
                                    <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{getOverview(m.id) || "No overview available."}</p>
                                    
                                    <div className="flex items-center justify-between text-xs font-medium text-zinc-500 border-t border-zinc-800 pt-4">
                                        <span>{date}</span>
                                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            Open <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Study Detail Page ---
const StudyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [material, setMaterial] = useState<StudyMaterial | null>(null);
    const [tab, setTab] = useState<'dashboard' | 'flashcards' | 'quiz' | 'map' | 'terms'>('dashboard');
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [locations, setLocations] = useState<StudyLocation[]>([]);
    const [terms, setTerms] = useState<string[]>([]);
    const [conceptMap, setConceptMap] = useState<ConceptMapNode | null>(null);
    const [overview, setOverview] = useState("");

    // Load Data
    useEffect(() => {
        if (!id) return;
        const allMaterials = getMaterials();
        const found = allMaterials.find(m => m.id === id);
        
        if (found) {
            setMaterial(found);
            setFlashcards(getFlashcards(id));
            setLocations(getLocations(id));
            setTerms(getKeyTerms(id));
            setConceptMap(getConceptMap(id));
            setOverview(getOverview(id));
            
            // Load Quiz Questions from local storage (hack as per LoadingScreen)
            const storedQuiz = localStorage.getItem(`sb_quiz_${id}`);
            if (storedQuiz) setQuizQuestions(JSON.parse(storedQuiz));
        } else {
            navigate('/library');
        }
    }, [id, navigate]);

    if (!material) return null;

    return (
        <div className="min-h-screen bg-black text-white pt-6 md:pt-24 pb-24 md:pb-12 px-4 md:px-8 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                <div>
                    <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1 cursor-pointer hover:text-white" onClick={() => navigate('/library')}>
                        <ArrowLeft size={14} /> Back to Library
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        {material.title}
                        <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full font-normal border border-zinc-700">
                            {material.subject || 'General'}
                        </span>
                    </h1>
                </div>

                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: Layout },
                        { id: 'flashcards', label: 'Cards', icon: Layers },
                        { id: 'quiz', label: 'Quiz', icon: Brain },
                        { id: 'map', label: 'Map', icon: MapIcon },
                        { id: 'terms', label: 'Dictionary', icon: BookA }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as any)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                                ${tab === t.id ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}
                            `}
                        >
                            <t.icon size={16} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 bg-zinc-950 rounded-3xl border border-zinc-900 overflow-hidden relative shadow-2xl">
                
                {tab === 'dashboard' && (
                    <div className="h-full overflow-y-auto p-6 md:p-10 scrollbar-hide">
                         <div className="max-w-4xl mx-auto space-y-8">
                             {/* Overview Hero */}
                             <div className="p-8 rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 shadow-xl relative overflow-hidden">
                                 <div className="relative z-10">
                                     <h3 className="text-zinc-400 uppercase tracking-widest text-xs font-bold mb-2">Overview</h3>
                                     <p className="text-xl md:text-2xl font-medium leading-relaxed text-white">
                                         {overview}
                                     </p>
                                 </div>
                                 <Sparkles className="absolute top-4 right-4 text-white/5 w-32 h-32" />
                             </div>

                             {/* Summary Content */}
                             <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-h3:text-white/90 prose-p:text-zinc-400 prose-li:text-zinc-400 prose-strong:text-white" 
                                  dangerouslySetInnerHTML={{ __html: material.content }} 
                             />
                         </div>
                    </div>
                )}

                {tab === 'flashcards' && (
                    <div className="h-full flex flex-col">
                        <FlashcardDeck cards={flashcards} onUpdateCard={(updated) => {
                             const newCards = flashcards.map(c => c.id === updated.id ? updated : c);
                             setFlashcards(newCards);
                             saveFlashcards(material.id, newCards);
                        }} />
                    </div>
                )}

                {tab === 'quiz' && (
                    <div className="h-full flex flex-col p-6 md:p-10 overflow-y-auto">
                        {quizQuestions.length > 0 ? (
                            <QuizRunner 
                                questions={quizQuestions} 
                                materialId={material.id} 
                                onComplete={() => {
                                    alert("Quiz recorded!");
                                    setTab('dashboard');
                                }} 
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                <Brain size={48} className="mb-4" />
                                <p>No quiz generated for this set.</p>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'map' && (
                    <MapSlide locations={locations} />
                )}

                {tab === 'terms' && (
                    <div className="h-full p-6">
                        <DictionarySlide terms={terms} />
                    </div>
                )}

            </div>
        </div>
    );
};

const FAQSection = () => {
    const faqs = [
        { q: "How does it work?", a: "Simply upload your notes (PDF, text) or type a topic. Our AI analyzes the content to create summaries, flashcards, and quizzes instantly." },
        { q: "Is it free to use?", a: "Infinite Study AI requires your own Google Gemini API key. If you have a key (which has a free tier), the app is free to use." },
        { q: "Can I upload images?", a: "Yes! You can attach images of diagrams, handwritten notes, or textbook pages, and the AI will include them in its analysis." },
        { q: "Where is my data stored?", a: "All your study materials and API keys are stored locally in your browser's storage. We don't save your data on our servers." },
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="bg-black py-32 px-6 border-t border-zinc-900">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full shadow-sm text-sm font-medium text-zinc-300 mb-6 border border-zinc-800">
                        <HelpCircle size={16} /> FAQ
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">Common Questions</h2>
                    <p className="text-xl text-zinc-500">Everything you need to know about the platform.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div 
                            key={i} 
                            className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        >
                            <div className="p-6 md:p-8 flex items-center justify-between">
                                <h3 className="text-lg md:text-xl font-semibold text-white">{faq.q}</h3>
                                <ChevronDown 
                                    size={24} 
                                    className={`text-zinc-500 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                                />
                            </div>
                            <div 
                                className={`px-6 md:px-8 text-zinc-400 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-48 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Landing Page ---
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
            return <span key={i} className="text-blue-400 bg-blue-900/30 rounded px-1">{part}</span>;
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
    <div className="w-full bg-black">
      {/* Hero Section */}
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor - Top blob only */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900 rounded-full blur-3xl opacity-30 pointer-events-none" />
      
      {/* REMOVED: Bottom Gradients */}

      <div className="max-w-2xl w-full text-center z-10 space-y-8 relative">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">
           What do you want to learn?
        </h1>

        <div 
          className={`
            relative bg-zinc-900 rounded-[2rem] border border-zinc-800 shadow-xl transition-all duration-300
            hover:border-zinc-700 hover:shadow-2xl hover:shadow-zinc-900/50
            flex flex-col min-h-[160px] text-left overflow-hidden
          `}
        >
          {/* Main Input Area with Overlay Highlighting */}
          <div className="flex-1 relative">
            {/* Backdrop for highlighting */}
            <div 
                ref={backdropRef}
                className="absolute inset-0 p-6 text-lg text-white whitespace-pre-wrap break-words font-sans bg-transparent pointer-events-none z-0 overflow-hidden"
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
              className="relative z-10 w-full h-full bg-transparent border-none outline-none text-lg text-transparent caret-white placeholder-zinc-500 resize-none font-sans p-6"
              style={{ minHeight: '120px', lineHeight: '1.625' }}
              spellCheck={false}
            />
          </div>
          
           {/* Context Chips Positioned Above Toolbar */}
             {(contextText || attachedImages.length > 0 || selectedSubject) && (
                 <div className="px-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar relative z-20">
                     {selectedSubject && (
                        <div className="flex items-center gap-1 text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold shrink-0 shadow-md">
                            {(() => {
                                const subj = subjects.find(s => s.id === selectedSubject);
                                if (!subj) return null;
                                return (
                                    <>
                                        <subj.icon size={12} /> {subj.label}
                                    </>
                                )
                            })()}
                            <button onClick={() => setSelectedSubject('')} className="ml-1 hover:text-zinc-600"><X size={12}/></button>
                        </div>
                     )}
                     {contextText && (
                         <div className="flex items-center gap-1 text-xs bg-purple-900/50 border border-purple-800 text-purple-200 px-2 py-1 rounded-md font-medium shrink-0">
                             <AtSign size={12} /> Context Added
                             <button onClick={() => setContextText('')} className="ml-1 hover:text-purple-100"><X size={10}/></button>
                         </div>
                     )}
                     {attachedImages.map((_, i) => (
                         <div key={i} className="flex items-center gap-1 text-xs bg-blue-900/50 border border-blue-800 text-blue-200 px-2 py-1 rounded-md font-medium shrink-0">
                             <ImageIcon size={12} /> Image {i+1}
                             <button onClick={() => setAttachedImages(prev => prev.filter((__, idx) => idx !== i))} className="ml-1 hover:text-blue-100"><X size={10}/></button>
                         </div>
                     ))}
                 </div>
             )}

          {/* Action Toolbar */}
          <div className="px-4 pb-4 flex items-center justify-between relative z-20 bg-zinc-900 rounded-b-[2rem]">
            
            {/* Left Tools & Tool Dropdown */}
            <div className="flex items-center gap-2 relative">
                {isToolMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-800 rounded-2xl shadow-xl border border-zinc-700 overflow-hidden animate-fade-in z-50">
                        <button 
                            onClick={() => { setSelectedTool('kit'); setIsToolMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-zinc-700 flex items-center gap-2 text-sm font-medium text-zinc-200"
                        >
                            <BookOpen size={16} /> Study Kit
                        </button>
                        <button 
                            onClick={() => { setSelectedTool('search'); setIsToolMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-zinc-700 flex items-center gap-2 text-sm font-medium text-zinc-200"
                        >
                            <Globe size={16} /> Search
                        </button>
                        <button 
                            onClick={() => { setSelectedTool('note'); setIsToolMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-zinc-700 flex items-center gap-2 text-sm font-medium text-zinc-200"
                        >
                            <Notebook size={16} /> Note Taker v1
                        </button>
                    </div>
                )}

                <button 
                    onClick={() => setIsToolMenuOpen(!isToolMenuOpen)}
                    className="p-2 rounded-full hover:bg-zinc-800 text-white transition-colors flex items-center gap-2 pr-4 bg-zinc-800 border border-zinc-700"
                >
                    <Plus size={20} strokeWidth={2} />
                    <span className="text-xs font-bold uppercase tracking-wider">{toolLabels[selectedTool]}</span>
                </button>

                <div className="h-6 w-px bg-zinc-800 mx-2"></div>

                {/* Hidden Inputs */}
                <input type="file" ref={fileInputRef} accept=".txt,.md,.js,.py,.html,.css,.json" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0], 'text')} />
                <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0], 'image')} />
                <input type="file" ref={contextInputRef} accept=".txt,.md" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0], 'context')} />

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Upload File"
                >
                    <Paperclip size={20} strokeWidth={1.5} />
                </button>
                
                 <button 
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" 
                    title="Image"
                >
                     <ImageIcon size={20} strokeWidth={1.5} />
                 </button>

                 <button 
                    onClick={() => contextInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" 
                    title="Context"
                >
                     <AtSign size={20} strokeWidth={1.5} />
                 </button>
            </div>
            
             {/* Right Tools */}
            <div className="flex items-center gap-3">
               <button className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                  <Mic size={22} strokeWidth={1.5} />
               </button>

                <button
                onClick={handleAction}
                disabled={!prompt.trim() && attachedImages.length === 0}
                className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                    ${(!prompt.trim() && attachedImages.length === 0) ? 'bg-zinc-800 text-zinc-600' : 'bg-white text-black hover:scale-105 shadow-md'}
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
                            ? 'bg-white text-black scale-105' 
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-1'
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

      <FAQSection />

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
             <Sparkles size={16} className="text-zinc-500"/>
             <span className="font-bold text-zinc-200">Infinite Study AI</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Infinite Study AI. Built with Google Gemini.</p>
      </footer>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [showSnow, setShowSnow] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <Router>
      {showSnow && <SnowOverlay />}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Easter Egg Button */}
      <button 
        onClick={() => setShowSnow(!showSnow)}
        className="fixed bottom-24 md:bottom-6 left-6 z-[100] bg-zinc-900/90 backdrop-blur text-xs font-bold text-blue-400 px-4 py-2 rounded-2xl shadow-lg border border-zinc-800 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        <Snowflake size={14} className={showSnow ? 'animate-spin' : ''} />
        Let it snow
      </button>

      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />
      <MobileNavbar onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/configure" element={<ConfigurePage />} />
        <Route path="/generating" element={<LoadingScreen />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/notes" element={<NoteTakerPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/library" element={<Library />} />
        <Route path="/study/:id" element={<StudyDetail />} />
        <Route path="/workspace" element={<Workspace onOpenSettings={() => setIsSettingsOpen(true)} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
