// Proxy do Discípulo Biblos. O token do Groq fica aqui no servidor e nunca
// chega ao navegador.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const MAX_BODY_BYTES = 8 * 1024;
const MAX_MESSAGES = 30;
const MAX_CHARS_PER_MESSAGE = 4000;
const GROQ_TIMEOUT_MS = 20000;
const RATE_WINDOW_MS = 60000;
const RATE_MAX_REQUESTS = 20;

const hits = new Map();

const clientIp = (event) => {
  const header =
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["x-forwarded-for"] ||
    "";
  return header.split(",")[0].trim() || "desconhecido";
};

const isRateLimited = (ip) => {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
};

const SYSTEM_PROMPT =
  "Você é o 'Discípulo Biblos', um assistente IA especialista na Bíblia Sagrada. " +
  "Seu objetivo é ajudar usuários a entenderem as escrituras, história bíblica, " +
  "personagens e teologia. Responda com sabedoria, gentileza e precisão. Use " +
  "emojis ocasionalmente. Se perguntarem algo fora do contexto bíblico/espiritual, " +
  "explique educadamente que seu foco é a Bíblia.";

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Método não permitido." });
  }

  if (!process.env.GROQ_API_KEY) {
    return json(500, {
      error: "GROQ_API_KEY não configurada no ambiente do Netlify.",
    });
  }

  const body = event.body || "";
  if (body.length > MAX_BODY_BYTES) {
    return json(413, { error: "Requisição grande demais." });
  }

  if (isRateLimited(clientIp(event))) {
    return json(429, {
      error: "Muitas mensagens em pouco tempo. Aguarde um instante.",
    });
  }

  let messages;
  try {
    ({ messages } = JSON.parse(body || "{}"));
  } catch {
    return json(400, { error: "Corpo da requisição inválido." });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return json(400, { error: "Nenhuma mensagem enviada." });
  }

  if (messages.length > MAX_MESSAGES) {
    return json(400, { error: "Conversa longa demais." });
  }

  // Só repassa o que a API espera — ignora qualquer campo extra do cliente.
  const history = messages.slice(-20).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.text ?? m.content ?? "").slice(0, MAX_CHARS_PER_MESSAGE),
  }));

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        max_tokens: 800,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Groq error:", res.status, detail);
      return json(res.status, { error: "O Discípulo não conseguiu responder." });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) return json(502, { error: "Resposta vazia do Discípulo." });

    return json(200, { text });
  } catch (err) {
    console.error("Chat function error:", err);
    if (err?.name === "TimeoutError") {
      return json(504, {
        error: "O Discípulo demorou demais para responder. Tente de novo.",
      });
    }
    return json(500, { error: "Falha na conexão com o Discípulo." });
  }
};
