import { useState } from "react";
import { useAllTasks } from "@/hooks/use-tasks";
import { useBoards, useUsers } from "@/hooks/use-boards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock, Users, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function Reports() {
  const { data: tasks = [] } = useAllTasks();
  const { data: boards = [] } = useBoards();
  const { data: users = [] } = useUsers();
  const [selectedBoard, setSelectedBoard] = useState<string>("all");

  // Filter tasks based on selected board
  const filteredTasks = selectedBoard === "all" 
    ? tasks 
    : tasks.filter(task => task.boardId === parseInt(selectedBoard));

  // Calculate statistics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.completed).length;
  const overdueTasks = filteredTasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && !task.completed;
  }).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate total estimated vs actual hours
  const totalEstimatedHours = filteredTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  const totalActualHours = filteredTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

  // Task status distribution
  const statusCounts = filteredTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority distribution
  const priorityCounts = filteredTasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // User productivity
  const userStats = users.map((user: any) => {
    const userTasks = filteredTasks.filter(task => task.assigneeId === user.id);
    const userCompleted = userTasks.filter(task => task.completed).length;
    const userTotal = userTasks.length;
    const userCompletionRate = userTotal > 0 ? Math.round((userCompleted / userTotal) * 100) : 0;
    const userHours = userTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
    
    return {
      ...user,
      totalTasks: userTotal,
      completedTasks: userCompleted,
      completionRate: userCompletionRate,
      totalHours: userHours
    };
  }).filter((user: any) => user.totalTasks > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in-progress': return 'bg-blue-500';
      case 'not-started': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold monday-dark">Reports & Analytics</h1>
              <p className="text-gray-600 mt-2">Track progress and analyze team performance</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boards</SelectItem>
                  {boards.map((board: any) => (
                    <SelectItem key={board.id} value={board.id.toString()}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Tasks</CardTitle>
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalTasks}</div>
                <p className="text-sm text-gray-600 mt-1">
                  {completedTasks} completed, {totalTasks - completedTasks} remaining
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Completion Rate</CardTitle>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
                <Progress value={completionRate} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Overdue Tasks</CardTitle>
                <AlertCircle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{overdueTasks}</div>
                <p className="text-sm text-gray-600 mt-1">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Time Tracking</CardTitle>
                <Clock className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalActualHours}h</div>
                <p className="text-sm text-gray-600 mt-1">
                  {totalEstimatedHours}h estimated
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="status" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-lg">
              <TabsTrigger value="status" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Status Distribution</TabsTrigger>
              <TabsTrigger value="priority" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Priority Analysis</TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Team Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Task Status Distribution</CardTitle>
                  <CardDescription className="text-gray-600">
                    Overview of tasks by their current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(statusCounts).map(([status, count]) => {
                      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                            <span className="capitalize font-medium text-gray-900">{status.replace('-', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Progress value={percentage} className="w-24" />
                            <span className="text-sm font-medium w-12 text-gray-900">{count}</span>
                            <span className="text-sm text-gray-600 w-10">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="priority" className="space-y-4">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Priority Distribution</CardTitle>
                  <CardDescription className="text-gray-600">
                    Breakdown of tasks by priority level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(priorityCounts).map(([priority, count]) => {
                      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                      return (
                        <div key={priority} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)}`} />
                            <span className="capitalize font-medium text-gray-900">{priority} Priority</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Progress value={percentage} className="w-24" />
                            <span className="text-sm font-medium w-12 text-gray-900">{count}</span>
                            <span className="text-sm text-gray-600 w-10">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Team Performance</CardTitle>
                  <CardDescription className="text-gray-600">
                    Individual team member productivity and task completion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userStats.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-monday-blue text-white flex items-center justify-center text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{user.totalTasks}</p>
                            <p className="text-xs text-gray-600">Total Tasks</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-emerald-600">{user.completedTasks}</p>
                            <p className="text-xs text-gray-600">Completed</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{user.completionRate}%</p>
                            <p className="text-xs text-gray-600">Rate</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{user.totalHours}h</p>
                            <p className="text-xs text-gray-600">Hours</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
