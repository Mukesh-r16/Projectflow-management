import { useParams, useLocation } from "wouter";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import BoardStats from "@/components/board/board-stats";
import TaskBoard from "@/components/board/task-board";
import KanbanBoard from "@/components/board/kanban-board";
import ActivityFeed from "@/components/board/activity-feed";
import TaskModal from "@/components/board/task-modal";
import { useBoardWithTasks, useBoards } from "@/hooks/use-boards";
import { useUserTasks, useAllTasks } from "@/hooks/use-tasks";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Filter, ArrowUpDown, User, Grid3X3, List } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { id } = useParams();
  const [location] = useLocation();
  const isMyTasksView = location === "/my-tasks";
  const isAllTasksView = location === "/all-tasks";
  const boardId = id ? parseInt(id) : 1; // Default to first board
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");

  const { data: board, isLoading, error } = useBoardWithTasks(boardId);
  const { data: myTasks = [], isLoading: isMyTasksLoading } = useUserTasks(1); // Current user ID is 1
  const { data: allTasks = [], isLoading: isAllTasksLoading } = useAllTasks();

  // Filter and sort functions
  const filterAndSortTasks = (tasks: any[]) => {
    let filtered = tasks;
    
    // Apply filter
    if (filterStatus !== "all") {
      filtered = tasks.filter(task => task.status === filterStatus);
    }
    
    // Apply sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "priority":
          const priorityOrder = { "high": 3, "medium": 2, "low": 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  };

  const filteredMyTasks = filterAndSortTasks(myTasks);
  const filteredAllTasks = filterAndSortTasks(allTasks);
  const filteredBoardTasks = board?.tasks ? filterAndSortTasks(board.tasks) : [];

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  if (isLoading || (isMyTasksView && isMyTasksLoading) || (isAllTasksView && isAllTasksLoading)) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
              <Skeleton className="h-96" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isMyTasksView && !isAllTasksView && (error || !board)) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Board not found</h2>
              <p className="text-gray-600">The requested board could not be loaded.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const currentTasks = isMyTasksView ? filteredMyTasks : 
                      isAllTasksView ? filteredAllTasks : 
                      filteredBoardTasks;

  const currentBoardId = isMyTasksView || isAllTasksView ? 1 : boardId;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isMyTasksView ? "My Tasks" : 
                   isAllTasksView ? "All Tasks" : 
                   board?.name}
                </h1>
                {!isMyTasksView && !isAllTasksView && board?.description && (
                  <p className="text-gray-600 mt-1">{board.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === "kanban" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("kanban")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none border-l"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("not-started")}>
                      Not Started
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("in-progress")}>
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                      Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortBy("name")}>
                      Name
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("priority")}>
                      Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("dueDate")}>
                      Due Date
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("status")}>
                      Status
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button onClick={handleAddTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>

            {/* Stats */}
            <BoardStats tasks={currentTasks} />

            {/* Board Content */}
            <div className="flex-1">
              {viewMode === "kanban" ? (
                <KanbanBoard
                  tasks={currentTasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                />
              ) : (
                <TaskBoard
                  tasks={currentTasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                />
              )}
            </div>
          </div>
        </main>

        {/* Activity Feed */}
        {!isMyTasksView && !isAllTasksView && (
          <aside className="w-80 border-l bg-white p-6">
            <ActivityFeed boardId={currentBoardId} />
          </aside>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        boardId={currentBoardId}
      />
    </div>
  );
}
