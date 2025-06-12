import { useState } from "react";
import { useAllTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, TrendingUp, BarChart } from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns";
import type { TaskWithAssignee } from "@shared/schema";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function Timeline() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { data: tasks = [], isLoading } = useAllTasks();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const getTasksByDateRange = (startDate: Date, endDate: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= startDate && taskDate <= endDate;
    });
  };

  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const prevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'not-started': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const weekTasks = getTasksByDateRange(weekStart, weekEnd);
  const completedTasks = weekTasks.filter(task => task.status === 'completed');
  const totalEstimatedHours = weekTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  const totalActualHours = weekTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <BarChart className="h-8 w-8 text-monday-blue" />
              <h1 className="text-3xl font-bold monday-dark">Project Timeline</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={prevWeek}>
                ←
              </Button>
              <h2 className="text-xl font-semibold monday-dark min-w-[200px] text-center">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </h2>
              <Button variant="outline" onClick={nextWeek}>
                →
              </Button>
            </div>
          </div>

          {/* Week Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm monday-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold monday-dark">{weekTasks.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm monday-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm monday-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-monday-blue">
                  {weekTasks.length > 0 ? Math.round((completedTasks.length / weekTasks.length) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm monday-medium">Hours Tracked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold monday-dark">{totalActualHours}h</div>
                <p className="text-xs monday-medium">{totalEstimatedHours}h estimated</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg monday-dark">Weekly Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {weekDays.map(day => {
                  const dayTasks = getTasksForDate(day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div key={format(day, 'yyyy-MM-dd')} className="space-y-2">
                      <div className={`text-center p-2 rounded-lg ${
                        isToday ? 'bg-monday-blue text-white' : 'bg-gray-50'
                      }`}>
                        <div className="text-sm font-medium">
                          {format(day, 'EEE')}
                        </div>
                        <div className="text-lg font-bold">
                          {format(day, 'd')}
                        </div>
                      </div>
                      
                      <div className="space-y-2 min-h-[300px]">
                        {dayTasks.map(task => (
                          <div
                            key={task.id}
                            className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start space-x-2 mb-2">
                              <div className={`w-2 h-2 rounded-full mt-1 ${getStatusColor(task.status)}`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium monday-dark truncate">
                                  {task.name}
                                </p>
                                {task.description && (
                                  <p className="text-xs monday-medium truncate">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority}
                              </Badge>
                              
                              {task.assignee && (
                                <div className="flex items-center space-x-1">
                                  <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-xs">
                                      {task.assignee.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs monday-medium">
                                    {task.assignee.name.split(' ')[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {(task.estimatedHours || task.actualHours) && (
                              <div className="mt-2 flex items-center space-x-2 text-xs monday-medium">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {task.actualHours || 0}h / {task.estimatedHours || 0}h
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {dayTasks.length === 0 && (
                          <div className="text-center text-gray-400 py-8">
                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tasks</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
