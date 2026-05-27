import pg from "pg";
import env from "./env.js";

const { Pool } = pg;

const isProduction = env.STAGE === "production";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  console.log("Database connected successfully!");
});

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
});

export default {
  query: (text: string, params: any[]) => pool.query(text, params),
  pool,
};
