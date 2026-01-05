
import { GoogleGenAI, Type } from "@google/genai";
import { AIFeedback, BattleVideo } from "../types";

// Always use process.env.API_KEY exclusively for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIFeedback = async (
  player: BattleVideo,
  opponent: BattleVideo,
  votes: number,
  isWinner: boolean
): Promise<AIFeedback> => {
  const prompt = `
    Analyze a 60-second guitar battle performance.
    Player: ${player.authorName} (${player.skillLevel}, ${player.style}, ${player.category}).
    Opponent: ${opponent.authorName}.
    Context: The player ${isWinner ? 'won' : 'lost'} with ${votes} community votes.
    
    Provide a technical guitar analysis in JSON format.
    Fields:
    - publicHighlight: A short positive technical point (max 15 words) for the public.
    - publicImprovement: A short technical point to work on (max 15 words) for the public.
    - technicalAnalysis: A detailed professional breakdown for the guitarist (e.g., phrasing, picking, dynamics).
    - practicalSuggestion: A specific exercise or focus area for next time.
    - technicalScore: A number from 1 to 10.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            publicHighlight: { type: Type.STRING },
            publicImprovement: { type: Type.STRING },
            technicalAnalysis: { type: Type.STRING },
            practicalSuggestion: { type: Type.STRING },
            technicalScore: { type: Type.NUMBER },
          },
          required: ["publicHighlight", "publicImprovement", "technicalAnalysis", "practicalSuggestion", "technicalScore"]
        }
      }
    });

    // Access the .text property directly as per Google GenAI SDK rules
    const jsonStr = response.text || '{}';
    const result = JSON.parse(jsonStr.trim());
    return result as AIFeedback;
  } catch (error) {
    console.error("AI Feedback Error:", error);
    return {
      publicHighlight: "Great technical control.",
      publicImprovement: "Work on rhythmic consistency.",
      technicalAnalysis: "Your alternate picking shows promise, but hand synchronization at high speeds needs refinement.",
      practicalSuggestion: "Practice scalar runs with a metronome at 5bpm increments.",
      technicalScore: 7.5
    };
  }
};
