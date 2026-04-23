import { Menu } from "@/components/menu/Menu";
import { Navbar } from "@/components/Navbar";
import { Player } from "@/components/Player";
import { useState, useEffect } from "react";
import { usePlayer } from "@/lib/useplayer";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { useProfile } from "@/lib/useProfile";
import { useT } from "@/lib/i18n";

// Путь к PDF файлу — замените на реальный путь
const PDF_PATH = "/about-translation.pdf";

export function About() {
  const [settings, setSettings] = useState(loadSettings);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleChangeSettings = (s: AppSettings) => {
    setSettings(s);
    saveSettings(s);
  };
  const player = usePlayer(settings.soundEnabled);
  const { profile, setName, setAvatar, logout } = useProfile();
  const t = useT(settings.interfaceLang);

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
        onSelectBookmark={() => {}}
        settings={settings}
        profile={profile}
        onLogout={logout}
        mobileOpen={menuOpen}
        onMobileClose={() => setMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 h-screen transition-all duration-300 ease-in-out overflow-hidden">
        <div className="shrink-0 h-16 z-30">
          <Navbar
            onSelectSura={() => {}}
            onSelectAyah={() => {}}
            langs={{ ar: true, ru: true, du: true }}
            onChangeLangs={() => {}}
            settings={settings}
            onChangeSettings={handleChangeSettings}
            profile={profile}
            onSetName={setName}
            onSetAvatar={setAvatar}
            onOpenMenu={() => setMenuOpen(true)}
          />
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Заголовок */}
          <div className="shrink-0 px-8 py-4 border-b border-[#262626]/50">
            <h1 className="text-white text-xl font-bold">{t.aboutTitle}</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {t.aboutSubtitle}
            </p>
          </div>

          {/* PDF viewer */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src={`${PDF_PATH}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full h-full"
              style={{ border: "none", background: "#000" }}
              title={t.aboutTitle}
            />
          </div>
        </div>

        <div className="shrink-0 h-16 z-30">
          <Player player={player} />
        </div>
      </div>
    </div>
  );
}
