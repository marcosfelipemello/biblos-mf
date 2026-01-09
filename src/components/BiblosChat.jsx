import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";
import { useChat } from "../hooks/useChat";
import Logo from "./Logo";

export default function BiblosChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, loading, error, sendMessage, clearChat } = useChat();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    sendMessage(inputText);
    setInputText("");
  };

  return (
    <>
      {/* FLOAT BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-50 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-slate-800 transition-all duration-300 animate-bounce-slow group"
        >
          <MessageCircle
            size={28}
            className="group-hover:text-amber-400 transition-colors"
          />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </button>
      )}

      {/* CHAT INTERFACE */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
          {/* Backdrop for mobile focus */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />

          <div className="bg-white pointer-events-auto w-full h-[85vh] sm:h-[600px] sm:w-[400px] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up sm:m-4 relative">
            {/* HEADER */}
            <div className="bg-slate-900 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-full">
                  <Logo size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold font-serif text-lg leading-tight">
                    Discípulo Biblos
                  </h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-500" /> IA
                    Especialista
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  className="text-slate-400 hover:text-red-400 transition-colors p-2"
                  title="Limpar Conversa"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 p-6">
                  <Logo size={60} className="mb-4 grayscale opacity-30" />
                  <p className="text-slate-500 text-sm font-medium">
                    "Pergunte-me sobre a genealogia de Davi, parábolas de Jesus
                    ou história bíblica."
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-amber-500 text-white rounded-tr-none"
                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    {/* Simple markdown parsing for bold text only for now or just raw */}
                    {msg.text
                      .split("**")
                      .map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin text-amber-500"
                    />
                    <span className="text-xs text-slate-400">
                      Escrevendo...
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl text-center border border-red-100">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <form
              onSubmit={handleSubmit}
              className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite sua pergunta..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="bg-amber-500 text-white p-3 rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 transition-colors shadow-md shadow-amber-500/20"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
