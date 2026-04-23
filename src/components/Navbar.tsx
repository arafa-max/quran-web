import { Search } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { getDb, queryDb, searchAyahs } from "@/lib/db";
import { LangsPanel } from "@/components/LangsPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ProfilePanel } from "@/components/ProfilePanel";
import type { AppSettings } from "@/lib/settings";
import type { Profile } from "@/lib/useProfile";
import { useT } from "@/lib/i18n";

interface Sura {
  number: number;
  name_ru: string;
  name_translate: string;
}

interface AyahResult {
  sura: number;
  number: number;
  text_ru: string;
}

interface Props {
  onSelectSura: (n: number) => void;
  onSelectAyah: (sura: number, ayah: number) => void;
  langs: { ar: boolean; ru: boolean; du: boolean };
  onChangeLangs: (langs: { ar: boolean; ru: boolean; du: boolean }) => void;
  settings: AppSettings;
  onChangeSettings: (s: AppSettings) => void;
  profile: Profile;
  onSetName: (name: string) => void;
  onSetAvatar: (avatar: string | null) => void;
}

export function Navbar({ onSelectSura, onSelectAyah, langs, onChangeLangs, settings, onChangeSettings, profile, onSetName, onSetAvatar }: Props) {
  const t = useT(settings.interfaceLang);
  const [query, setQuery] = useState("");
  const [suras, setSuras] = useState<Sura[]>([]);
  const [closedQuery, setClosedQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDb().then((db) => {
      const rows = queryDb<Sura>(db, "SELECT number, name_ru, name_translate FROM suras_names ORDER BY number");
      setSuras(rows);
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setClosedQuery(query);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [query]);

  const results = useMemo(() => {
    if (!query.trim()) return { suras: [], ayahs: [] as AyahResult[] };
    const q = query.toLowerCase();
    const matchedSuras = suras
      .filter((s) => s.name_ru?.toLowerCase().includes(q) || String(s.number).includes(q))
      .slice(0, 5);
    const ayahResults = searchAyahs(query).map((a) => ({
      sura: a.sura,
      number: a.ayah,
      text_ru: a.text_ru,
    }));
    return { suras: matchedSuras, ayahs: ayahResults };
  }, [query, suras]);

  const open = closedQuery !== query && (results.suras.length > 0 || results.ayahs.length > 0);

  return (
    // ✅ убран fixed, left-[256px] — теперь просто полная ширина в потоке
    <div className="h-16 w-full bg-[#171717CC] backdrop-blur-[12px] border-b border-[#262626]/50 flex items-center px-4 gap-3 z-30">
      <div ref={ref} className="relative flex-1 max-w-sm">
        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-1.5">
          <Search size={14} className="text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="bg-transparent text-sm text-zinc-400 outline-none w-full placeholder:text-zinc-600"
          />
        </div>

        {open && (
          <div className="absolute top-full mt-2 w-full bg-[#1c1c1c] border border-[#262626] rounded-xl overflow-hidden shadow-xl z-50">
            {results.suras.length > 0 && (
              <>
                <p className="text-[#F59E0B] text-xs px-3 pt-2 pb-1 uppercase">{t.searchSuras}</p>
                {results.suras.map((s) => (
                  <button
                    key={s.number}
                    onClick={() => { onSelectSura(s.number); setQuery(""); setClosedQuery(""); }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 transition-colors"
                  >
                    <span className="text-white text-sm">{s.name_ru}</span>
                    <span className="text-[#F59E0B] text-sm font-arabic">{s.name_translate}</span>
                  </button>
                ))}
              </>
            )}
            {results.ayahs.length > 0 && (
              <>
                <p className="text-[#F59E0B] text-xs px-3 pt-2 pb-1 uppercase border-t border-[#262626]/50">{t.searchAyahs}</p>
                {results.ayahs.map((a) => (
                  <button
                    key={`${a.sura}-${a.number}`}
                    onClick={() => { onSelectAyah(a.sura, a.number); setQuery(""); setClosedQuery(""); }}
                    className="w-full flex items-start gap-2 px-3 py-2 hover:bg-zinc-800 transition-colors"
                  >
                    <span className="text-[#F59E0B] text-xs shrink-0 mt-0.5">
                      {String(a.sura).padStart(3, "0")}:{a.number}
                    </span>
                    <span className="text-zinc-400 text-xs text-left line-clamp-2">{a.text_ru}</span>
                  </button>
                ))}
              </>
            )}
            {results.suras.length === 0 && results.ayahs.length === 0 && (
              <p className="text-zinc-600 text-sm px-3 py-3">{t.searchNotFound}</p>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <LangsPanel langs={langs} onChangeLangs={onChangeLangs} t={t} />
        <SettingsPanel settings={settings} onChangeSettings={onChangeSettings} t={t} />
        <ProfilePanel profile={profile} onSetName={onSetName} onSetAvatar={onSetAvatar} />
      </div>
    </div>
  );
}