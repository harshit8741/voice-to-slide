// Drizzle ORM schema for users table (supports both PostgreSQL and SQLite)

import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { sqliteTable, text as sqliteText, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Choose table type based on database URL
const isUsingSQLite = process.env.DATABASE_URL?.startsWith('sqlite:');

export const users = isUsingSQLite 
  ? sqliteTable('users', {
      id: sqliteText('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
      email: sqliteText('email').notNull().unique(),
      password: sqliteText('password'),
      firstName: sqliteText('first_name').notNull(),
      lastName: sqliteText('last_name').notNull(),
      googleId: sqliteText('google_id'),
      profilePicture: sqliteText('profile_picture'),
      authProvider: sqliteText('auth_provider').notNull().default('email'),
      createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
      updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    })
  : pgTable('users', {
      id: uuid('id').primaryKey().defaultRandom(),
      email: varchar('email', { length: 255 }).notNull().unique(),
      password: text('password'),
      firstName: varchar('first_name', { length: 100 }).notNull(),
      lastName: varchar('last_name', { length: 100 }).notNull(),
      googleId: varchar('google_id', { length: 255 }),
      profilePicture: text('profile_picture'),
      authProvider: varchar('auth_provider', { length: 50 }).notNull().default('email'),
      createdAt: timestamp('created_at').notNull().defaultNow(),
      updatedAt: timestamp('updated_at').notNull().defaultNow(),
    });

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email(),
  firstName: (schema) => schema.min(2, 'First name must be at least 2 characters'),
  lastName: (schema) => schema.min(2, 'Last name must be at least 2 characters'),
  password: (schema) => schema.min(6, 'Password must be at least 6 characters').optional(),
  authProvider: (schema) => z.enum(['email', 'google']).default('email'),
});

export const selectUserSchema = createSelectSchema(users);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;