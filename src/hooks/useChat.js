import { useRef, useState } from "react";

const MAX_HISTORY = 20;
const MAX_MESSAGE_CHARS = 4000;

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sendingRef = useRef(false);
  const generationRef = useRef(0);

  const sendMessage = async (userMessage) => {
    const text = String(userMessage ?? "")
      .trim()
      .slice(0, MAX_MESSAGE_CHARS);
    if (!text || sendingRef.current) return;

    const generation = generationRef.current;
    sendingRef.current = true;
    setLoading(true);
    setError(null);

    const history = [...messages, { role: "user", text }].slice(-MAX_HISTORY);
    setMessages(history);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || "Falha na conexão.");

      if (generationRef.current === generation) {
        setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      }
    } catch (err) {
      console.error("Chat Error:", err);
      if (generationRef.current === generation) {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, failed: true } : m
          )
        );
        setError(`Erro: ${err.message}`);
      }
    } finally {
      if (generationRef.current === generation) setLoading(false);
      sendingRef.current = false;
    }
  };

  const clearChat = () => {
    generationRef.current += 1;
    sendingRef.current = false;
    setMessages([]);
    setError(null);
  };

  return { messages, loading, error, sendMessage, clearChat };
}
