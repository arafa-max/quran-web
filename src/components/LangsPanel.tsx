import { Languages } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import type { TranslationKey } from "@/lib/i18n";

interface Props {
    langs: { ar: boolean; ru: boolean; du: boolean };
    onChangeLangs: (langs: { ar: boolean; ru: boolean; du: boolean }) => void;
    t: Record<TranslationKey, string>;
}

export function LangsPanel({ langs, onChangeLangs, t }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const LANG_OPTIONS = [
        { key: "ar" as const, label: t.langAr },
        { key: "ru" as const, label: t.langRu },
        { key: "du" as const, label: t.langDu },
    ];

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((s) => !s)}
                className={open ? "text-yellow-500" : "text-[#A3A3A3] hover:text-white transition-colors"}
            >
                <Languages size={18} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 bg-[#1c1c1c] border border-[#262626] rounded-xl p-3 flex flex-col gap-2 z-50 w-48 shadow-xl">
                    <p className="text-[#F59E0B] text-xs uppercase mb-1">{t.langsTitle}</p>
                    {LANG_OPTIONS.map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={langs[key]}
                                onChange={(e) => onChangeLangs({ ...langs, [key]: e.target.checked })}
                                className="accent-yellow-500"
                            />
                            <span className="text-zinc-400 text-sm">{label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}