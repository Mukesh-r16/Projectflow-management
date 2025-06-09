import { users, boards, tasks, type User, type InsertUser, type Board, type InsertBoard, type Task, type InsertTask, type TaskWithAssignee, type BoardWithTasks } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Boards
  getBoard(id: number): Promise<Board | undefined>;
  getBoardWithTasks(id: number): Promise<BoardWithTasks | undefined>;
  getAllBoards(): Promise<Board[]>;
  createBoard(board: InsertBoard): Promise<Board>;
  updateBoard(id: number, board: Partial<Board>): Promise<Board | undefined>;
  deleteBoard(id: number): Promise<boolean>;

  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  getTaskWithAssignee(id: number): Promise<TaskWithAssignee | undefined>;
  getTasksByBoard(boardId: number): Promise<TaskWithAssignee[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  updateTaskPositions(taskIds: number[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private boards: Map<number, Board>;
  private tasks: Map<number, Task>;
  private currentUserId: number;
  private currentBoardId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.boards = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentBoardId = 1;
    this.currentTaskId = 1;
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const sampleUsers: InsertUser[] = [
      { username: "sarah.wilson", password: "password", name: "Sarah Wilson", email: "sarah@company.com", avatar: null },
      { username: "mike.chen", password: "password", name: "Mike Chen", email: "mike@company.com", avatar: null },
      { username: "emma.davis", password: "password", name: "Emma Davis", email: "emma@company.com", avatar: null },
      { username: "john.doe", password: "password", name: "John Doe", email: "john@company.com", avatar: null },
      { username: "lisa.johnson", password: "password", name: "Lisa Johnson", email: "lisa@company.com", avatar: null },
    ];

    sampleUsers.forEach(user => {
      const id = this.currentUserId++;
      this.users.set(id, { ...user, id });
    });

    // Create sample boards
    const sampleBoards: InsertBoard[] = [
      { name: "Marketing Campaign", description: "Q4 marketing initiatives", color: "#0073EA", status: "active", createdBy: 1 },
      { name: "Product Development", description: "New feature development", color: "#00C875", status: "active", createdBy: 2 },
      { name: "Design System", description: "UI/UX design components", color: "#FF5AC4", status: "active", createdBy: 3 },
      { name: "Sales Pipeline", description: "Lead management and conversion", color: "#FDAB3D", status: "active", createdBy: 4 },
    ];

    sampleBoards.forEach(board => {
      const id = this.currentBoardId++;
      this.boards.set(id, { ...board, id });
    });

    // Create sample tasks for the first board
    const sampleTasks: InsertTask[] = [
      { boardId: 1, name: "Launch social media campaign", description: "Create engaging content for Q4 launch", status: "not-started", priority: "high", assigneeId: 1, dueDate: "2024-12-15", position: 0 },
      { boardId: 1, name: "Design banner assets", description: "Create visual assets for campaign", status: "completed", priority: "medium", assigneeId: 2, dueDate: "2024-12-10", position: 1, completed: true },
      { boardId: 1, name: "Write copy for landing page", description: "Create compelling copy for campaign landing", status: "in-progress", priority: "low", assigneeId: 3, dueDate: "2024-12-20", position: 2 },
      { boardId: 1, name: "Set up email automation", description: "Configure email sequences for campaign", status: "not-started", priority: "high", assigneeId: 4, dueDate: "2024-12-08", position: 3 },
      { boardId: 1, name: "Research target audience", description: "Analyze demographics and preferences", status: "completed", priority: "medium", assigneeId: 5, dueDate: "2024-12-05", position: 4, completed: true },
    ];

    sampleTasks.forEach(task => {
      const id = this.currentTaskId++;
      this.tasks.set(id, { 
        ...task, 
        id,
        description: task.description || null,
        assigneeId: task.assigneeId || null,
        dueDate: task.dueDate || null,
        startDate: task.startDate || null,
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0,
        position: task.position || 0,
        completed: task.completed || false
      });
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, avatar: insertUser.avatar || null };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Boards
  async getBoard(id: number): Promise<Board | undefined> {
    return this.boards.get(id);
  }

  async getBoardWithTasks(id: number): Promise<BoardWithTasks | undefined> {
    const board = this.boards.get(id);
    if (!board) return undefined;

    const boardTasks = await this.getTasksByBoard(id);
    return { ...board, tasks: boardTasks };
  }

  async getAllBoards(): Promise<Board[]> {
    return Array.from(this.boards.values());
  }

  async createBoard(insertBoard: InsertBoard): Promise<Board> {
    const id = this.currentBoardId++;
    const board: Board = { ...insertBoard, id, description: insertBoard.description || null };
    this.boards.set(id, board);
    return board;
  }

  async updateBoard(id: number, boardUpdate: Partial<Board>): Promise<Board | undefined> {
    const board = this.boards.get(id);
    if (!board) return undefined;

    const updatedBoard = { ...board, ...boardUpdate };
    this.boards.set(id, updatedBoard);
    return updatedBoard;
  }

  async deleteBoard(id: number): Promise<boolean> {
    return this.boards.delete(id);
  }

  // Tasks
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTaskWithAssignee(id: number): Promise<TaskWithAssignee | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const assignee = task.assigneeId ? await this.getUser(task.assigneeId) : undefined;
    return { ...task, assignee };
  }

  async getTasksByBoard(boardId: number): Promise<TaskWithAssignee[]> {
    const boardTasks = Array.from(this.tasks.values()).filter(task => task.boardId === boardId);
    
    const tasksWithAssignees = await Promise.all(
      boardTasks.map(async (task) => {
        const assignee = task.assigneeId ? await this.getUser(task.assigneeId) : undefined;
        return { ...task, assignee };
      })
    );

    return tasksWithAssignees.sort((a, b) => a.position - b.position);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id,
      description: insertTask.description || null,
      assigneeId: insertTask.assigneeId || null,
      dueDate: insertTask.dueDate || null,
      startDate: insertTask.startDate || null,
      estimatedHours: insertTask.estimatedHours || 0,
      actualHours: insertTask.actualHours || 0,
      position: insertTask.position || 0,
      completed: insertTask.completed || false
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async updateTaskPositions(taskIds: number[]): Promise<void> {
    taskIds.forEach((taskId, index) => {
      const task = this.tasks.get(taskId);
      if (task) {
        task.position = index;
        this.tasks.set(taskId, task);
      }
    });
  }
}

// Database Storage Implementation (for MySQL)
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
