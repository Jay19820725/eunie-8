
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

async function listMusic() {
  const rawDbUrl = process.env.DATABASE_URL;
  const connectionString = rawDbUrl || "postgresql://root:sy9aLY7vAHcEfji2U5b0R6n348kQV1NK@tpe1.clusters.zeabur.com:23833/zeabur";

  const pool = new Pool({
    connectionString,
    ssl: false,
  });

  try {
    const result = await pool.query("SELECT * FROM music_tracks ORDER BY id ASC");
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error("Error listing music:", err);
  } finally {
    await pool.end();
  }
}

listMusic();
