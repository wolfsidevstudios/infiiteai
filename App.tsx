
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
  MessageSquare,
  ChevronLeft,
  ToggleLeft,
  ToggleRight,
  Copy,
  BellRing,
  Volume2,
  UserPlus,
  CreditCard,
  Maximize,
  Headphones,
  ScanLine,
  Pause
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
  getKeyTerms,
  getAppSettings,
  saveAppSettings,
  syncWidgetData,
  registerPeriodicSync
} from './services/storageService';
import { generateSummary, generateFlashcards, generateQuiz, generateShortOverview, generateConceptMap, generateLocationData, performWebSearch, generateStructuredNotes, generateKeyTerms, setApiKey, getApiKey, generateAudioLessonContent } from './services/geminiService';
import FlashcardDeck from './components/FlashcardDeck';
import QuizRunner from './components/QuizRunner';
import DictionarySlide from './components/DictionarySlide';
import StudyBuddyChat from './components/StudyBuddyChat';
import AudioLessonPlayer from './components/AudioLessonPlayer';

// Global type for Google GSI and Window features
declare global {
    interface Window {
        google: any;
        launchQueue?: any;
    }
}

const LOGO_URL = "https://iili.io/fVhsBY7.png";
const GOOGLE_CLIENT_ID = "562922803230-1co4tjg47qh3kfcmd2djjl7d8so9rtro.apps.googleusercontent.com";

// --- CUSTOM ICONS ---

const GeminiIcon = () => (
  <svg viewBox="0 0 65 65" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="maskme" style={{maskType:"alpha"}} maskUnits="userSpaceOnUse" x="0" y="0" width="65" height="65">
      <path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="#000"/>
      <path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="url(#prefix__paint0_linear_2001_67)"/>
    </mask>
    <g mask="url(#maskme)">
      <g filter="url(#prefix__filter0_f_2001_67)"><path d="M-5.859 50.734c7.498 2.663 16.116-2.33 19.249-11.152 3.133-8.821-.406-18.131-7.904-20.794-7.498-2.663-16.116 2.33-19.25 11.151-3.132 8.822.407 18.132 7.905 20.795z" fill="#FFE432"/></g>
      <g filter="url(#prefix__filter1_f_2001_67)"><path d="M27.433 21.649c10.3 0 18.651-8.535 18.651-19.062 0-10.528-8.35-19.062-18.651-19.062S8.78-7.94 8.78 2.587c0 10.527 8.35 19.062 18.652 19.062z" fill="#FC413D"/></g>
      <g filter="url(#prefix__filter2_f_2001_67)"><path d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z" fill="#00B95C"/></g>
      <g filter="url(#prefix__filter3_f_2001_67)"><path d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z" fill="#00B95C"/></g>
      <g filter="url(#prefix__filter4_f_2001_67)"><path d="M30.954 74.181c9.014-5.485 11.427-17.976 5.389-27.9-6.038-9.925-18.241-13.524-27.256-8.04-9.015 5.486-11.428 17.977-5.39 27.902 6.04 9.924 18.242 13.523 27.257 8.038z" fill="#00B95C"/></g>
      <g filter="url(#prefix__filter5_f_2001_67)"><path d="M67.391 42.993c10.132 0 18.346-7.91 18.346-17.666 0-9.757-8.214-17.667-18.346-17.667s-18.346 7.91-18.346 17.667c0 9.757 8.214 17.666 18.346 17.666z" fill="#3186FF"/></g>
      <g filter="url(#prefix__filter6_f_2001_67)"><path d="M-13.065 40.944c9.33 7.094 22.959 4.869 30.442-4.972 7.483-9.84 5.987-23.569-3.343-30.663C4.704-1.786-8.924.439-16.408 10.28c-7.483 9.84-5.986 23.57 3.343 30.664z" fill="#FBBC04"/></g>
      <g filter="url(#prefix__filter7_f_2001_67)"><path d="M34.74 51.43c11.135 7.656 25.896 5.524 32.968-4.764 7.073-10.287 3.779-24.832-7.357-32.488C49.215 6.52 34.455 8.654 27.382 18.94c-7.072 10.288-3.779 24.833 7.357 32.49z" fill="#3186FF"/></g>
      <g filter="url(#prefix__filter8_f_2001_67)"><path d="M54.984-2.336c2.833 3.852-.808 11.34-8.131 16.727-7.324 5.387-15.557 6.631-18.39 2.78-2.833-3.853.807-11.342 8.13-16.728 7.324-5.387 15.558-6.631 18.39-2.78z" fill="#749BFF"/></g>
      <g filter="url(#prefix__filter9_f_2001_67)"><path d="M31.727 16.104C43.053 5.598 46.94-8.626 40.41-15.666c-6.53-7.04-21.006-4.232-32.332 6.274s-15.214 24.73-8.683 31.77c6.53 7.04 21.006 4.232 32.332-6.274z" fill="#FC413D"/></g>
      <g filter="url(#prefix__filter10_f_2001_67)"><path d="M8.51 53.838c6.732 4.818 14.46 5.55 17.262 1.636 2.802-3.915-.384-10.994-7.116-15.812-6.731-4.818-14.46-5.55-17.261-1.636-2.802 3.915.383 10.994 7.115 15.812z" fill="#FFEE48"/></g>
    </g>
    <defs>
      <filter id="prefix__filter0_f_2001_67" x="-19.824" y="13.152" width="39.274" height="43.217" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="2.46" result="effect1_foregroundBlur_2001_67"/></filter>
      <filter id="prefix__filter1_f_2001_67" x="-15.001" y="-40.257" width="84.868" height="85.688" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="11.891" result="effect1_foregroundBlur_2001_67"/></filter>
      <filter id="prefix__filter2_f_2001_67" x="-20.776" y="11.927" width="79.454" height="90.916" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter>
      <filter id="prefix__filter3_f_2001_67" x="-20.776" y="11.927" width="79.454" height="90.916" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter>
      <filter id="prefix__filter4_f_2001_67" x="-19.845" y="15.459" width="79.731" height="81.505" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter>
      <filter id="prefix__filter5_f_2001_67" x="29.832" y="-11.552" width="75.117" height="73.758" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="9.606" result="effect1_foregroundBlur_2001_67"/></filter>
      <filter id="prefix__filter6_f_2001_67" x="-38.583" y="-16.253" width="78.135" height="78.758" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="8.706" result="effect1_foregroundBlur_2001_67"/></filter>
      <filter id="prefix__filter7_f_2001_67" x="8.107" y="-5.966" width="78.877" height="77.539" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="7.775" result="effect1_foregroundBlur_2001_67"/></filter>
      <filter id="prefix__filter8_f_2001_67" x="13.587" y="-18.488" width="56.272" height="51.81" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="6.957" result="effect1_foregroundBlur_2001_67"/></filter>
      <filter id="prefix__filter9_f_2001_67" x="-15.526" y="-31.297" width="70.856" height="69.306" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="5.876" result="effect1_foregroundBlur_2001_67"/></filter>
      <filter id="prefix__filter10_f_2001_67" x="-14.168" y="20.964" width="55.501" height="51.571" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="7.273" result="effect1_foregroundBlur_2001_67"/></filter>
      <linearGradient id="prefix__paint0_linear_2001_67" x1="18.447" y1="43.42" x2="52.153" y2="15.004" gradientUnits="userSpaceOnUse"><stop stopColor="#4893FC"/><stop offset=".27" stopColor="#4893FC"/><stop offset=".777" stopColor="#969DFF"/><stop offset="1" stopColor="#BD99FE"/></linearGradient>
    </defs>
  </svg>
);

const SearchSparkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="16" width="16">
    <g id="ai-spark-internet-fill">
      <path id="Union" fill="currentColor" d="M10.5 5c0.3384 0 0.672 0.02112 1 0.05957V9.2627c-0.1197 -0.25002 -0.2431 -0.48533 -0.3682 -0.70411 -0.2177 -0.38105 -0.4368 -0.70873 -0.6318 -0.97949 -0.195 0.27076 -0.4141 0.59844 -0.63184 0.97949 -0.24157 0.42276 -0.47988 0.90596 -0.68945 1.44141H15v2h-0.6035c0.0649 0.48 0.1035 0.9804 0.1035 1.5s-0.0386 1.02 -0.1035 1.5h2.4277c0.1138 -0.4816 0.1758 -0.9836 0.1758 -1.5 0 -0.3403 -0.0292 -0.6739 -0.0801 -1h2.0196c0.0384 0.3281 0.0605 0.6616 0.0605 1 0 4.6944 -3.8056 8.5 -8.5 8.5C5.80558 22 2 18.1944 2 13.5 2 8.80558 5.80558 5 10.5 5M5.02441 17c0.75338 1.1762 1.87374 2.0939 3.20118 2.5898 -0.03047 -0.0516 -0.06325 -0.1028 -0.09375 -0.1562 -0.38542 -0.6745 -0.77364 -1.4933 -1.0752 -2.4336zm8.91899 0c-0.3016 0.9403 -0.6898 1.7591 -1.0752 2.4336 -0.0306 0.0535 -0.0642 0.1044 -0.0948 0.1562 1.3278 -0.4959 2.4487 -1.4134 3.2022 -2.5898zm-4.76469 0c0.20957 0.5354 0.44788 1.0187 0.68945 1.4414 0.21754 0.3808 0.43694 0.7079 0.63184 0.9785 0.1949 -0.2706 0.4143 -0.5977 0.6318 -0.9785 0.2416 -0.4227 0.4799 -0.906 0.6895 -1.4414zm-5.00293 -5C4.06197 12.4816 4 12.9836 4 13.5s0.06197 1.0184 0.17578 1.5h2.42774C6.53859 14.52 6.5 14.0196 6.5 13.5s0.03859 -1.02 0.10352 -1.5zm4.44824 0c-0.07856 0.4767 -0.12402 0.9776 -0.12402 1.5s0.04546 1.0233 0.12402 1.5H12.376c0.0785 -0.4767 0.124 -0.9776 0.124 -1.5s-0.0455 -1.0233 -0.124 -1.5zM19 1.5c0 1.93297 1.567 3.49998 3.5 3.5v2l-0.1748 0.00391c-1.7922 0.08816 -3.2297 1.52481 -3.3203 3.31639L19 10.5h-2c0 -1.87274 -1.4708 -3.4016 -3.3203 -3.49512L13.5 7V5l0.1797 -0.00488C15.5292 4.90158 17 3.37271 17 1.5zM8.22559 7.40918C6.89801 7.90513 5.77785 8.82374 5.02441 10h2.03223c0.30156 -0.94029 0.68978 -1.75911 1.0752 -2.43359 0.03064 -0.05364 0.06314 -0.10533 0.09375 -0.15723" strokeWidth="1"></path>
    </g>
  </svg>
);

const NoteTakerIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="16" width="16">
  <g id="ai-spark-generate-text-fill">
    <path id="Union" fill="currentColor" d="M20 20H4v-2h16zm0 -4H4v-2h16zm-7 -4H4v-2h9zm6 -10.5c0 1.93297 1.567 3.49998 3.5 3.5v2l-0.1748 0.00391c-1.7922 0.08816 -3.2297 1.52481 -3.3203 3.31639L19 10.5h-2c0 -1.87274 -1.4708 -3.4016 -3.3203 -3.49512L13.5 7V5l0.1797 -0.00488C15.5292 4.90158 17 3.37271 17 1.5zM10 8H4V6h6z" strokeWidth="1"></path>
  </g>
</svg>
);

const AudioLessonIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="16" width="16">
  <g id="graphic-eq">
    <path id="Union" fill="currentColor" d="M12 2c0.5523 0 1 0.44772 1 1v18c0 0.5523 -0.4477 1 -1 1s-1 -0.4477 -1 -1V3c0 -0.55228 0.4477 -1 1 -1M7.5 6c0.55228 0 1 0.44772 1 1v10c0 0.5523 -0.44772 1 -1 1s-1 -0.4477 -1 -1V7c0 -0.55228 0.44772 -1 1 -1m9 0c0.5523 0 1 0.44772 1 1v10c0 0.5523 -0.4477 1 -1 1s-1 -0.4477 -1 -1V7c0 -0.55228 0.4477 -1 1 -1M3 10c0.55228 0 1 0.4477 1 1v2c0 0.5523 -0.44772 1 -1 1s-1 -0.4477 -1 -1v-2c0 -0.5523 0.44772 -1 1 -1m18 0c0.5523 0 1 0.4477 1 1v2c0 0.5523 -0.4477 1 -1 1s-1 -0.4477 -1 -1v-2c0 -0.5523 0.4477 -1 1 -1" strokeWidth="1"></path>
  </g>
</svg>
);

const StudyKitIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" height="16" width="16">
  <g id="Free Remix/Interface Essential/open-book--content-books-book-open">
    <path id="Union" fill="currentColor" fillRule="evenodd" d="M1.91733 1.68385c-0.07203 -0.0094 -0.13605 0.01261 -0.19075 0.06513 -0.05829 0.05597 -0.10158 0.14496 -0.10158 0.251v7c0 0.18875 0.16581 0.40678 0.45401 0.44437 1.81061 0.23618 3.16656 1.03355 4.06545 1.76635 0.0804 0.0656 0.15725 0.1307 0.23054 0.1949V4.20572c-0.04145 -0.05292 -0.09499 -0.1188 -0.16058 -0.19473 -0.18888 -0.21865 -0.47575 -0.51834 -0.85979 -0.83141 -0.76839 -0.62641 -1.91336 -1.29694 -3.4373 -1.49573ZM7.625 4.20572v7.19988c0.07329 -0.0642 0.15014 -0.1293 0.23054 -0.1949 0.89889 -0.7328 2.25486 -1.53017 4.06546 -1.76635 0.2882 -0.03759 0.454 -0.25562 0.454 -0.44437v-7c0 -0.10604 -0.0433 -0.19503 -0.1016 -0.251 -0.0547 -0.05252 -0.1187 -0.07453 -0.1907 -0.06513 -1.524 0.19879 -2.66894 0.86932 -3.43733 1.49573 -0.38404 0.31307 -0.67091 0.61276 -0.85979 0.83141 -0.06559 0.07593 -0.11913 0.14181 -0.16058 0.19473ZM7.51441 13.355c0.0019 -0.0028 0.00378 -0.0056 0.00564 -0.0084l0.00016 -0.0002 0.00966 -0.0138c0.0096 -0.0136 0.02549 -0.0356 0.04767 -0.0651 0.04439 -0.059 0.11376 -0.1474 0.20804 -0.2565 0.18888 -0.2187 0.47575 -0.5183 0.85979 -0.8314 0.76839 -0.6264 1.91333 -1.297 3.43733 -1.4958 0.8071 -0.1052 1.5423 -0.76799 1.5423 -1.68382v-7c0 -0.87226 -0.7276 -1.682996 -1.704 -1.555632C10.1104 0.68053 8.75443 1.47794 7.85554 2.21073c-0.35402 0.2886 -0.63906 0.56866 -0.85554 0.80351 -0.21648 -0.23485 -0.50152 -0.51491 -0.85554 -0.80351C5.24557 1.47794 3.88962 0.68053 2.07901 0.444348 1.10262 0.316984 0.375 1.12772 0.375 1.99998v7c0 0.91583 0.73523 1.57862 1.54233 1.68382 1.52394 0.1988 2.66891 0.8694 3.4373 1.4958 0.38404 0.3131 0.67091 0.6127 0.85979 0.8314 0.09428 0.1091 0.16365 0.1975 0.20804 0.2565 0.02218 0.0295 0.03807 0.0515 0.04767 0.0651l0.00966 0.0138 0.00016 0.0002c0.00186 0.0028 0.00374 0.0056 0.00564 0.0084 0.03975 0.0576 0.08795 0.1069 0.14208 0.147 0.05407 0.0401 0.11522 0.0719 0.18186 0.0933 0.00311 0.0009 0.00623 0.0019 0.00935 0.0029 0.11529 0.0349 0.241 0.0367 0.36224 0 0.00312 -0.001 0.00624 -0.002 0.00935 -0.0029 0.06664 -0.0214 0.12779 -0.0532 0.18186 -0.0933 0.05413 -0.0401 0.10233 -0.0894 0.14208 -0.147Z" clipRule="evenodd" strokeWidth="1"></path>
  </g>
</svg>
);

const AutoSelectIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" height="12" width="12">
  <g id="Free Remix/Artificial Intelligence/ai-science-spark--atom-scientific-experiment-artificial-intelligence-ai">
    <path id="Union" fill="currentColor" fillRule="evenodd" d="M11.1759 0.649356c-0.1952 -0.87008 -1.42801 -0.863859 -1.61549 0.007044l-0.02083 0.096752 0.48882 0.105228 -0.48882 -0.105227C9.30975 1.82077 8.46963 2.63397 7.42198 2.81931c-0.89609 0.15852 -0.89608 1.45286 0 1.61139 1.04765 0.18533 1.88777 0.99853 2.1176 2.06615l0.02083 0.09675c0.18748 0.8709 1.42029 0.87713 1.61549 0.00705l0.0253 -0.11276c0.2385 -1.06349 1.0795 -1.87059 2.1253 -2.0556 0.8979 -0.15883 0.8979 -1.45575 0 -1.61458 -1.0458 -0.18501 -1.8868 -0.99211 -2.1253 -2.0556l-0.0253 -0.112754ZM5.4936 3.34813c-0.95772 -0.62057 -1.89778 -1.06247 -2.72285 -1.2489 -0.79703 -0.18009 -1.66172 -0.15503 -2.244181 0.42742 -0.4322824 0.43229 -0.5559912 1.0264 -0.52095711 1.60925C0.0407044 4.71972 0.23639 5.36919 0.539043 6.03503 0.822207 6.65799 1.21169 7.32291 1.69156 8 1.21169 8.6771 0.822208 9.34201 0.539043 9.96497 0.23639 10.6308 0.0407045 11.2803 0.00561194 11.8641c-0.03503424 0.5829 0.08867456 1.177 0.52095706 1.6092l0.441942 -0.4419 -0.441942 0.4419c0.432283 0.4323 1.026401 0.556 1.609251 0.521 0.58382 -0.0351 1.23329 -0.2308 1.89913 -0.5334 0.62296 -0.2832 1.28788 -0.6727 1.96497 -1.1526 0.67708 0.4799 1.34198 0.8694 1.96493 1.1525 0.66584 0.3027 1.31531 0.4984 1.89913 0.5335 0.58282 0.035 1.17692 -0.0887 1.60922 -0.521 0.6058 -0.6058 0.6098 -1.5157 0.4029 -2.3477 -0.2153 -0.8657 -0.7032 -1.8544 -1.3825 -2.85801 -0.1934 -0.28586 -0.582 -0.36076 -0.86786 -0.1673 -0.28587 0.19347 -0.36077 0.58205 -0.1673 0.86791 0.63146 0.93302 1.03696 1.7852 1.20456 2.4591 0.176 0.7077 0.0523 1.0362 -0.0737 1.1621 -0.0887 0.0888 -0.2725 0.1798 -0.65032 0.1571 -0.37684 -0.0226 -0.87077 -0.1572 -1.45687 -0.4236 -0.45052 -0.2048 -0.93694 -0.479 -1.44205 -0.816 0.43327 -0.3609 0.86534 -0.755 1.28855 -1.1782 0.21848 -0.2184 0.42887 -0.43895 0.63069 -0.66044 0.23249 -0.25515 0.21412 -0.65045 -0.04103 -0.88294 -0.25514 -0.23248 -0.65044 -0.21411 -0.88293 0.04103 -0.18873 0.20713 -0.38576 0.41365 -0.59061 0.6185 -0.4787 0.4787 -0.96476 0.91295 -1.44481 1.29785 -0.48007 -0.3849 -0.96613 -0.81917 -1.44485 -1.29789 -0.4787 -0.4787 -0.91298 -0.96475 -1.29782 -1.44481 0.38484 -0.48005 0.81912 -0.96611 1.29782 -1.44481 0.26053 -0.26053 0.52373 -0.50839 0.78746 -0.74262 0.25808 -0.22922 0.28148 -0.62426 0.05226 -0.88234s-0.62426 -0.28148 -0.88234 -0.05226c-0.28228 0.25072 -0.56342 0.5155 -0.84126 0.79334 -0.42322 0.42321 -0.8173 0.85528 -1.17815 1.28856 -0.33708 -0.50513 -0.61125 -0.99156 -0.81604 -1.44209 -0.26641 -0.58611 -0.40099 -1.08003 -0.42364 -1.45688 -0.02271 -0.37781 0.06836 -0.56163 0.15709 -0.65036 0.12039 -0.12039 0.42605 -0.24089 1.0848 -0.09204 0.63071 0.14251 1.43184 0.50406 2.31861 1.07866 0.28968 0.1877 0.67668 0.10503 0.86438 -0.18465 0.1877 -0.28968 0.10504 -0.67668 -0.18464 -0.86438ZM2.49304 9.04014c-0.33708 0.50512 -0.61125 0.99156 -0.81604 1.44206 -0.26641 0.5861 -0.40099 1.0801 -0.42364 1.4569 -0.02271 0.3778 0.06836 0.5616 0.15709 0.6504 0.08874 0.0887 0.27256 0.1798 0.65037 0.1571 0.37684 -0.0227 0.87077 -0.1573 1.45687 -0.4237 0.45054 -0.2048 0.93697 -0.4789 1.44209 -0.816 -0.43329 -0.3609 -0.86537 -0.755 -1.28859 -1.1782 -0.42322 -0.42322 -0.8173 -0.85529 -1.17815 -1.28856ZM4.74992 8c0 -0.69035 0.55964 -1.25 1.25 -1.25 0.69035 0 1.25 0.55965 1.25 1.25 0 0.69036 -0.55965 1.25 -1.25 1.25 -0.69036 0 -1.25 -0.55964 -1.25 -1.25Z" clipRule="evenodd" strokeWidth="1"></path>
  </g>
</svg>
);

// --- SHARED COMPONENTS ---

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

// --- CONSTANTS ---

const MODELS = [
  { 
    id: 'gemini-3-pro', 
    name: 'Pro v3', 
    fullName: 'Gemini 3 Pro',
    desc: 'Reasoning expert for complex tasks.', 
    speed: 4, 
    intelligence: 5, 
    cost: 'Moderate',
    context: '2m tokens',
    features: ['Web Search', 'MCP', 'Vision']
  },
  { 
    id: 'gemini-3-flash', 
    name: 'Flash v3', 
    fullName: 'Gemini 3 Flash',
    desc: 'High-speed, cost-efficient AI for real-world workflows.', 
    speed: 5, 
    intelligence: 4, 
    cost: 'Low',
    context: '1m tokens',
    features: ['Web Search', 'MCP', 'Vision']
  },
  { 
    id: 'gemini-2.5-pro', 
    name: 'Pro v2.5', 
    fullName: 'Gemini 2.5 Pro',
    desc: 'Balanced performance for general tasks.', 
    speed: 3, 
    intelligence: 4, 
    cost: 'Moderate',
    context: '1m tokens',
    features: ['Web Search', 'Vision']
  },
  { 
    id: 'gemini-2.5-flash', 
    name: 'Flash v2.5', 
    fullName: 'Gemini 2.5 Flash',
    desc: 'Lightweight and extremely fast.', 
    speed: 5, 
    intelligence: 3, 
    cost: 'Very Low',
    context: '1m tokens',
    features: ['Web Search', 'Vision']
  }
];

const ModelInfoCard = ({ model, className = "absolute left-full top-0 ml-4" }: { model: typeof MODELS[0], className?: string }) => (
  <div className={`${className} w-72 bg-white rounded-2xl p-5 shadow-2xl border border-zinc-100 z-[60] text-left animate-fade-in hidden group-hover:block pointer-events-none`}>
      <h4 className="text-lg font-bold text-black mb-1">{model.fullName}</h4>
      <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{model.desc}</p>
      
      <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Speed</span>
              <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1.5 w-6 rounded-full ${i <= model.speed ? 'bg-black' : 'bg-zinc-200'}`}></div>
                  ))}
              </div>
          </div>
          <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Intelligence</span>
              <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1.5 w-6 rounded-full ${i <= model.intelligence ? 'bg-black' : 'bg-zinc-200'}`}></div>
                  ))}
              </div>
          </div>
      </div>

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs">Cost</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${model.cost === 'Low' || model.cost === 'Very Low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {model.cost}
              </span>
          </div>
          <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs">Context</span>
              <span className="text-black text-xs font-bold">{model.context}</span>
          </div>
      </div>

      <div className="space-y-1">
          <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-2">Supports</p>
          {model.features.map(feat => (
              <div key={feat} className="flex items-center justify-between text-xs text-black font-medium">
                  <span>{feat}</span>
                  <Check size={14} className="text-green-500" />
              </div>
          ))}
      </div>
  </div>
);

// --- Snow Effect Component ---
const SnowOverlay = () => {
    // Generate flakes with random properties
    const flakes = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: Math.random() * 8 + 4, // 4-12s - slower for a "custom" premium feel
        delay: Math.random() * 5,
        size: Math.random() * 4 + 2, // 2-6px - smaller, cleaner
        opacity: Math.random() * 0.4 + 0.1
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-[50] overflow-hidden font-sans">
            {flakes.map((flake) => (
                <div 
                    key={flake.id}
                    className="absolute bg-white rounded-full animate-snowfall"
                    style={{
                        left: `${flake.left}vw`,
                        animationDuration: `${flake.duration}s`,
                        animationDelay: `${flake.delay}s`,
                        width: `${flake.size}px`,
                        height: `${flake.size}px`,
                        opacity: flake.opacity,
                        top: '-20px'
                    }}
                />
            ))}
            <style>{`
                @keyframes snowfall {
                    0% { transform: translateY(-10vh) translateX(0); opacity: 0; }
                    20% { opacity: 0.5; }
                    100% { transform: translateY(110vh) translateX(50px); opacity: 0; }
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

// --- Product Hunt Popup Component ---
const ProductHuntPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const utmSource = params.get('utm_source');
    
    // Check if user came from Product Hunt via URL params or Referrer
    if (ref === 'producthunt' || utmSource === 'producthunt' || document.referrer.includes('producthunt.com')) {
      setIsOpen(true);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://infinite-study.vercel.app/");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl relative border border-zinc-800 text-center">
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>
            
            <div className="w-16 h-16 bg-[#FF6154]/20 text-[#FF6154] rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Welcome, Product Hunters! 😻</h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
                Thank you for discovering us! We're thrilled to have you here.
            </p>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6 flex items-center justify-between gap-3">
                <span className="text-zinc-400 text-sm truncate select-all">https://infinite-study.vercel.app/</span>
                <button 
                    onClick={handleCopy}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
                    title="Copy URL"
                >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
            </div>

            <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-white text-black rounded-xl font-bold hover:scale-[1.02] transition-transform mb-4"
            >
                Start Exploring
            </button>
            
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                Keep sharing & supporting! 🚀
            </p>
        </div>
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

// --- Settings Modal ---
interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showSnow: boolean;
    onToggleSnow: (val: boolean) => void;
}

const SettingsModal = ({ isOpen, onClose, showSnow, onToggleSnow }: SettingsModalProps) => {
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

    const requestNotifications = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                alert("Notifications enabled! You'll stay updated.");
            } else {
                alert("Permission denied or dismissed.");
            }
        } else {
            alert("Your browser does not support notifications.");
        }
    };
    
    // Feature 8: Payment Request API
    const handleProUpgrade = async () => {
        if (!('PaymentRequest' in window)) {
            alert("Payment Request API not supported on this device.");
            return;
        }
        
        const supportedInstruments = [{ supportedMethods: 'basic-card' }];
        const details = {
            total: { label: 'Infinite Study Pro', amount: { currency: 'USD', value: '4.99' } }
        };
        
        try {
            const request = new PaymentRequest(supportedInstruments, details);
            const paymentResponse = await request.show();
            // Simulate processing
            setTimeout(async () => {
                await paymentResponse.complete('success');
                alert("Welcome to Pro! (Simulation)");
            }, 1000);
        } catch (e) {
            console.log("Payment cancelled or failed", e);
        }
    };
    
    // Feature 10: Contact Picker API
    const handleShare = async () => {
        // @ts-ignore
        if ('contacts' in navigator && 'ContactsManager' in window) {
            try {
                const props = ['name', 'tel', 'email'];
                const opts = { multiple: false };
                // @ts-ignore
                const contacts = await navigator.contacts.select(props, opts);
                if (contacts.length) {
                    alert(`Sharing Infinite Study with ${contacts[0].name[0]}!`);
                }
            } catch (ex) {
                console.log(ex);
            }
        } else {
            alert("Contact Picker not supported on this device (try Android).");
        }
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
                        <Settings size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Settings</h2>
                </div>

                <div className="space-y-6">
                    {/* Visual Preferences */}
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Appearance</h3>
                        <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-zinc-800 mb-3">
                             <div className="flex items-center gap-3">
                                 <Snowflake size={20} className={showSnow ? 'text-blue-400' : 'text-zinc-600'} />
                                 <div>
                                     <p className="text-white font-medium text-sm">Snow Effect</p>
                                     <p className="text-xs text-zinc-500">Show falling snow particles</p>
                                 </div>
                             </div>
                             <button 
                                onClick={() => onToggleSnow(!showSnow)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${showSnow ? 'bg-blue-600' : 'bg-zinc-700'}`}
                             >
                                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showSnow ? 'left-7' : 'left-1'}`} />
                             </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-zinc-800 cursor-pointer hover:bg-zinc-950 mb-3" onClick={requestNotifications}>
                             <div className="flex items-center gap-3">
                                 <BellRing size={20} className="text-yellow-500" />
                                 <div>
                                     <p className="text-white font-medium text-sm">Notifications</p>
                                     <p className="text-xs text-zinc-500">Enable study reminders</p>
                                 </div>
                             </div>
                             <ChevronRight size={16} className="text-zinc-500" />
                        </div>
                        
                        {/* New Feature Buttons */}
                        <div className="flex gap-2">
                             <button onClick={handleProUpgrade} className="flex-1 p-3 bg-gradient-to-r from-purple-900 to-purple-800 rounded-xl border border-purple-700 flex items-center justify-center gap-2 text-xs font-bold text-white hover:opacity-90">
                                 <CreditCard size={14} /> Upgrade Pro
                             </button>
                             <button onClick={handleShare} className="flex-1 p-3 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center gap-2 text-xs font-bold text-zinc-300 hover:text-white">
                                 <UserPlus size={14} /> Share
                             </button>
                        </div>
                    </div>

                    {/* API Settings */}
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">API Configuration</h3>
                        <div className="p-4 bg-black rounded-xl border border-zinc-800 space-y-3">
                            <p className="text-zinc-400 text-xs leading-relaxed">
                                Enter your Google Gemini API key to enable AI features. Stored locally.
                            </p>
                            <input 
                                type="password" 
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder="sk-..."
                                className="w-full p-3 bg-zinc-900 rounded-lg border border-zinc-800 focus:outline-none focus:border-white/30 font-mono text-xs text-white placeholder-zinc-700"
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleSave}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                        <Save size={18} /> Save Changes
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
    <>
      {/* Feature 5: Window Controls Overlay Region */}
      <div className="titlebar-area hidden md:block" />
      
      <nav className="hidden md:flex fixed top-0 left-0 w-full z-50 justify-center pt-6 pb-4 pointer-events-none">
        <div className={`
          px-6 py-2 rounded-full flex items-center gap-6 transition-colors duration-300 pointer-events-auto
          bg-transparent
          text-white
        `}>
          <div className="hidden md:flex items-center gap-2 mr-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src={LOGO_URL} alt="Logo" className="w-8 h-8 rounded-full" />
              <span className="font-bold text-sm tracking-tight text-white drop-shadow-md">Infinite Study AI</span>
          </div>
          <div className="w-px h-4 hidden md:block bg-white/20"></div>
          
          <button 
            onClick={() => navigate('/')} 
            className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-white drop-shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/library')} 
            className={`text-sm font-medium transition-colors ${isActive('/library') ? 'text-white drop-shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Library
          </button>
          <button 
            onClick={() => navigate('/chat')} 
            className={`text-sm font-medium transition-colors ${isActive('/chat') ? 'text-white drop-shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Chat
          </button>

          <div className="w-px h-4 bg-white/20"></div>

          <button 
            onClick={onOpenSettings}
            className="text-sm font-medium transition-colors text-white/60 hover:text-white flex items-center gap-2"
            title="Settings"
          >
            <Settings size={18} />
          </button>
          
          <div className="w-px h-4 bg-white/20"></div>

          <button 
            onClick={() => navigate('/workspace')} 
            className="text-sm font-medium px-3 py-1 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg"
          >
             <Layout size={14} /> Workspace
          </button>
        </div>
      </nav>
    </>
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

// --- Audio Lesson Detail Page ---
const AudioLessonPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState<any>(null);

    useEffect(() => {
        if(!id) return;
        const materials = getMaterials();
        const found = materials.find(m => m.id === id);
        if (found && found.type === 'audio-lesson' && found.audioLessonData) {
            setLesson(found.audioLessonData);
        } else {
            navigate('/library');
        }
    }, [id, navigate]);

    if (!lesson) return null;

    return (
        <AudioLessonPlayer 
            lesson={lesson} 
            onComplete={() => {
                // Mark complete logic could go here
                alert("Lesson Marked Complete!");
                navigate('/library');
            }}
            onBack={() => navigate('/library')}
        />
    );
};

// --- Configure Page ---
const ConfigurePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState(location.state?.title || "New Study Set");
  
  // State for selections
  const [options, setOptions] = useState({
      summary: true,
      flashcards: true,
      quiz: true,
      map: true,
      terms: true,
      locations: true
  });
  
  if (!location.state) return <Navigate to="/" />;

  const toggleOption = (key: keyof typeof options) => {
      setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStart = () => {
      navigate('/generating', {
          state: { ...location.state, title, options }
      });
  };

  const OptionCard = ({ label, icon: Icon, id }: { label: string, icon: any, id: keyof typeof options }) => (
      <button 
          onClick={() => toggleOption(id)}
          className={`
              relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 h-32
              ${options[id] 
                  ? 'bg-white text-black border-white shadow-xl shadow-white/10 scale-105 z-10' 
                  : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:scale-[1.02]'
              }
          `}
      >
          {options[id] && (
              <div className="absolute top-3 right-3 text-black">
                  <CheckCircle2 size={18} className="fill-green-400 text-black" />
              </div>
          )}
          <Icon size={28} strokeWidth={1.5} />
          <span className="font-bold text-xs uppercase tracking-wide">{label}</span>
      </button>
  );

  return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative">
          {/* Background blobs for "floating" feel */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="w-full max-w-2xl bg-zinc-950/80 backdrop-blur-xl rounded-[2rem] p-8 border border-zinc-800 shadow-2xl relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Configure Kit</h2>
                <p className="text-zinc-500">Customize what AI generates for you</p>
              </div>
              
              <div className="space-y-8">
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block ml-1">Study Set Title</label>
                      <input 
                          type="text" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 focus:bg-zinc-900 transition-all text-center font-medium placeholder-zinc-700"
                          placeholder="e.g. Introduction to Biology"
                      />
                  </div>

                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 block ml-1 text-center">Select Modules</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <OptionCard id="summary" label="Summary" icon={FileText} />
                          <OptionCard id="flashcards" label="Flashcards" icon={Layers} />
                          <OptionCard id="quiz" label="Quiz" icon={Brain} />
                          <OptionCard id="map" label="Concept Map" icon={Network} />
                          <OptionCard id="terms" label="Key Terms" icon={BookA} />
                          <OptionCard id="locations" label="Locations" icon={MapPin} />
                      </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                        onClick={() => navigate('/')} 
                        className="px-6 py-4 rounded-xl text-zinc-500 font-bold hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleStart}
                        className="flex-1 py-4 bg-white text-black rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/20"
                    >
                        <Sparkles size={20} className="text-amber-500" /> Generate
                    </button>
                  </div>
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
            const { content, title, context, images, selectedSubject, options, type } = location.state;
            
            // Handle Audio Lesson Generation
            if (type === 'audio-lesson') {
                try {
                    setStatus("Writing Lesson Script...");
                    const lessonData = await generateAudioLessonContent(content, context, images);
                    
                    if (!lessonData) throw new Error("Failed to generate audio lesson");
                    
                    setStatus("Finalizing Lesson...");

                    const newMaterial: StudyMaterial = {
                        id: lessonData.id,
                        title: title || "Audio Lesson",
                        content: "Audio Lesson content.",
                        context: context,
                        images: images,
                        createdAt: Date.now(),
                        type: 'audio-lesson',
                        subject: selectedSubject,
                        audioLessonData: lessonData
                    };

                    saveMaterial(newMaterial);
                    navigate(`/audio-lesson/${lessonData.id}`);

                } catch (e) {
                    console.error(e);
                    alert("Audio Lesson Generation Failed.");
                    navigate('/');
                }
                return;
            }

            // Default Study Kit Generation
            const opts = options || { summary: true, flashcards: true, quiz: true, map: true, terms: true, locations: true };

            try {
                // Parallel generation for speed
                setStatus("Reading and understanding content...");
                
                // Conditionally create promises
                const summaryPromise = opts.summary ? generateSummary(content, context, images) : Promise.resolve("");
                const overviewPromise = opts.summary ? generateShortOverview(content, context, images) : Promise.resolve("");
                const cardsPromise = opts.flashcards ? generateFlashcards(content, context, images) : Promise.resolve([]);
                const quizPromise = opts.quiz ? generateQuiz(content, context, images) : Promise.resolve([]);
                const mapPromise = opts.map ? generateConceptMap(content, context, images) : Promise.resolve(null);
                const locPromise = opts.locations ? generateLocationData(content, context, images) : Promise.resolve([]);
                const termsPromise = opts.terms ? generateKeyTerms(content, context, images) : Promise.resolve([]);
                
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
                
                if (opts.flashcards) saveFlashcards(newMaterial.id, cards);
                if (opts.quiz) localStorage.setItem(`sb_quiz_${newMaterial.id}`, JSON.stringify(quiz));
                if (opts.map && map) saveConceptMap(newMaterial.id, map);
                if (opts.locations) saveLocations(newMaterial.id, locations);
                if (opts.terms) saveKeyTerms(newMaterial.id, terms);
                if (opts.summary) saveOverview(newMaterial.id, overview);

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
                            const isAudio = m.type === 'audio-lesson';
                            return (
                                <div 
                                    key={m.id}
                                    onClick={() => navigate(isAudio ? `/audio-lesson/${m.id}` : `/study/${m.id}`)}
                                    className="group relative bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all cursor-pointer shadow-lg"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl border border-zinc-800 group-hover:scale-110 transition-transform ${isAudio ? 'bg-purple-900/30' : 'bg-zinc-950'}`}>
                                            {isAudio ? <Headphones size={24} className="text-purple-400" /> : <BookOpen size={24} className="text-white" />}
                                        </div>
                                        <button 
                                            onClick={(e) => handleDelete(e, m.id)}
                                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-900/20 rounded-full transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold mb-2 line-clamp-1 text-white group-hover:text-blue-200 transition-colors">{m.title}</h3>
                                    <p className="text-zinc-500 text-sm mb-4 line-clamp-2">
                                        {isAudio ? "Interactive Audio Lesson with Quizzes" : (getOverview(m.id) || "No overview available.")}
                                    </p>
                                    
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [locations, setLocations] = useState<StudyLocation[]>([]);
    const [terms, setTerms] = useState<string[]>([]);
    const [conceptMap, setConceptMap] = useState<ConceptMapNode | null>(null);
    const [overview, setOverview] = useState("");
    const wakeLockRef = useRef<any>(null);
    
    // Feature 9: Web Speech API (TTS) - Play/Pause State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Feature 3: Screen Wake Lock
    useEffect(() => {
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator) {
                try {
                    // @ts-ignore
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                    console.log('Wake Lock active');
                } catch (err) {
                    console.log('Wake Lock failed', err);
                }
            }
        };
        requestWakeLock();
        
        return () => {
            if (wakeLockRef.current) wakeLockRef.current.release();
            window.speechSynthesis.cancel(); // Stop any speech when leaving
        };
    }, []);

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
    
    // Feature 9: Web Speech API (TTS) - Toggle Logic
    const toggleSpeech = () => {
        if (!material?.content) return;
        const synth = window.speechSynthesis;

        if (isSpeaking && !isPaused) {
            synth.pause();
            setIsPaused(true);
        } else if (isPaused) {
            synth.resume();
            setIsPaused(false);
        } else {
            synth.cancel();
            // Strip HTML tags for speech
            const text = material.content.replace(/<[^>]*>/g, '');
            const utterance = new SpeechSynthesisUtterance(text);
            
            utterance.onend = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };
            
            utterance.onerror = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            }

            synth.speak(utterance);
            setIsSpeaking(true);
            setIsPaused(false);
        }
    };

    if (!material) return null;

    // Define Views for Carousel
    // Always include Overview/Dashboard
    const slides = [
        {
            id: 'dashboard',
            label: 'Overview',
            icon: Layout,
            component: (
                <div className="h-full overflow-y-auto p-6 md:p-12 scrollbar-hide">
                    <div className="max-w-4xl mx-auto space-y-12 pb-20">
                        {/* Overview Hero - Clean Design */}
                        <div className="p-8 md:p-10 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                                    <h3 className="text-zinc-400 uppercase tracking-widest text-xs font-bold">Quick Summary</h3>
                                </div>
                                <p className="text-xl md:text-2xl font-medium leading-relaxed text-white">
                                    {overview || "No overview available."}
                                </p>
                            </div>
                        </div>

                        {/* Summary Content - Enhanced Formatting */}
                        {material.content ? (
                            <div className="relative">
                                <button 
                                    onClick={toggleSpeech}
                                    className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white flex items-center gap-2 text-sm"
                                >
                                    {isSpeaking && !isPaused ? <Pause size={16} /> : <Volume2 size={16} />} 
                                    {isSpeaking && !isPaused ? "Pause Reading" : (isPaused ? "Resume Reading" : "Read Aloud")}
                                </button>
                                <div className="prose prose-invert prose-lg max-w-none 
                                    prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight
                                    prose-h1:text-4xl prose-h1:mb-6
                                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-zinc-800 prose-h2:pb-2
                                    prose-h3:text-xl prose-h3:text-blue-200 prose-h3:mt-8
                                    prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-6
                                    prose-strong:text-white prose-strong:font-extrabold
                                    prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
                                    prose-li:text-zinc-300 prose-li:marker:text-blue-500
                                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-400
                                " 
                                     dangerouslySetInnerHTML={{ __html: material.content }} 
                                />
                            </div>
                        ) : (
                            <div className="text-center py-10 text-zinc-500">
                                No summary generated.
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    ];
    
    // Conditionally add other slides
    if (flashcards.length > 0) {
        slides.push({
            id: 'flashcards',
            label: 'Flashcards',
            icon: Layers,
            component: (
                <div className="h-full flex flex-col pb-20">
                    <FlashcardDeck cards={flashcards} onUpdateCard={(updated) => {
                         const newCards = flashcards.map(c => c.id === updated.id ? updated : c);
                         setFlashcards(newCards);
                         saveFlashcards(material.id, newCards);
                    }} />
                </div>
            )
        });
    }

    if (quizQuestions.length > 0) {
        slides.push({
            id: 'quiz',
            label: 'Quiz',
            icon: Brain,
            component: (
                <div className="h-full flex flex-col p-6 md:p-10 overflow-y-auto pb-20">
                    <QuizRunner 
                        questions={quizQuestions} 
                        materialId={material.id} 
                        onComplete={() => {
                            alert("Quiz recorded!");
                            setCurrentIndex(0); // Go back to dashboard
                        }} 
                    />
                </div>
            )
        });
    }

    if (locations.length > 0) {
        slides.push({
            id: 'map',
            label: 'Locations',
            icon: MapIcon,
            component: <MapSlide locations={locations} />
        });
    }

    if (terms.length > 0) {
        slides.push({
            id: 'terms',
            label: 'Dictionary',
            icon: BookA,
            component: (
                <div className="h-full p-6 pb-20">
                    <DictionarySlide terms={terms} />
                </div>
            )
        });
    }

    // Handle index bounds when slides change
    if (currentIndex >= slides.length) {
        setCurrentIndex(0);
    }

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="min-h-screen bg-black text-white pt-6 md:pt-24 pb-24 md:pb-12 px-4 md:px-8 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0 z-20 relative">
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
                
                {/* Slide Title for Mobile/Desktop */}
                {slides[currentIndex] && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">
                        {React.createElement(slides[currentIndex].icon, { size: 16, className: "text-zinc-400" })}
                        <span className="text-sm font-bold text-white">{slides[currentIndex].label}</span>
                    </div>
                )}
            </div>

            {/* Carousel Content Area */}
            <div className="flex-1 min-h-0 bg-zinc-950 rounded-3xl border border-zinc-900 overflow-hidden relative shadow-2xl group">
                
                {/* The Slide */}
                <div className="absolute inset-0">
                    {slides[currentIndex] ? slides[currentIndex].component : (
                        <div className="flex items-center justify-center h-full text-zinc-500">
                            No content available.
                        </div>
                    )}
                </div>

                {/* Navigation Arrows */}
                {slides.length > 1 && (
                    <>
                        <button 
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/40 text-white/50 hover:bg-black/80 hover:text-white transition-all backdrop-blur-sm border border-white/5 opacity-0 group-hover:opacity-100 z-30"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/40 text-white/50 hover:bg-black/80 hover:text-white transition-all backdrop-blur-sm border border-white/5 opacity-0 group-hover:opacity-100 z-30"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}

                {/* Bottom Indicators (Carousel Dots / Tabs) */}
                {slides.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 p-2 rounded-full bg-black/60 backdrop-blur-md border border-zinc-800">
                        {slides.map((slide, idx) => (
                            <button
                                key={slide.id}
                                onClick={() => setCurrentIndex(idx)}
                                className={`
                                    relative px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5
                                    ${idx === currentIndex 
                                        ? 'bg-white text-black shadow-lg pl-2 pr-3' 
                                        : 'text-zinc-400 hover:text-white hover:bg-white/10'}
                                `}
                            >
                                {idx === currentIndex && React.createElement(slide.icon, { size: 12 })}
                                {idx === currentIndex ? slide.label : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- FAQ Section ---
const FAQSection = () => {
    return (
      <div className="py-20 bg-black border-t border-zinc-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-white mb-10">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
               <h3 className="font-bold text-white mb-2">How does it work?</h3>
               <p className="text-zinc-400 text-sm">We use Google's Gemini AI to analyze your study material and generate summaries, quizzes, and flashcards instantly.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
               <h3 className="font-bold text-white mb-2">Is it free?</h3>
               <p className="text-zinc-400 text-sm">Yes, Infinite Study AI is currently free to use. You just need your own API key for high usage.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
               <h3 className="font-bold text-white mb-2">Can I upload images?</h3>
               <p className="text-zinc-400 text-sm">Absolutely! You can upload images of handwritten notes or diagrams, and we'll extract the information.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
               <h3 className="font-bold text-white mb-2">What is the Audio Lesson?</h3>
               <p className="text-zinc-400 text-sm">It converts your notes into an engaging podcast-style lesson with quizzes to test your listening.</p>
            </div>
          </div>
        </div>
      </div>
    );
};

// --- Landing Page ---
const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState('');
  const [selectedTool, setSelectedTool] = useState<'kit' | 'search' | 'note' | 'audio'>('kit');
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[1]); // Default to Flash v3
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  
  // Feature 4: Protocol Handlers
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (action) {
        if (action.startsWith('quiz/')) {
            const quizId = action.split('/')[1];
            navigate(`/study/${quizId}`);
        }
    }
  }, []);

  // Feature 2: File Handling API
  useEffect(() => {
    if ('launchQueue' in window && window.launchQueue) {
        window.launchQueue.setConsumer(async (launchParams: any) => {
            if (!launchParams.files.length) return;
            for (const handle of launchParams.files) {
                const file = await handle.getFile();
                const text = await file.text();
                setPrompt(text);
            }
        });
    }
  }, []);
  
  // Handle Share Target Params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedTitle = params.get('title');
    const sharedText = params.get('text');
    const sharedUrl = params.get('url');

    if (sharedTitle || sharedText || sharedUrl) {
      const content = [sharedTitle, sharedText, sharedUrl].filter(Boolean).join('\n\n');
      if (content) {
        setPrompt(content);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);
  
  // Context & Uploads
  const [contextText, setContextText] = useState<string>('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  // Refs for file inputs
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
    } else if (selectedTool === 'audio') {
        navigate('/generating', {
            state: {
                content: prompt,
                title: "New Audio Lesson",
                context: contextText,
                images: attachedImages,
                selectedSubject,
                type: 'audio-lesson'
            }
        });
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
  
  // Feature 9: Web Speech API (STT)
  const handleVoiceInput = () => {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.start();
          recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              setPrompt(prev => prev ? prev + ' ' + transcript : transcript);
          };
      } else {
          alert("Speech recognition not supported in this browser.");
      }
  };
  
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
      note: "Note Taker",
      audio: "Audio Lesson"
  };

  return (
    <div className="w-full bg-black">
      {/* Product Hunt Badge - Centered Bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
           <a href="https://www.producthunt.com/products/infinite-study-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-infinite-study-ai" target="_blank" rel="noopener noreferrer">
               <img alt="Infinite Study AI -  Turn notes into summaries, quizzes & flashcards instantly  | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1055227&theme=dark&t=1766893408138" />
           </a>
      </div>

      {/* Hero Section */}
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-2xl w-full text-center z-10 space-y-8 relative">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">
           What do you want to learn?
        </h1>

        <div 
          className={`
            relative bg-zinc-900 rounded-[2rem] border border-zinc-800 shadow-xl transition-all duration-300
            hover:border-zinc-700 hover:shadow-2xl hover:shadow-zinc-900/50
            flex flex-col min-h-[160px] text-left
          `}
        >
          {/* Main Input Area */}
          <div className="flex-1 relative">
            <div 
                ref={backdropRef}
                className="absolute inset-0 p-6 text-lg text-white whitespace-pre-wrap break-words font-sans bg-transparent pointer-events-none z-0 overflow-hidden"
                style={{ lineHeight: '1.625' }}
            >
                {highlightLinks(prompt)}
                {prompt.endsWith('\n') && <br />}
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onScroll={handleScroll}
              placeholder={selectedTool === 'search' ? "What do you want to research?" : "Ask anything or paste a URL..."}
              className="relative z-10 w-full h-full bg-transparent border-none outline-none text-lg text-transparent caret-white placeholder-zinc-500 resize-none font-sans p-6 pr-32"
              style={{ minHeight: '120px', lineHeight: '1.625' }}
              spellCheck={false}
            />
          </div>
          
           {/* Context Chips */}
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
                            <StudyKitIcon /> Study Kit
                        </button>
                        <button 
                            onClick={() => { setSelectedTool('audio'); setIsToolMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-zinc-700 flex items-center gap-2 text-sm font-medium text-zinc-200"
                        >
                            <AudioLessonIcon /> Audio Lesson
                        </button>
                        <button 
                            onClick={() => { setSelectedTool('search'); setIsToolMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-zinc-700 flex items-center gap-2 text-sm font-medium text-zinc-200"
                        >
                            <SearchSparkIcon /> Search
                        </button>
                        <button 
                            onClick={() => { setSelectedTool('note'); setIsToolMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-zinc-700 flex items-center gap-2 text-sm font-medium text-zinc-200"
                        >
                            <NoteTakerIcon /> Note Taker
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
            <div className="flex items-center gap-2">
               
               {/* Model Selector */}
               <div className="relative">
                    <button 
                        onClick={() => setModelMenuOpen(!modelMenuOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all group"
                    >
                        <div className="w-4 h-4 rounded-full overflow-hidden opacity-70 group-hover:opacity-100">
                           <GeminiIcon />
                        </div>
                        <span>{selectedModel.name}</span>
                        <ChevronDown size={12} className={`text-zinc-500 transition-transform ${modelMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {modelMenuOpen && (
                        <div className="absolute bottom-full right-0 mb-2 w-56 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-visible p-1 flex flex-col gap-1 z-50">
                            
                            {/* Auto Scan Toggle Header */}
                            <div 
                                onClick={() => setAutoScan(!autoScan)}
                                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-zinc-800 rounded-xl mb-1 border-b border-zinc-800"
                            >
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                                    <AutoSelectIcon /> Auto-select
                                </div>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${autoScan ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoScan ? 'left-4.5' : 'left-0.5'}`} style={{ left: autoScan ? '18px' : '2px' }} />
                                </div>
                            </div>

                            {MODELS.map(model => (
                                <div key={model.id} className="relative group">
                                    <button
                                        onClick={() => { setSelectedModel(model); setModelMenuOpen(false); }}
                                        className={`
                                            w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all
                                            ${selectedModel.id === model.id ? 'bg-white text-black' : 'text-zinc-300 hover:bg-zinc-800'}
                                        `}
                                    >
                                        <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                                            <GeminiIcon />
                                        </div>
                                        {model.name}
                                        {selectedModel.id === model.id && <Check size={12} className="ml-auto" />}
                                    </button>
                                    {/* Info Card on Hover */}
                                    <div className="absolute right-full bottom-0 mr-2 w-64 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-xl z-[60] text-left animate-fade-in hidden group-hover:block pointer-events-none">
                                        <ModelInfoCard model={model} className="relative" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

               <button 
                 onClick={handleVoiceInput}
                 className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
               >
                  <Mic size={20} strokeWidth={2} />
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
             <img src={LOGO_URL} className="w-6 h-6 rounded-full grayscale opacity-50" alt="Logo" />
             <span className="font-bold text-zinc-200">Infinite Study AI</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Infinite Study AI. Built with Google Gemini.</p>
      </footer>
    </div>
  );
};

const App = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSnow, setShowSnow] = useState(true);

  // Load Settings on Mount
  useEffect(() => {
    const settings = getAppSettings();
    setShowSnow(settings.showSnow);
    // Sync widget data on mount
    syncWidgetData();
    // Register Periodic Sync
    registerPeriodicSync();
  }, []);

  const handleToggleSnow = (enabled: boolean) => {
    setShowSnow(enabled);
    saveAppSettings({ showSnow: enabled });
  };

  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
        <ProductHuntPopup />
        {showSnow && <SnowOverlay />}
        
        <Routes>
           <Route path="/workspace" element={<Workspace onOpenSettings={() => setIsSettingsOpen(true)} />} />
           
           <Route path="*" element={
              <>
                 <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />
                 <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/study/:id" element={<StudyDetail />} />
                    <Route path="/audio-lesson/:id" element={<AudioLessonPage />} />
                    <Route path="/configure" element={<ConfigurePage />} />
                    <Route path="/generating" element={<LoadingScreen />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/notes" element={<NoteTakerPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                 </Routes>
                 <MobileNavbar onOpenSettings={() => setIsSettingsOpen(true)} />
              </>
           } />
        </Routes>

        <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            showSnow={showSnow}
            onToggleSnow={handleToggleSnow}
        />
      </div>
    </Router>
  );
};

export default App;
