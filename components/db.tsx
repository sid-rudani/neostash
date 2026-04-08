import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'neostash.db';

export interface PhotoMetadata {
    id: string;
    photo_path: string | null;
    audio_path: string | null;
    isLiked: number;
    title: string | null;
    note: string | null;
    embedding: any | null; // BLOB in DB
}

const deleteDbFilePath = async () => {
    try {
        const dbDir = `${FileSystem.Directory}SQLite`;
        const dbPath = `${dbDir}/${DB_NAME}`;
        const info = await FileSystem.getInfoAsync(dbPath);
        if (info.exists) {
            await FileSystem.deleteAsync(dbPath);
            console.log('Deleted malformed database file.');
        }
    } catch (e) {
        console.error('Could not delete db', e);
    }
};

export const initDb = async () => {
    try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);

        // Test query to ensure the db is not malformed
        await db.execAsync(`PRAGMA user_version;`);

        // Create the schema
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS photos (
          id TEXT PRIMARY KEY,
          photo_path TEXT,
          audio_path TEXT,
          isLiked INTEGER DEFAULT 0,
          title TEXT,
          note TEXT,
          embedding BLOB
      );

      CREATE VIRTUAL TABLE IF NOT EXISTS photos_fts USING fts5(
          id UNINDEXED, 
          title, 
          note, 
          content='photos', 
          content_rowid='rowid'
      );

      CREATE TRIGGER IF NOT EXISTS photos_ai AFTER INSERT ON photos BEGIN
          INSERT INTO photos_fts(rowid, id, title, note) VALUES (new.rowid, new.id, new.title, new.note);
      END;

      CREATE TRIGGER IF NOT EXISTS photos_ad AFTER DELETE ON photos BEGIN
          INSERT INTO photos_fts(photos_fts, rowid, id, title, note) VALUES('delete', old.rowid, old.id, old.title, old.note);
      END;

      CREATE TRIGGER IF NOT EXISTS photos_au AFTER UPDATE ON photos BEGIN
          INSERT INTO photos_fts(photos_fts, rowid, id, title, note) VALUES('delete', old.rowid, old.id, old.title, old.note);
          INSERT INTO photos_fts(rowid, id, title, note) VALUES (new.rowid, new.id, new.title, new.note);
      END;
    `);

        console.log('Database initialized successfully.');
    } catch (error: any) {
        if (error.message && error.message.includes('malformed')) {
            console.warn('Database is malformed. Recreating...');
            await deleteDbFilePath();
            await initDb(); // Retry init
        } else {
            console.error('Error during DB initialization:', error);
            throw error;
        }
    }
};

export const syncAllAssetsToDb = async (ids: string[]) => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);

    const statement = await db.prepareAsync(`
    INSERT OR IGNORE INTO photos (id) VALUES ($id);
  `);

    try {
        await db.withTransactionAsync(async () => {
            for (const id of ids) {
                await statement.executeAsync({ $id: id });
            }
        });
    } finally {
        await statement.finalizeAsync();
    }
};

export const getPhotoMetadata = async (id: string): Promise<PhotoMetadata | null> => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    const result = await db.getFirstAsync<PhotoMetadata>(
        `SELECT * FROM photos WHERE id = ?`,
        [id]
    );
    return result;
};

export const updatePhotoMetadata = async (
    id: string,
    data: { isLiked?: number; note?: string; title?: string }
) => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);

    await db.runAsync(
        `
      UPDATE photos 
      SET isLiked = COALESCE(?, isLiked), 
          note = COALESCE(?, note), 
          title = COALESCE(?, title)
      WHERE id = ?
  `,
        [
            data.isLiked !== undefined ? data.isLiked : null,
            data.note !== undefined ? data.note : null,
            data.title !== undefined ? data.title : null,
            id,
        ]
    );
};

export const searchByKeyword = async (text: string): Promise<string[]> => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);

    const escaped = text.replace(/"/g, '""');
    const query = `"${escaped}"*`; // prefix search

    const results = await db.getAllAsync<{ id: string }>(
        `SELECT id FROM photos_fts WHERE photos_fts MATCH ? ORDER BY rank`,
        [query]
    );

    return results.map((r) => r.id);
};

export const getFavoritePhotos = async (): Promise<PhotoMetadata[]> => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    const results = await db.getAllAsync<PhotoMetadata>(
        `SELECT * FROM photos WHERE isLiked = 1`
    );
    return results;
};
