import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBoardSchema, insertTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all boards
  app.get("/api/boards", async (req, res) => {
    try {
      const boards = await storage.getAllBoards();
      res.json(boards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch boards" });
    }
  });

  // Get board with tasks
  app.get("/api/boards/:id", async (req, res) => {
    try {
      const boardId = parseInt(req.params.id);
      const board = await storage.getBoardWithTasks(boardId);
      
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      res.json(board);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch board" });
    }
  });

  // Create board
  app.post("/api/boards", async (req, res) => {
    try {
      const boardData = insertBoardSchema.parse(req.body);
      const board = await storage.createBoard(boardData);
      res.status(201).json(board);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid board data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create board" });
    }
  });

  // Update board
  app.patch("/api/boards/:id", async (req, res) => {
    try {
      const boardId = parseInt(req.params.id);
      const boardData = req.body;
      const board = await storage.updateBoard(boardId, boardData);
      
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      res.json(board);
    } catch (error) {
      res.status(500).json({ message: "Failed to update board" });
    }
  });

  // Delete board
  app.delete("/api/boards/:id", async (req, res) => {
    try {
      const boardId = parseInt(req.params.id);
      const deleted = await storage.deleteBoard(boardId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      res.json({ message: "Board deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete board" });
    }
  });

  // Get tasks for a board
  app.get("/api/boards/:id/tasks", async (req, res) => {
    try {
      const boardId = parseInt(req.params.id);
      const tasks = await storage.getTasksByBoard(boardId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get tasks for a specific user
  app.get("/api/users/:id/tasks", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const boards = await storage.getAllBoards();
      const allTasks = [];
      
      for (const board of boards) {
        const boardTasks = await storage.getTasksByBoard(board.id);
        const userTasks = boardTasks.filter(task => task.assigneeId === userId);
        allTasks.push(...userTasks);
      }
      
      res.json(allTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user tasks" });
    }
  });

  // Get all tasks from all boards
  app.get("/api/tasks", async (req, res) => {
    try {
      const boards = await storage.getAllBoards();
      const allTasks = [];
      
      for (const board of boards) {
        const boardTasks = await storage.getTasksByBoard(board.id);
        allTasks.push(...boardTasks);
      }
      
      res.json(allTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all tasks" });
    }
  });

  // Create task
  app.post("/api/tasks", async (req, res) => {
    try {
      // Add default boardId if not provided
      const taskDataWithDefaults = {
        boardId: 1, // Default to first board
        ...req.body
      };
      
      const taskData = insertTaskSchema.parse(taskDataWithDefaults);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.log("Task creation error:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update task
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const taskData = req.body;
      const task = await storage.updateTask(taskId, taskData);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const deleted = await storage.deleteTask(taskId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Update task positions (for drag and drop)
  app.patch("/api/tasks/positions", async (req, res) => {
    try {
      const { taskIds } = req.body;
      if (!Array.isArray(taskIds)) {
        return res.status(400).json({ message: "taskIds must be an array" });
      }
      
      await storage.updateTaskPositions(taskIds);
      res.json({ message: "Task positions updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update task positions" });
    }
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
