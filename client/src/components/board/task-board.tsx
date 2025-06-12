import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/constants";
import type { TaskWithAssignee } from "@shared/schema";
import { useState } from "react";

interface TaskBoardProps {
  tasks: TaskWithAssignee[];
  onTaskClick: (task: TaskWithAssignee) => void;
  onAddTask: () => void;
}

export default function TaskBoard({ tasks, onTaskClick, onAddTask }: TaskBoardProps) {
  // Ensure tasks is always an array
  const taskList = tasks || [];
  
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...taskList].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any = a[sortField as keyof TaskWithAssignee];
    let bValue: any = b[sortField as keyof TaskWithAssignee];
    
    // Handle special cases
    if (sortField === 'assignee') {
      aValue = a.assignee?.name || '';
      bValue = b.assignee?.name || '';
    } else if (sortField === 'priority') {
      const priorityOrder = { "high": 3, "medium": 2, "low": 1 };
      aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    } else if (sortField === 'dueDate') {
      aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };
  
  const getStatusConfig = (status: string) => {
    return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0];
  };

  const getPriorityConfig = (priority: string) => {
    return PRIORITY_OPTIONS.find(option => option.value === priority) || PRIORITY_OPTIONS[1];
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const today = new Date();
    const isOverdue = date < today;
    
    const formatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    return {
      formatted,
      isOverdue,
      className: isOverdue ? "monday-red" : "monday-dark"
    };
  };

  return (
    <div className="bg-white rounded-lg border border-monday-border overflow-hidden">
      {/* Board Table Header */}
      <div className="border-b border-monday-border bg-gray-50">
        <div className="grid grid-cols-12 gap-4 p-4 text-sm font-semibold monday-medium">
          <div 
            className="col-span-4 flex items-center cursor-pointer hover:text-monday-blue transition-colors"
            onClick={() => handleSort('name')}
          >
            Task
            {getSortIcon('name')}
          </div>
          <div 
            className="col-span-2 flex items-center cursor-pointer hover:text-monday-blue transition-colors"
            onClick={() => handleSort('assignee')}
          >
            Assignee
            {getSortIcon('assignee')}
          </div>
          <div 
            className="col-span-2 flex items-center cursor-pointer hover:text-monday-blue transition-colors"
            onClick={() => handleSort('status')}
          >
            Status
            {getSortIcon('status')}
          </div>
          <div 
            className="col-span-2 flex items-center cursor-pointer hover:text-monday-blue transition-colors"
            onClick={() => handleSort('priority')}
          >
            Priority
            {getSortIcon('priority')}
          </div>
          <div 
            className="col-span-2 flex items-center cursor-pointer hover:text-monday-blue transition-colors"
            onClick={() => handleSort('dueDate')}
          >
            Due Date
            {getSortIcon('dueDate')}
          </div>
        </div>
      </div>

      {/* Task Rows */}
      <div className="divide-y divide-monday-border">
        {sortedTasks.map((task) => {
          const statusConfig = getStatusConfig(task.status);
          const priorityConfig = getPriorityConfig(task.priority);
          const dueDateInfo = formatDueDate(task.dueDate);

          return (
            <div
              key={task.id}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => onTaskClick(task)}
            >
              <div className="col-span-4 flex items-center space-x-3">
                <Checkbox 
                  checked={task.completed}
                  className="border-monday-border"
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <p className="font-medium monday-dark group-hover:monday-blue transition-colors">
                    {task.name}
                  </p>
                  {task.description && (
                    <p className="text-sm monday-medium">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="col-span-2 flex items-center">
                {task.assignee ? (
                  <>
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={task.assignee.avatar || undefined} />
                      <AvatarFallback>
                        {task.assignee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm monday-dark">{task.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-sm monday-medium">Unassigned</span>
                )}
              </div>
              
              <div className="col-span-2 flex items-center">
                <Badge className={`${statusConfig.color} border-0`}>
                  {statusConfig.label}
                </Badge>
              </div>
              
              <div className="col-span-2 flex items-center">
                <Badge variant="outline" className={`${priorityConfig.color} border-0`}>
                  {priorityConfig.label}
                </Badge>
              </div>
              
              <div className="col-span-2 flex items-center">
                {dueDateInfo && dueDateInfo.formatted && (
                  <span className={`text-sm ${dueDateInfo.className}`}>
                    {dueDateInfo.formatted}
                    {dueDateInfo.isOverdue && " (Overdue)"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Task Row */}
      <div className="border-t border-monday-border p-4">
        <Button
          variant="ghost"
          onClick={onAddTask}
          className="monday-medium hover:monday-blue transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add new task
        </Button>
      </div>
    </div>
  );
}
