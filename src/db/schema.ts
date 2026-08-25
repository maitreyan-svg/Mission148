import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Unique Firebase / Account ID
  email: text('email').notNull(),
  username: text('username').notNull(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),
  securityQuestion: text('security_question'),
  securityAnswerHash: text('security_answer_hash'),
  targets: text('targets'), // JSON string: { jeeMainPercentile, jeeAdvancedAIR, dailyStudyHoursGoal, dailyWaterGoalMl }
  isPublic: boolean('is_public').default(true),
  avatarSeed: text('avatar_seed'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const chapters = pgTable('chapters', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  subject: text('subject').notNull(), // physics, chemistry, mathematics
  name: text('name').notNull(),
  totalLectures: integer('total_lectures').default(0).notNull(),
  completedLectures: text('completed_lectures').default('[]').notNull(), // JSON array of numbers
  pyq: text('pyq').default('{}').notNull(), // JSON: { isDone, isDetailed, total, completed, correct, incorrect }
  shortNotesMade: boolean('short_notes_made').default(false).notNull(),
  revisionCount: integer('revision_count').default(0).notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const dayLogs = pgTable('day_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  dayNumber: integer('day_number').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  targetHours: integer('target_hours').default(15).notNull(),
  actualHours: text('actual_hours').default('0').notNull(), // decimal string
  status: text('status').default('not_started').notNull(),
  notes: text('notes'),
  meals: text('meals').default('{"breakfast":false,"lunch":false,"dinner":false}').notNull(),
  waterMl: integer('water_ml').default(0).notNull(),
  chaptersStudied: text('chapters_studied').default('[]').notNull(),
  subjectHours: text('subject_hours').default('{"physics":0,"chemistry":0,"mathematics":0,"backlog":0}').notNull(),
  subjectTargetHours: text('subject_target_hours').default('{"physics":4.5,"chemistry":4.5,"mathematics":4.5,"backlog":1.5}'),
  backlogSlot: text('backlog_slot'),
  lecturesCompletedCount: integer('lectures_completed_count').default(0),
  pyqsCompletedCount: integer('pyqs_completed_count').default(0),
  revisionsLoggedCount: integer('revisions_logged_count').default(0),
  shortNotesLoggedCount: integer('short_notes_logged_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const dailyTasks = pgTable('daily_tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  dayNumber: integer('day_number').notNull(),
  subject: text('subject').notNull(),
  title: text('title').notNull(),
  completed: boolean('completed').default(false).notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const timerSessions = pgTable('timer_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  dayNumber: integer('day_number').notNull(),
  date: text('date').notNull(),
  subject: text('subject').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  chapterId: text('chapter_id'),
  chapterName: text('chapter_name'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const mockTests = pgTable('mock_tests', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  testName: text('test_name').notNull(),
  date: text('date').notNull(),
  examType: text('exam_type').notNull(),
  physicsScore: integer('physics_score').default(0).notNull(),
  chemistryScore: integer('chemistry_score').default(0).notNull(),
  mathScore: integer('math_score').default(0).notNull(),
  totalScore: integer('total_score').default(0).notNull(),
  maxScore: integer('max_score').default(300).notNull(),
  percentile: text('percentile'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});
