
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getNudgeMessage = async (tasks: string[], productivityHours: { start: string; end: string }, isIdle: boolean) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is currently in their productivity hours (${productivityHours.start} - ${productivityHours.end}). 
      Pending tasks: ${tasks.join(', ') || 'Nothing listed yet'}.
      Status: ${isIdle ? 'User is IDLE (not using timer, no recent tasks done)' : 'User is active but needs a push'}.
      
      Act as "De-Mager", the ultimate Anti-Mager (Anti-Lazy) assistant. Your personality is "cerewet" (nagging), high-energy, and funny in Indonesian. 
      Combat "mager" (laziness) at all costs!
      
      If idle: Strongly nudge them to stop being mager. Remind them their future self is watching.
      If not idle: Keep them fired up.
      
      Limit to 2-3 sentences. Use emojis like 🔥, 🚀, 💪, 😤.`,
      config: {
        temperature: 1.0,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Woi! Jangan mager terus! Ini jam produktif kamu. Ayo gerak sekarang sebelum disalip orang lain! 🔥";
  }
};

export const getHealthConsultantResponse = async (query: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[]) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are a "Health & Productivity Consultant" for teens aged 12-15. 
        Your goal is to combat sedentary lifestyle (too much sitting/screen time).
        Provide supportive, informative, and easy-to-understand advice in Indonesian.
        Topics: posture, eye strain, micro-breaks, staying active during study, 5-minute workouts.
        Keep answers punchy and engaging for a teenage audience.`,
        temperature: 0.7,
      },
      history: history,
    });

    const response = await chat.sendMessage({ message: query });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf ya, aku lagi agak lemot nih. Tapi intinya: jangan lupa gerak setiap 30 menit! 💪";
  }
};
