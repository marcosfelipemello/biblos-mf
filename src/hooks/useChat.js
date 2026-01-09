import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";

// WARNING: In a real production app, you should proxy this through a backend
// to avoid exposing the key, but for this client-side demo/MVP it works.
const API_KEY = "AIzaSyD8m8U6OuOSIPLgoPqgttYwQEQJY9OCaB4";

const genAI = new GoogleGenerativeAI(API_KEY);

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (userMessage) => {
    setLoading(true);
    setError(null);

    // Add user message immediately
    const newMessages = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const chat = model.startChat({
        history: newMessages.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        })),
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      // Context prompt to ensure it behaves as "Discípulo Biblos"
      const systemContext = `
        Você é o "Discípulo Biblos", um assistente especialista na Bíblia Sagrada.
        Responda perguntas sobre personagens, versículos, e história bíblica.
        Seja educado, sábio e use referências bíblicas quando possível.
        Se a pergunta não for sobre a Bíblia ou fé, diga gentilmente que só pode falar sobre esses temas.
        Mantenha respostas concisas e fáceis de ler.
      `;

      // We send the message combined with context instructions if it's the first message,
      // or just the message. But standard chat history handles context better if we treat it as Persona.
      // For simplicity in Gemini SDK, we can prepend context to the first message or rely on history.
      // Let's just send the message, but rely on a "system prompt" logic if supported or implicit via history?
      // Gemini 1.5 Flash supports system instructions in getGenerativeModel, let's update that.
    } catch (e) {
      console.error(e);
      setError("Erro ao conectar com o Discípulo Biblos.");
    } finally {
      setLoading(false);
    }
  };

  // Re-writing the hook to be more robust with the system instruction
  const sendMessageWithContext = async (userMessage) => {
    setLoading(true);
    setError(null);

    const updatedHistory = [...messages, { role: "user", text: userMessage }];
    setMessages(updatedHistory);

    try {
      // Using gemini-2.5-flash as requested and verified.
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction:
          "Você é o 'Discípulo Biblos', um assistente IA especialista na Bíblia Sagrada. Seu objetivo é ajudar usuários a entenderem as escrituras, história bíblica, personagens e teologia. Responda com sabedoria, gentileza e precisão. Use emojis ocasionalmente. Se perguntarem algo fora do contexto bíblico/espiritual, explique educadamente que seu foco é a Bíblia.",
      });

      const result = await model.generateContent({
        contents: updatedHistory.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        })),
      });

      const responseText = result.response.text();

      setMessages((prev) => [...prev, { role: "model", text: responseText }]);
    } catch (err) {
      console.error("Chat Error:", err);
      // Better error message
      setError(`Erro: ${err.message || "Falha na conexão com o Discípulo."}`);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    sendMessage: sendMessageWithContext,
    clearChat,
  };
}
