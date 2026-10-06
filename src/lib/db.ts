import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY
);

const SEED_DB_PATH = path.join(process.cwd(), 'database', 'cybernex.db');
const SCHEMA_FILE_PATH = path.join(process.cwd(), 'database', 'schema.sql');
const TMP_DB_PATH = path.join('/tmp', 'cybernex.db');

function getActiveDbPath(): string {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  return isServerless ? TMP_DB_PATH : SEED_DB_PATH;
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    const activePath = getActiveDbPath();
    const dir = path.dirname(activePath);

    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        console.error('[!] Error creating database directory:', err);
      }
    }

    if (!fs.existsSync(/*turbopackIgnore: true*/ activePath)) {
      console.log(`[*] Initializing CyberNex database at: ${activePath}`);

      let copied = false;
      if (fs.existsSync(SEED_DB_PATH) && SEED_DB_PATH !== activePath) {
        try {
          fs.copyFileSync(SEED_DB_PATH, activePath);
          copied = true;
          console.log('[*] Cloned seeded database to:', activePath);
        } catch (err) {
          console.warn('[!] Could not copy pre-seeded database, initializing via schema.sql:', err);
        }
      }

      dbInstance = new Database(activePath);

      if (!copied && fs.existsSync(SCHEMA_FILE_PATH)) {
        console.log('[*] Executing schema.sql to initialize tables and synthetic records...');
        const schema = fs.readFileSync(SCHEMA_FILE_PATH, 'utf-8');
        dbInstance.exec(schema);
      }
    } else {
      dbInstance = new Database(activePath);
    }

    // Enable foreign keys
    dbInstance.pragma('foreign_keys = ON');
  }

  return dbInstance;
}

export function resetDb(): void {
  const activePath = getActiveDbPath();

  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
    dbInstance = null;
  }

  if (fs.existsSync(/*turbopackIgnore: true*/ activePath)) {
    try {
      fs.unlinkSync(activePath);
    } catch {
      // ignore
    }
  }

  if (isServerless && fs.existsSync(SEED_DB_PATH) && SEED_DB_PATH !== activePath) {
    try {
      fs.copyFileSync(SEED_DB_PATH, activePath);
      dbInstance = new Database(activePath);
      dbInstance.pragma('foreign_keys = ON');
      return;
    } catch {
      // fallback to schema
    }
  }

  const db = getDb();
  if (fs.existsSync(SCHEMA_FILE_PATH)) {
    const schema = fs.readFileSync(SCHEMA_FILE_PATH, 'utf-8');
    db.exec(schema);
  }
}

