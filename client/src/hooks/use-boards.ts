import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Board, BoardWithTasks, User } from "@shared/schema";

export function useBoards() {
  return useQuery<Board[]>({
    queryKey: ["/api/boards"],
  });
}

export function useBoardWithTasks(boardId: number) {
  return useQuery<BoardWithTasks>({
    queryKey: ["/api/boards", boardId],
  });
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["/api/users"],
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (boardData: any) => {
      const response = await apiRequest("POST", "/api/boards", boardData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...boardData }: { id: number } & any) => {
      const response = await apiRequest("PATCH", `/api/boards/${id}`, boardData);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/boards", id] });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (boardId: number) => {
      const response = await apiRequest("DELETE", `/api/boards/${boardId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
    },
  });
}
