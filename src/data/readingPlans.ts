// Static reading plans. Each day points at a reference (book + chapter).
// Progress is tracked per (plan_id, day_index) in `reading_plan_progress`.

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  days: { reference: string; title: string }[];
}

export const readingPlans: ReadingPlan[] = [
  {
    id: "strength-7",
    title: "7 Days of Strength",
    description: "A week of verses on courage, perseverance, and the strength God gives.",
    days: [
      { reference: "Joshua 1", title: "Be strong and courageous" },
      { reference: "Isaiah 40", title: "Soar on wings like eagles" },
      { reference: "Philippians 4", title: "I can do all this through him" },
      { reference: "Psalm 23", title: "The Lord is my shepherd" },
      { reference: "2 Timothy 1", title: "Not a spirit of fear" },
      { reference: "Romans 8", title: "More than conquerors" },
      { reference: "Psalm 46", title: "Be still and know" },
    ],
  },
  {
    id: "discipline-30",
    title: "30 Days of Discipline",
    description: "A month of short readings on grit, faithfulness, and walking in the Spirit.",
    days: [
      { reference: "Proverbs 3", title: "Trust in the Lord" },
      { reference: "Proverbs 16", title: "Commit your work" },
      { reference: "Proverbs 18", title: "The name of the Lord" },
      { reference: "Galatians 6", title: "Do not grow weary" },
      { reference: "Colossians 3", title: "Work with all your heart" },
      { reference: "1 Corinthians 6", title: "Your body is a temple" },
      { reference: "1 Corinthians 16", title: "Stand firm in the faith" },
      { reference: "1 Timothy 4", title: "Train yourself in godliness" },
      { reference: "1 Thessalonians 5", title: "Encourage one another" },
      { reference: "Matthew 6", title: "Seek first the kingdom" },
      { reference: "John 16", title: "Take heart, I have overcome" },
      { reference: "Psalm 28", title: "The Lord is my strength" },
      { reference: "Psalm 34", title: "Taste and see" },
      { reference: "Psalm 37", title: "Delight in the Lord" },
      { reference: "Psalm 51", title: "Create in me a pure heart" },
      { reference: "Isaiah 41", title: "Do not fear" },
      { reference: "Isaiah 54", title: "No weapon shall prosper" },
      { reference: "Jeremiah 29", title: "Plans to give you hope" },
      { reference: "Exodus 14", title: "The Lord will fight for you" },
      { reference: "Zephaniah 3", title: "He delights in you" },
      { reference: "1 Peter 5", title: "Cast your anxiety" },
      { reference: "2 Corinthians 5", title: "A new creation" },
      { reference: "Joshua 1", title: "Be strong and courageous (revisit)" },
      { reference: "Isaiah 40", title: "Renew your strength (revisit)" },
      { reference: "Philippians 4", title: "Rejoice always (revisit)" },
      { reference: "Romans 8", title: "All things for good (revisit)" },
      { reference: "Psalm 23", title: "The Shepherd (revisit)" },
      { reference: "Psalm 46", title: "Be still (revisit)" },
      { reference: "2 Timothy 1", title: "Power, love, sound mind (revisit)" },
      { reference: "Matthew 6", title: "Seek first (revisit)" },
    ],
  },
  {
    id: "gospels-year",
    title: "1 Year Through the Gospels",
    description: "A year-long walk through key chapters of Matthew, Mark, Luke, and John (sample track).",
    days: Array.from({ length: 12 }, (_, i) => ({
      reference: i % 2 === 0 ? "Matthew 6" : "John 16",
      title: `Month ${i + 1}: meditate & journal`,
    })),
  },
];

export function getReadingPlan(id: string) {
  return readingPlans.find((p) => p.id === id);
}

export const reflectionPrompts = [
  "What's one phrase from today's reading that hit you hardest, and why?",
  "Where in your life does this verse apply right now?",
  "What's one small action you can take today in response?",
  "What's a fear or anxiety you can hand over after reading this?",
  "Who in your life needs to hear what you just read?",
  "How does this verse change the way you'll train, work, or rest today?",
  "What would change in your week if you fully believed this?",
];

export function getReflectionPrompt(seed: number) {
  return reflectionPrompts[seed % reflectionPrompts.length];
}
