export interface BibleVerse {
  verse: string;
  reference: string;
  book: string;
  chapter: number;
}

export const dailyVerses: BibleVerse[] = [
  { verse: "I can do all this through him who gives me strength.", reference: "Philippians 4:13", book: "Philippians", chapter: 4 },
  { verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9", book: "Joshua", chapter: 1 },
  { verse: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", reference: "Isaiah 40:31", book: "Isaiah", chapter: 40 },
  { verse: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own.", reference: "1 Corinthians 6:19", book: "1 Corinthians", chapter: 6 },
  { verse: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9", book: "Joshua", chapter: 1 },
  { verse: "The Lord is my strength and my shield; my heart trusts in him, and he helps me.", reference: "Psalm 28:7", book: "Psalms", chapter: 28 },
  { verse: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.", reference: "2 Timothy 1:7", book: "2 Timothy", chapter: 1 },
  { verse: "Commit to the Lord whatever you do, and he will establish your plans.", reference: "Proverbs 16:3", book: "Proverbs", chapter: 16 },
  { verse: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.", reference: "Colossians 3:23", book: "Colossians", chapter: 3 },
  { verse: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", reference: "2 Corinthians 5:17", book: "2 Corinthians", chapter: 5 },
  { verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11", book: "Jeremiah", chapter: 29 },
  { verse: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5", book: "Proverbs", chapter: 3 },
  { verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", reference: "Romans 8:28", book: "Romans", chapter: 8 },
  { verse: "The Lord is my shepherd, I lack nothing.", reference: "Psalm 23:1", book: "Psalms", chapter: 23 },
  { verse: "Be still, and know that I am God.", reference: "Psalm 46:10", book: "Psalms", chapter: 46 },
  { verse: "No weapon forged against you will prevail, and you will refute every tongue that accuses you.", reference: "Isaiah 54:17", book: "Isaiah", chapter: 54 },
  { verse: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you.", reference: "Zephaniah 3:17", book: "Zephaniah", chapter: 3 },
  { verse: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7", book: "1 Peter", chapter: 5 },
  { verse: "So do not fear, for I am with you; do not be dismayed, for I am your God.", reference: "Isaiah 41:10", book: "Isaiah", chapter: 41 },
  { verse: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", reference: "Galatians 6:9", book: "Galatians", chapter: 6 },
  { verse: "The name of the Lord is a fortified tower; the righteous run to it and are safe.", reference: "Proverbs 18:10", book: "Proverbs", chapter: 18 },
  { verse: "He gives strength to the weary and increases the power of the weak.", reference: "Isaiah 40:29", book: "Isaiah", chapter: 40 },
  { verse: "Delight yourself in the Lord, and he will give you the desires of your heart.", reference: "Psalm 37:4", book: "Psalms", chapter: 37 },
  { verse: "The righteous cry out, and the Lord hears them; he delivers them from all their troubles.", reference: "Psalm 34:17", book: "Psalms", chapter: 34 },
  { verse: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.", reference: "Matthew 6:33", book: "Matthew", chapter: 6 },
  { verse: "I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world.", reference: "John 16:33", book: "John", chapter: 16 },
  { verse: "Be on your guard; stand firm in the faith; be courageous; be strong.", reference: "1 Corinthians 16:13", book: "1 Corinthians", chapter: 16 },
  { verse: "The Lord will fight for you; you need only to be still.", reference: "Exodus 14:14", book: "Exodus", chapter: 14 },
  { verse: "For physical training is of some value, but godliness has value for all things, holding promise for both the present life and the life to come.", reference: "1 Timothy 4:8", book: "1 Timothy", chapter: 4 },
  { verse: "Therefore encourage one another and build each other up, just as in fact you are doing.", reference: "1 Thessalonians 5:11", book: "1 Thessalonians", chapter: 5 },
  { verse: "Create in me a pure heart, O God, and renew a steadfast spirit within me.", reference: "Psalm 51:10", book: "Psalms", chapter: 51 },
];

export function getDailyVerse(): BibleVerse {
  const startDate = new Date(2026, 2, 11); // March 11, 2026
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const index = ((diffDays % dailyVerses.length) + dailyVerses.length) % dailyVerses.length;
  return dailyVerses[index];
}
