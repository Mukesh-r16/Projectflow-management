import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User, Plus } from "lucide-react";
import { format } from "date-fns";
import { useUpdateTask } from "@/hooks/use-tasks";
import type { TaskWithAssignee } from "@shared/schema";

interface KanbanBoardProps {
  tasks: TaskWithAssignee[];
  onTaskClick: (task: TaskWithAssignee) => void;
  onAddTask: () => void;
}

const statusColumns = [
  { id: "not-started", title: "Not Started", color: "bg-gray-100" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-100" },
  { id: "completed", title: "Completed", color: "bg-green-100" },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function KanbanBoard({ tasks, onTaskClick, onAddTask }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<TaskWithAssignee | null>(null);
  const updateTaskMutation = useUpdateTask();

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, task: TaskWithAssignee) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== targetStatus) {
      try {
        await updateTaskMutation.mutateAsync({
          id: draggedTask.id,
          status: targetStatus,
          boardId: draggedTask.boardId
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
    setDraggedTask(null);
  };

  return (
    <div className="flex gap-6 h-full overflow-x-auto">
      {statusColumns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        
        return (
          <div
            key={column.id}
            className="flex-1 min-w-[300px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`rounded-lg ${column.color} p-4 mb-4`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg monday-dark">
                  {column.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="monday-medium">
                    {columnTasks.length}
                  </Badge>
                  {column.id === "not-started" && (
                    <Button
                      size="sm"
                      onClick={onAddTask}
                      className="bg-monday-blue hover:bg-blue-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
              {columnTasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-monday-border"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => onTaskClick(task)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium monday-dark line-clamp-2">
                        {task.name}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ml-2 ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {task.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {task.assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs monday-medium">
                              {task.assignee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(task.dueDate), 'MMM dd')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                  {column.id === "not-started" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onAddTask}
                      className="mt-2 monday-medium hover:monday-dark"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add a task
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
