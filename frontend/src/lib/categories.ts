type CategoryConfig = {
  icon: string;
  bg: string;
  text: string;
};

const categoryMap: Record<string, CategoryConfig> = {
  Food: { icon: "🍕", bg: "bg-orange-100", text: "text-orange-600" },
  Grocery: { icon: "🛒", bg: "bg-green-100", text: "text-green-600" },
  Fuel: { icon: "⛽", bg: "bg-amber-100", text: "text-amber-600" },
  Shopping: { icon: "🛍️", bg: "bg-pink-100", text: "text-pink-600" },
  Bills: { icon: "📄", bg: "bg-blue-100", text: "text-blue-600" },
  Health: { icon: "💊", bg: "bg-red-100", text: "text-red-600" },
  Entertainment: { icon: "🎬", bg: "bg-purple-100", text: "text-purple-600" },
  Travel: { icon: "✈️", bg: "bg-sky-100", text: "text-sky-600" },
  Education: { icon: "📚", bg: "bg-indigo-100", text: "text-indigo-600" },
  Salary: { icon: "💵", bg: "bg-emerald-100", text: "text-emerald-600" },
  Investment: { icon: "📈", bg: "bg-teal-100", text: "text-teal-600" },
  Other: { icon: "📌", bg: "bg-slate-100", text: "text-slate-600" },
};

export function getCategoryConfig(category: string): CategoryConfig {
  return categoryMap[category] || categoryMap.Other;
}