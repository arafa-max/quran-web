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
    menuNames: "99 имён",
    menuPrayerTimes: "Время намазов",
    menuAbout: "Об переводе",
    menuNoReciters: "Список чтецов пуст",

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

    // Names
    namesTitle: "99 имён Аллаха",
    namesSearchPlaceholder: "Поиск...",
    namesFrom: "из 99",
    namesDescription: "Описание",
    namesMentionedIn: "Упоминается в сурах",
    namesSelectPrompt: "Выберите имя из списка",

    // PrayerTimes
    prayerTimesTitle: "Время намазов",
    prayerTimesSearchPlaceholder: "Введите город...",
    prayerTimesSearchLoading: "Поиск...",
    prayerTimesLocate: "Определить по геолокации",
    prayerTimesNext: "Следующий намаз",
    prayerTimesEmpty: "Введите город или разрешите определение геолокации",
    prayerTimesErrorLoad: "Не удалось загрузить время намазов",
    prayerTimesErrorGeoUnsupported: "Геолокация не поддерживается",
    prayerTimesErrorGeoDenied: "Не удалось получить геолокацию",
    prayerTimesErrorCityNotFound: "Город не найден",
    prayerTimesErrorSearch: "Ошибка поиска города",
    prayerFajr: "Фаджр",
    prayerSunrise: "Восход",
    prayerDhuhr: "Зухр",
    prayerAsr: "Аср",
    prayerMaghrib: "Магриб",
    prayerIsha: "Иша",

    // About
    aboutTitle: "Об переводе",
    aboutSubtitle: "Информация о переводе Корана",

    // Juz
    juzTitle: "Джузы",
    juzSelectPrompt: "Выберите джуз",
    juzStartsAt: "Начало",
    juzEndsAt: "Конец",

    // Bookmarks
    bookmarksTitle: "Избранные",
    bookmarksSubtitle: "Сохранённые аяты для быстрого доступа",
    bookmarksEmpty: "Закладок пока нет",
    bookmarksSelectPrompt: "Выберите аят из избранного",

    // Reciters
    recitersTitle: "Чтецы",
    recitersSubtitle: "Выберите чтеца для воспроизведения аятов",
    recitersCurrent: "Сейчас выбран",
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
    menuNames: "99 Names",
    menuPrayerTimes: "Prayer Times",
    menuAbout: "About Translation",
    menuNoReciters: "Reciter list is empty",

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

    // Names
    namesTitle: "99 Names of Allah",
    namesSearchPlaceholder: "Search...",
    namesFrom: "of 99",
    namesDescription: "Description",
    namesMentionedIn: "Mentioned in surahs",
    namesSelectPrompt: "Choose a name from the list",

    // PrayerTimes
    prayerTimesTitle: "Prayer Times",
    prayerTimesSearchPlaceholder: "Enter a city...",
    prayerTimesSearchLoading: "Searching...",
    prayerTimesLocate: "Detect by geolocation",
    prayerTimesNext: "Next prayer",
    prayerTimesEmpty: "Enter a city or allow geolocation",
    prayerTimesErrorLoad: "Failed to load prayer times",
    prayerTimesErrorGeoUnsupported: "Geolocation is not supported",
    prayerTimesErrorGeoDenied: "Failed to get geolocation",
    prayerTimesErrorCityNotFound: "City not found",
    prayerTimesErrorSearch: "City search error",
    prayerFajr: "Fajr",
    prayerSunrise: "Sunrise",
    prayerDhuhr: "Dhuhr",
    prayerAsr: "Asr",
    prayerMaghrib: "Maghrib",
    prayerIsha: "Isha",

    // About
    aboutTitle: "About Translation",
    aboutSubtitle: "Information about the Quran translation",

    // Juz
    juzTitle: "Juz",
    juzSelectPrompt: "Choose a juz",
    juzStartsAt: "Starts at",
    juzEndsAt: "Ends at",

    // Bookmarks
    bookmarksTitle: "Bookmarks",
    bookmarksSubtitle: "Saved ayahs for quick access",
    bookmarksEmpty: "No bookmarks yet",
    bookmarksSelectPrompt: "Choose an ayah from bookmarks",

    // Reciters
    recitersTitle: "Reciters",
    recitersSubtitle: "Choose a reciter for ayah playback",
    recitersCurrent: "Currently selected",
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
    menuNames: "99 исим",
    menuPrayerTimes: "Намаз вақти",
    menuAbout: "Тәржүмә һәққидә",
    menuNoReciters: "Оқуғучи тизими бош",

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

    // Names
    namesTitle: "Алланиң 99 исми",
    namesSearchPlaceholder: "Издәш...",
    namesFrom: "99 дин",
    namesDescription: "Тәсвир",
    namesMentionedIn: "Сүрәләрдә өтүлиду",
    namesSelectPrompt: "Тизимдин исим таллаң",

    // PrayerTimes
    prayerTimesTitle: "Намаз вақти",
    prayerTimesSearchPlaceholder: "Шәһәр киргүзүң...",
    prayerTimesSearchLoading: "Излиниватиду...",
    prayerTimesLocate: "Геолокация билән тепиш",
    prayerTimesNext: "Кейинки намаз",
    prayerTimesEmpty: "Шәһәр киргүзүң яки геолокациягә рухсәт бериң",
    prayerTimesErrorLoad: "Намаз вақтини жүкләп болмиди",
    prayerTimesErrorGeoUnsupported: "Геолокация қолланмайду",
    prayerTimesErrorGeoDenied: "Геолокацияни елиш болмиди",
    prayerTimesErrorCityNotFound: "Шәһәр тепилмиди",
    prayerTimesErrorSearch: "Шәһәр издәш хатаси",
    prayerFajr: "Фәҗр",
    prayerSunrise: "Күн чиқиш",
    prayerDhuhr: "Зуһр",
    prayerAsr: "Әср",
    prayerMaghrib: "Мәғриб",
    prayerIsha: "Хуптан",

    // About
    aboutTitle: "Тәржүмә һәққидә",
    aboutSubtitle: "Қуран тәржүмиси һәққидә учур",

    // Juz
    juzTitle: "Жузлар",
    juzSelectPrompt: "Жуз таллаң",
    juzStartsAt: "Башлиниши",
    juzEndsAt: "Ахири",

    // Bookmarks
    bookmarksTitle: "Сақланғанлар",
    bookmarksSubtitle: "Тиз етишиш үчүн сақланған аятлар",
    bookmarksEmpty: "Техи сақланған жуқ",
    bookmarksSelectPrompt: "Сақланғанлардин аят таллаң",

    // Reciters
    recitersTitle: "Оқуғучилар",
    recitersSubtitle: "Аят авәзини аңлаш үчүн оқуғучи таллаң",
    recitersCurrent: "Һазир талланған",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function useT(lang: Lang) {
  return translations[lang] as Record<TranslationKey, string>;
}
