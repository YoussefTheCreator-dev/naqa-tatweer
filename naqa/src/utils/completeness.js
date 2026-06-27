// Profile completeness — how many optional fields are filled (0..100).
const CAMEL_FIELDS = [
  "tagNumber", "photo", "gender", "bodyCondition", "lastVetVisit", "vetName",
  "conditions", "insurance", "paddock", "gps", "feeding", "notes",
];
const PALM_FIELDS = [
  "tagNumber", "photo", "plantingDate", "height", "offshoots", "pollination",
  "lastPruning", "soilType", "irrigationMethod", "waterSource", "litresPerSession",
  "expectedHarvest",
];

function filled(v) {
  if (v === 0) return true;
  if (Array.isArray(v)) return v.length > 0;
  return v !== undefined && v !== null && String(v).trim() !== "";
}

export function completeness(entity, type) {
  const fields = type === "camel" ? CAMEL_FIELDS : PALM_FIELDS;
  const done = fields.filter((f) => filled(entity[f])).length;
  return Math.round((done / fields.length) * 100);
}
