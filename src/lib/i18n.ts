export type Lang = "ru" | "en" | "du";

const translations = {
  ru: {
    // Navbar
    searchPlaceholder: "Поиск по ключевому слову",
    searchSuras: "Суры",
    searchAyahs: "Аяты",
    searchNotFound: "Ничего не найдено",

    // LangsPanel
    langsTitle: "Языки",
    langAr: "Арабский",
    langRu: "Русский (Кулиев)",
    langDu: "Дунганский",

    // SettingsPanel
    settingsTitle: "Настройки",
    settingsTheme: "Тема",
    settingsDark: "Тёмная",
    settingsLight: "Светлая",
    settingsFontSize: "Размер шрифта",
    settingsInterfaceLang: "Язык интерфейса",
    settingsCompact: "Компактный режим",
    settingsSound: "Звук",
    settingsFontSmoothing: "Сглаживание шрифта",

    // Menu
    menuSurahs: "Суры",
    menuJuz: "Джуз",
    menuBookmarks: "Избранные",
    menuRecent: "Недавние",
    menuReciters: "Чтецы",
    menuDownload: "Скачать оффлайн",
    menuDownloadDone: "Скачано",
    menuDownloading: "Загрузка",
    menuHelp: "Помощь",
    menuLogout: "Выйти",
    menuLogoutConfirm: "Выйти из профиля? Имя и фото будут удалены.",
    menuNoBookmarks: "Нет избранных",
    menuAppTitle: "СВЯЩЕННЫЙ КОРАН",
    menuAppSubtitle: "с переводом",
    menuCollapse: "Свернуть",
    menuExpand: "Развернуть",

    // AyahList
    listSuras: "Список сур",
    listSura: "Сура",
    listAyah: "Аят",

    // AyahContent
    surahLabel: "СУРА",
    translationRu: "РУССКИЙ (ЭЛЬМИР КУЛИЕВ)",
    translationDu: "ДУНГАНСКИЙ (МЕС. ДИАЛЕКТ)",

    // Player
    playerQueue: "Очередь",
    playerReciter: "МИШАРИ РАШИД АЛАФАСИ",
  },

  en: {
    // Navbar
    searchPlaceholder: "Search by keyword",
    searchSuras: "Surahs",
    searchAyahs: "Ayahs",
    searchNotFound: "Nothing found",

    // LangsPanel
    langsTitle: "Languages",
    langAr: "Arabic",
    langRu: "Russian (Kuliev)",
    langDu: "Dungan",

    // SettingsPanel
    settingsTitle: "Settings",
    settingsTheme: "Theme",
    settingsDark: "Dark",
    settingsLight: "Light",
    settingsFontSize: "Font size",
    settingsInterfaceLang: "Interface language",
    settingsCompact: "Compact mode",
    settingsSound: "Sound",
    settingsFontSmoothing: "Font smoothing",

    // Menu
    menuSurahs: "Surahs",
    menuJuz: "Juz",
    menuBookmarks: "Bookmarks",
    menuRecent: "Recent",
    menuReciters: "Reciters",
    menuDownload: "Download offline",
    menuDownloadDone: "Downloaded",
    menuDownloading: "Downloading",
    menuHelp: "Help",
    menuLogout: "Logout",
    menuLogoutConfirm: "Log out? Your name and photo will be removed.",
    menuNoBookmarks: "No bookmarks",
    menuAppTitle: "HOLY QURAN",
    menuAppSubtitle: "with translation",
    menuCollapse: "Collapse",
    menuExpand: "Expand",

    // AyahList
    listSuras: "Surah list",
    listSura: "Surah",
    listAyah: "Ayah",

    // AyahContent
    surahLabel: "SURAH",
    translationRu: "RUSSIAN (ELMIR KULIEV)",
    translationDu: "DUNGAN (LOCAL DIALECT)",

    // Player
    playerQueue: "Queue",
    playerReciter: "MISHARY RASHID ALAFASY",
  },

  du: {
    // Navbar
    searchPlaceholder: "Сүзлар бәлән изляу",
    searchSuras: "Сурәләр",
    searchAyahs: "Аятлар",
    searchNotFound: "Табылмады",

    // LangsPanel
    langsTitle: "Тиллар",
    langAr: "Гәрәпчә",
    langRu: "Русча (Кулиев)",
    langDu: "Дунганча",

    // SettingsPanel
    settingsTitle: "Насройкалар",
    settingsTheme: "Тема",
    settingsDark: "Қараңғы",
    settingsLight: "Йарык",
    settingsFontSize: "Харп үлчәми",
    settingsInterfaceLang: "Интерфейс тили",
    settingsCompact: "Ихчам режим",
    settingsSound: "Авәз",
    settingsFontSmoothing: "Харп силлиги",

    // Menu
    menuSurahs: "Сурәләр",
    menuJuz: "Жуз",
    menuBookmarks: "Сақланганлар",
    menuRecent: "Йакында",
    menuReciters: "Оқучылар",
    menuDownload: "Оффлайн йүклә",
    menuDownloadDone: "Йүкләнди",
    menuDownloading: "Йүклянмәктә",
    menuHelp: "Ярдәм",
    menuLogout: "Чығу",
    menuLogoutConfirm: "Чығасызмы? Исим вә сүрәт өчүрүлидур.",
    menuNoBookmarks: "Сақланган жуқ",
    menuAppTitle: "МҮҚӘДДӘС КУРАН",
    menuAppSubtitle: "тәржүмәси билән",
    menuCollapse: "Жыйу",
    menuExpand: "Ачу",

    // AyahList
    listSuras: "Сурәләр тизими",
    listSura: "Сурә",
    listAyah: "Аят",

    // AyahContent
    surahLabel: "СУРӘ",
    translationRu: "РУСЧА (КУЛИЕВ)",
    translationDu: "ДУНГАНЧА (МЕС. ДИАЛЕКТ)",

    // Player
    playerQueue: "Навбат",
    playerReciter: "МИШАРИ РАШИД АЛАФАСИ",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function useT(lang: Lang) {
  return translations[lang] as Record<TranslationKey, string>;
}
