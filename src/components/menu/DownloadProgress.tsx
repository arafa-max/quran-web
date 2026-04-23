import { Pause, Play, X } from "lucide-react";
import type { DownloadProgress as DP } from "./useDownload";

interface Props {
    progress: DP;
    pct: number;
    paused: boolean;
    onPause: () => void;
    onResume: () => void;
    onCancel: () => void;
}

export function DownloadProgress({ progress, pct, paused, onPause, onResume, onCancel }: Props) {
    return (
        <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-[12px] px-3 py-2 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-yellow-400 text-xs truncate">
                        {paused ? "⏸ Пауза" : `${pct}%`} — {progress.suraName}
                    </span>
                    <span className="text-zinc-600 text-[10px] mt-0.5">
                        {progress.suraTotal > 1
                            ? `Сура ${progress.suraIndex} из ${progress.suraTotal} · `
                            : ""}
                        {progress.loadedMb.toFixed(1)} / ~{progress.totalMb.toFixed(0)} МБ
                        {progress.skipped > 0 && ` · ${progress.skipped} пропущено`}
                    </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {paused ? (
                        <button onClick={onResume} title="Возобновить"
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40 transition-colors">
                            <Play size={12} />
                        </button>
                    ) : (
                        <button onClick={onPause} title="Пауза"
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                            <Pause size={12} />
                        </button>
                    )}
                    <button onClick={onCancel} title="Отменить"
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors">
                        <X size={12} />
                    </button>
                </div>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-100 ${paused ? "bg-zinc-500" : "bg-yellow-500"}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-zinc-600 text-xs">
                {progress.current} / {progress.total} аятов
            </span>
        </div>
    );
}