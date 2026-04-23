import initSqlJs from "@jlongster/sql.js";
import type { Database, SqlValue } from "sql.js";

let db: Database | null = null;
const allAyahs: { sura: number; ayah: number; text_ru: string }[] = [];

// 30 джузов — начало каждого (сура, аят)
const JUZ_DATA = [
  { juz: 1, sura: 1, ayah: 1 },
  { juz: 2, sura: 2, ayah: 142 },
  { juz: 3, sura: 2, ayah: 253 },
  { juz: 4, sura: 3, ayah: 92 },
  { juz: 5, sura: 4, ayah: 24 },
  { juz: 6, sura: 4, ayah: 148 },
  { juz: 7, sura: 5, ayah: 82 },
  { juz: 8, sura: 6, ayah: 111 },
  { juz: 9, sura: 7, ayah: 87 },
  { juz: 10, sura: 8, ayah: 41 },
  { juz: 11, sura: 9, ayah: 93 },
  { juz: 12, sura: 11, ayah: 6 },
  { juz: 13, sura: 12, ayah: 53 },
  { juz: 14, sura: 15, ayah: 1 },
  { juz: 15, sura: 17, ayah: 1 },
  { juz: 16, sura: 18, ayah: 75 },
  { juz: 17, sura: 21, ayah: 1 },
  { juz: 18, sura: 23, ayah: 1 },
  { juz: 19, sura: 25, ayah: 21 },
  { juz: 20, sura: 27, ayah: 56 },
  { juz: 21, sura: 29, ayah: 46 },
  { juz: 22, sura: 33, ayah: 31 },
  { juz: 23, sura: 36, ayah: 28 },
  { juz: 24, sura: 39, ayah: 32 },
  { juz: 25, sura: 41, ayah: 47 },
  { juz: 26, sura: 46, ayah: 1 },
  { juz: 27, sura: 51, ayah: 31 },
  { juz: 28, sura: 58, ayah: 1 },
  { juz: 29, sura: 67, ayah: 1 },
  { juz: 30, sura: 78, ayah: 1 },
];

function initJuzTable(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS juz (
      juz     INTEGER PRIMARY KEY,
      sura    INTEGER NOT NULL,
      ayah    INTEGER NOT NULL
    )
  `);
  const count = queryDb<{ cnt: number }>(
    database,
    "SELECT COUNT(*) as cnt FROM juz",
  );
  if (count[0]?.cnt === 0) {
    const stmt = database.prepare(
      "INSERT INTO juz (juz, sura, ayah) VALUES (?, ?, ?)",
    );
    JUZ_DATA.forEach(({ juz, sura, ayah }) => stmt.run([juz, sura, ayah]));
    stmt.free();
  }
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@jlongster/sql.js/dist/${file}`,
  });

  const res = await fetch("/quran_dng.db");
  const buf = await res.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buf));

  // ✅ Создаём таблицу джузов при каждой загрузке БД
  initJuzTable(db);

  return db;
}

export function queryDb<T = Record<string, unknown>>(
  db: Database,
  sql: string,
  params: SqlValue[] = [],
): T[] {
  const result = db.exec(sql, params);
  if (!result.length) return [];

  const { columns, values } = result[0];
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]])),
  ) as T[];
}

export async function loadAllAyahs() {
  if (allAyahs.length) return allAyahs;
  const database = await getDb();
  for (let i = 1; i <= 114; i++) {
    try {
      const rows = queryDb<{ number: number; text_ru: string }>(
        database,
        `SELECT number, text_ru FROM sura_${i}`,
      );
      rows.forEach((r) =>
        allAyahs.push({ sura: i, ayah: r.number, text_ru: r.text_ru }),
      );
    } catch {
      /* skip */
    }
  }
  return allAyahs;
}

export function searchAyahs(query: string) {
  const q = query.toLowerCase();
  return allAyahs
    .filter((a) => a.text_ru?.toLowerCase().includes(q))
    .slice(0, 5);
}
