import { Menu } from "@/components/menu/Menu";
import { Navbar } from "@/components/Navbar";
import { Player } from "@/components/Player";
import { AyahContent } from "@/components/AyahContent";
import { useState, useEffect } from "react";
import { usePlayer } from "@/lib/useplayer";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { useProfile } from "@/lib/useProfile";
import { useBookmarks } from "@/lib/useBookmarks";
import { getReciterById } from "@/lib/reciters";
import { useT } from "@/lib/i18n";
import { getDb, queryDb } from "@/lib/db";
import { List, Trash2, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import type { Bookmark } from "./Surahs";

interface BookmarkRow extends Bookmark {
  name_ru: string;
  name_translate: string;
}

export function BookmarksPage() {
  const [activeSura, setActiveSura] = useState<number | null>(null);
  const [activeAyah, setActiveAyah] = useState(1);
  const [langs, setLangs] = useState({ ar: true, ru: true, du: true });
  const [settings, setSettings] = useState(loadSettings);
  const [menuOpen, setMenuOpen] = useState(false);
  const [listOpen, setListOpen] = useState(true);
  const [bookmarkRows, setBookmarkRows] = useState<BookmarkRow[]>([]);

  const handleChangeSettings = (s: AppSettings) => { setSettings(s); saveSettings(s); };
  const player = usePlayer(settings.soundEnabled);
  const { profile, setName, setAvatar, logout } = useProfile();
  const { bookmarks, toggleBookmark, clearBookmarks } = useBookmarks();
  const t = useT(settings.interfaceLang);
  const location = useLocation();

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
      const rows = bookmarks.map((bookmark) => {
        const info = queryDb<{ name_ru: string; name_translate: string }>(
          db,
          "SELECT name_ru, name_translate FROM suras_names WHERE number = ?",
          [bookmark.sura],
        )[0];

        return {
          ...bookmark,
          name_ru: info?.name_ru ?? `${t.listSura} ${bookmark.sura}`,
          name_translate: info?.name_translate ?? "",
        };
      });
      setBookmarkRows(rows);
    });
  }, [bookmarks, t.listSura]);

  useEffect(() => {
    const state = location.state as { bookmark?: Bookmark } | null;
    if (state?.bookmark) {
      setActiveSura(state.bookmark.sura);
      setActiveAyah(state.bookmark.ayah);
      return;
    }

    if (!activeSura && bookmarks.length > 0) {
      setActiveSura(bookmarks[0].sura);
      setActiveAyah(bookmarks[0].ayah);
    }

    if (bookmarks.length === 0) {
      setActiveSura(null);
      setActiveAyah(1);
    }
  }, [location.state, bookmarks, activeSura]);

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Menu
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
                <div>
                  <p className="text-[#F59E0B] text-xs uppercase">{t.bookmarksTitle}</p>
                  <p className="text-zinc-600 text-[11px] mt-1">{t.bookmarksSubtitle}</p>
                </div>
                {bookmarks.length > 0 && (
                  <button
                    onClick={clearBookmarks}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {bookmarkRows.length === 0 ? (
                  <div className="flex items-center justify-center h-full px-4">
                    <p className="text-zinc-600 text-xs text-center">{t.bookmarksEmpty}</p>
                  </div>
                ) : (
                  bookmarkRows.map((bookmark) => (
                    <button
                      key={`${bookmark.sura}-${bookmark.ayah}`}
                      onClick={() => { setActiveSura(bookmark.sura); setActiveAyah(bookmark.ayah); setListOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 min-h-[80px]
                        rounded-[8px] transition-colors
                        ${activeSura === bookmark.sura && activeAyah === bookmark.ayah
                          ? "bg-yellow-500/10 text-yellow-500 border border-[#F59E0B33]"
                          : "text-zinc-400 hover:bg-zinc-800"
                        }`}
                    >
                      <div className="flex flex-col items-start gap-1 text-left">
                        <span className="text-xs text-zinc-500">
                          {t.listSura} {bookmark.sura}, {t.listAyah} {bookmark.ayah}
                        </span>
                        <span className="text-sm">{bookmark.name_ru}</span>
                      </div>
                      <span className="text-sm font-arabic">{bookmark.name_translate}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

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
                <p className="text-zinc-600 text-sm">{t.bookmarksSelectPrompt}</p>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 h-16 z-30">
          <Player player={player} reciterName={getReciterById(settings.reciterId).name} />
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
