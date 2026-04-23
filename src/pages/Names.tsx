import { Menu } from "@/components/menu/Menu";
import { Navbar } from "@/components/Navbar";
import { Player } from "@/components/Player";
import { useState, useEffect } from "react";
import { usePlayer } from "@/lib/useplayer";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { useProfile } from "@/lib/useProfile";
import { getDb, queryDb } from "@/lib/db";
import { List, X } from "lucide-react";

interface NameRow {
  number: number;
  name_ar: string;
  name_ru: string;
  name_translated: string;
  description: string;
  suras_names: string;
}

export function Names() {
  const [settings, setSettings] = useState(loadSettings);
  const [menuOpen, setMenuOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [names, setNames] = useState<NameRow[]>([]);
  const [selected, setSelected] = useState<NameRow | null>(null);
  const [search, setSearch] = useState("");

  const handleChangeSettings = (s: AppSettings) => {
    setSettings(s);
    saveSettings(s);
  };
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
      const rows = queryDb<NameRow>(db, "SELECT * FROM names ORDER BY number");
      setNames(rows);
      if (rows.length > 0) setSelected(rows[0]);
    });
  }, []);

  const filtered = names.filter(
    (n) =>
      n.name_ru?.toLowerCase().includes(search.toLowerCase()) ||
      n.name_ar?.includes(search) ||
      n.name_translated?.toLowerCase().includes(search.toLowerCase()),
  );

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

        <div className="flex flex-1 overflow-hidden relative">
          {listOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setListOpen(false)}
            />
          )}

          {/* Левая панель — список имён */}
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
                <p className="text-[#F59E0B] text-xs uppercase mb-2">
                  99 имён Аллаха
                </p>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full bg-[#171717] text-zinc-300 text-xs px-3 py-2 rounded-lg border border-[#262626]/50 outline-none placeholder-zinc-600 focus:border-yellow-500/40"
                />
              </div>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {filtered.map((n) => (
                  <button
                    key={n.number}
                    onClick={() => { setSelected(n); setListOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 h-[72px]
                                        rounded-[8px] transition-colors
                                        ${
                                          selected?.number === n.number
                                            ? "bg-yellow-500/10 text-yellow-500 border border-[#F59E0B33]"
                                            : "text-zinc-400 hover:bg-zinc-800"
                                        }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600 w-5 text-right">
                      {n.number}
                    </span>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm">{n.name_ru}</span>
                      <span className="text-xs text-zinc-600">
                        {n.name_translated}
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-arabic">{n.name_ar}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Правая часть — детали имени */}
          <div className="flex-1 overflow-y-auto">
            {selected ? (
              <div className="flex flex-col items-center px-8 py-12 gap-8">
                {/* Арабское имя */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-yellow-500/10 border border-[#F59E0B33] flex items-center justify-center">
                    <span className="text-yellow-400 text-3xl font-arabic">
                      {selected.name_ar}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-2xl font-semibold">
                      {selected.name_ru}
                    </p>
                    <p className="text-zinc-500 text-sm mt-1">
                      {selected.name_translated}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-600 bg-[#171717] px-3 py-1 rounded-full border border-[#262626]/50">
                    № {selected.number} из 99
                  </span>
                </div>

                {/* Описание */}
                {selected.description && (
                  <div className="w-full max-w-xl bg-[#171717] rounded-xl px-6 py-5 border border-[#262626]/50">
                    <p className="text-[#F59E0B] text-xs uppercase mb-3">
                      Описание
                    </p>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {selected.description}
                    </p>
                  </div>
                )}

                {/* Суры */}
                {selected.suras_names && (
                  <div className="w-full max-w-xl bg-[#171717] rounded-xl px-6 py-5 border border-[#262626]/50">
                    <p className="text-[#F59E0B] text-xs uppercase mb-3">
                      Упоминается в сурах
                    </p>
                    <p className="text-zinc-300 text-sm">
                      {selected.suras_names}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-600 text-sm">Выберите имя из списка</p>
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
