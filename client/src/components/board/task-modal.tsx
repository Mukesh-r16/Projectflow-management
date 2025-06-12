import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useUsers } from "@/hooks/use-boards";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { TaskWithAssignee } from "@shared/schema";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskWithAssignee | null;
  boardId: number;
}

export default function TaskModal({ isOpen, onClose, task, boardId }: TaskModalProps) {
  const { toast } = useToast();
  const { data: users } = useUsers();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "not-started",
    priority: "medium",
    assigneeId: "",
    dueDate: "",
    startDate: "",
    estimatedHours: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId?.toString() || "unassigned",
        dueDate: task.dueDate || "",
        startDate: task.startDate || "",
        estimatedHours: task.estimatedHours?.toString() || "",
      });
      setSelectedDate(task.dueDate ? new Date(task.dueDate) : undefined);
    } else {
      setFormData({
        name: "",
        description: "",
        status: "not-started",
        priority: "medium",
        assigneeId: "unassigned",
        dueDate: "",
        startDate: "",
        estimatedHours: "",
      });
      setSelectedDate(undefined);
    }
  }, [task, isOpen]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Task name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const taskData = {
        name: formData.name,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        boardId,
        assigneeId: formData.assigneeId && formData.assigneeId !== "unassigned" ? parseInt(formData.assigneeId) : null,
        dueDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
        startDate: formData.startDate || null,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        actualHours: task?.actualHours || 0,
        position: task?.position || 0,
        completed: false,
      };

      console.log('Saving task data:', taskData);

      if (task) {
        await updateTaskMutation.mutateAsync({
          id: task.id,
          ...taskData,
        });
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } else {
        await createTaskMutation.mutateAsync(taskData);
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold monday-dark">
            {task ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="taskName" className="text-sm font-medium monday-dark">
              Task Name *
            </Label>
            <Input
              id="taskName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter task name..."
              className="mt-2 border-monday-border focus:ring-monday-blue focus:border-transparent"
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-sm font-medium monday-dark">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description..."
              rows={4}
              className="mt-2 border-monday-border focus:ring-monday-blue focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium monday-dark">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="mt-2 border-monday-border focus:ring-monday-blue">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium monday-dark">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="mt-2 border-monday-border focus:ring-monday-blue">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium monday-dark">Assignee</Label>
              <Select 
                value={formData.assigneeId} 
                onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
              >
                <SelectTrigger className="mt-2 border-monday-border focus:ring-monday-blue">
                  <SelectValue placeholder="Select assignee..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dueDate" className="text-sm font-medium monday-dark">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value));
                  } else {
                    setSelectedDate(undefined);
                  }
                }}
                className="mt-2 border-monday-border focus:ring-monday-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Time Tracking Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium monday-dark">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-2 border-monday-border focus:ring-monday-blue focus:border-transparent"
              />
            </div>
            
            <div>
              <Label htmlFor="estimatedHours" className="text-sm font-medium monday-dark">
                Estimated Hours
              </Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                className="mt-2 border-monday-border focus:ring-monday-blue focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-monday-border">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="monday-medium hover:monday-dark"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
            className="bg-monday-blue hover:bg-blue-600"
          >
            {createTaskMutation.isPending || updateTaskMutation.isPending ? "Saving..." : "Save Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
