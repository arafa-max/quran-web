import { Menu } from "@/components/menu/Menu";
import { Navbar } from "@/components/Navbar";
import { Player } from "@/components/Player";
import { AyahContent } from "@/components/AyahContent";
import { useState, useEffect } from "react";
import { usePlayer } from "@/lib/useplayer";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { useProfile } from "@/lib/useProfile";
import { useRecents } from "@/lib/useRecents";
import { List, Trash2, X } from "lucide-react";
import type { Bookmark } from "./Surahs";

export function Recents() {
    const [activeSura, setActiveSura] = useState<number | null>(null);
    const [activeAyah, setActiveAyah] = useState(1);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [langs, setLangs] = useState({ ar: true, ru: true, du: true });
    const [settings, setSettings] = useState(loadSettings);
    const [menuOpen, setMenuOpen] = useState(false);
    const [listOpen, setListOpen] = useState(true);

    const handleChangeSettings = (s: AppSettings) => { setSettings(s); saveSettings(s); };
    const player = usePlayer(settings.soundEnabled);
    const { profile, setName, setAvatar, logout } = useProfile();
    const { recents, clearRecents } = useRecents();

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("light", settings.theme === "light");
        root.classList.toggle("dark", settings.theme === "dark");
        root.setAttribute("data-fontsize", settings.fontSize);
        root.classList.toggle("compact", settings.compactMode);
        root.classList.toggle("font-smoothing-on", settings.fontSmoothing);
        root.classList.toggle("font-smoothing-off", !settings.fontSmoothing);
    }, [settings]);

    const toggleBookmark = (sura: number, ayah: number) => {
        setBookmarks((prev) => {
            const exists = prev.some((b) => b.sura === sura && b.ayah === ayah);
            return exists
                ? prev.filter((b) => !(b.sura === sura && b.ayah === ayah))
                : [...prev, { sura, ayah }];
        });
    };

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden">
            <Menu
                bookmarks={bookmarks}
                onSelectBookmark={(b) => { setActiveSura(b.sura); setActiveAyah(b.ayah); }}
                settings={settings}
                profile={profile}
                onLogout={logout}
                onNavigate={(n) => { setActiveSura(n); setActiveAyah(1); }}
                mobileOpen={menuOpen}
                onMobileClose={() => setMenuOpen(false)}
            />

            <div className="flex flex-col flex-1 h-screen transition-all duration-300 ease-in-out overflow-hidden">
                <div className="shrink-0 h-16 z-30">
                    <Navbar
                        onSelectSura={(n) => { setActiveSura(n); setActiveAyah(1); }}
                        onSelectAyah={(sura, ayah) => { setActiveSura(sura); setActiveAyah(ayah); }}
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

                    {/* Левая панель — список недавних */}
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
                        <div className="shrink-0 px-4 py-3 border-b border-[#262626]/50 flex items-center justify-between">
                            <p className="text-[#F59E0B] text-xs uppercase">Недавние</p>
                            {recents.length > 0 && (
                                <button
                                    onClick={clearRecents}
                                    className="text-zinc-600 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {recents.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-zinc-600 text-xs">История пуста</p>
                                </div>
                            ) : (
                                recents.map((r) => (
                                    <button
                                        key={`${r.sura}-${r.visitedAt}`}
                                        onClick={() => { setActiveSura(r.sura); setActiveAyah(r.ayah); setListOpen(false); }}
                                        className={`w-full flex items-center justify-between px-4 py-3 h-[80px]
                                rounded-[8px] transition-colors
                                ${activeSura === r.sura
                                                ? "bg-yellow-500/10 text-yellow-500 border border-[#F59E0B33]"
                                                : "text-zinc-400 hover:bg-zinc-800"
                                            }`}
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-xs text-zinc-500">{formatTime(r.visitedAt)}</span>
                                            <span className="text-sm">{r.name_ru}</span>
                                        </div>
                                        <span className="text-sm font-arabic">{r.name_translate}</span>
                                    </button>
                                ))
                            )}
                        </div>
                        </div>
                    </div>

                    {/* Правая часть — контент */}
                    <div className="flex-1 overflow-y-auto">
                        {activeSura ? (
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
                                <p className="text-zinc-600 text-sm">Выберите суру из истории</p>
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
