import { Download, X, CheckCircle, Circle, Trash2, WifiOff } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import type { Sura } from "./useDownload";
import { countCachedAyahs, deleteSuraAudio } from "./audioDb";

interface Props {
    suras: Sura[];
    onDownload: (selected: Sura[]) => void;
    onClose: () => void;
    onNavigate?: (suraNumber: number) => void;
    downloading?: boolean;
}

type CacheStatus = "full" | "partial" | "none";

export function DownloadModal({ suras, onDownload, onClose, onNavigate, downloading }: Props) {
    const [cacheMap, setCacheMap] = useState<Record<number, CacheStatus>>({});
    const [deleteMode, setDeleteMode] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [deleting, setDeleting] = useState(false);

    // Следим за сетью
    useEffect(() => {
        const on = () => setIsOnline(true);
        const off = () => setIsOnline(false);
        window.addEventListener("online", on);
        window.addEventListener("offline", off);
        return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
    }, []);

    const loadCache = useCallback(async () => {
        const entries = await Promise.all(
            suras.map(async (s) => {
                const cached = await countCachedAyahs(s.number);
                const status: CacheStatus =
                    cached === 0 ? "none" : cached >= s.ayahs_count ? "full" : "partial";
                return [s.number, status] as const;
            }),
        );
        setCacheMap(Object.fromEntries(entries));
    }, [suras]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const entries = await Promise.all(
                suras.map(async (s) => {
                    const cached = await countCachedAyahs(s.number);
                    const status: CacheStatus =
                        cached === 0 ? "none" : cached >= s.ayahs_count ? "full" : "partial";
                    return [s.number, status] as const;
                }),
            );
            if (!cancelled) setCacheMap(Object.fromEntries(entries));
        };
        load().catch(() => { });
        return () => { cancelled = true; };
    }, [suras, downloading]);

    const cachedSuras = suras.filter((s) => cacheMap[s.number] === "full");
    const notDownloaded = suras.filter((s) => cacheMap[s.number] !== "full");
    const allDone = notDownloaded.length === 0;

    const toggleSelect = (num: number) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(num) ? next.delete(num) : next.add(num);
            return next;
        });
    };

    const handleDeleteSelected = async () => {
        if (selected.size === 0) return;
        setDeleting(true);
        await Promise.all([...selected].map(n => deleteSuraAudio(n)));
        await loadCache();
        setSelected(new Set());
        setDeleteMode(false);
        setDeleting(false);
    };

    const handleSuraClick = (sura: Sura) => {
        const status = cacheMap[sura.number];
        if (deleteMode) {
            if (status === "full") toggleSelect(sura.number);
            return;
        }
        if (status === "full" && onNavigate) {
            onNavigate(sura.number);
            onClose();
            return;
        }
        if (status !== "full" && isOnline) {
            onDownload([sura]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center">
            <div className="bg-[#1c1c1c] border border-[#262626] rounded-2xl w-80 max-h-[80vh] flex flex-col shadow-2xl">
                {/* Хедер */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
                    <p className="text-[#F59E0B] text-sm font-semibold">
                        {deleteMode ? `Выбрано: ${selected.size}` : "Скачать оффлайн"}
                    </p>
                    <div className="flex items-center gap-2">
                        {cachedSuras.length > 0 && !downloading && (
                            <button
                                onClick={() => { setDeleteMode(d => !d); setSelected(new Set()); }}
                                className={`text-xs px-2 py-1 rounded-lg transition-colors ${deleteMode ? "bg-red-500/20 text-red-400" : "text-zinc-500 hover:text-red-400"}`}
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                        <button onClick={onClose} className="text-zinc-500 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Нет интернета */}
                {!isOnline && !allDone && (
                    <div className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                        <WifiOff size={13} className="shrink-0" />
                        Нет подключения к интернету
                    </div>
                )}

                {/* Кнопка удалить выбранные */}
                {deleteMode && (
                    <div className="px-3 pt-3">
                        <button
                            onClick={handleDeleteSelected}
                            disabled={selected.size === 0 || deleting}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-default transition-colors"
                        >
                            <Trash2 size={13} />
                            {deleting ? "Удаляется..." : `Удалить выбранные (${selected.size})`}
                        </button>
                    </div>
                )}

                <div className="overflow-y-auto flex-1 p-2 [&::-webkit-scrollbar]:hidden">
                    {!deleteMode && !allDone && isOnline && (
                        <button
                            onClick={() => onDownload(notDownloaded)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-yellow-400 hover:bg-yellow-500/10 transition-colors border border-yellow-600/30 mb-2"
                        >
                            <Download size={14} />
                            Скачать весь Коран ({notDownloaded.length} сур)
                        </button>
                    )}
                    {suras.map((sura) => {
                        const status = cacheMap[sura.number];
                        const isSelected = selected.has(sura.number);
                        const canNavigate = status === "full" && !deleteMode && onNavigate;
                        const canDelete = deleteMode && status === "full";
                        const canDownload = !deleteMode && status !== "full" && isOnline;

                        return (
                            <button
                                key={sura.number}
                                onClick={() => handleSuraClick(sura)}
                                disabled={deleteMode && status !== "full"}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                                    ${isSelected ? "bg-red-500/15 text-red-300" :
                                        canNavigate ? "text-green-400 hover:bg-green-500/10" :
                                            canDelete ? "text-zinc-300 hover:bg-zinc-800" :
                                                canDownload ? "text-zinc-400 hover:bg-zinc-800 hover:text-white" :
                                                    "text-zinc-600 cursor-default"}`}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    {deleteMode && status === "full" ? (
                                        <div className={`w-3 h-3 rounded-sm border shrink-0 flex items-center justify-center ${isSelected ? "bg-red-500 border-red-500" : "border-zinc-500"}`}>
                                            {isSelected && <X size={8} />}
                                        </div>
                                    ) : status === "full" ? (
                                        <CheckCircle size={12} className="text-green-500 shrink-0" />
                                    ) : status === "partial" ? (
                                        <Circle size={12} className="text-yellow-600 shrink-0" />
                                    ) : (
                                        <Circle size={12} className="text-zinc-700 shrink-0" />
                                    )}
                                    <span className="truncate">{sura.number}. {sura.name_ru}</span>
                                </div>
                                <span className="text-zinc-600 text-xs ml-2 shrink-0">{sura.name_translate}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}