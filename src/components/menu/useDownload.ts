import { useState, useRef, useEffect } from "react";
import { saveAudio, hasAudio, clearAllAudio } from "./audioDb";

export interface Sura {
  number: number;
  name_ru: string;
  name_translate: string;
  ayahs_count: number;
}

export interface DownloadProgress {
  current: number;
  total: number;
  suraName: string;
  suraIndex: number;
  suraTotal: number;
  loadedMb: number;
  totalMb: number;
  skipped: number;
}

const AUDIO_URL = (sura: number, ayah: number) =>
  `https://everyayah.com/data/Alafasy_64kbps/${String(sura).padStart(3, "0")}${String(ayah).padStart(3, "0")}.mp3`;

const AVG_AYAH_KB = 35;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const BATCH_SIZE = 4;
const DONE_KEY = "quran-offline-done";

async function fetchWithRetry(url: string): Promise<Blob | null> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.blob();
    } catch {
      if (attempt < MAX_RETRIES - 1)
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
    }
  }
  return null;
}

const EMPTY_PROGRESS: DownloadProgress = {
  current: 0,
  total: 0,
  suraName: "",
  suraIndex: 0,
  suraTotal: 0,
  loadedMb: 0,
  totalMb: 0,
  skipped: 0,
};

export function useDownload() {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(
    () => localStorage.getItem(DONE_KEY) === "1",
  );
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress>(EMPTY_PROGRESS);

  const pauseRef = useRef(false);
  const cancelRef = useRef(false);
  // FIX: guard against double-start when Menu remounts mid-download
  const runningRef = useRef(false);

  useEffect(() => {
    if (done) localStorage.setItem(DONE_KEY, "1");
    else localStorage.removeItem(DONE_KEY);
  }, [done]);

  const start = async (selected: Sura[]) => {
    // Если уже качается — отменяем и запускаем новое
    if (runningRef.current) {
      cancelRef.current = true;
      // ждём завершения текущего цикла
      await new Promise((r) => setTimeout(r, 50));
    }
    runningRef.current = true;
    cancelRef.current = false;

    setDownloading(true);
    setDone(false);
    setPaused(false);
    pauseRef.current = false;
    cancelRef.current = false;

    const total = selected.reduce((acc, s) => acc + s.ayahs_count, 0);
    const totalMb = (total * AVG_AYAH_KB) / 1024;
    let current = 0;
    let loadedBytes = 0;
    let skipped = 0;

    outer: for (let si = 0; si < selected.length; si++) {
      if (cancelRef.current) break;
      const sura = selected[si];

      const ayahs = Array.from({ length: sura.ayahs_count }, (_, i) => i + 1);

      for (let b = 0; b < ayahs.length; b += BATCH_SIZE) {
        if (cancelRef.current) break outer;

        while (pauseRef.current) {
          await new Promise((r) => setTimeout(r, 200));
          if (cancelRef.current) break;
        }
        if (cancelRef.current) break outer;

        const batch = ayahs.slice(b, b + BATCH_SIZE);

        // FIX: count completed ayahs correctly — track per-ayah, not per-batch
        await Promise.all(
          batch.map(async (ayah) => {
            const key = `${sura.number}:${ayah}`;
            if (await hasAudio(key)) {
              skipped++;
              loadedBytes += AVG_AYAH_KB * 1024;
            } else {
              const blob = await fetchWithRetry(AUDIO_URL(sura.number, ayah));
              if (blob) {
                loadedBytes += blob.size;
                await saveAudio(key, blob);
              }
              // FIX: if blob is null (failed), we still advance current so
              // progress doesn't stall — but we don't count it as skipped
            }
            // FIX: increment atomically inside the per-ayah callback
            current = Math.min(current + 1, total);
          }),
        );

        setProgress({
          current,
          total,
          suraName: sura.name_ru,
          suraIndex: si + 1,
          suraTotal: selected.length,
          loadedMb: loadedBytes / 1024 / 1024,
          totalMb,
          skipped,
        });
      }
    }

    runningRef.current = false;
    setDownloading(false);
    if (!cancelRef.current) setDone(true);
    setPaused(false);
  };

  const pause = () => {
    pauseRef.current = true;
    setPaused(true);
  };

  const resume = () => {
    pauseRef.current = false;
    setPaused(false);
  };

  const cancel = () => {
    cancelRef.current = true;
    pauseRef.current = false;
    runningRef.current = false;
    setPaused(false);
    setDownloading(false);
    setProgress(EMPTY_PROGRESS);
  };

  const clearCache = async () => {
    await clearAllAudio();
    setDone(false);
    setProgress(EMPTY_PROGRESS);
  };

  const pct =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return {
    downloading,
    done,
    paused,
    progress,
    pct,
    start,
    pause,
    resume,
    cancel,
    clearCache,
  };
}
