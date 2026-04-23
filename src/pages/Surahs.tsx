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

export type Bookmark = { sura: number; ayah: number };

const MENU_W = { expanded: 255, collapsed: 76 };

export function Surahs() {
  const [activeSura, setActiveSura] = useState(1);
  const [activeAyah, setActiveAyah] = useState(1);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [langs, setLangs] = useState({ ar: true, ru: true, du: true });
  const [settings, setSettings] = useState(loadSettings);
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  const handleChangeSettings = (s: AppSettings) => { setSettings(s); saveSettings(s); };
  const player = usePlayer(settings.soundEnabled);
  const { profile, setName, setAvatar, logout } = useProfile();
  const { addRecent } = useRecents();

  const menuW = menuCollapsed ? MENU_W.collapsed : MENU_W.expanded;

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

  const handleSelectAyah = (ayah: number) => {
    setActiveAyah(ayah);
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
      <Menu
        bookmarks={bookmarks}
        onSelectBookmark={(b) => { handleSelectSura(b.sura); setActiveAyah(b.ayah); }}
        settings={settings}
        profile={profile}
        onLogout={logout}
        onNavigate={handleSelectSura}
        onCollapse={setMenuCollapsed}
      />

      <div
        style={{ marginLeft: menuW }}
        className="flex flex-col flex-1 h-screen transition-all duration-300 ease-in-out overflow-hidden"
      >
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
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="shrink-0 w-64 h-full overflow-hidden border-r border-[#262626]/50">
            <AyahList
              activeSura={activeSura}
              activeAyah={activeAyah}
              onSelectSura={handleSelectSura}
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
  );
}