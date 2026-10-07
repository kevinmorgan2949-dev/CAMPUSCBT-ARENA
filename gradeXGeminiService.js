import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAkc3n8USamQikTOo8dwQOafEQwJXL6_Ek" });

/**
 * 1. CBT Arena & Practice Mode: Generate professional-grade customized questions
 */
export async function generateProCBTQuestions({ subject, topic, difficulty = "Professional", count = 5 }) {
  const prompt = `You are an expert professional examiner. Generate ${count} rigorous, high-quality, professional-grade multiple-choice CBT questions for the subject "${subject}", focused specifically on "${topic}". 
  Difficulty level: ${difficulty}. 
  Ensure each question has 4 distinct options, one unambiguous correct answer, and a detailed educational explanation.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Exactly 4 distinct options"
            },
            correctAnswer: { type: Type.STRING, description: "Must match one of the options text precisely" },
            explanation: { type: Type.STRING, description: "Detailed professional breakdown of the solution" }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text());
  } catch (err) {
    console.error("Failed to parse professional CBT questions:", err);
    throw new Error("Could not generate valid questions at the moment.");
  }
}

/**
 * 2. PDF Explainer: Analyze text extracted from a PDF and provide clear breakdowns
 */
export async function explainPDFContent(pdfTextChunk, userQuery = "Summarize and explain the core concepts of this material clearly.") {
  const prompt = `You are an expert academic tutor. Analyze the following document text and address the user's focus: "${userQuery}".
  
  Document Text:
  ${pdfTextChunk}

  Provide a structured, easy-to-read explanation with key takeaways, definitions of important terms, and practical insights.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text();
}
