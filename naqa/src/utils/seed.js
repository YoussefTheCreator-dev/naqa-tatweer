// Initial demo data, loaded into localStorage on first run so the dashboard
// looks alive. All of this is editable in-app afterwards.
import { todayISO } from "./helpers.js";

function shiftDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const SEED = {
  camels: [
    {
      id: "camel_seed_1",
      name: "Zafra",
      breed: "Majaheem",
      age: 6,
      weight: 540,
      status: "healthy",
      notes: "Calm temperament, strong milker.",
      weightLog: [
        { date: shiftDate(-120), kg: 505 },
        { date: shiftDate(-90), kg: 515 },
        { date: shiftDate(-60), kg: 525 },
        { date: shiftDate(-30), kg: 533 },
        { date: shiftDate(-1), kg: 540 },
      ],
      vaccines: [
        { id: "v1", name: "Brucellosis", date: shiftDate(-200), next: shiftDate(-5) },
        { id: "v2", name: "Camel Pox", date: shiftDate(-90), next: shiftDate(60) },
      ],
      feeding: "Alfalfa 2×/day, dates supplement, free-choice minerals.",
      tagNumber: "UAE-0042", photo: "", gender: "female",
      bodyCondition: 4, tempLog: [{ date: shiftDate(-3), temp: 37.4 }],
      lastVetVisit: shiftDate(-45), vetName: "Dr. Salim Al Marar",
      conditions: "", insurance: "INS-2231",
      pregnant: true, conceptionDate: shiftDate(-270), expectedBirth: shiftDate(120), sireTag: "UAE-0011", damTag: "UAE-0007",
      paddock: "North Pen A", gps: "24.2071, 55.7449",
    },
    {
      id: "camel_seed_2",
      name: "Hadban",
      breed: "Sofor",
      age: 9,
      weight: 612,
      status: "attention",
      notes: "Slight weight dip last month — monitor feed intake.",
      weightLog: [
        { date: shiftDate(-120), kg: 640 },
        { date: shiftDate(-90), kg: 632 },
        { date: shiftDate(-60), kg: 625 },
        { date: shiftDate(-30), kg: 618 },
        { date: shiftDate(-1), kg: 612 },
      ],
      vaccines: [
        { id: "v3", name: "Clostridial", date: shiftDate(-150), next: shiftDate(15) },
      ],
      feeding: "Alfalfa 3×/day, increased ration to recover weight.",
      tagNumber: "UAE-0019", photo: "", gender: "male",
      bodyCondition: 3, tempLog: [{ date: shiftDate(-2), temp: 38.1 }],
      lastVetVisit: shiftDate(-20), vetName: "Dr. Salim Al Marar",
      conditions: "Mild dental wear.", insurance: "INS-2232",
      usedForBreeding: true, sireTag: "UAE-0003", damTag: "UAE-0005",
      paddock: "South Pen B", gps: "24.2068, 55.7461",
    },
    {
      id: "camel_seed_3",
      name: "Rimth",
      breed: "Awarik",
      age: 3,
      weight: 410,
      status: "healthy",
      notes: "Young racer in training.",
      weightLog: [
        { date: shiftDate(-90), kg: 360 },
        { date: shiftDate(-60), kg: 380 },
        { date: shiftDate(-30), kg: 398 },
        { date: shiftDate(-1), kg: 410 },
      ],
      vaccines: [
        { id: "v4", name: "Brucellosis", date: shiftDate(-30), next: shiftDate(150) },
      ],
      feeding: "High-energy mix 3×/day for training.",
      tagNumber: "UAE-0088", photo: "", gender: "male",
      bodyCondition: 4, tempLog: [],
      lastVetVisit: shiftDate(-10), vetName: "Dr. Aisha Nuaimi",
      conditions: "", insurance: "",
      usedForBreeding: false, sireTag: "", damTag: "",
      paddock: "Training Track", gps: "",
    },
  ],

  palms: [
    {
      id: "palm_seed_1",
      code: "P-A01",
      variety: "Khalas",
      age: 12,
      status: "healthy",
      lastInspection: shiftDate(-6),
      section: "A",
      growthLog: [
        { date: shiftDate(-120), height: 4.2 },
        { date: shiftDate(-60), height: 4.35 },
        { date: shiftDate(-2), height: 4.5 },
      ],
      treatments: [
        { id: "t1", date: shiftDate(-40), type: "Fertilisation", note: "NPK + organic compost" },
      ],
      irrigationLog: [
        { date: shiftDate(-2), litres: 120 },
        { date: shiftDate(-1), litres: 120 },
      ],
      nextFertilise: shiftDate(20),
      tagNumber: "PLM-001", photo: "",
      plantingDate: shiftDate(-365 * 12), height: 4.5, offshoots: 3,
      pollination: "pollinated", lastPruning: shiftDate(-150), nextPruning: shiftDate(30),
      soilType: "sandy", irrigationMethod: "drip", waterSource: "well", litresPerSession: 120,
      expectedHarvest: shiftDate(70), lastYield: 62,
      harvestLog: [{ id: "h1", date: shiftDate(-300), kg: 58 }],
      pestLog: [], fertiliserLog: [{ id: "fl1", date: shiftDate(-40), type: "NPK", qty: "2 kg" }],
    },
    {
      id: "palm_seed_2",
      code: "P-A02",
      variety: "Khenaizi",
      age: 8,
      status: "attention",
      lastInspection: shiftDate(-21),
      section: "A",
      growthLog: [
        { date: shiftDate(-120), height: 3.1 },
        { date: shiftDate(-60), height: 3.2 },
        { date: shiftDate(-2), height: 3.28 },
      ],
      treatments: [
        { id: "t2", date: shiftDate(-15), type: "Inspection", note: "Minor frond yellowing — watch." },
      ],
      irrigationLog: [{ date: shiftDate(-3), litres: 100 }],
      nextFertilise: shiftDate(-3),
      tagNumber: "PLM-002", photo: "",
      plantingDate: shiftDate(-365 * 8), height: 3.28, offshoots: 2,
      pollination: "not yet", lastPruning: shiftDate(-220), nextPruning: shiftDate(-40),
      soilType: "loamy", irrigationMethod: "drip", waterSource: "network", litresPerSession: 100,
      expectedHarvest: shiftDate(95), lastYield: 41,
      harvestLog: [{ id: "h2", date: shiftDate(-280), kg: 39 }],
      pestLog: [{ id: "pl1", date: shiftDate(-15), type: "Frond yellowing", treatment: "Monitoring" }],
      fertiliserLog: [],
    },
    {
      id: "palm_seed_3",
      code: "P-B01",
      variety: "Lulu",
      age: 15,
      status: "healthy",
      lastInspection: shiftDate(-3),
      section: "B",
      growthLog: [
        { date: shiftDate(-120), height: 5.0 },
        { date: shiftDate(-60), height: 5.1 },
        { date: shiftDate(-2), height: 5.18 },
      ],
      treatments: [
        { id: "t3", date: shiftDate(-70), type: "Pollination", note: "Hand pollinated, good fruit set." },
      ],
      irrigationLog: [
        { date: shiftDate(-1), litres: 150 },
      ],
      nextFertilise: shiftDate(45),
      tagNumber: "PLM-007", photo: "",
      plantingDate: shiftDate(-365 * 15), height: 5.18, offshoots: 4,
      pollination: "pollinated", lastPruning: shiftDate(-60), nextPruning: shiftDate(120),
      soilType: "mixed", irrigationMethod: "flood", waterSource: "well", litresPerSession: 150,
      expectedHarvest: shiftDate(60), lastYield: 78,
      harvestLog: [{ id: "h3", date: shiftDate(-310), kg: 74 }, { id: "h4", date: shiftDate(-680), kg: 70 }],
      pestLog: [], fertiliserLog: [{ id: "fl3", date: shiftDate(-70), type: "Organic compost", qty: "5 kg" }],
    },
  ],

  feedLog: [
    { id: "f1", date: todayISO(), type: "Feed", item: "Alfalfa", qty: "60 kg" },
    { id: "f2", date: todayISO(), type: "Water", item: "Trough refill", qty: "300 L" },
  ],

  // Daily care: seed today's water done for Zafra so the UI shows a checked state.
  dailyCare: {
    camel_seed_1: { [todayISO()]: { water: { done: true, time: new Date().toISOString() } } },
  },

  // Expense ledger (Feature 6) — a few entries this month for the demo.
  expenses: [
    { id: "exp_seed_1", date: shiftDate(-2), category: "Feed", amount: 850, linkType: "general", linkId: null, notes: "Alfalfa delivery" },
    { id: "exp_seed_2", date: shiftDate(-5), category: "Vaccine", amount: 220, linkType: "camel", linkId: "camel_seed_1", notes: "Camel Pox booster" },
    { id: "exp_seed_3", date: shiftDate(-8), category: "Labour", amount: 600, linkType: "general", linkId: null, notes: "Weekly farm hand" },
    { id: "exp_seed_4", date: shiftDate(-3), category: "Water", amount: 300, linkType: "palm", linkId: "palm_seed_1", notes: "Tanker top-up" },
    { id: "exp_seed_5", date: shiftDate(-1), category: "Medicine", amount: 140, linkType: "camel", linkId: "camel_seed_2", notes: "Dental check supplies" },
    { id: "exp_seed_6", date: shiftDate(-6), category: "Equipment", amount: 480, linkType: "palm", linkId: "palm_seed_3", notes: "Drip emitters" },
  ],

  // Vet / authority contact book (Feature 5). One example pre-populated.
  contacts: [
    {
      id: "contact_seed_1",
      name: "Emergency Vet",
      phone: "800-232372",
      speciality: "Farm Authority",
      notes: "Abu Dhabi Agriculture and Food Safety Authority (ADAFSA) — 800-ADAFSA",
      favourite: true,
    },
  ],

  // A reminder due now (shows as a due alert + toast) and one upcoming.
  reminders: [
    { id: "rem_seed_1", title: "Vet visit for Hadban", when: new Date(Date.now() - 3600000).toISOString(), linkType: "camel", linkId: "camel_seed_2" },
    { id: "rem_seed_2", title: "Pollinate P-A02", when: shiftDate(2) + "T08:00", linkType: "palm", linkId: "palm_seed_2" },
  ],
};
