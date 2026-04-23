import { useRef, useState, useCallback, useEffect } from "react";
import { getAudio } from "@/components/menu/audioDb";

export type Track = { src: string; title: string };
export type RepeatMode = "none" | "one" | "all";

// "https://everyayah.com/.../001001.mp3"  →  "1:1"
function srcToKey(src: string): string | null {
  const match = src.match(/(\d{3})(\d{3})\.mp3$/);
  if (!match) return null;
  return `${parseInt(match[1])}:${parseInt(match[2])}`;
}

// Возвращает blob URL из кэша или оригинальный src
async function resolveSrc(src: string): Promise<string> {
  const key = srcToKey(src);
  if (!key) return src;
  const blob = await getAudio(key);
  if (!blob) return src;
  return URL.createObjectURL(blob);
}

export function usePlayer(soundEnabled: boolean = true) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const blobUrlRef = useRef<string | null>(null); // чтобы revoke старый

  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [volume, setVolume] = useState(1);
  const [repeat, setRepeat] = useState<RepeatMode>("none");
  const [shuffle, setShuffle] = useState(false);

  const track = queue[index] ?? null;

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = !soundEnabled;
  }, [soundEnabled]);

  // Освобождаем blob URL при смене трека
  const revokeBlob = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  const playAt = useCallback(
    async (idx: number, q?: Track[]) => {
      const list = q ?? queue;
      if (!list[idx] || !audioRef.current) return;

      revokeBlob();
      const resolved = await resolveSrc(list[idx].src);
      // Если это новый blob URL — запомним для последующего revoke
      if (resolved !== list[idx].src) blobUrlRef.current = resolved;

      audioRef.current.src = resolved;
      audioRef.current.play().catch(() => {});
      setIndex(idx);
      setPlaying(true);
    },
    [queue],
  );

  const playTrack = useCallback(async (track: Track) => {
    setQueue([track]);
    setIndex(0);
    if (!audioRef.current) return;

    revokeBlob();
    const resolved = await resolveSrc(track.src);
    if (resolved !== track.src) blobUrlRef.current = resolved;

    audioRef.current.src = resolved;
    audioRef.current.play().catch(() => {});
    setPlaying(true);
  }, []);

  const playAll = useCallback(
    (tracks: Track[], startIndex = 0) => {
      setQueue(tracks);
      playAt(startIndex, tracks);
    },
    [playAt],
  );

  const addToQueue = useCallback((track: Track) => {
    setQueue((q) => [...q, track]);
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setPlaying((p) => !p);
  }, [playing]);

  const next = useCallback(() => {
    if (queue.length === 0) return;
    if (repeat === "one") {
      audioRef.current!.currentTime = 0;
      audioRef.current!.play().catch(() => {});
      return;
    }
    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = index + 1;
    }
    if (nextIdx >= queue.length) {
      if (repeat === "all") nextIdx = 0;
      else {
        setPlaying(false);
        return;
      }
    }
    playAt(nextIdx);
  }, [queue, index, repeat, shuffle, playAt]);

  const prev = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prevIdx = index - 1 < 0 ? queue.length - 1 : index - 1;
    playAt(prevIdx);
  }, [index, queue, playAt]);

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === "none" ? "all" : r === "all" ? "one" : "none"));
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);

  const onTimeUpdate = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    setProgress((a.currentTime / a.duration) * 100);
    setCurrentTime(fmt(a.currentTime));
    setDuration(fmt(a.duration));
  }, []);

  const onLoadStart = useCallback(() => {
    setProgress(0);
    setCurrentTime("0:00");
    setDuration("0:00");
  }, []);

  const onProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const pct = e.nativeEvent.offsetX / e.currentTarget.offsetWidth;
    if (audioRef.current)
      audioRef.current.currentTime = pct * audioRef.current.duration;
  }, []);

  const onVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      setVolume(v);
      if (audioRef.current) audioRef.current.volume = v;
    },
    [],
  );

  const removeFromQueue = useCallback(
    (idx: number) => {
      setQueue((q) => q.filter((_, i) => i !== idx));
      if (idx < index) setIndex((i) => i - 1);
    },
    [index],
  );

  return {
    audioRef,
    track,
    queue,
    index,
    playing,
    progress,
    currentTime,
    duration,
    volume,
    repeat,
    shuffle,
    playTrack,
    playAll,
    addToQueue,
    removeFromQueue,
    togglePlay,
    next,
    prev,
    cycleRepeat,
    toggleShuffle,
    onTimeUpdate,
    onLoadStart,
    onEnded: next,
    onProgressClick,
    onVolumeChange,
  };
}
