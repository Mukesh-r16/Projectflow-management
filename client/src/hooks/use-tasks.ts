import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Task, TaskWithAssignee } from "@shared/schema";

export function useTasks(boardId: number) {
  return useQuery<TaskWithAssignee[]>({
    queryKey: ["/api/boards", boardId, "tasks"],
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: (_, taskData) => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards", taskData.boardId] });
      queryClient.invalidateQueries({ queryKey: ["/api/boards", taskData.boardId, "tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...taskData }: { id: number } & any) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, taskData);
      return response.json();
    },
    onSuccess: (_, { boardId }) => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["/api/boards", boardId] });
        queryClient.invalidateQueries({ queryKey: ["/api/boards", boardId, "tasks"] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, boardId }: { taskId: number; boardId: number }) => {
      const response = await apiRequest("DELETE", `/api/tasks/${taskId}`);
      return response.json();
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards", boardId] });
      queryClient.invalidateQueries({ queryKey: ["/api/boards", boardId, "tasks"] });
    },
  });
}

export function useUpdateTaskPositions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskIds, boardId }: { taskIds: number[]; boardId: number }) => {
      const response = await apiRequest("PATCH", "/api/tasks/positions", { taskIds });
      return response.json();
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards", boardId] });
      queryClient.invalidateQueries({ queryKey: ["/api/boards", boardId, "tasks"] });
    },
  });
}

export function useUserTasks(userId: number) {
  return useQuery<TaskWithAssignee[]>({
    queryKey: ["/api/users", userId, "tasks"],
  });
}

export function useAllTasks() {
  return useQuery<TaskWithAssignee[]>({
    queryKey: ["/api/tasks"],
  });
}
