import { useRef, useState, useEffect } from "react";
import { Camera, X, User } from "lucide-react";
import type { Profile } from "@/lib/useProfile";
import { getInitials } from "@/lib/useProfile";

interface Props {
    profile: Profile;
    onSetName: (name: string) => void;
    onSetAvatar: (avatar: string | null) => void;
}

export function ProfilePanel({ profile, onSetName, onSetAvatar }: Props) {
    const [open, setOpen] = useState(false);
    // Контролируемый инпут — key сбрасывает его при открытии панели
    const [nameInput, setNameInput] = useState(profile.name);
    const ref = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        // Синхронизируем input с актуальным именем при открытии, а не в эффекте
        setNameInput(profile.name);
        setOpen((s) => !s);
    };

    const handleNameBlur = () => {
        onSetName(nameInput.trim());
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => onSetAvatar(reader.result as string);
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const initials = getInitials(profile.name) || "?";

    return (
        <div ref={ref} className="relative">
            {/* Кнопка-аватар в navbar */}
            <button
                onClick={handleOpen}
                className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs text-white font-bold bg-yellow-600 hover:ring-2 hover:ring-yellow-500/50 transition-all"
            >
                {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                    <span>{initials}</span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 bg-[#1c1c1c] border border-[#262626] rounded-xl p-4 z-50 w-64 shadow-xl flex flex-col gap-4">
                    <p className="text-[#F59E0B] text-xs uppercase tracking-wider">Профиль</p>

                    {/* Аватар */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative group">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-yellow-600/30 border-2 border-yellow-600/50 flex items-center justify-center">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={28} className="text-yellow-500" />
                                )}
                            </div>
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <Camera size={16} className="text-white" />
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700"
                            >
                                Загрузить фото
                            </button>
                            {profile.avatar && (
                                <button
                                    onClick={() => onSetAvatar(null)}
                                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* Имя */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-zinc-500 text-xs">Имя</span>
                        <input
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onBlur={handleNameBlur}
                            onKeyDown={(e) => e.key === "Enter" && handleNameBlur()}
                            placeholder="Введите имя..."
                            className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none border border-transparent focus:border-yellow-500/50 placeholder:text-zinc-600 transition-colors"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}