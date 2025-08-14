import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/schemas/*.ts',
  out: './drizzle',
  dialect: process.env.DATABASE_URL?.startsWith('sqlite:') ? 'sqlite' : 'postgresql',
  dbCredentials: process.env.DATABASE_URL?.startsWith('sqlite:') 
    ? { url: process.env.DATABASE_URL!.replace('sqlite:', '') }
    : { url: process.env.DATABASE_URL! },
  verbose: true,
  strict: true,
});