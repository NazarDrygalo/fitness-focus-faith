const messages: string[] = [
  "Discipline is choosing between what you want now and what you want most.",
  "The body achieves what the mind believes.",
  "You don't have to be great to start, but you have to start to be great.",
  "Pain is temporary. Quitting lasts forever.",
  "The only bad workout is the one that didn't happen.",
  "Your future self will thank you for not giving up today.",
  "Consistency is more important than perfection.",
  "Every rep counts. Every day counts. You count.",
  "The iron never lies. The work you put in always shows.",
  "Strength doesn't come from what you can do. It comes from overcoming what you once thought you couldn't.",
  "Fall seven times, stand up eight.",
  "The man who moves a mountain begins by carrying away small stones.",
  "What seems impossible today will one day become your warm-up.",
  "Champions aren't made in gyms. Champions are made from something deep inside them.",
  "The difference between who you are and who you want to be is what you do.",
  "Don't count the days. Make the days count.",
  "Sweat is just fat crying.",
  "The harder the battle, the sweeter the victory.",
  "You are stronger than your strongest excuse.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The only person you should try to be better than is the person you were yesterday.",
  "It never gets easier. You just get stronger.",
  "A one-hour workout is 4% of your day. No excuses.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Great things never came from comfort zones.",
  "Push harder than yesterday if you want a different tomorrow.",
  "Wake up with determination. Go to bed with satisfaction.",
  "The grind includes days you don't feel like showing up.",
  "Respect your body enough to give it the best.",
];

export function getDailyMessage(): string {
  const startDate = new Date(2026, 2, 11);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const index = ((diffDays % messages.length) + messages.length) % messages.length;
  return messages[index];
}
