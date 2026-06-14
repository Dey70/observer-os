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
  db.execSync(`
    CREATE TABLE IF NOT EXISTS weight_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      weight REAL NOT NULL,
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

export const saveSession = (data, callback) => {
  try {
    db.runSync(
      `INSERT INTO sessions 
        (date, type, duration, notes, rpe)
        VALUES (?, ?, ?, ?, ?)`,
      [data.date, data.type, data.duration, data.notes, data.rpe],
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

export const getRecentSessions = (days, callback) => {
  try {
    const rows = db.getAllSync(
      `SELECT * FROM sessions ORDER BY date DESC LIMIT ?`,
      [days],
    );
    callback(rows);
  } catch (error) {
    console.log(error);
    callback([]);
  }
};

export const saveWeight = (data, callback) => {
  try {
    db.runSync(
      `INSERT OR REPLACE INTO weight_logs (date, weight) VALUES (?, ?)`,
      [data.date, data.weight],
    );
    callback(true);
  } catch (error) {
    console.log(error);
    callback(false);
  }
};

export const getRecentWeights = (days, callback) => {
  try {
    const rows = db.getAllSync(
      `SELECT * FROM weight_logs ORDER BY date DESC LIMIT ?`,
      [days],
    );
    callback(rows);
  } catch (error) {
    console.log(error);
    callback([]);
  }
};

export default db;
