import { Menu } from "@/components/menu/Menu";
import { Navbar } from "@/components/Navbar";
import { Player } from "@/components/Player";
import { useState, useEffect, useRef } from "react";
import { usePlayer } from "@/lib/useplayer";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { useProfile } from "@/lib/useProfile";
import { useT } from "@/lib/i18n";
import { MapPin, Search } from "lucide-react";

interface PrayerTime {
  name: string;
  nameRu: string;
  time: string;
}

interface AlAdhanResponse {
  data: {
    timings: Record<string, string>;
    date: {
      readable: string;
      hijri: { date: string; month: { en: string }; year: string };
    };
    meta: { timezone: string; city: string };
  };
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const PRAYER_KEYS = [
  { key: "Fajr", labelKey: "prayerFajr" },
  { key: "Sunrise", labelKey: "prayerSunrise" },
  { key: "Dhuhr", labelKey: "prayerDhuhr" },
  { key: "Asr", labelKey: "prayerAsr" },
  { key: "Maghrib", labelKey: "prayerMaghrib" },
  { key: "Isha", labelKey: "prayerIsha" },
] as const;

export function PrayerTimes() {
  const [settings, setSettings] = useState(loadSettings);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState("");
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  const [hijriDate, setHijriDate] = useState<string | null>(null);
  const [gregorianDate, setGregorianDate] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Закрыть подсказки при клике снаружи
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = (value: string) => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&featuretype=city`,
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 350);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityInput(value);
    fetchSuggestions(value);
  };

  const fetchByCoords = async (lat: number, lon: number, cityName?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!cityName) {
        try {
        const geo = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`
);
          const data = await geo.json();
          console.log(data);
          cityName = data.name
            ?? data.address?.village
            ?? data.address?.hamlet
            ?? data.address?.town
            ?? data.address?.city
            ?? "";
        } catch {
          cityName = "";
        }
      }

      const date = new Date();
      const d = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${d}?latitude=${lat}&longitude=${lon}&method=3`,
      );
      const json: AlAdhanResponse = await res.json();
      const timings = json.data.timings;
      setPrayers(
        PRAYER_KEYS.map((p) => ({
          name: p.key,
          nameRu: t[p.labelKey],
          time: timings[p.key]?.slice(0, 5) ?? "--:--",
        })),
      );
      setHijriDate(
        `${json.data.date.hijri.date} (${json.data.date.hijri.month.en} ${json.data.date.hijri.year})`,
      );
      setGregorianDate(json.data.date.readable);
      setCurrentCity(cityName ?? "");
    } catch {
      setError(t.prayerTimesErrorLoad);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (s: NominatimResult) => {
    const cityName = s.display_name.split(",")[0];
    setCityInput(cityName);
    setShowSuggestions(false);
    setSuggestions([]);
    fetchByCoords(parseFloat(s.lat), parseFloat(s.lon), cityName);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError(t.prayerTimesErrorGeoUnsupported);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => setError(t.prayerTimesErrorGeoDenied),
    );
  };

  const handleCitySearch = async () => {
    if (!cityInput.trim()) return;
    setShowSuggestions(false);
    setLoading(true);
    setError(null);
    try {
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityInput)}&format=json&limit=1`,
      );
      const geoData: NominatimResult[] = await geo.json();
      if (!geoData.length) { setError(t.prayerTimesErrorCityNotFound); setLoading(false); return; }
      const { lat, lon, display_name } = geoData[0];
      await fetchByCoords(parseFloat(lat), parseFloat(lon), display_name.split(",")[0]);
    } catch {
      setError(t.prayerTimesErrorSearch);
      setLoading(false);
    }
  };

  const getNextPrayer = () => {
    if (!prayers.length) return null;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    for (const p of prayers) {
      if (p.name === "Sunrise") continue;
      const [h, m] = p.time.split(":").map(Number);
      if (h * 60 + m > nowMinutes) return p.name;
    }
    return prayers[0].name;
  };

  const nextPrayer = getNextPrayer();

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

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-lg mx-auto flex flex-col gap-6">
            {/* Заголовок */}
            <div>
              <h1 className="text-white text-2xl font-bold">{t.prayerTimesTitle}</h1>
              {currentCity && (
                <p className="text-zinc-500 text-sm mt-1 flex items-center gap-1">
                  <MapPin size={12} /> {currentCity}
                </p>
              )}
              {hijriDate && (
                <p className="text-zinc-600 text-xs mt-0.5">
                  {gregorianDate} · {hijriDate}
                </p>
              )}
            </div>

            {/* Поиск */}
            <div className="flex flex-col gap-2">
              <div ref={wrapperRef} className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={cityInput}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCitySearch();
                      if (e.key === "Escape") setShowSuggestions(false);
                    }}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={t.prayerTimesSearchPlaceholder}
                    className="w-full bg-[#171717] text-zinc-300 text-sm px-4 py-2.5 rounded-lg border border-[#262626]/50 outline-none placeholder-zinc-600 focus:border-yellow-500/40"
                  />

                  {/* Подсказки */}
                  {showSuggestions && (suggestions.length > 0 || suggestLoading) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#171717] border border-[#262626]/50 rounded-lg overflow-hidden z-50 shadow-xl">
                      {suggestLoading ? (
                        <div className="px-4 py-3 text-zinc-600 text-sm">{t.prayerTimesSearchLoading}</div>
                      ) : (
                        suggestions.map((s, i) => {
                          const parts = s.display_name.split(",");
                          const city = parts[0];
                          const rest = parts.slice(1, 3).join(",").trim();
                          return (
                            <button
                              key={i}
                              onMouseDown={() => handleSelectSuggestion(s)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors text-left"
                            >
                              <MapPin size={12} className="text-zinc-600 shrink-0" />
                              <div>
                                <p className="text-zinc-200 text-sm">{city}</p>
                                {rest && <p className="text-zinc-600 text-xs">{rest}</p>}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCitySearch}
                  className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-[#F59E0B33] text-yellow-500 px-4 py-2.5 rounded-lg transition-colors shrink-0"
                >
                  <Search size={16} />
                </button>
              </div>

              <button
                onClick={handleGeolocate}
                className="flex items-center justify-center gap-2 w-full bg-[#171717] hover:bg-zinc-800 border border-[#262626]/50 text-zinc-400 text-sm px-4 py-2.5 rounded-lg transition-colors"
              >
                <MapPin size={14} />
                {t.prayerTimesLocate}
              </button>
            </div>

            {/* Ошибка */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Загрузка */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
              </div>
            )}

            {/* Намазы */}
            {!loading && prayers.length > 0 && (
              <div className="flex flex-col gap-2">
                {prayers.map((p) => {
                  const isNext = p.name === nextPrayer;
                  const isSunrise = p.name === "Sunrise";
                  return (
                    <div
                      key={p.name}
                      className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-colors
                        ${isNext ? "bg-yellow-500/10 border-[#F59E0B33]" : "bg-[#171717] border-[#262626]/50"}`}
                    >
                      <div className="flex items-center gap-3">
                        {isNext && (
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                        )}
                        <div>
                          <p className={`text-sm font-medium ${isNext ? "text-yellow-400" : isSunrise ? "text-zinc-600" : "text-zinc-300"}`}>
                            {p.nameRu}
                          </p>
                          {isNext && (
                            <p className="text-xs text-yellow-500/60 mt-0.5">{t.prayerTimesNext}</p>
                          )}
                        </div>
                      </div>
                      <p className={`text-lg font-mono ${isNext ? "text-yellow-400" : isSunrise ? "text-zinc-600" : "text-zinc-300"}`}>
                        {p.time}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Пустое состояние */}
            {!loading && !prayers.length && !error && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <MapPin size={32} className="text-zinc-700" />
                <p className="text-zinc-600 text-sm text-center">
                  {t.prayerTimesEmpty}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 h-16 z-30">
          <Player player={player} />
        </div>
      </div>
    </div>
  );
}
