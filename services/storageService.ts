
import { StudyMaterial, Flashcard, QuizResult, StudyPlan, UserStats, ConceptMapNode, Task, StudyLocation } from '../types';

const KEYS = {
  MATERIALS: 'sb_materials',
  FLASHCARDS: 'sb_flashcards',
  QUIZ_RESULTS: 'sb_quiz_results',
  STUDY_PLANS: 'sb_study_plans', 
  OVERVIEWS: 'sb_overviews',
  CONCEPT_MAPS: 'sb_concept_maps',
  LOCATIONS: 'sb_locations',
  STATS: 'sb_stats',
  TASKS: 'sb_tasks',
  KEY_TERMS: 'sb_key_terms',
  SETTINGS: 'sb_settings' // New key
};

// --- Helper to sync data to Service Worker for PWA Widgets ---
export const syncWidgetData = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const stats = getStats();
        navigator.serviceWorker.controller.postMessage({
            type: 'WIDGET_UPDATE',
            payload: { streak: stats.streakDays }
        });
    }
};

// --- BADGING & SYNC HELPERS ---

// Updates the app icon badge with the number of incomplete tasks
const updateAppBadge = () => {
    if ('setAppBadge' in navigator) {
        const tasks = getTasks();
        const incompleteCount = tasks.filter(t => !t.completed).length;
        if (incompleteCount > 0) {
            // @ts-ignore
            navigator.setAppBadge(incompleteCount).catch(e => console.error(e));
        } else {
            // @ts-ignore
            navigator.clearAppBadge().catch(e => console.error(e));
        }
    }
};

// Registers a background sync event
export const registerBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            // @ts-ignore
            await registration.sync.register('sync-study-data');
        } catch (err) {
            // Sync not supported or failed
            console.debug('Background sync registration failed or not supported');
        }
    }
};

// --- PERIODIC SYNC (Feature #6) ---
export const registerPeriodicSync = async () => {
    if ('serviceWorker' in navigator && 'periodicSync' in (await navigator.serviceWorker.ready)) {
        try {
            const registration = await navigator.serviceWorker.ready;
            // @ts-ignore
            await registration.periodicSync.register('daily-streak-check', {
                minInterval: 24 * 60 * 60 * 1000 // 1 day
            });
            console.log('Periodic sync registered');
        } catch (error) {
            console.log('Periodic sync could not be registered', error);
        }
    }
};

// --- CONTENT INDEXING API (Feature #7) ---
export const addToContentIndex = async (material: StudyMaterial) => {
    // @ts-ignore
    if ('serviceWorker' in navigator && 'index' in (await navigator.serviceWorker.ready)) {
        try {
            const registration = await navigator.serviceWorker.ready;
            // @ts-ignore
            await registration.index.add({
                id: material.id,
                title: material.title,
                description: `Study set for ${material.subject || 'general topics'}`,
                category: 'article',
                icons: [{ src: 'https://iili.io/fVhsBY7.png', sizes: '192x192', type: 'image/png' }],
                url: `./#/study/${material.id}`
            });
            console.log('Content indexed:', material.title);
        } catch (e) {
            console.debug('Content indexing failed', e);
        }
    }
};

export const saveMaterial = (material: StudyMaterial) => {
  const materials = getMaterials();
  materials.push(material);
  localStorage.setItem(KEYS.MATERIALS, JSON.stringify(materials));
  addToContentIndex(material); // Index content for Android system search
};

export const getMaterials = (): StudyMaterial[] => {
  const data = localStorage.getItem(KEYS.MATERIALS);
  return data ? JSON.parse(data) : [];
};

export const deleteMaterial = (id: string) => {
  const materials = getMaterials().filter(m => m.id !== id);
  localStorage.setItem(KEYS.MATERIALS, JSON.stringify(materials));
  
  // Remove from index
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
          // @ts-ignore
          if(reg.index) reg.index.delete(id);
      });
  }
};

export const saveFlashcards = (materialId: string, cards: Flashcard[]) => {
  const allCards = getAllFlashcards();
  const updated = { ...allCards, [materialId]: cards };
  localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(updated));
};

export const getFlashcards = (materialId: string): Flashcard[] => {
  const allCards = getAllFlashcards();
  return allCards[materialId] || [];
};

const getAllFlashcards = (): Record<string, Flashcard[]> => {
  const data = localStorage.getItem(KEYS.FLASHCARDS);
  return data ? JSON.parse(data) : {};
};

export const saveQuizResult = (result: QuizResult) => {
  const results = getQuizResults();
  results.push(result);
  localStorage.setItem(KEYS.QUIZ_RESULTS, JSON.stringify(results));
  updateStats('quiz', result.score);
};

export const getQuizResults = (): QuizResult[] => {
  const data = localStorage.getItem(KEYS.QUIZ_RESULTS);
  return data ? JSON.parse(data) : [];
};

export const saveOverview = (materialId: string, overview: string) => {
    const data = getAllOverviews();
    const updated = { ...data, [materialId]: overview };
    localStorage.setItem(KEYS.OVERVIEWS, JSON.stringify(updated));
}

export const getOverview = (materialId: string): string => {
    const data = getAllOverviews();
    return data[materialId] || "";
}

const getAllOverviews = (): Record<string, string> => {
    const data = localStorage.getItem(KEYS.OVERVIEWS);
    return data ? JSON.parse(data) : {};
}

export const saveConceptMap = (materialId: string, map: ConceptMapNode) => {
    const data = getAllConceptMaps();
    const updated = { ...data, [materialId]: map };
    localStorage.setItem(KEYS.CONCEPT_MAPS, JSON.stringify(updated));
}

export const getConceptMap = (materialId: string): ConceptMapNode | null => {
    const data = getAllConceptMaps();
    return data[materialId] || null;
}

const getAllConceptMaps = (): Record<string, ConceptMapNode> => {
    const data = localStorage.getItem(KEYS.CONCEPT_MAPS);
    return data ? JSON.parse(data) : {};
}

export const saveLocations = (materialId: string, locations: StudyLocation[]) => {
    const data = getAllLocations();
    const updated = { ...data, [materialId]: locations };
    localStorage.setItem(KEYS.LOCATIONS, JSON.stringify(updated));
}

export const getLocations = (materialId: string): StudyLocation[] => {
    const data = getAllLocations();
    return data[materialId] || [];
}

const getAllLocations = (): Record<string, StudyLocation[]> => {
    const data = localStorage.getItem(KEYS.LOCATIONS);
    return data ? JSON.parse(data) : {};
}

export const saveKeyTerms = (materialId: string, terms: string[]) => {
    const data = getAllKeyTerms();
    const updated = { ...data, [materialId]: terms };
    localStorage.setItem(KEYS.KEY_TERMS, JSON.stringify(updated));
}

export const getKeyTerms = (materialId: string): string[] => {
    const data = getAllKeyTerms();
    return data[materialId] || [];
}

const getAllKeyTerms = (): Record<string, string[]> => {
    const data = localStorage.getItem(KEYS.KEY_TERMS);
    return data ? JSON.parse(data) : {};
}

// Tasks Logic - Updated with Badge and Sync
export const saveTask = (task: Task) => {
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    updateAppBadge();
    registerBackgroundSync();
}

export const getTasks = (): Task[] => {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : [];
}

export const updateTask = (task: Task) => {
    const tasks = getTasks();
    const updated = tasks.map(t => t.id === task.id ? task : t);
    localStorage.setItem(KEYS.TASKS, JSON.stringify(updated));
    updateAppBadge();
    registerBackgroundSync();
}

export const deleteTask = (id: string) => {
    const tasks = getTasks().filter(t => t.id !== id);
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    updateAppBadge();
    registerBackgroundSync();
}


// Deprecated in UI but kept for storage integrity
export const saveStudyPlan = (plan: StudyPlan) => {
  const plans = getAllStudyPlans();
  const updated = { ...plans, [plan.materialId]: plan };
  localStorage.setItem(KEYS.STUDY_PLANS, JSON.stringify(updated));
};

export const getStudyPlan = (materialId: string): StudyPlan | null => {
  const plans = getAllStudyPlans();
  return plans[materialId] || null;
};

const getAllStudyPlans = (): Record<string, StudyPlan> => {
  const data = localStorage.getItem(KEYS.STUDY_PLANS);
  return data ? JSON.parse(data) : {};
};

export const getStats = (): UserStats => {
  const defaultStats: UserStats = {
    streakDays: 0,
    lastStudyDate: '',
    totalCardsLearned: 0,
    totalQuizzesTaken: 0,
    averageQuizScore: 0,
  };
  const data = localStorage.getItem(KEYS.STATS);
  return data ? JSON.parse(data) : defaultStats;
};

export const updateStats = (type: 'quiz' | 'card' | 'login', value?: number) => {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];

  if (type === 'login') {
    if (stats.lastStudyDate !== today) {
        const lastDate = new Date(stats.lastStudyDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (stats.lastStudyDate && lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
            stats.streakDays += 1;
        } else if (stats.lastStudyDate !== today) {
            stats.streakDays = 1; 
        }
        stats.lastStudyDate = today;
    }
  } else if (type === 'quiz' && typeof value === 'number') {
    const totalScore = (stats.averageQuizScore * stats.totalQuizzesTaken) + value;
    stats.totalQuizzesTaken += 1;
    stats.averageQuizScore = totalScore / stats.totalQuizzesTaken;
  } else if (type === 'card') {
    stats.totalCardsLearned += 1;
  }

  localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  syncWidgetData(); // Update widget whenever stats change
  return stats;
};

// --- Settings Logic ---
export interface AppSettings {
    showSnow: boolean;
}

export const getAppSettings = (): AppSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    // Default showSnow to true if not set
    return data ? JSON.parse(data) : { showSnow: true };
}

export const saveAppSettings = (settings: AppSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export const clearAllData = () => {
    localStorage.clear();
    // @ts-ignore
    if ('clearAppBadge' in navigator) navigator.clearAppBadge();
}
