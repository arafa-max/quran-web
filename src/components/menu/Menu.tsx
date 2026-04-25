import {
    BookOpen, List, Bookmark, Clock, Mic,
    Download, HelpCircle, LogOut,
    PanelLeftClose, PanelLeftOpen, Star, Clock4, Info, X
} from "lucide-react";
import type { AppSettings } from "@/lib/settings";
import type { Profile } from "@/lib/useProfile";
import { useT } from "@/lib/i18n";
import { getDb, queryDb } from "@/lib/db";
import { useState, useCallback, useEffect } from "react";
import { useDownload } from "./useDownload";
import type { Sura } from "./useDownload";
import { DownloadProgress } from "./DownloadProgress";
import { DownloadModal } from "./DownloadModal";
import { useNavigate, useLocation } from "react-router-dom";

interface Props {
    settings: AppSettings;
    profile: Profile;
    onLogout: () => void;
    onNavigate?: (suraNumber: number) => void;
    onCollapse?: (collapsed: boolean) => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

function NavTooltip({ label }: { label: string }) {
    return (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5
                        bg-[#1c1c1c] border border-[#2a2a2a] text-zinc-200 text-xs
                        rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100
                        transition-opacity duration-150 pointer-events-none z-[9999]">
            {label}
        </div>
    );
}

interface BottomBtnProps {
    collapsed: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
    tooltip?: string;
}

function BottomBtn({ collapsed, icon, label, onClick, className = "", tooltip }: BottomBtnProps) {
    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={`flex items-center gap-3 w-full px-3 py-[13px] rounded-[10px]
                            text-[14.5px] font-semibold transition-all duration-150
                            ${collapsed ? "justify-center" : ""} ${className}`}
            >
                {icon}
                {!collapsed && <span>{label}</span>}
            </button>
            {collapsed && <NavTooltip label={tooltip ?? label} />}
        </div>
    );
}

function useModalSuras() {
    const [showModal, setShowModal] = useState(false);
    const [suras, setSuras] = useState<Sura[]>([]);

    const openModal = useCallback(async () => {
        const db = await getDb();
        const rows = queryDb<Omit<Sura, "ayahs_count">>(
            db,
            "SELECT number, name_ru, name_translate FROM suras_names ORDER BY number"
        );

        const withCounts: Sura[] = rows.map((s) => {
            const res = queryDb<{ cnt: number }>(db, `SELECT COUNT(*) as cnt FROM sura_${s.number}`);
            return { ...s, ayahs_count: res[0]?.cnt ?? 0 };
        });

        setSuras(withCounts);
        setShowModal(true);
    }, []);

    return { showModal, suras, openModal, closeModal: () => setShowModal(false) };
}

const NAV_ITEMS = [
    { icon: BookOpen, key: "SURAHS", path: "/" },
    { icon: List, key: "JUZ", path: "/juz" },
    { icon: Bookmark, key: "BOOKMARKS", path: "/bookmarks" },
    { icon: Clock, key: "RECENTS", path: "/recents" },
    { icon: Mic, key: "RECITERS", path: "/reciters" },
    { icon: Star, key: "NAMES", path: "/names" },
    { icon: Clock4, key: "PRAYERTIMES", path: "/prayertimes" },
    { icon: Info, key: "ABOUT", path: "/about" },
] as const;

const PATH_TO_KEY: Record<string, string> = {
    "/": "SURAHS",
    "/bookmarks": "BOOKMARKS",
    "/juz": "JUZ",
    "/recents": "RECENTS",
    "/reciters": "RECITERS",
    "/names": "NAMES",
    "/prayertimes": "PRAYERTIMES",
    "/about": "ABOUT",
    "/help": "HELP",
};

interface MenuLocationState {
    menuKey?: string;
}

export function Menu({
    settings,
    onLogout,
    onNavigate,
    onCollapse,
    mobileOpen = false,
    onMobileClose,
}: Props) {
    const t = useT(settings.interfaceLang);
    const location = useLocation();
    const navigate = useNavigate();
    const dl = useDownload();
    const { showModal, suras, openModal, closeModal } = useModalSuras();

    const pathname = location.pathname.toLowerCase();
    const locationState = location.state as MenuLocationState | null;
    const rootMenuKey = locationState?.menuKey;
    const routeActive = pathname === "/" && rootMenuKey === "BOOKMARKS"
        ? "BOOKMARKS"
        : (PATH_TO_KEY[pathname] ?? "SURAHS");
    const [active, setActive] = useState<string>(routeActive);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        setActive(routeActive);
    }, [pathname, routeActive]);

    // Закрывать мобильный drawer при навигации
    const handleNav = useCallback((key: string, path: string) => {
        setActive(key);
        navigate(path, { state: { menuKey: key } });
        onMobileClose?.();
    }, [navigate, onMobileClose]);

    // Блокировка скролла body на мобильном
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const handleLogout = useCallback(() => {
        if (window.confirm(t.menuLogoutConfirm ?? "Выйти из профиля?")) {
            onLogout();
        }
    }, [onLogout, t.menuLogoutConfirm]);

    const labelOf: Record<string, string> = {
        SURAHS: t.menuSurahs,
        JUZ: t.menuJuz,
        BOOKMARKS: t.menuBookmarks,
        RECENTS: t.menuRecent,
        RECITERS: t.menuReciters,
        NAMES: t.menuNames,
        PRAYERTIMES: t.menuPrayerTimes,
        ABOUT: t.menuAbout,
    };

    const sidebar = (
        <div className="w-full transition-all duration-300 ease-in-out h-full bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col">
            {/* Header */}
            <div className="px-4 pt-6 pb-5 shrink-0">
                <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                        <span className="text-yellow-400 text-sm">☽</span>
                    </div>

                    {!collapsed && (
                        <div className="overflow-hidden flex-1">
                            <p className="text-yellow-400 text-[19px] font-bold uppercase tracking-wider leading-tight whitespace-nowrap">
                                Ихляс - Шынже <br />жин
                            </p>
                            <p className="text-zinc-600 text-[10.5px] uppercase tracking-widest mt-0.5 whitespace-nowrap">
                                Священный коран с<br /> переводом
                            </p>
                        </div>
                    )}

                    {/* Кнопка закрытия только на мобильном */}
                    {!collapsed && onMobileClose && (
                        <button
                            onClick={onMobileClose}
                            className="md:hidden ml-auto p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                            aria-label="Закрыть меню"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="mx-4 h-px bg-[#1f1f1f] shrink-0" />

            {/* Навигация */}
            <nav className="flex flex-col gap-0.5 px-2.5 mt-3 flex-1 min-h-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {NAV_ITEMS.map(({ icon: Icon, key, path }) => {
                    const isActive = active === key;
                    const label = labelOf[key];

                    return (
                        <div key={key} className="relative group">
                            <button
                                onClick={() => handleNav(key, path)}
                                className={`relative flex items-center w-full gap-3 px-4 py-[13px] rounded-[10px] text-[14.5px] font-semibold transition-all duration-200
                                    ${collapsed ? "justify-center" : ""}
                                    ${isActive
                                        ? "bg-[#3a2f00] text-yellow-400"
                                        : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-zinc-200"
                                    }`}
                            >
                                {isActive && (
                                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3.5px] h-[58%] bg-yellow-400 rounded-l-full" />
                                )}

                                <Icon
                                    size={18}
                                    strokeWidth={isActive ? 2.8 : 2}
                                    className={`shrink-0 ${isActive ? "text-yellow-400" : "text-zinc-400"}`}
                                />

                                {!collapsed && (
                                    <span className={`truncate ${isActive ? "text-yellow-400" : ""}`}>
                                        {label}
                                    </span>
                                )}
                            </button>
                            {collapsed && <NavTooltip label={label} />}
                        </div>
                    );
                })}

            </nav>

            {/* Нижняя панель */}
            <div className="px-3 pb-5 flex flex-col gap-1 mt-auto shrink-0">
                <div className="mx-1 h-px bg-[#1f1f1f] mb-3" />

                {/* Скачивание */}
                {!dl.downloading && (
                    <div className="px-2 mb-2">
                        <button
                            onClick={openModal}
                            className={`flex items-center gap-3 w-full px-4 py-[13px] rounded-[10px] text-[14.5px] font-semibold transition-all duration-200
                                bg-[#3a2f00] hover:bg-[#4a3f10] text-yellow-400 border border-yellow-500/20
                                ${collapsed ? "justify-center" : ""}`}
                        >
                            <Download size={18} className="shrink-0" />
                            {!collapsed && <span>{t.menuDownload}</span>}
                        </button>
                    </div>
                )}

                {dl.downloading && !collapsed && (
                    <DownloadProgress
                        progress={dl.progress}
                        pct={dl.pct}
                        paused={dl.paused}
                        onPause={dl.pause}
                        onResume={dl.resume}
                        onCancel={dl.cancel}
                    />
                )}

                <BottomBtn
                    collapsed={collapsed}
                    icon={<HelpCircle size={17} className="shrink-0" />}
                    label={t.menuHelp}
                    onClick={() => handleNav("HELP", "/help")}
                    className={active === "HELP"
                        ? "bg-[#3a2f00] text-yellow-400"
                        : "text-zinc-500 hover:text-zinc-200 hover:bg-[#1a1a1a]"}
                />

                <BottomBtn
                    collapsed={collapsed}
                    icon={<LogOut size={17} className="shrink-0" />}
                    label={t.menuLogout}
                    onClick={handleLogout}
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                />

                <div className="mx-1 h-px bg-[#1f1f1f] my-2" />

                {/* Collapse (только десктоп) */}
                <div className="hidden md:block">
                    <BottomBtn
                        collapsed={collapsed}
                        icon={collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
                        label={t.menuCollapse}
                        tooltip={t.menuExpand}
                        onClick={() => {
                            const next = !collapsed;
                            setCollapsed(next);
                            onCollapse?.(next);
                        }}
                        className="text-zinc-600 hover:text-zinc-400 hover:bg-[#141414] font-normal"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Десктоп: сайдбар участвует в layout и не перекрывает контент */}
            <div
                className={`hidden md:block h-screen z-40 shrink-0 transition-all duration-300 ease-in-out ${
                    collapsed ? "w-[88px]" : "w-[280px]"
                }`}
            >
                {sidebar}
            </div>

            {/* Мобильный drawer */}
            <div
                className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300
                            ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
                onClick={onMobileClose}
            />

            <div
                className={`md:hidden fixed left-0 top-0 h-full z-50 w-[80%] max-w-[255px]
                            transition-transform duration-300 ease-in-out
                            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {sidebar}
            </div>

            {showModal && (
                <DownloadModal
                    suras={suras}
                    downloading={dl.downloading}
                    onDownload={dl.start}
                    onClose={closeModal}
                    onNavigate={onNavigate}
                />
            )}
        </>
    );
}
