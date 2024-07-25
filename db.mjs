import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise();
const db = pgp(process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres");

export const setupDb = async () => {
  try {
    await db.none(`
      DROP TABLE IF EXISTS planets;
      CREATE TABLE planets (
        id SERIAL NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        image TEXT
      )
    `);

    await db.none(`INSERT INTO planets (name) VALUES ('Earth')`);
    await db.none(`INSERT INTO planets (name) VALUES ('Mars')`);
    console.log("Database setup complete");
  } catch (error) {
    console.error("Error setting up the database:", error);
    throw error;
  }
};

export default db;
