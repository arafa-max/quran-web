import { Menu } from "@/components/menu/Menu";
import { Navbar } from "@/components/Navbar";
import { Player } from "@/components/Player";
import { useState, useEffect } from "react";
import { usePlayer } from "@/lib/useplayer";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { useProfile } from "@/lib/useProfile";

export function Reciters() {
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
                bookmarks={[]}
                onSelectBookmark={() => { }}
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

                <div className="flex-1 overflow-y-auto flex items-center justify-center">
                    <p className="text-zinc-600 text-sm">Список чтецов пуст</p>
                </div>

                <div className="shrink-0 h-16 z-30">
                    <Player player={player} />
                </div>
            </div>
        </div>
    );
}
