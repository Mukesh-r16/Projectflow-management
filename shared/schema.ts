import { mysqlTable, varchar, int, boolean, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  avatar: varchar("avatar", { length: 500 }),
});

export const boards = mysqlTable("boards", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  color: varchar("color", { length: 7 }).notNull().default("#0073EA"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdBy: int("created_by").notNull(),
});

export const tasks = mysqlTable("tasks", {
  id: int("id").primaryKey().autoincrement(),
  boardId: int("board_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  status: varchar("status", { length: 50 }).notNull().default("not-started"), // not-started, in-progress, completed
  priority: varchar("priority", { length: 50 }).notNull().default("medium"), // low, medium, high
  assigneeId: int("assignee_id"),
  dueDate: varchar("due_date", { length: 10 }),
  startDate: varchar("start_date", { length: 10 }),
  estimatedHours: int("estimated_hours").default(0),
  actualHours: int("actual_hours").default(0),
  position: int("position").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
});

export const timeEntries = mysqlTable("time_entries", {
  id: int("id").primaryKey().autoincrement(),
  taskId: int("task_id").notNull(),
  userId: int("user_id").notNull(),
  description: varchar("description", { length: 1000 }),
  hours: int("hours").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertBoardSchema = createInsertSchema(boards).omit({
  id: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
}).extend({
  assigneeId: z.number().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  estimatedHours: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBoard = z.infer<typeof insertBoardSchema>;
export type Board = typeof boards.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;

export type TaskWithAssignee = Task & {
  assignee?: User;
};

export type TaskWithTimeTracking = TaskWithAssignee & {
  timeEntries?: TimeEntry[];
};

export type BoardWithTasks = Board & {
  tasks: TaskWithAssignee[];
};
