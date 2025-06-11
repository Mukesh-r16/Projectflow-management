import { useState } from "react";
import { useAllTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: tasks = [], isLoading } = useAllTasks();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
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
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <CalendarIcon className="h-8 w-8 text-monday-blue" />
                <h1 className="text-3xl font-bold monday-dark">Calendar</h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold monday-dark min-w-[200px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <Button variant="outline" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg monday-dark">Task Calendar</CardTitle>
              </CardHeader>
              <CardContent>
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium monday-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const dayTasks = getTasksForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] p-2 border border-monday-border bg-white ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isToday ? 'bg-blue-50 border-monday-blue' : ''}`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isToday ? 'text-monday-blue font-bold' : 'monday-dark'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className="p-1 rounded text-xs bg-white border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></div>
                          <span className="truncate monday-dark font-medium">
                            {task.name}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between items-center">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                          {task.assignee && (
                            <span className="text-xs monday-medium truncate ml-1">
                              {task.assignee.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {dayTasks.length > 3 && (
                      <div className="text-xs monday-medium text-center">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Task Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm monday-medium">Total Tasks This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold monday-dark">
              {tasks.filter(task => 
                task.dueDate && 
                isSameMonth(new Date(task.dueDate), currentDate)
              ).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm monday-medium">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-monday-blue">
              {getTasksForDate(new Date()).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm monday-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(task => 
                task.dueDate && 
                new Date(task.dueDate) < new Date() && 
                task.status !== 'completed'
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>
        </main>
      </div>
    </div>
  );
}
