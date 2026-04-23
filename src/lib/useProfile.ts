import { useState, useCallback } from "react";

export interface Profile {
  name: string;
  avatar: string | null;
}

const KEY = "quran_profile";
const EMPTY: Profile = { name: "", avatar: null };

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return JSON.parse(raw);
  } catch {
    return EMPTY;
  }
}

function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(loadProfile);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      saveProfile(next);
      return next;
    });
  }, []);

  const setName = useCallback(
    (name: string) => updateProfile({ name }),
    [updateProfile],
  );
  const setAvatar = useCallback(
    (avatar: string | null) => updateProfile({ avatar }),
    [updateProfile],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setProfile(EMPTY);
  }, []);

  return { profile, setName, setAvatar, logout };
}
