// db.js
import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect()
  .then(() => console.log("✅ Conectado ao PostgreSQL"))
  .catch(err => console.error("Erro ao conectar:", err));

module.exports = db;
