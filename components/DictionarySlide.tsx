
import React, { useState, useEffect } from 'react';
import { Search, Volume2, BookA, Loader2 } from 'lucide-react';

interface Props {
  terms: string[];
}

interface Definition {
  word: string;
  phonetic: string;
  audio?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

const DictionarySlide: React.FC<Props> = ({ terms }) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(terms[0] || null);
  const [definition, setDefinition] = useState<Definition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Combine props terms with search if user searches for something else
  const filteredTerms = terms.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

  const fetchDefinition = async (word: string) => {
    setLoading(true);
    setError(false);
    setDefinition(null);
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      const entry = data[0];
      
      // Extract audio if exists
      const audioObj = entry.phonetics.find((p: any) => p.audio && p.audio.length > 0);

      setDefinition({
        word: entry.word,
        phonetic: entry.phonetic || entry.phonetics[0]?.text || "",
        audio: audioObj?.audio || undefined,
        meanings: entry.meanings
      });
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWord) {
      fetchDefinition(selectedWord);
    }
  }, [selectedWord]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
       setSelectedWord(searchTerm);
    }
  };

  const playAudio = () => {
    if (definition?.audio) {
      const audio = new Audio(definition.audio);
      audio.play();
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-zinc-900 overflow-hidden rounded-3xl border border-zinc-800 shadow-sm">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 bg-zinc-950 border-r border-zinc-800 flex flex-col">
         <div className="p-4 border-b border-zinc-800">
             <form onSubmit={handleSearch} className="relative">
                 <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search dictionary..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all bg-black text-white placeholder-zinc-600"
                 />
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
             </form>
         </div>
         
         <div className="flex-1 overflow-y-auto no-scrollbar p-2">
            <h4 className="px-4 py-2 text-xs font-bold text-zinc-600 uppercase tracking-widest">Key Terms</h4>
            {filteredTerms.map(term => (
                <button
                    key={term}
                    onClick={() => setSelectedWord(term)}
                    className={`
                        w-full text-left px-4 py-3 rounded-xl mb-1 transition-all flex items-center justify-between group
                        ${selectedWord === term ? 'bg-white text-black shadow-lg' : 'hover:bg-zinc-800 text-zinc-400'}
                    `}
                >
                    <span className="font-medium capitalize">{term}</span>
                    {selectedWord === term && <BookA size={16} className="text-black/50" />}
                </button>
            ))}
            {filteredTerms.length === 0 && searchTerm && (
                <button
                    onClick={() => setSelectedWord(searchTerm)}
                    className="w-full text-left px-4 py-3 rounded-xl mb-1 hover:bg-zinc-800 text-blue-400 font-medium"
                >
                    Look up "{searchTerm}"
                </button>
            )}
         </div>
      </div>

      {/* Definition Area */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar flex flex-col">
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
                 <Loader2 className="animate-spin" size={40} />
                 <p>Fetching definition...</p>
             </div>
          ) : error ? (
             <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
                 <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                    <BookA size={32} />
                 </div>
                 <p className="text-lg">Definition not found for "{selectedWord}".</p>
                 <p className="text-sm">Try checking the spelling or search for another term.</p>
             </div>
          ) : definition ? (
             <div className="animate-fade-in max-w-2xl mx-auto w-full">
                 <div className="flex items-start justify-between mb-8">
                     <div>
                         <h2 className="text-5xl md:text-6xl font-bold text-white mb-2 capitalize tracking-tight">{definition.word}</h2>
                         <p className="text-2xl text-zinc-500 font-serif italic">{definition.phonetic}</p>
                     </div>
                     {definition.audio && (
                         <button 
                            onClick={playAudio}
                            className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-lg"
                         >
                             <Volume2 size={24} />
                         </button>
                     )}
                 </div>

                 <div className="space-y-8">
                     {definition.meanings.map((meaning, idx) => (
                         <div key={idx} className="border-b border-zinc-800 pb-6 last:border-0">
                             <div className="flex items-center gap-3 mb-4">
                                 <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-bold font-mono uppercase">
                                     {meaning.partOfSpeech}
                                 </span>
                                 <div className="h-px bg-zinc-800 flex-1"></div>
                             </div>
                             <ul className="space-y-4">
                                 {meaning.definitions.slice(0, 3).map((def, dIdx) => (
                                     <li key={dIdx} className="text-lg text-zinc-300 leading-relaxed pl-4 border-l-2 border-white/10">
                                         {def.definition}
                                         {def.example && (
                                             <p className="mt-2 text-zinc-500 italic text-base">"{def.example}"</p>
                                         )}
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     ))}
                 </div>
             </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-zinc-600">
                 Select a word to view its definition
             </div>
          )}
      </div>
    </div>
  );
};

export default DictionarySlide;
