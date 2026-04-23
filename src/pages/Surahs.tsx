import { Menu } from "@/components/menu/Menu";
import { Navbar } from "@/components/Navbar";
import { Player } from "@/components/Player";
import { AyahList } from "@/components/AyahList";
import { AyahContent } from "@/components/AyahContent";
import { useState, useEffect } from "react";
import { usePlayer } from "@/lib/useplayer";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { useProfile } from "@/lib/useProfile";
import { useRecents } from "@/lib/useRecents";
import { getDb, queryDb } from "@/lib/db";
import { List, X } from "lucide-react";

export type Bookmark = { sura: number; ayah: number };

export function Surahs() {
  const [activeSura, setActiveSura] = useState(1);
  const [activeAyah, setActiveAyah] = useState(1);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [langs, setLangs] = useState({ ar: true, ru: true, du: true });
  const [settings, setSettings] = useState(loadSettings);
  const [listOpen, setListOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // мобильный drawer меню

  const handleChangeSettings = (s: AppSettings) => { setSettings(s); saveSettings(s); };
  const player = usePlayer(settings.soundEnabled);
  const { profile, setName, setAvatar, logout } = useProfile();
  const { addRecent } = useRecents();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", settings.theme === "light");
    root.classList.toggle("dark", settings.theme === "dark");
    root.setAttribute("data-fontsize", settings.fontSize);
    root.classList.toggle("compact", settings.compactMode);
    root.classList.toggle("font-smoothing-on", settings.fontSmoothing);
    root.classList.toggle("font-smoothing-off", !settings.fontSmoothing);
  }, [settings]);

  const getSuraInfo = async (n: number) => {
    const db = await getDb();
    const info = queryDb<{ name_ru: string; name_translate: string }>(
      db,
      "SELECT name_ru, name_translate FROM suras_names WHERE number = ?",
      [n]
    );
    return info[0] ?? null;
  };

  const handleSelectSura = (n: number) => {
    setActiveSura(n);
    setActiveAyah(1);
    getSuraInfo(n).then((info) => {
      if (info) addRecent({ sura: n, ayah: 1, name_ru: info.name_ru, name_translate: info.name_translate });
    });
  };

  const handleSelectSuraMobile = (n: number) => {
    handleSelectSura(n);
  };

  const handleSelectAyah = (ayah: number) => {
    setActiveAyah(ayah);
    setListOpen(false);
    getSuraInfo(activeSura).then((info) => {
      if (info) addRecent({ sura: activeSura, ayah, name_ru: info.name_ru, name_translate: info.name_translate });
    });
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

      {/* Menu — десктоп sidebar + мобильный drawer (через пропы) */}
      <Menu
        bookmarks={bookmarks}
        onSelectBookmark={(b) => { handleSelectSura(b.sura); setActiveAyah(b.ayah); }}
        settings={settings}
        profile={profile}
        onLogout={logout}
        onNavigate={handleSelectSura}
        mobileOpen={menuOpen}
        onMobileClose={() => setMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 h-screen md:transition-all md:duration-300 md:ease-in-out overflow-hidden">
        <div className="flex flex-col flex-1 h-screen overflow-hidden">
          <div className="shrink-0 h-16 z-30">
            <Navbar
              onSelectSura={handleSelectSura}
              onSelectAyah={(sura, ayah) => { handleSelectSura(sura); handleSelectAyah(ayah); }}
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

            <div className={`
              fixed inset-y-0 left-0 z-50 w-full h-full transition-transform duration-300
              md:relative md:inset-auto md:z-auto md:w-64 md:shrink-0 md:translate-x-0
              md:border-r md:border-[#262626]/50
              ${listOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
              <button
                className="absolute top-3 right-3 z-10 md:hidden text-zinc-500 hover:text-white"
                onClick={() => setListOpen(false)}
              >
                <X size={18} />
              </button>
              <AyahList
                activeSura={activeSura}
                activeAyah={activeAyah}
                onSelectSura={handleSelectSuraMobile}
                onSelectAyah={handleSelectAyah}
                settings={settings}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <AyahContent
                sura={activeSura}
                activeAyah={activeAyah}
                player={player}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
                langs={langs}
                settings={settings}
              />
            </div>
          </div>

          <div className="shrink-0 h-16 z-30">
            <Player player={player} />
          </div>
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
