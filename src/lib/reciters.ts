export interface Reciter {
  id: string;
  name: string;
  subtitle: string;
  folder: string;
}

export const RECITERS: Reciter[] = [
  { id: "alafasy", name: "Mishary Rashid Alafasy", subtitle: "Alafasy 64kbps", folder: "Alafasy_64kbps" },
  { id: "husary", name: "Mahmoud Khalil Al-Husary", subtitle: "Husary 64kbps", folder: "Husary_64kbps" },
  { id: "abdulbasit", name: "Abdul Basit Murattal", subtitle: "Abdul Basit Murattal 64kbps", folder: "Abdul_Basit_Murattal_64kbps" },
  { id: "sudais", name: "Abdurrahmaan As-Sudais", subtitle: "Sudais 64kbps", folder: "Abdurrahmaan_As-Sudais_64kbps" },
  { id: "ajamy", name: "Ahmed ibn Ali al-Ajamy", subtitle: "Ajamy 64kbps", folder: "Ahmed_ibn_Ali_al-Ajamy_64kbps_QuranExplorer.Com" },
];

export function getReciterById(id: string) {
  return RECITERS.find((reciter) => reciter.id === id) ?? RECITERS[0];
}
