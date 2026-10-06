/**
 * CyberNex Educational Lab - Database Reset Script
 * Resets the SQLite database to its original seeded state using better-sqlite3.
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_DIR = path.join(__dirname, '..', 'database');
const DB_PATH = path.join(DB_DIR, 'cybernex.db');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');

function resetDatabase() {
  console.log('[*] Initializing CyberNex Lab Database Reset...');

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`[!] Error: Schema file not found at ${SCHEMA_PATH}`);
    process.exit(1);
  }

  // Remove existing database if present
  if (fs.existsSync(DB_PATH)) {
    try {
      fs.unlinkSync(DB_PATH);
      console.log(`[-] Removed previous database: ${DB_PATH}`);
    } catch (err) {
      console.warn(`[!] Warning removing old database (${err.message}). Overwriting...`);
    }
  }

  const db = new Database(DB_PATH);
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schemaSql);
  db.close();

  console.log('[+] Database successfully reset and seeded!');
  console.log('\n==================================================');
  console.log('   CYBERNEX LAB - DEFAULT CREDENTIALS (FAKE DATA)');
  console.log('==================================================');
  console.log('  Administrator  : admin  / AdminPassword2026!  (Role: admin)');
  console.log('  SOC Analyst    : alice  / alice_hunter2       (Role: analyst)');
  console.log('  Junior Operator: bob    / bobpassword123      (Role: user)');
  console.log('==================================================');
  console.log(`[+] Database location: ${DB_PATH}\n`);
}

if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase, DB_PATH };
