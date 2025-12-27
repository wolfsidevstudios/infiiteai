
import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, QuizQuestion, ConceptMapNode, StudyLocation, SearchResult } from '../types';

let apiKey = process.env.API_KEY || localStorage.getItem('user_gemini_api_key') || '';
// Initialize with available key, handled gracefully if empty until set
let ai = new GoogleGenAI({ apiKey: apiKey || 'dummy' });

const MODEL_NAME = 'gemini-3-flash-preview';

export const setApiKey = (key: string) => {
    apiKey = key;
    localStorage.setItem('user_gemini_api_key', key);
    ai = new GoogleGenAI({ apiKey });
};

export const getApiKey = () => apiKey;

/**
 * Helper to construct the API payload with text, optional context, and optional images.
 */
const buildContents = (promptText: string, mainContent: string, context?: string, images?: string[]) => {
  const parts: any[] = [];
  
  // 1. Instructions & Main Content
  let fullText = `${promptText}\n\n=== INPUT ===\n${mainContent.substring(0, 30000)}`;

  // 2. Add Context if exists
  if (context) {
    fullText += `\n\n=== CONTEXT / RUBRIC / GRADING CRITERIA ===\n${context.substring(0, 10000)}`;
  }

  parts.push({ text: fullText });

  // 3. Add Images if exist
  if (images && images.length > 0) {
    images.forEach(base64 => {
      // Clean base64 string if it contains data URI prefix
      const cleanBase64 = base64.split(',')[1] || base64;
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Assuming PNG/JPEG, API is flexible usually
          data: cleanBase64
        }
      });
    });
  }

  return { parts };
};

export const generateSummary = async (text: string, context?: string, images?: string[]): Promise<string> => {
  const prompt = `
    You are an expert study assistant. 
    Create a comprehensive study guide/summary for the provided material.
    
    If the material contains URLs, use Google Search to find the relevant content and summarize it.
    
    CRITICAL: If a Rubric or Context is provided, ensure the summary highlights sections that are most important based on that rubric.
    
    Format:
    - Use HTML <h3> for headers.
    - Use <ul><li> for bullet points.
    - Use <mark> tags to highlight specific key terms, dates, or crucial definitions.
    - Use <strong> for emphasis.
    - Keep it structured and easy to read.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: buildContents(prompt, text, context, images),
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error (Summary):", error);
    return "Failed to generate summary. Please check your API key.";
  }
};

export const generateFlashcards = async (text: string, context?: string, images?: string[]): Promise<Flashcard[]> => {
  const prompt = `
    Generate 10 high-quality flashcards based on the provided material.
    If context/rubric is provided, prioritize questions that align with the grading criteria.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: buildContents(prompt, text, context, images),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "[]");
    return json.map((card: any, index: number) => ({
      id: `card-${Date.now()}-${index}`,
      front: card.front,
      back: card.back,
      status: 'new',
    }));
  } catch (error) {
    console.error("Gemini API Error (Cards):", error);
    return [];
  }
};

export const generateQuiz = async (text: string, context?: string, images?: string[]): Promise<QuizQuestion[]> => {
  const prompt = `
    Create a 10-minute quiz (approx 8 questions) based on the provided material.
    Prioritize topics emphasized in the Context/Rubric if present.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: buildContents(prompt, text, context, images),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                }
            }
        }
      }
    });

    const json = JSON.parse(response.text || "[]");
    return json.map((q: any, index: number) => ({
      id: `quiz-${Date.now()}-${index}`,
      ...q
    }));
  } catch (error) {
    console.error("Gemini API Error (Quiz):", error);
    return [];
  }
};

export const generateConceptMap = async (text: string, context?: string, images?: string[]): Promise<ConceptMapNode> => {
    const prompt = `
      Create a hierarchical concept map of the main topics.
      The structure should be: Root Topic -> Main Concepts -> Details/Sub-concepts.
      
      Return a single Root Node object.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: buildContents(prompt, text, context, images),
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                details: { type: Type.STRING },
                children: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            label: { type: Type.STRING },
                            details: { type: Type.STRING },
                            children: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        label: { type: Type.STRING },
                                        details: { type: Type.STRING },
                                        children: { 
                                            type: Type.ARRAY, 
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    id: { type: Type.STRING },
                                                    label: { type: Type.STRING },
                                                    details: { type: Type.STRING }
                                                }
                                            } 
                                        } 
                                    }
                                }
                            }
                        }
                    }
                }
            }
          }
        }
      });
  
      const json = JSON.parse(response.text || "{}");
      // Fallback if empty
      if (!json.label) return { id: 'root', label: 'Main Topic', children: [] };
      return json;

    } catch (error) {
      console.error("Gemini API Error (Map):", error);
      return { id: 'error', label: 'Could not generate map', children: [] };
    }
  };

export const generateLocationData = async (text: string, context?: string, images?: string[]): Promise<StudyLocation[]> => {
  const prompt = `
    Analyze the provided study material. Identify key geographical locations, historical sites, or scientific places mentioned.
    If no specific real-world locations are relevant, return an empty array.
    
    For each location, provide:
    1. Name
    2. A short tooltip description (1 sentence).
    3. Approximate Latitude and Longitude (decimal degrees).
    4. Category (historical, geographical, scientific, other).

    Limit to max 7 key locations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: buildContents(prompt, text, context, images),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              category: { type: Type.STRING, enum: ['historical', 'geographical', 'scientific', 'other'] }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "[]");
    return json.map((loc: any, index: number) => ({
      id: `loc-${Date.now()}-${index}`,
      ...loc
    }));
  } catch (error) {
    console.error("Gemini API Error (Locations):", error);
    return [];
  }
};

export const generateKeyTerms = async (text: string, context?: string, images?: string[]): Promise<string[]> => {
  const prompt = `
    Analyze the provided content and identify 12-15 difficult words, technical terms, or key concepts that a student would likely need to look up in a dictionary to fully understand the material.
    Focus on vocabulary specific to the subject matter.
    Return ONLY a JSON array of strings (e.g., ["mitochondria", "photosynthesis", "metaphor", "derivative"]).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: buildContents(prompt, text, context, images),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini API Error (Key Terms):", error);
    return [];
  }
};

export const generateShortOverview = async (text: string, context?: string, images?: string[]): Promise<string> => {
    const prompt = `
      You are a helpful study buddy.
      Create a very concise, engaging overview of this study material.
      It should be a single paragraph (max 4-5 sentences) that describes exactly what the user will learn or practice from these notes.
      Use a friendly, encouraging tone.
      Do not use markdown like bold or headers, just plain text.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: buildContents(prompt, text, context, images),
      });
  
      return response.text || "Ready to study! This set covers your uploaded material.";
    } catch (error) {
      console.error("Gemini API Error (Overview):", error);
      return "Your study set is ready!";
    }
};

export const performWebSearch = async (query: string): Promise<SearchResult> => {
    const prompt = `
        Search the web for the following query: "${query}".
        
        Provide a comprehensive answer. 
        Also, explicitly outline the steps you took to gather this information as a timeline of events (e.g., "Analyzed user query", "Searched for X", "Synthesized data").
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ text: prompt }],
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        // Parse sources from grounding chunks
        const sources: { title: string; uri: string }[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        chunks.forEach((chunk: any) => {
            if (chunk.web?.uri) {
                sources.push({
                    title: chunk.web.title || new URL(chunk.web.uri).hostname,
                    uri: chunk.web.uri
                });
            }
        });

        // We need to ask Gemini to format the text it just retrieved into the specific JSON structure we need for the UI.
        const rawText = response.text || "";
        
        const formatPrompt = `
            Based on the following text, extract a short summary (2-3 sentences max) and a timeline of how the answer was derived.
            
            Text: ${rawText.substring(0, 10000)}
            
            Return JSON:
            {
                "summary": "...",
                "timeline": ["Step 1...", "Step 2..."]
            }
            
            For the summary, surround key important words with <mark> tags.
        `;

        const formatResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ text: formatPrompt }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        timeline: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });

        const formatted = JSON.parse(formatResponse.text || "{}");

        return {
            summary: formatted.summary || "No summary available.",
            timeline: formatted.timeline || ["Analyzed Query", "Performed Search", "Synthesized Results"],
            sources: sources,
            fullContent: rawText
        };

    } catch (error) {
        console.error("Search Error", error);
        return {
            summary: "Search failed.",
            timeline: [],
            sources: [],
            fullContent: ""
        };
    }
};

export const generateStructuredNotes = async (topic: string, context?: string, images?: string[]): Promise<string> => {
    const prompt = `
        You are 'Note Taker v1', an advanced AI note-taking assistant.
        Create clear, beautiful, and structured notes on the topic: "${topic}".
        
        RULES FOR OUTPUT (HTML Format Only):
        - Do NOT use Markdown (no #, ##, **, etc.). Output raw HTML.
        - Use <h1> for the main title.
        - Use <h2> for main sections.
        - Use <h3> for subsections.
        - Use <b> or <strong> for bolding important concepts.
        - Use <ul> and <li> for lists.
        - COLORFUL HIGHLIGHTS:
            - Use <span style="background-color: #fef08a; padding: 0 4px; border-radius: 4px;">yellow highlight</span> for Definitions.
            - Use <span style="background-color: #bbf7d0; padding: 0 4px; border-radius: 4px;">green highlight</span> for Key Concepts or Dates.
            - Use <span style="background-color: #bfdbfe; padding: 0 4px; border-radius: 4px;">blue highlight</span> for Sources or References.
        - LINKS:
            - If you mention a website or source, format it as <a href="#" style="color: #2563eb; text-decoration: underline;">Link text</a>.
        
        Structure:
        1. Title
        2. Brief Introduction
        3. Detailed Sections (with highlights)
        4. Key Takeaways Box (use a <div> with border and padding).
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: buildContents(prompt, topic, context, images),
        });
        return response.text || "Could not generate notes.";
    } catch (error) {
        return "Note generation failed.";
    }
};
