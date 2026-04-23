import { Settings, Sun, Moon, Type, Globe, Volume2, LayoutList, Sparkles } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import type { AppSettings } from "@/lib/settings";
import type { TranslationKey } from "@/lib/i18n";

interface Props {
    settings: AppSettings;
    onChangeSettings: (s: AppSettings) => void;
    t: Record<TranslationKey, string>;
}

const FONT_SIZES = ["sm", "md", "lg", "xl"] as const;
const INTERFACE_LANGS = [
    { key: "ru" as const, label: "Русский" },
    { key: "en" as const, label: "English" },
    { key: "du" as const, label: "Кыргызский" },
];

export function SettingsPanel({ settings, onChangeSettings, t }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const set = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) =>
        onChangeSettings({ ...settings, [key]: val });

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((s) => !s)}
                className={open ? "text-yellow-500" : "text-[#A3A3A3] hover:text-white transition-colors"}
            >
                <Settings size={18} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 bg-[#1c1c1c] border border-[#262626] rounded-xl p-4 z-50 w-64 shadow-xl flex flex-col gap-4">
                    <p className="text-[#F59E0B] text-xs uppercase tracking-wider">{t.settingsTitle}</p>

                    {/* Тема */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                            <Sun size={12} /> {t.settingsTheme}
                        </span>
                        <div className="flex gap-2">
                            {(["dark", "light"] as const).map((theme) => (
                                <button
                                    key={theme}
                                    onClick={() => set("theme", theme)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${settings.theme === theme
                                        ? "bg-yellow-500 text-black"
                                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                        }`}
                                >
                                    {theme === "dark"
                                        ? <><Moon size={10} className="inline mr-1" />{t.settingsDark}</>
                                        : <><Sun size={10} className="inline mr-1" />{t.settingsLight}</>
                                    }
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Размер шрифта */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                            <Type size={12} /> {t.settingsFontSize}
                        </span>
                        <div className="flex gap-1.5">
                            {FONT_SIZES.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => set("fontSize", size)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${settings.fontSize === size
                                        ? "bg-yellow-500 text-black"
                                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                        }`}
                                >
                                    {size.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Язык интерфейса */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                            <Globe size={12} /> {t.settingsInterfaceLang}
                        </span>
                        <div className="flex flex-col gap-1">
                            {INTERFACE_LANGS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => set("interfaceLang", key)}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${settings.interfaceLang === key
                                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                                        : "text-zinc-400 hover:bg-zinc-800"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Тогглы */}
                    <div className="flex flex-col gap-2 border-t border-[#262626] pt-3">
                        {([
                            { key: "compactMode" as const, icon: <LayoutList size={12} />, label: t.settingsCompact },
                            { key: "soundEnabled" as const, icon: <Volume2 size={12} />, label: t.settingsSound },
                            { key: "fontSmoothing" as const, icon: <Sparkles size={12} />, label: t.settingsFontSmoothing },
                        ]).map(({ key, icon, label }) => (
                            <label key={key} className="flex items-center justify-between cursor-pointer">
                                <span className="text-zinc-400 text-xs flex items-center gap-1.5">{icon}{label}</span>
                                <div
                                    onClick={() => set(key, !settings[key])}
                                    className={`w-8 h-4 rounded-full transition-colors relative ${settings[key] ? "bg-yellow-500" : "bg-zinc-700"
                                        }`}
                                >
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${settings[key] ? "left-4" : "left-0.5"
                                        }`} />
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}