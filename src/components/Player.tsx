import { useState } from "react";
import {
  Repeat, Repeat1, SkipBack, Play, Pause,
  SkipForward, Shuffle, Volume2, List, X,
} from "lucide-react";
import type { usePlayer } from "@/lib/useplayer";

interface Props {
  player: ReturnType<typeof usePlayer>;
  reciterName?: string;
}

export function Player({ player, reciterName }: Props) {
  const {
    audioRef, track, queue, index, playing, progress,
    currentTime, duration, volume, repeat, shuffle,
    togglePlay, next, prev, cycleRepeat, toggleShuffle,
    removeFromQueue, onTimeUpdate, onLoadStart, onEnded,
    onProgressClick, onVolumeChange,
  } = player;

  const [showQueue, setShowQueue] = useState(false);

  return (
    // ✅ relative контейнер — queue позиционируется относительно него
    <div className="relative">
      {/* Очередь — позиционируется над плеером */}
      {showQueue && (
        <div className="absolute bottom-full right-0 w-72 max-h-96 overflow-y-auto
                        bg-[#1c1c1c] border border-[#262626] rounded-tl-xl z-50
                        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-4 py-2 border-b border-[#262626] text-xs text-zinc-400 uppercase">
            Очередь ({queue.length})
          </div>
          {queue.map((t, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-2 text-xs
                          ${i === index
                  ? "text-yellow-500 bg-yellow-500/10"
                  : "text-zinc-400 hover:bg-zinc-800"
                }`}
            >
              <span className="truncate flex-1">{t.title}</span>
              <button onClick={() => removeFromQueue(i)} className="ml-2 text-zinc-600 hover:text-white">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Плеер */}
      <div className="h-16 w-full bg-[#171717]/80 backdrop-blur-[12px]
                      border-t border-[#262626]/50 flex items-center px-4 gap-4">
        <audio
          ref={audioRef}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          onLoadStart={onLoadStart}
        />

        {/* Трек */}
        <div className="flex items-center gap-3 w-48">
          <div className="w-9 h-9 rounded bg-yellow-600/30 flex items-center justify-center">
            <span className="text-yellow-500 text-sm">♪</span>
          </div>
          <div>
            <p className="text-white text-xs font-semibold truncate max-w-[100px]">
              {track?.title ?? "—"}
            </p>
            <p className="text-zinc-500 text-xs">{track?.reciter ?? reciterName ?? "—"}</p>
          </div>
        </div>

        {/* Контролы */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button onClick={cycleRepeat} className={repeat !== "none" ? "text-yellow-500" : "text-zinc-500 hover:text-white"}>
              {repeat === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
            <button onClick={prev} className="text-zinc-500 hover:text-white">
              <SkipBack size={16} />
            </button>
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center hover:bg-yellow-400"
            >
              {playing ? <Pause size={16} className="text-black" /> : <Play size={16} className="text-black" />}
            </button>
            <button onClick={next} className="text-zinc-500 hover:text-white">
              <SkipForward size={16} />
            </button>
            <button onClick={toggleShuffle} className={shuffle ? "text-yellow-500" : "text-zinc-500 hover:text-white"}>
              <Shuffle size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-zinc-500 text-xs">{currentTime}</span>
            <div
              className="flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer"
              onClick={onProgressClick}
            >
              <div
                className="h-full bg-yellow-500 rounded-full pointer-events-none"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-zinc-500 text-xs">{duration}</span>
          </div>
        </div>

        {/* Громкость + очередь */}
        <div className="flex items-center gap-2 w-36">
          <Volume2 size={16} className="text-zinc-500" />
          <input
            type="range" min="0" max="1" step="0.01"
            value={volume} onChange={onVolumeChange}
            className="flex-1 accent-yellow-500 h-1"
          />
          <button
            onClick={() => setShowQueue((s) => !s)}
            className={showQueue ? "text-yellow-500" : "text-zinc-500 hover:text-white"}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
