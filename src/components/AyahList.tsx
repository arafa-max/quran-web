import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { getDb, queryDb } from "@/lib/db";
import type { AppSettings } from "@/lib/settings";
import { useT } from "@/lib/i18n";

interface Sura {
  number: number;
  name_ar: string;
  name_ru: string;
  name_translate: string;
}

interface Ayah {
  number: number;
  text_ar: string;
}

interface Props {
  activeSura: number;
  activeAyah: number;
  onSelectSura: (n: number) => void;
  onSelectAyah: (n: number) => void;
  settings: AppSettings;
}

export function AyahList({ activeSura, activeAyah, onSelectSura, onSelectAyah, settings }: Props) {
  const t = useT(settings.interfaceLang);
  const [suras, setSuras] = useState<Sura[]>([]);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [view, setView] = useState<"suras" | "ayahs">("suras");

  useEffect(() => {
    getDb().then((db) => {
      const rows = queryDb<Sura>(db, "SELECT * FROM suras_names ORDER BY number");
      setSuras(rows);
    });
  }, []);

  useEffect(() => {
    getDb().then((db) => {
      const rows = queryDb<Ayah>(db, `SELECT number, text_ar FROM sura_${activeSura} ORDER BY number`);
      setAyahs(rows);
    });
  }, [activeSura]);

 const handleSelectSura = (n: number) => {
  onSelectSura(n);
  setView("ayahs"); 
};

  return (
    <div className="flex flex-col h-full bg-[#000000]">
      <div className="shrink-0 px-4 py-3 border-b border-[#262626]/50 flex items-center gap-2">
        {view === "ayahs" && (
          <button
            onClick={() => setView("suras")}
            className="text-zinc-500 hover:text-yellow-500 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        <p className="text-[#F59E0B] text-xs uppercase">{t.listSuras}</p>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {view === "suras" && suras.map((sura) => (
          <button
            key={sura.number}
            onClick={() => handleSelectSura(sura.number)}
            className={`ayah-item w-full flex items-center justify-between px-4 py-3 min-h-[64px] h-auto
                        rounded-[8px] mx-0 transition-colors active:opacity-70
                        ${activeSura === sura.number
                ? "bg-yellow-500/10 text-yellow-500 border border-[#F59E0B33]"
                : "text-zinc-400 hover:bg-zinc-800"
              }`}
          >
            <span className="text-sm shrink-0">{t.listSura} {sura.number}</span>
            <div className="flex items-center gap-2 ml-2 min-w-0">
              {activeSura === sura.number && (
                <img src="/right.svg" alt="" className="w-2.5 shrink-0" />
              )}
              <span className="text-sm font-arabic text-right leading-relaxed">{sura.name_translate}</span>
            </div>
          </button>
        ))}

        {view === "ayahs" && ayahs.map((ayah) => (
          <button
            key={ayah.number}
            onClick={() => onSelectAyah(ayah.number)}
            className={`ayah-item w-full flex items-center justify-between px-4 py-3 min-h-[64px] h-auto
                        rounded-[8px] mx-0 transition-colors active:opacity-70
                        ${activeAyah === ayah.number
                ? "bg-yellow-500/10 text-yellow-500 border border-[#F59E0B33]"
                : "text-zinc-400 hover:bg-zinc-800"
              }`}
          >
            <span className="text-sm shrink-0">{t.listAyah} {ayah.number}</span>
            <div className="flex items-center gap-2 ml-2 min-w-0">
              {activeAyah === ayah.number && (
                <img src="/right.svg" alt="" className="w-2.5 shrink-0" />
              )}
              <span className="text-sm font-arabic text-right leading-relaxed">
                {ayah.text_ar.split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}