// lib/db/schema.ts
import { pgTable, text, timestamp, integer, varchar, boolean, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ROOMS TABLE
// ============================================

export const rooms = pgTable(
  'rooms',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 7 }).notNull().unique(),
    creator: varchar('creator', { length: 100 }).notNull(),
    duration: integer('duration').notNull(),
    participantsCount: integer('participants_count').notNull().default(5),
    messageCount: integer('message_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => [
    index('code_idx').on(table.code),
    index('expires_at_idx').on(table.expiresAt),
    index('active_idx').on(table.isActive),
  ]
);

// ============================================
// PARTICIPANTS TABLE
// ============================================

export const participants = pgTable(
  'participants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roomCode: varchar('room_code', { length: 7 })
      .notNull()
      .references(() => rooms.code, { onDelete: 'cascade' }),
    userName: varchar('user_name', { length: 100 }).notNull(),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
    isOnline: boolean('is_online').notNull().default(true),
    lastSeenAt: timestamp('last_seen_at').notNull().defaultNow(),
  },
  (table) => [
    index('participants_room_code_idx').on(table.roomCode),
    index('participants_user_name_idx').on(table.userName),
    index('participants_online_idx').on(table.isOnline),
  ]
);

// ============================================
// MESSAGES TABLE
// ============================================

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roomCode: varchar('room_code', { length: 7 })
      .notNull()
      .references(() => rooms.code, { onDelete: 'cascade' }),
    userName: varchar('user_name', { length: 100 }).notNull(),
    message: text('message').notNull(),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
  },
  (table) => [
    index('messages_room_code_idx').on(table.roomCode),
    index('messages_timestamp_idx').on(table.timestamp),
  ]
);

// ============================================
// RELATIONS
// ============================================

export const roomsRelations = relations(rooms, ({ many }) => ({
  participants: many(participants),
  messages: many(messages),
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  room: one(rooms, {
    fields: [participants.roomCode],
    references: [rooms.code],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  room: one(rooms, {
    fields: [messages.roomCode],
    references: [rooms.code],
  }),
}));

// ============================================
// TYPES
// ============================================

export type DbRoom = typeof rooms.$inferSelect;
export type DbNewRoom = typeof rooms.$inferInsert;

export type DbParticipant = typeof participants.$inferSelect;
export type DbNewParticipant = typeof participants.$inferInsert;

export type DbMessage = typeof messages.$inferSelect;
export type DbNewMessage = typeof messages.$inferInsert;