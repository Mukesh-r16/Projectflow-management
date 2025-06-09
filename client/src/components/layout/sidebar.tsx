import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  Calendar, 
  BarChart3, 
  Clock, 
  User,
  Folder,
  Plus,
  ChevronRight
} from "lucide-react";
import { useBoards } from "@/hooks/use-boards";
import { useState } from "react";

export default function Sidebar() {
  const [location] = useLocation();
  const { data: boards = [] } = useBoards();
  const [expandedSections, setExpandedSections] = useState<string[]>(["boards"]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path: string) => location === path;

  const mainNavItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/my-tasks", label: "My Tasks", icon: User },
    { path: "/all-tasks", label: "All Tasks", icon: Folder },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/timeline", label: "Timeline", icon: Clock },
    { path: "/reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <Button className="w-full bg-monday-blue hover:bg-blue-600" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Board
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-4 space-y-1">
          {mainNavItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  isActive(item.path) 
                    ? "bg-monday-blue text-white hover:bg-blue-600" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                size="sm"
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="mt-6 px-4">
          <button
            onClick={() => toggleSection("boards")}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-2 hover:text-monday-blue"
          >
            <span>Your Boards</span>
            <ChevronRight 
              className={`h-4 w-4 transition-transform ${
                expandedSections.includes("boards") ? "rotate-90" : ""
              }`}
            />
          </button>
          
          {expandedSections.includes("boards") && (
            <div className="space-y-1 ml-2">
              {boards.map((board) => (
                <Link key={board.id} href={`/board/${board.id}`}>
                  <Button
                    variant={location === `/board/${board.id}` ? "secondary" : "ghost"}
                    className={`w-full justify-start text-xs ${
                      location === `/board/${board.id}`
                        ? "bg-gray-100 text-monday-blue"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    size="sm"
                  >
                    <div 
                      className="w-3 h-3 rounded mr-2"
                      style={{ backgroundColor: board.color }}
                    />
                    <span className="truncate">{board.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
