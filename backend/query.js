#!/usr/bin/env node
/**
 * Herramienta simple para ejecutar consultas sobre la base SQLite.
 * Uso:
 *   node query.js "SELECT * FROM contacts LIMIT 5"    # consulta directa
 *   node query.js stats                                 # estadísticas básicas
 *   node query.js last 10                               # últimos 10 registros
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'contacts.db');
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Uso: node query.js <SQL | stats | last [n] | count>');
  process.exit(0);
}

function openDb() {
  return new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
      console.error('Error abriendo DB:', err.message);
      process.exit(1);
    }
  });
}

function runSQL(sql) {
  const db = openDb();
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error en la consulta:', err.message);
    } else {
      console.table(rows);
    }
    db.close();
  });
}

function stats() {
  const sql = `SELECT 
      COUNT(*) total,
      COUNT(CASE WHEN date(created_at)=date('now') THEN 1 END) hoy,
      COUNT(CASE WHEN date(created_at)>=date('now','-7 days') THEN 1 END) ultimos_7_dias
    FROM contacts`;
  runSQL(sql);
}

function last(n = 5) {
  const sql = `SELECT id,name,email,subject,substr(message,1,40)||'...' AS mensaje,timestamp,created_at
               FROM contacts ORDER BY id DESC LIMIT ${Number(n)||5}`;
  runSQL(sql);
}

function count() {
  runSQL('SELECT COUNT(*) as total FROM contacts');
}

switch (args[0]) {
  case 'stats':
    stats();
    break;
  case 'last':
    last(args[1]);
    break;
  case 'count':
    count();
    break;
  default:
    runSQL(args.join(' '));
}
