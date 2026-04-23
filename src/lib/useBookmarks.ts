import { useCallback, useState } from "react";
import type { Bookmark } from "@/pages/Surahs";

const KEY = "quran_bookmarks";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Bookmark[];
  } catch {
    return [];
  }
}

function save(items: Bookmark[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(load);

  const toggleBookmark = useCallback((sura: number, ayah: number) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.sura === sura && b.ayah === ayah);
      const next = exists
        ? prev.filter((b) => !(b.sura === sura && b.ayah === ayah))
        : [...prev, { sura, ayah }].sort((a, b) => (a.sura - b.sura) || (a.ayah - b.ayah));
      save(next);
      return next;
    });
  }, []);

  const clearBookmarks = useCallback(() => {
    save([]);
    setBookmarks([]);
  }, []);

  return { bookmarks, toggleBookmark, clearBookmarks };
}
