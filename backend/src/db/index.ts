// Database connection and configuration

import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import * as usersSchema from '../schemas/users';
import * as presentationsSchema from '../schemas/presentations';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const schema = { ...usersSchema, ...presentationsSchema };

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Initialize database connection based on URL
const connectionString = process.env.DATABASE_URL;

type DatabaseType = PostgresJsDatabase<typeof schema> | BetterSQLite3Database<typeof schema>;

let db: DatabaseType;

if (connectionString.startsWith('sqlite:')) {
  // SQLite connection
  const dbPath = connectionString.replace('sqlite:', '');
  const sqlite = new Database(dbPath);
  db = drizzleSqlite(sqlite, { schema }) as BetterSQLite3Database<typeof schema>;
} else {
  // PostgreSQL connection
  const client = postgres(connectionString, { 
    ssl: connectionString.includes('sslmode=require') ? 'require' : false,
    max: 1 
  });
  db = drizzle(client, { schema }) as PostgresJsDatabase<typeof schema>;
}

export { db };
export * from '../schemas/users';
export * from '../schemas/presentations';