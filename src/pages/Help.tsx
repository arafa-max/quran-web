import { Menu } from "@/components/menu/Menu";
import { Navbar } from "@/components/Navbar";
import { Player } from "@/components/Player";
import { useState, useEffect } from "react";
import { usePlayer } from "@/lib/useplayer";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { useProfile } from "@/lib/useProfile";
import { getReciterById } from "@/lib/reciters";

export function Help() {
    const [settings, setSettings] = useState(loadSettings);
    const [menuOpen, setMenuOpen] = useState(false);
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

                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <h1 className="text-white text-2xl font-bold mb-6">Помощь</h1>
                    <div className="flex flex-col gap-4 max-w-xl">
                        {[
                            { q: "Как скачать суры офлайн?", a: "Нажмите кнопку «Скачать оффлайн» в меню слева и выберите нужные суры." },
                            { q: "Как добавить аят в избранное?", a: "Нажмите на иконку закладки рядом с аятом." },
                            { q: "Как изменить язык интерфейса?", a: "Откройте настройки (иконка шестерёнки) и выберите язык." },
                            { q: "Как включить компактный режим?", a: "В настройках включите тумблер «Компактный режим»." },
                        ].map(({ q, a }) => (
                            <div key={q} className="bg-[#171717] rounded-xl px-5 py-4 border border-[#262626]/50">
                                <p className="text-yellow-400 text-sm font-semibold mb-1">{q}</p>
                                <p className="text-zinc-400 text-sm">{a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="shrink-0 h-16 z-30">
                    <Player player={player} reciterName={getReciterById(settings.reciterId).name} />
                </div>
            </div>
        </div>
    );
}
