import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("observeros.db");

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      sleep_hours REAL,
      sleep_quality INTEGER,
      soreness INTEGER,
      fatigue INTEGER,
      mood INTEGER,
      energy INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      duration INTEGER,
      notes TEXT,
      rpe INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const saveDailyLog = (data, callback) => {
  try {
    db.runSync(
      `INSERT INTO daily_logs 
        (date, sleep_hours, sleep_quality, soreness, fatigue, mood, energy, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.date,
        data.sleepHours,
        data.sleepQuality,
        data.soreness,
        data.fatigue,
        data.mood,
        data.energy,
        data.notes,
      ],
    );
    callback(true);
  } catch (error) {
    console.log(error);
    callback(false);
  }
};

export const getRecentLogs = (days, callback) => {
  try {
    const rows = db.getAllSync(
      `SELECT * FROM daily_logs ORDER BY date DESC LIMIT ?`,
      [days],
    );
    callback(rows);
  } catch (error) {
    console.log(error);
    callback([]);
  }
};

export default db;
