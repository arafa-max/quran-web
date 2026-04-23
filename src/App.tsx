import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Surahs } from "./pages/Surahs";
import { Juz } from "./pages/Juz";
import { BookmarksPage } from "./pages/Bookmarks";
import { Reciters } from "./pages/Reciters";
import { Recents } from "./pages/Recents";
import { Help } from "./pages/Help";
import { PrayerTimes } from "./pages/Prayertimes";
import { About } from "./pages/About";
import { Names } from "./pages/Names";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Surahs />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/juz" element={<Juz />} />
          <Route path="/reciters" element={<Reciters />} />
          <Route path="/recents" element={<Recents />} />
          <Route path="/help" element={<Help />} />
          <Route path="/names" element={<Names />} />
          <Route path="/prayertimes" element={<PrayerTimes />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
