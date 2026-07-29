import { useState } from "react";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (userMessage) => {
    setLoading(true);
    setError(null);

    const history = [...messages, { role: "user", text: userMessage }];
    setMessages(history);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || "Falha na conexão.");

      setMessages((prev) => [...prev, { role: "model", text: data.text }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setError(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return { messages, loading, error, sendMessage, clearChat };
}
