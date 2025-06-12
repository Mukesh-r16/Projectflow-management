import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle, ListTodo } from "lucide-react";
import type { TaskWithAssignee } from "@shared/schema";

interface BoardStatsProps {
  tasks: TaskWithAssignee[];
}

export default function BoardStats({ tasks }: BoardStatsProps) {
  // Ensure tasks is always an array
  const taskList = tasks || [];
  
  const totalTasks = taskList.length;
  const completedTasks = taskList.filter(task => task.status === "completed").length;
  const inProgressTasks = taskList.filter(task => task.status === "in-progress").length;
  const overdueTasks = taskList.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && task.status !== "completed";
  }).length;

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: ListTodo,
      bgColor: "bg-blue-100",
      iconColor: "monday-blue",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "monday-green",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      bgColor: "bg-orange-100",
      iconColor: "monday-orange",
    },
    {
      label: "Overdue",
      value: overdueTasks,
      icon: AlertTriangle,
      bgColor: "bg-pink-100",
      iconColor: "monday-pink",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-monday-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold monday-dark">{stat.value}</p>
                <p className="text-sm monday-medium">{stat.label}</p>
              </div>
              <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
