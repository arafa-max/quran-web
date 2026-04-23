import { useState, useCallback } from "react";

export interface RecentItem {
  sura: number;
  ayah: number;
  name_ru: string;
  name_translate: string;
  visitedAt: number;
}

const KEY = "quran_recents";
const MAX = 20;

function load(): RecentItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(items: RecentItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function useRecents() {
  const [recents, setRecents] = useState<RecentItem[]>(load);

  const addRecent = useCallback((item: Omit<RecentItem, "visitedAt">) => {
    setRecents((prev) => {
      // убираем дубликат по суре
      const filtered = prev.filter((r) => r.sura !== item.sura);
      const next = [{ ...item, visitedAt: Date.now() }, ...filtered].slice(
        0,
        MAX,
      );
      save(next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    save([]);
    setRecents([]);
  }, []);

  return { recents, addRecent, clearRecents };
}
