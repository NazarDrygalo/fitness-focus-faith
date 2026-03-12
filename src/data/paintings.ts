export interface PaintingOfTheDay {
  title: string;
  painter: string;
  yearPainted: string;
  subject: string;
  colors: string[]; // hex colors for the 3D canvas
}

const paintings: PaintingOfTheDay[] = [
  { title: "Starry Night", painter: "Vincent van Gogh", yearPainted: "1889", subject: "A swirling night sky over a quiet village with cypress trees", colors: ["#1a237e", "#ffd54f", "#0d47a1", "#4caf50"] },
  { title: "The Great Wave off Kanagawa", painter: "Katsushika Hokusai", yearPainted: "1831", subject: "A massive wave threatening boats near Mount Fuji", colors: ["#1565c0", "#e3f2fd", "#0d47a1", "#f5f5dc"] },
  { title: "Girl with a Pearl Earring", painter: "Johannes Vermeer", yearPainted: "1665", subject: "A young woman with a pearl earring and blue turban", colors: ["#1a237e", "#ffd700", "#263238", "#ffcc80"] },
  { title: "The Persistence of Memory", painter: "Salvador Dalí", yearPainted: "1931", subject: "Melting clocks draped over a surreal landscape", colors: ["#ff8f00", "#4e342e", "#78909c", "#fff9c4"] },
  { title: "Mona Lisa", painter: "Leonardo da Vinci", yearPainted: "1503", subject: "A woman with an enigmatic smile in front of a landscape", colors: ["#5d4037", "#8d6e63", "#2e7d32", "#fff8e1"] },
  { title: "The Birth of Venus", painter: "Sandro Botticelli", yearPainted: "1485", subject: "Venus emerging from the sea on a shell", colors: ["#80cbc4", "#ffccbc", "#a5d6a7", "#ffe0b2"] },
  { title: "Guernica", painter: "Pablo Picasso", yearPainted: "1937", subject: "The horrors of the bombing of Guernica during the Spanish Civil War", colors: ["#212121", "#f5f5f5", "#616161", "#9e9e9e"] },
  { title: "Water Lilies", painter: "Claude Monet", yearPainted: "1906", subject: "Colorful water lilies floating on a tranquil pond", colors: ["#1b5e20", "#7986cb", "#e8f5e9", "#ce93d8"] },
  { title: "The Scream", painter: "Edvard Munch", yearPainted: "1893", subject: "A figure with an agonized expression against a tumultuous sky", colors: ["#ff6f00", "#d32f2f", "#1a237e", "#ffeb3b"] },
  { title: "A Sunday on La Grande Jatte", painter: "Georges Seurat", yearPainted: "1886", subject: "Parisians relaxing in a park on an island in the Seine", colors: ["#388e3c", "#4fc3f7", "#fff9c4", "#8d6e63"] },
  { title: "The Night Watch", painter: "Rembrandt van Rijn", yearPainted: "1642", subject: "A militia company led by Captain Frans Banning Cocq", colors: ["#3e2723", "#ffd54f", "#212121", "#ff8a65"] },
  { title: "Liberty Leading the People", painter: "Eugène Delacroix", yearPainted: "1830", subject: "A woman personifying Liberty leading people over barricades", colors: ["#1565c0", "#d32f2f", "#f5f5f5", "#795548"] },
  { title: "American Gothic", painter: "Grant Wood", yearPainted: "1930", subject: "A farmer and his daughter standing before a house with a Gothic window", colors: ["#795548", "#9e9d24", "#455a64", "#d7ccc8"] },
  { title: "The Kiss", painter: "Gustav Klimt", yearPainted: "1908", subject: "A couple embracing, wrapped in elaborate golden robes", colors: ["#ffd700", "#ff8f00", "#4e342e", "#ffe082"] },
  { title: "Impression, Sunrise", painter: "Claude Monet", yearPainted: "1872", subject: "A hazy harbor scene at sunrise with small boats", colors: ["#ff7043", "#42a5f5", "#78909c", "#ffcc80"] },
];

export function getDailyPainting(): PaintingOfTheDay {
  const startDate = new Date(2026, 2, 11);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const index = ((diffDays % paintings.length) + paintings.length) % paintings.length;
  return paintings[index];
}
