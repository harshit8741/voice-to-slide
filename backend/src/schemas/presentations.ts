// Drizzle ORM schema for presentations and slides tables

import { pgTable, uuid, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { sqliteTable, text as sqliteText, integer as sqliteInteger } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { users } from './users';
import dotenv from 'dotenv';

dotenv.config();

const isUsingSQLite = process.env.DATABASE_URL?.startsWith('sqlite:');

// Presentations table
export const presentations = isUsingSQLite
  ? sqliteTable('presentations', {
      id: sqliteText('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
      title: sqliteText('title').notNull(),
      transcription: sqliteText('transcription').notNull(),
      userId: sqliteText('user_id').notNull(),
      createdAt: sqliteInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
      updatedAt: sqliteInteger('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    })
  : pgTable('presentations', {
      id: uuid('id').primaryKey().defaultRandom(),
      title: varchar('title', { length: 255 }).notNull(),
      transcription: text('transcription').notNull(),
      userId: uuid('user_id').notNull(),
      createdAt: timestamp('created_at').notNull().defaultNow(),
      updatedAt: timestamp('updated_at').notNull().defaultNow(),
    });

// Slides table
export const slides = isUsingSQLite
  ? sqliteTable('slides', {
      id: sqliteText('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
      presentationId: sqliteText('presentation_id').notNull(),
      title: sqliteText('title').notNull(),
      bulletPoints: sqliteText('bullet_points').notNull(), // JSON array of strings
      keyTakeaway: sqliteText('key_takeaway'),
      imageIdea: sqliteText('image_idea'),
      slideOrder: sqliteInteger('slide_order').notNull(),
      createdAt: sqliteInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
      updatedAt: sqliteInteger('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    })
  : pgTable('slides', {
      id: uuid('id').primaryKey().defaultRandom(),
      presentationId: uuid('presentation_id').notNull(),
      title: varchar('title', { length: 255 }).notNull(),
      bulletPoints: text('bullet_points').notNull(), // JSON array of strings
      keyTakeaway: text('key_takeaway'),
      imageIdea: text('image_idea'),
      slideOrder: integer('slide_order').notNull(),
      createdAt: timestamp('created_at').notNull().defaultNow(),
      updatedAt: timestamp('updated_at').notNull().defaultNow(),
    });

// Relations
export const presentationsRelations = relations(presentations, ({ one, many }) => ({
  user: one(users, {
    fields: [presentations.userId],
    references: [users.id],
  }),
  slides: many(slides),
}));

export const slidesRelations = relations(slides, ({ one }) => ({
  presentation: one(presentations, {
    fields: [slides.presentationId],
    references: [presentations.id],
  }),
}));

// Zod schemas for validation
export const insertPresentationSchema = createInsertSchema(presentations, {
  title: (schema) => schema.min(1, 'Title is required'),
  transcription: (schema) => schema.min(10, 'Transcription must be at least 10 characters'),
});

export const selectPresentationSchema = createSelectSchema(presentations);

export const insertSlideSchema = createInsertSchema(slides, {
  title: (schema) => schema.min(1, 'Slide title is required'),
  bulletPoints: (schema) => schema.min(1, 'Bullet points are required'),
  slideOrder: (schema) => schema.min(0, 'Slide order must be non-negative'),
});

export const selectSlideSchema = createSelectSchema(slides);

// Types
export type Presentation = typeof presentations.$inferSelect;
export type NewPresentation = typeof presentations.$inferInsert;
export type Slide = typeof slides.$inferSelect;
export type NewSlide = typeof slides.$inferInsert;

// Combined type for presentation with slides
export type PresentationWithSlides = Presentation & {
  slides: Slide[];
};