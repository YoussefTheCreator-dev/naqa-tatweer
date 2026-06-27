// Expense tracker helpers (Feature 6). All amounts in AED.
export const CATEGORIES = ["Feed", "Water", "Medicine", "Vaccine", "Labour", "Equipment", "Other"];
export const CAT_AR = {
  Feed: "علف", Water: "ماء", Medicine: "دواء", Vaccine: "تطعيم",
  Labour: "عمالة", Equipment: "معدات", Other: "أخرى",
};
export const CAT_COLOR = {
  Feed: "#3E7A35", Water: "#2B6F8C", Medicine: "#C4622D", Vaccine: "#9C5BAE",
  Labour: "#C98A1E", Equipment: "#6B6353", Other: "#8A8A8A",
};

export function isThisMonth(iso) {
  const d = new Date(iso), n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

// Total for a specific entity (or general farm).
export function totalFor(expenses, linkType, linkId) {
  return expenses
    .filter((e) => e.linkType === linkType && (linkId == null || e.linkId === linkId))
    .reduce((s, e) => s + Number(e.amount || 0), 0);
}

export function totalForEntity(expenses, linkId) {
  return expenses.filter((e) => e.linkId === linkId).reduce((s, e) => s + Number(e.amount || 0), 0);
}

export function byCategory(expenses) {
  return CATEGORIES
    .map((c) => ({ category: c, amount: expenses.filter((e) => e.category === c).reduce((s, e) => s + Number(e.amount || 0), 0) }))
    .filter((x) => x.amount > 0);
}

export const sumAmount = (expenses) => expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
