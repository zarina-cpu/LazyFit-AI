"use client";

import { useState } from "react";
import { LoaderCircle, Send, Sparkles } from "lucide-react";

export default function ChatPage() {
  const [input, setInput] = useState("Мне нужны упражнения для рук, но болят запястья");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Я ленивый тренер. Напишите, что болит, что хочется и сколько минут готовы не лежать. Подберу мягкие варианты.",
      suggestions: [],
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function send(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message) return;
    setInput("");
    const next = [...messages, { role: "user", text: message, suggestions: [] }];
    setMessages(next);
    setLoading(true);
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: next.map((item) => ({ role: item.role, text: item.text })),
      }),
    });
    const data = await response.json();
    setLoading(false);
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        text: data.reply || "Давайте проще: одно упражнение и диван.",
        suggestions: data.suggestions || [],
      },
    ]);
  }

  async function saveSuggestion(suggestion) {
    await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(suggestion),
    });
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col">
      <header className="mb-4">
        <p className="text-sm text-muted">Ассистент</p>
        <h1 className="display text-4xl">Скажите, как удобно лежать.</h1>
      </header>
      <div className="flex-1 space-y-3">
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={`rounded-3xl px-4 py-3 text-sm leading-6 ${
              message.role === "user" ? "ml-8 bg-fill text-white" : "mr-8 border border-line bg-card"
            }`}
          >
            <p>{message.text}</p>
            {message.suggestions?.length ? (
              <div className="mt-3 space-y-2">
                {message.suggestions.map((suggestion) => (
                  <div key={suggestion.title} className="rounded-2xl bg-bg px-3 py-3 text-ink">
                    <p className="font-medium">{suggestion.title}</p>
                    <p className="mt-1 text-muted">{suggestion.description}</p>
                    <button
                      type="button"
                      onClick={() => saveSuggestion(suggestion)}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-sage"
                    >
                      <Sparkles size={12} /> В каталог
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <LoaderCircle className="animate-spin" size={16} /> думаю, не вставая...
          </p>
        ) : null}
      </div>
      <form onSubmit={send} className="sticky bottom-24 mt-4 flex gap-2 lg:bottom-4">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="упражнения от боли в пояснице"
          className="flex-1 rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-sage focus:ring-2"
        />
        <button type="submit" aria-label="Отправить" className="grid h-12 w-12 place-items-center rounded-2xl bg-fill text-white">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
