export interface CarOfTheDay {
  make: string;
  model: string;
  year: number;
  horsepower: number;
  zeroToSixty: string;
  topSpeed: string;
  engine: string;
  color: string; // hex for 3D model
}

const cars: CarOfTheDay[] = [
  { make: "Lamborghini", model: "Aventador SVJ", year: 2024, horsepower: 770, zeroToSixty: "2.8s", topSpeed: "217 mph", engine: "6.5L V12", color: "#c41e3a" },
  { make: "Ferrari", model: "SF90 Stradale", year: 2024, horsepower: 986, zeroToSixty: "2.5s", topSpeed: "211 mph", engine: "4.0L Twin-Turbo V8 Hybrid", color: "#ff2800" },
  { make: "Porsche", model: "911 GT3 RS", year: 2024, horsepower: 518, zeroToSixty: "3.0s", topSpeed: "184 mph", engine: "4.0L Flat-6", color: "#f5f5f5" },
  { make: "McLaren", model: "720S", year: 2024, horsepower: 710, zeroToSixty: "2.7s", topSpeed: "212 mph", engine: "4.0L Twin-Turbo V8", color: "#ff6600" },
  { make: "Bugatti", model: "Chiron Super Sport", year: 2024, horsepower: 1578, zeroToSixty: "2.3s", topSpeed: "273 mph", engine: "8.0L Quad-Turbo W16", color: "#1a1a2e" },
  { make: "Koenigsegg", model: "Jesko Absolut", year: 2024, horsepower: 1600, zeroToSixty: "2.5s", topSpeed: "330 mph", engine: "5.0L Twin-Turbo V8", color: "#c0c0c0" },
  { make: "Pagani", model: "Huayra R", year: 2024, horsepower: 838, zeroToSixty: "2.7s", topSpeed: "238 mph", engine: "6.0L V12", color: "#1e3a5f" },
  { make: "Aston Martin", model: "Valkyrie", year: 2024, horsepower: 1139, zeroToSixty: "2.5s", topSpeed: "250 mph", engine: "6.5L V12 Hybrid", color: "#013220" },
  { make: "Rimac", model: "Nevera", year: 2024, horsepower: 1914, zeroToSixty: "1.85s", topSpeed: "258 mph", engine: "Quad Electric Motors", color: "#4a0e4e" },
  { make: "Mercedes-AMG", model: "One", year: 2024, horsepower: 1049, zeroToSixty: "2.9s", topSpeed: "219 mph", engine: "1.6L Turbo V6 Hybrid (F1)", color: "#2d2d2d" },
  { make: "Nissan", model: "GT-R Nismo", year: 2024, horsepower: 600, zeroToSixty: "2.5s", topSpeed: "205 mph", engine: "3.8L Twin-Turbo V6", color: "#808080" },
  { make: "Ford", model: "GT", year: 2024, horsepower: 660, zeroToSixty: "3.0s", topSpeed: "216 mph", engine: "3.5L Twin-Turbo V6", color: "#003399" },
  { make: "Chevrolet", model: "Corvette Z06", year: 2024, horsepower: 670, zeroToSixty: "2.6s", topSpeed: "195 mph", engine: "5.5L Flat-Plane V8", color: "#ffcc00" },
  { make: "BMW", model: "M4 CSL", year: 2024, horsepower: 543, zeroToSixty: "3.6s", topSpeed: "191 mph", engine: "3.0L Twin-Turbo I6", color: "#1c69d4" },
  { make: "Dodge", model: "Viper ACR", year: 2017, horsepower: 645, zeroToSixty: "3.0s", topSpeed: "177 mph", engine: "8.4L V10", color: "#b22222" },
];

export function getDailyCar(): CarOfTheDay {
  const startDate = new Date(2026, 2, 11);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const index = ((diffDays % cars.length) + cars.length) % cars.length;
  return cars[index];
}
