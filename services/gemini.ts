import { GoogleGenAI, Type, Schema, LiveConnectConfig } from "@google/genai";
import { WorkoutPlan, MealPlan } from '../types';

const MODEL_NAME = "gemini-2.5-flash";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateWorkout(
    goal: string,
    level: string,
    duration: string,
    equipment: string,
    targetMuscles?: string,
    excludedExercises?: string,
    trainingStyle?: string,
    preferences?: string
  ): Promise<WorkoutPlan> {
    const prompt = `Create a detailed workout plan for a ${level} level person who wants to achieve "${goal}". 
    The workout should be approximately ${duration} minutes long. 
    Available equipment: ${equipment}.
    ${targetMuscles ? `Focus specifically on these muscle groups: ${targetMuscles}.` : ''}
    ${excludedExercises ? `Do NOT include these exercises: ${excludedExercises}.` : ''}
    ${trainingStyle ? `Preferred training style: ${trainingStyle} (e.g., Standard sets, Circuit, Supersets).` : ''}
    ${preferences ? `Additional preferences: ${preferences}.` : ''}
    Focus on safety and effectiveness.`;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        routineName: { type: Type.STRING, description: "A catchy name for the workout" },
        targetMuscleGroup: { type: Type.STRING },
        difficulty: { type: Type.STRING },
        durationMinutes: { type: Type.INTEGER },
        exercises: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              sets: { type: Type.STRING, description: "e.g., '3' or '3-4'" },
              reps: { type: Type.STRING, description: "e.g., '10-12' or '30 secs'" },
              rest: { type: Type.STRING, description: "Rest time between sets" },
              instructions: { type: Type.STRING, description: "Brief form cue" },
            },
            required: ["name", "sets", "reps", "rest", "instructions"]
          }
        }
      },
      required: ["routineName", "exercises", "targetMuscleGroup", "difficulty", "durationMinutes"]
    };

    const response = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
        return JSON.parse(response.text) as WorkoutPlan;
    }
    throw new Error("Failed to generate workout plan");
  }

  async generateMealPlan(
    goal: string,
    dietaryRestrictions: string
  ): Promise<MealPlan> {
    const prompt = `Create a daily meal plan (Breakfast, Lunch, Dinner, Snack) for someone whose goal is "${goal}".
    Dietary restrictions: ${dietaryRestrictions || "None"}.
    Include approximate macros per meal.`;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        planName: { type: Type.STRING },
        meals: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "e.g. Breakfast: Oatmeal" },
              ingredients: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              instructions: { type: Type.STRING, description: "Short prep guide" },
              macros: {
                type: Type.OBJECT,
                properties: {
                  protein: { type: Type.STRING },
                  carbs: { type: Type.STRING },
                  fats: { type: Type.STRING },
                  calories: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    };

    const response = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
        return JSON.parse(response.text) as MealPlan;
    }
    throw new Error("Failed to generate meal plan");
  }

  getChatModel() {
      return this.ai.chats.create({
          model: MODEL_NAME,
          config: {
              systemInstruction: `You are Global Fitness AI.
Your personality is:
- Calm
- Structured
- Not robotic
- Concise (not overly long)

Your mission is to assist with fitness, nutrition, and daily planning decisions.
You are capable of analyzing workout logs (JSON data) to identify trends, overtraining risks, and consistency patterns.

When asked to "Plan my day simply", provide a structured daily schedule.
When asked to "Help me decide", analyze options objectively.
When asked "What should I do tonight?", provide healthy, restorative suggestions.
When asked to "Explain", use simple, clear terms.
When analyzing workout history, be specific about volume, intensity, and recovery advice.`,
          }
      });
  }

  async startLiveSession(callbacks: any, config: LiveConnectConfig) {
    return this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config
    });
  }

  async generateExerciseVideo(exerciseName: string, instructions: string): Promise<string> {
    // Ensure the user has selected a paid API key for Veo
    if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }

    // Re-initialize AI with the current key environment to ensure Veo access
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic, clear fitness demonstration of ${exerciseName}. ${instructions}. Professional lighting, gym background, 4k resolution, stable camera.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    if (operation.error) {
        const errorMessage = (operation.error as any).message || "Video generation failed";
        throw new Error(errorMessage as string);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI returned");

    // Fetch the video content using the key to get the raw bytes/blob
    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error("Failed to download generated video");
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}

export const geminiService = new GeminiService();