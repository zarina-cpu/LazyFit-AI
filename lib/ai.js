const SYSTEM_RULES = `Ты — LazyFit AI, тренер для ленивых. Пиши по-русски, тепло, коротко, без токсичной мотивации.
Упражнения должны быть реалистичными: диван, ковёр, сериал, бутылка воды, без зала и сложного инвентаря.
Никогда не предлагай опасные нагрузки при боли. Если пользователь жалуется на боль — дай щадящую альтернативу и посоветуй врача при острой боли.
Верни СТРОГО JSON без markdown.`;

function extractJson(text) {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    const arrayStart = trimmed.indexOf("[");
    const arrayEnd = trimmed.lastIndexOf("]");
    if (arrayStart >= 0 && arrayEnd > arrayStart) {
      try {
        return JSON.parse(trimmed.slice(arrayStart, arrayEnd + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${SYSTEM_RULES}\n\n${prompt}` }] }],
            generationConfig: { temperature: 0.7 },
          }),
        },
      );
      if (!response.ok) {
        lastError = await response.text();
        continue;
      }
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n");
      return extractJson(text) || { raw: text };
    } catch (error) {
      lastError = error.message;
    }
  }

  console.warn("Gemini unavailable:", lastError);
  return null;
}

function guessCategories(text) {
  const value = (text || "").toLowerCase();
  const mapping = [
    ["лица", "Для лица"],
    ["фейс", "Для лица"],
    ["шеи", "Для шеи"],
    ["шея", "Для шеи"],
    ["спин", "Для спины"],
    ["поясниц", "Для спины"],
    ["рук", "Для рук"],
    ["трицепс", "Для рук"],
    ["бицепс", "Для рук"],
    ["плеч", "Для рук"],
    ["ног", "Для ног"],
    ["бедр", "Для ног"],
    ["ягодиц", "Для ягодиц"],
    ["таз", "Для ягодиц"],
    ["пресс", "Для пресса"],
    ["живот", "Для пресса"],
    ["кор", "Для кора"],
    ["планк", "Для кора"],
  ];
  const found = mapping.filter(([key]) => value.includes(key)).map(([, name]) => name);
  const unique = [...new Set(found)];
  if (!unique.includes("Для ленивых")) unique.push("Для ленивых");
  return unique.length ? unique : ["Для ленивых", "Для кора"];
}

function titleFromSource(sourceUrl, text) {
  if (text) {
    const first = text.split(/[.!?]/)[0].trim();
    if (first.length > 8 && first.length < 80) return first;
  }
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      const slug = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "");
      if (slug) return slug.replace(/[-_]+/g, " ").slice(0, 60);
      return `Ленивое упражнение из ${url.hostname}`;
    } catch {
      return "Упражнение из ссылки";
    }
  }
  return "Ленивое упражнение с дивана";
}

export function mockParse({ sourceUrl, text, fileName }) {
  const blob = `${text || ""} ${sourceUrl || ""} ${fileName || ""}`;
  const categories = guessCategories(blob);
  const title = titleFromSource(sourceUrl, text || fileName);
  const mediaType = fileName
    ? fileName.match(/\.(gif)$/i)
      ? "GIF"
      : fileName.match(/\.(mp4|mov|webm)$/i)
        ? "VIDEO"
        : "IMAGE"
    : sourceUrl
      ? "LINK"
      : "IMAGE";

  return {
    title,
    description:
      text?.trim() ||
      "Лёжа или полулёжа, без резких рывков. 8–12 медленных повторов, пауза в верхней точке на 2 секунды. Можно делать во время сериала — если запыхались, просто уменьшите амплитуду.",
    mediaType,
    categories,
    suitability: blob.toLowerCase().includes("похуд") ? "LOSE_WEIGHT" : "MAINTAIN",
  };
}

export async function parseExerciseInput(payload) {
  const prompt = `Разбери контент упражнения и верни JSON:
{
  "title": "короткое русское название",
  "description": "техника для ленивого новичка, 2-4 предложения",
  "mediaType": "VIDEO" | "IMAGE" | "GIF" | "LINK",
  "categories": ["Для спины", "Для ленивых"],
  "suitability": "LOSE_WEIGHT" | "GAIN_MUSCLE" | "MAINTAIN"
}
Категории только из списка: Для лица, Для шеи, Для спины, Для рук, Для ног, Для ягодиц, Для пресса, Для кора, Для ленивых.
Контент: ${JSON.stringify(payload)}`;

  const ai = await callGemini(prompt);
  if (ai?.title && ai?.description) {
    return {
      title: ai.title,
      description: ai.description,
      mediaType: ai.mediaType || "LINK",
      categories: Array.isArray(ai.categories) && ai.categories.length ? ai.categories : guessCategories(payload.text),
      suitability: ai.suitability || "MAINTAIN",
    };
  }
  return mockParse(payload);
}

export async function chatWithCoach({ message, history = [], goal }) {
  const prompt = `Цель пользователя: ${goal || "MAINTAIN"}.
История: ${JSON.stringify(history.slice(-6))}
Новое сообщение: ${message}

Верни JSON:
{
  "reply": "дружелюбный ответ тренера",
  "suggestions": [
    {
      "title": "",
      "description": "",
      "categories": ["Для рук"],
      "mediaType": "IMAGE"
    }
  ]
}
Дай 2-3 предложения упражнений, если пользователь просит тренировку или альтернативу. Если это просто болтовня — suggestions: [].`;

  const ai = await callGemini(prompt);
  if (ai?.reply) {
    return {
      reply: ai.reply,
      suggestions: Array.isArray(ai.suggestions) ? ai.suggestions : [],
    };
  }

  const categories = guessCategories(message);
  const lower = message.toLowerCase();
  const pain = /боль|болит|запяст|колен|поясниц|шея/.test(lower);

  const suggestions = [
    {
      title: pain ? "Щадящий вариант без упора" : "Диванный сет под запрос",
      description: pain
        ? "Убираем нагрузку с больного места. Движение маленькое, медленное, только пока комфортно. Если боль острая — сегодня пропускаем и лучше показать врачу."
        : "Делаем прямо там, где вы сидите: 8–10 медленных повторов, дыхание спокойное, сериал можно не ставить на паузу.",
      categories,
      mediaType: "IMAGE",
    },
    {
      title: "Микро-пауза для циркуляции",
      description: "Раз в серию — встать, потянуться вверх, мягко переступить с ноги на ногу 30 секунд. Это считается.",
      categories: ["Для ног", "Для ленивых"],
      mediaType: "IMAGE",
    },
  ];

  return {
    reply: pain
      ? "Понял про дискомфорт. Ниже — мягкие замены без героизма. Если боль резкая или не проходит — это уже не про тренировку, а про врача."
      : `Собрал ленивые варианты под «${message.slice(0, 80)}». Можно добавить в каталог одним касанием и я вплету их в план.`,
    suggestions,
  };
}
