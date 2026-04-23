import { Menu } from "@/components/menu/Menu";
import { Navbar } from "@/components/Navbar";
import { Player } from "@/components/Player";
import { useState, useEffect } from "react";
import { usePlayer } from "@/lib/useplayer";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { useProfile } from "@/lib/useProfile";
import { RECITERS, getReciterById } from "@/lib/reciters";
import { useT } from "@/lib/i18n";

export function Reciters() {
    const [settings, setSettings] = useState(loadSettings);
    const [menuOpen, setMenuOpen] = useState(false);
    const handleChangeSettings = (s: AppSettings) => { setSettings(s); saveSettings(s); };
    const player = usePlayer(settings.soundEnabled);
    const { profile, setName, setAvatar, logout } = useProfile();
    const t = useT(settings.interfaceLang);
    const currentReciter = getReciterById(settings.reciterId);

    const handleSelectReciter = (reciterId: string) => {
        const next = { ...settings, reciterId };
        setSettings(next);
        saveSettings(next);
    };

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("light", settings.theme === "light");
        root.classList.toggle("dark", settings.theme === "dark");
        root.setAttribute("data-fontsize", settings.fontSize);
        root.classList.toggle("compact", settings.compactMode);
        root.classList.toggle("font-smoothing-on", settings.fontSmoothing);
        root.classList.toggle("font-smoothing-off", !settings.fontSmoothing);
    }, [settings]);

    return (
        <div className="flex h-screen bg-black overflow-hidden">
            <Menu
                settings={settings}
                profile={profile}
                onLogout={logout}
                mobileOpen={menuOpen}
                onMobileClose={() => setMenuOpen(false)}
            />

            <div className="flex flex-col flex-1 h-screen transition-all duration-300 ease-in-out overflow-hidden">
                <div className="shrink-0 h-16 z-30">
                    <Navbar
                        onSelectSura={() => { }}
                        onSelectAyah={() => { }}
                        langs={{ ar: true, ru: true, du: true }}
                        onChangeLangs={() => { }}
                        settings={settings}
                        onChangeSettings={handleChangeSettings}
                        profile={profile}
                        onSetName={setName}
                        onSetAvatar={setAvatar}
                        onOpenMenu={() => setMenuOpen(true)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-6">
                            <h1 className="text-white text-2xl font-bold">{t.recitersTitle}</h1>
                            <p className="text-zinc-500 text-sm mt-1">{t.recitersSubtitle}</p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            {RECITERS.map((reciter) => {
                                const isActive = reciter.id === settings.reciterId;
                                return (
                                    <button
                                        key={reciter.id}
                                        onClick={() => handleSelectReciter(reciter.id)}
                                        className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
                                            isActive
                                                ? "border-[#F59E0B66] bg-yellow-500/10"
                                                : "border-[#262626]/50 bg-[#171717] hover:bg-zinc-800"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className={`text-sm font-semibold ${isActive ? "text-yellow-400" : "text-white"}`}>
                                                    {reciter.name}
                                                </p>
                                                <p className="text-zinc-500 text-xs mt-1">{reciter.subtitle}</p>
                                            </div>
                                            {isActive && (
                                                <span className="rounded-full bg-[#F59E0B33] px-2 py-1 text-[10px] uppercase text-yellow-400">
                                                    {t.recitersCurrent}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 h-16 z-30">
                    <Player player={player} reciterName={currentReciter.name} />
                </div>
            </div>
        </div>
    );
}
