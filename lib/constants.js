export const GOALS = [
  {
    id: "LOSE_WEIGHT",
    label: "Похудение",
    hint: "Лёгкий пульс, больше движения, минимум героизма",
    emoji: "🔥",
  },
  {
    id: "GAIN_MUSCLE",
    label: "Набор массы",
    hint: "Медленные повторы, можно с дивана и бутылками воды",
    emoji: "💪",
  },
  {
    id: "MAINTAIN",
    label: "Поддержание формы",
    hint: "Чтобы сериал шёл, а тело не затекало",
    emoji: "🌿",
  },
];

export const WEEKDAYS = [
  { id: 1, short: "Пн", full: "Понедельник" },
  { id: 2, short: "Вт", full: "Вторник" },
  { id: 3, short: "Ср", full: "Среда" },
  { id: 4, short: "Чт", full: "Четверг" },
  { id: 5, short: "Пт", full: "Пятница" },
  { id: 6, short: "Сб", full: "Суббота" },
  { id: 7, short: "Вс", full: "Воскресенье" },
];

export const CATEGORY_META = {
  "Для лица": { emoji: "😌", color: "#f3c9a5" },
  "Для шеи": { emoji: "🦢", color: "#c9ddd4" },
  "Для спины": { emoji: "🧘", color: "#b7d0c4" },
  "Для рук": { emoji: "💪", color: "#e8c4b8" },
  "Для ног": { emoji: "🦵", color: "#d5c6e8" },
  "Для ягодиц": { emoji: "🍑", color: "#f0b7a4" },
  "Для пресса": { emoji: "🔥", color: "#f2d19a" },
  "Для кора": { emoji: "🦋", color: "#b9d4ea" },
  "Для ленивых": { emoji: "🛋️", color: "#dccbb0" },
};

export function goalLabel(id) {
  return GOALS.find((item) => item.id === id)?.label || "Поддержание формы";
}

export function todayIso(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function jsDayToPlanDay(date = new Date()) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}
