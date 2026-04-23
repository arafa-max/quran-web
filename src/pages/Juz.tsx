import { Menu } from "@/components/menu/Menu";
import { Navbar } from "@/components/Navbar";
import { Player } from "@/components/Player";
import { AyahContent } from "@/components/AyahContent";
import { useState, useEffect } from "react";
import { usePlayer } from "@/lib/useplayer";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { useProfile } from "@/lib/useProfile";
import { getDb, queryDb } from "@/lib/db";
import { List, X } from "lucide-react";
import type { Bookmark } from "./Surahs";

interface JuzRow {
    juz: number;
    sura: number;
    ayah: number;
}

interface SuraName {
    number: number;
    name_ru: string;
    name_translate: string;
}

export function Juz() {
    const [activeSura, setActiveSura] = useState(1);
    const [activeAyah, setActiveAyah] = useState(1);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [langs, setLangs] = useState({ ar: true, ru: true, du: true });
    const [settings, setSettings] = useState(loadSettings);
    const [menuOpen, setMenuOpen] = useState(false);
    const [listOpen, setListOpen] = useState(true);
    const [juzList, setJuzList] = useState<(JuzRow & { name_ru: string; name_translate: string })[]>([]);
    const [view, setView] = useState<"juz" | "content">("juz");

    const handleChangeSettings = (s: AppSettings) => { setSettings(s); saveSettings(s); };
    const player = usePlayer(settings.soundEnabled);
    const { profile, setName, setAvatar, logout } = useProfile();

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("light", settings.theme === "light");
        root.classList.toggle("dark", settings.theme === "dark");
        root.setAttribute("data-fontsize", settings.fontSize);
        root.classList.toggle("compact", settings.compactMode);
        root.classList.toggle("font-smoothing-on", settings.fontSmoothing);
        root.classList.toggle("font-smoothing-off", !settings.fontSmoothing);
    }, [settings]);

    useEffect(() => {
        getDb().then((db) => {
            const juzRows = queryDb<JuzRow>(db, "SELECT * FROM juz ORDER BY juz");
            const suraNames = queryDb<SuraName>(db, "SELECT number, name_ru, name_translate FROM suras_names");
            const nameMap = Object.fromEntries(suraNames.map((s) => [s.number, s]));
            setJuzList(juzRows.map((j) => ({
                ...j,
                name_ru: nameMap[j.sura]?.name_ru ?? "",
                name_translate: nameMap[j.sura]?.name_translate ?? "",
            })));
        });
    }, []);

    const handleSelectJuz = (juz: JuzRow) => {
        setActiveSura(juz.sura);
        setActiveAyah(juz.ayah);
        setView("content");
        setListOpen(false);
    };

    const toggleBookmark = (sura: number, ayah: number) => {
        setBookmarks((prev) => {
            const exists = prev.some((b) => b.sura === sura && b.ayah === ayah);
            return exists
                ? prev.filter((b) => !(b.sura === sura && b.ayah === ayah))
                : [...prev, { sura, ayah }];
        });
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden">
            <Menu
                bookmarks={bookmarks}
                onSelectBookmark={(b) => { setActiveSura(b.sura); setActiveAyah(b.ayah); setView("content"); }}
                settings={settings}
                profile={profile}
                onLogout={logout}
                onNavigate={(n) => { setActiveSura(n); setActiveAyah(1); setView("content"); }}
                mobileOpen={menuOpen}
                onMobileClose={() => setMenuOpen(false)}
            />

            <div className="flex flex-col flex-1 h-screen transition-all duration-300 ease-in-out overflow-hidden">
                <div className="shrink-0 h-16 z-30">
                    <Navbar
                        onSelectSura={(n) => { setActiveSura(n); setActiveAyah(1); setView("content"); }}
                        onSelectAyah={(sura, ayah) => { setActiveSura(sura); setActiveAyah(ayah); setView("content"); }}
                        langs={langs}
                        onChangeLangs={setLangs}
                        settings={settings}
                        onChangeSettings={handleChangeSettings}
                        profile={profile}
                        onSetName={setName}
                        onSetAvatar={setAvatar}
                        onOpenMenu={() => setMenuOpen(true)}
                    />
                </div>

                <div className="flex flex-1 overflow-hidden relative">
                    {listOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/60 md:hidden"
                            onClick={() => setListOpen(false)}
                        />
                    )}

                    {/* Левая панель — список джузов */}
                    <div className={`
                        fixed inset-y-0 left-0 z-50 w-[85%] max-w-64 h-full bg-black transition-transform duration-300
                        md:relative md:inset-auto md:z-auto md:w-64 md:max-w-none md:translate-x-0
                        ${listOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                    `}>
                        <button
                            className="absolute top-3 right-3 z-10 md:hidden text-zinc-500 hover:text-white"
                            onClick={() => setListOpen(false)}
                        >
                            <X size={18} />
                        </button>

                        <div className="shrink-0 w-full h-full flex flex-col bg-black border-r border-[#262626]/50 overflow-hidden">
                        <div className="shrink-0 px-4 py-3 border-b border-[#262626]/50">
                            <p className="text-[#F59E0B] text-xs uppercase">Джузы</p>
                        </div>
                        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {juzList.map((j) => (
                                <button
                                    key={j.juz}
                                    onClick={() => handleSelectJuz(j)}
                                    className={`w-full flex items-center justify-between px-4 py-3 h-[80px]
                              rounded-[8px] transition-colors
                              ${view === "content" && activeSura === j.sura && activeAyah === j.ayah
                                            ? "bg-yellow-500/10 text-yellow-500 border border-[#F59E0B33]"
                                            : "text-zinc-400 hover:bg-zinc-800"
                                        }`}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="text-xs text-zinc-500">Джуз {j.juz}</span>
                                        <span className="text-sm">{j.name_ru}</span>
                                    </div>
                                    <span className="text-sm font-arabic">{j.name_translate}</span>
                                </button>
                            ))}
                        </div>
                        </div>
                    </div>

                    {/* Правая часть — контент или заглушка */}
                    <div className="flex-1 overflow-y-auto">
                        {view === "content" ? (
                            <AyahContent
                                sura={activeSura}
                                activeAyah={activeAyah}
                                player={player}
                                bookmarks={bookmarks}
                                onToggleBookmark={toggleBookmark}
                                langs={langs}
                                settings={settings}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-zinc-600 text-sm">Выберите джуз</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="shrink-0 h-16 z-30">
                    <Player player={player} />
                </div>
            </div>

            <button
                className="fixed bottom-20 right-4 z-40 md:hidden w-12 h-12 rounded-full bg-[#F59E0B] text-black flex items-center justify-center shadow-lg"
                onClick={() => setListOpen(true)}
            >
                <List size={20} />
            </button>
        </div>
    );
}
