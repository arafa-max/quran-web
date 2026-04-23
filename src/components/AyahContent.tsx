import { useEffect, useState, useRef, useCallback } from "react";
import { Bookmark } from "lucide-react";
import { getDb, queryDb } from "@/lib/db";
import type { usePlayer } from "@/lib/useplayer";
import type { Bookmark as BookmarkType } from "../pages/Surahs";
import type { AppSettings } from "@/lib/settings";
import { useT } from "@/lib/i18n";
import { getAudio } from "@/components/menu/audioDb";
import { getReciterById } from "@/lib/reciters";

interface Ayah {
  number: number;
  text_ar: string;
  text_du: string;
  text_ru: string;
}

interface SuraInfo {
  number: number;
  name_ar: string;
  name_ru: string;
  name_translate: string;
}

interface Props {
  sura: number;
  activeAyah: number;
  player: ReturnType<typeof usePlayer>;
  bookmarks: BookmarkType[];
  onToggleBookmark: (sura: number, ayah: number) => void;
  langs: { ar: boolean; ru: boolean; du: boolean };
  settings: AppSettings;
}

const REMOTE_AUDIO_URL = (sura: number, ayah: number, reciterId: string) =>
  `https://everyayah.com/data/${getReciterById(reciterId).folder}/${String(sura).padStart(3, "0")}${String(ayah).padStart(3, "0")}.mp3`;

async function resolveAudioUrl(sura: number, ayah: number, reciterId: string): Promise<string> {
  if (reciterId !== "alafasy") {
    return REMOTE_AUDIO_URL(sura, ayah, reciterId);
  }
  const key = `${sura}:${ayah}`;
  const blob = await getAudio(key);
  if (blob) return URL.createObjectURL(blob);
  return REMOTE_AUDIO_URL(sura, ayah, reciterId);
}

export function AyahContent({ sura, activeAyah, player, bookmarks, onToggleBookmark, langs, settings }: Props) {
  const t = useT(settings.interfaceLang);
  const reciter = getReciterById(settings.reciterId);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [suraInfo, setSuraInfo] = useState<SuraInfo | null>(null);
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const blobUrls = useRef<string[]>([]);

  useEffect(() => {
    getDb().then((db) => {
      const rows = queryDb<Ayah>(db, `SELECT * FROM sura_${sura} ORDER BY number`);
      setAyahs(rows);
      const info = queryDb<SuraInfo>(db, "SELECT * FROM suras_names WHERE number = ?", [sura]);
      if (info.length) setSuraInfo(info[0]);
    });
  }, [sura]);

  useEffect(() => {
    return () => {
      blobUrls.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrls.current = [];
    };
  }, [sura]);

  useEffect(() => {
    if (!activeAyah) return;
    const timer = setTimeout(() => {
      ayahRefs.current[activeAyah]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return () => clearTimeout(timer);
  }, [activeAyah, ayahs]);

  const handlePlay = useCallback(
    async (ayah: Ayah) => {
      const tracks = await Promise.all(
        ayahs.map(async (a) => {
          const src = await resolveAudioUrl(sura, a.number, settings.reciterId);
          if (src.startsWith("blob:")) blobUrls.current.push(src);
          return { src, title: `${t.listAyah} ${a.number}`, reciter: reciter.name };
        }),
      );
      const idx = ayahs.findIndex((a) => a.number === ayah.number);
      player.playAll(tracks, idx);
    },
    [ayahs, sura, t, player, settings.reciterId, reciter.name],
  );

  return (
    // ✅ Никаких margin/padding снаружи — родитель в Surahs.tsx управляет размером
    <div className="min-h-full bg-black pb-6">
      {/* Шапка суры */}
      <div className="ayah-card mx-5 mt-5 rounded-[12px] bg-[#78350F]/20
                      flex items-center justify-between px-6 py-5">
        <div>
          <div className="flex">
            <p className="text-[#F59E0B] text-xs mb-1 bg-[#F59E0B33] rounded-4xl p-1 px-3">
              {t.surahLabel} {String(sura).padStart(3, "0")}
            </p>
          </div>
          <h1 className="text-white text-2xl font-bold">{suraInfo?.name_ru ?? "..."}</h1>
        </div>
        <p className="text-[#F59E0B] text-5xl font-arabic">{suraInfo?.name_translate}</p>
      </div>

      {/* Аяты */}
      {ayahs.map((ayah) => {
        const remoteUrl = REMOTE_AUDIO_URL(sura, ayah.number, settings.reciterId);
        const isThisPlaying =
          player.playing &&
          (player.track?.src === remoteUrl ||
            player.track?.title === `${t.listAyah} ${ayah.number}`);
        const isBookmarked = bookmarks.some((b) => b.sura === sura && b.ayah === ayah.number);

        return (
          <div
            key={ayah.number}
            ref={(el) => { ayahRefs.current[ayah.number] = el; }}
            className={`ayah-card mx-5 rounded-[12px] transition-colors my-5 px-6 py-5
                        ${activeAyah === ayah.number
                ? "bg-[#78350F]/20 ring-1 ring-[#F59E0B]/30"
                : "bg-[#171717]/30"
              }`}
          >
            <div className="flex flex-row mb-8">
              <div className="flex flex-col items-center gap-7">
                <div className="w-10 h-10 rounded-full border-[#F59E0B4D] bg-[#F59E0B0D]
                                border-2 flex items-center justify-center">
                  <span className="text-[#F59E0B] text-xs font-bold">{ayah.number}</span>
                </div>
                <button
                  onClick={() => isThisPlaying ? player.togglePlay() : handlePlay(ayah)}
                  className={`flex items-center justify-center w-5 h-5 rounded-full text-xs
                              transition-colors
                              ${isThisPlaying
                      ? "bg-[#F59E0B] text-black"
                      : "bg-[#737373] hover:bg-[#F59E0B] hover:text-black text-white"
                    }`}
                >
                  {isThisPlaying ? "⏸" : "▶"}
                </button>
                <button
                  onClick={() => onToggleBookmark(sura, ayah.number)}
                  className={`text-xs transition-colors
                              ${isBookmarked ? "text-yellow-500" : "text-zinc-600 hover:text-white"}`}
                >
                  <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
              </div>

              {langs.ar && (
                <p
                  className="flex-1 text-white font-arabic text-right leading-loose mb-6 dir-rtl"
                  style={{ fontSize: "calc(var(--ayah-font-size) * 3)" }}
                >
                  {ayah.text_ar}
                </p>
              )}
            </div>

            <div
              className={`grid gap-6 pt-4 border-t border-[#262626]/50
                          ${langs.ru && langs.du ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {langs.ru && (
                <div>
                  <p className="text-[#F59E0B] text-xs mb-2 flex items-center gap-2">
                    <span className="inline-block w-[7px] h-[8px] rounded-full bg-[#F59E0B66]" />
                    {t.translationRu}
                  </p>
                  <p className="text-zinc-400 leading-relaxed"
                    style={{ fontSize: "var(--ayah-font-size)" }}>
                    {ayah.text_ru}
                  </p>
                </div>
              )}
              {langs.du && (
                <div>
                  <p className="text-[#F59E0B] text-xs mb-2 flex items-center gap-2">
                    <span className="inline-block w-[8px] h-[8px] rounded-full bg-[#3B82F666]" />
                    {t.translationDu}
                  </p>
                  <p className="text-zinc-400 leading-relaxed"
                    style={{ fontSize: "var(--ayah-font-size)" }}>
                    {ayah.text_du}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
