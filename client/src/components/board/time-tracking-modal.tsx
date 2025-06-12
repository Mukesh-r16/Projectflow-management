import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Play, Square, Pause, Save, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TaskWithAssignee, TimeEntry } from "@shared/schema";

interface TimeTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskWithAssignee | null;
}

export default function TimeTrackingModal({ isOpen, onClose, task }: TimeTrackingModalProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [description, setDescription] = useState("");
  const [manualHours, setManualHours] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pausedTime, setPausedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch time entries for the task
  const { data: timeEntries = [] } = useQuery<TimeEntry[]>({
    queryKey: ['/api/tasks', task?.id, 'time-entries'],
    enabled: !!task,
  });

  // Timer effect
  useEffect(() => {
    if (isTracking && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, isPaused]);

  const startTimer = () => {
    setIsTracking(true);
    setIsPaused(false);
    setStartTime(new Date());
    setCurrentTime(pausedTime);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    setPausedTime(currentTime);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const stopTimer = () => {
    const totalMinutes = Math.floor(currentTime / 60);
    setManualHours((totalMinutes / 60).toFixed(2));
    setIsTracking(false);
    setIsPaused(false);
    setStartTime(null);
    setCurrentTime(0);
    setPausedTime(0);
  };

  // Create time entry mutation
  const createTimeEntryMutation = useMutation({
    mutationFn: async (data: {
      taskId: number;
      hours: number;
      description: string;
      date: string;
      entryType: string;
    }) => {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', task?.id, 'time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Time entry logged successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log time entry",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!task || (!manualHours && !isTracking)) {
      toast({
        title: "Error",
        description: "Please enter hours or use the timer",
        variant: "destructive",
      });
      return;
    }

    const hours = parseFloat(manualHours) || (currentTime / 3600);
    const entryType = isTracking ? "timer" : "manual";

    createTimeEntryMutation.mutate({
      taskId: task.id,
      hours: Math.round(hours * 60), // Convert to minutes
      description,
      date: manualDate,
      entryType,
    });

    // Reset form
    setDescription("");
    setManualHours("");
    setCurrentTime(0);
    setPausedTime(0);
    setIsTracking(false);
    setIsPaused(false);
    setStartTime(null);
  };

  const handleClose = () => {
    if (isTracking) {
      stopTimer();
    }
    onClose();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 monday-dark">
            <Clock className="h-5 w-5 text-monday-blue" />
            <span>Track Time - {task?.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="history">Time Entries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timer" className="space-y-6">
            {/* Enhanced Timer Section */}
            <div className="text-center space-y-4">
              <div className="text-5xl font-mono font-bold monday-dark">
                {formatTime(currentTime)}
              </div>
              <div className="flex justify-center space-x-3">
                {!isTracking ? (
                  <Button onClick={startTimer} className="bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Timer
                  </Button>
                ) : (
                  <>
                    {!isPaused ? (
                      <Button onClick={pauseTimer} className="bg-yellow-600 hover:bg-yellow-700">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button onClick={resumeTimer} className="bg-green-600 hover:bg-green-700">
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button onClick={stopTimer} variant="destructive">
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
              {isTracking && (
                <div className="text-sm text-gray-600">
                  {isPaused ? "Timer paused" : "Timer running..."}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="timer-description" className="text-sm font-medium monday-dark">
                  Description
                </Label>
                <Textarea
                  id="timer-description"
                  placeholder="What are you working on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 border-monday-border focus:ring-monday-blue focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hours" className="text-sm font-medium monday-dark">
                    Hours
                  </Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.25"
                    placeholder="0.00"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                    className="mt-2 border-monday-border focus:ring-monday-blue focus:border-transparent"
                  />
                </div>
                
                <div>
                  <Label htmlFor="date" className="text-sm font-medium monday-dark">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="mt-2 border-monday-border focus:ring-monday-blue focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="manual-description" className="text-sm font-medium monday-dark">
                  Description
                </Label>
                <Textarea
                  id="manual-description"
                  placeholder="What did you work on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 border-monday-border focus:ring-monday-blue focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="max-h-80 overflow-y-auto">
              {timeEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No time entries yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeEntries.map((entry: any) => (
                    <div key={entry.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{(entry.hours / 60).toFixed(2)}h</span>
                            <span className="text-sm text-gray-500">{entry.date}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              entry.entryType === 'timer' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {entry.entryType}
                            </span>
                          </div>
                          {entry.description && (
                            <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-monday-border">
          <Button variant="outline" onClick={handleClose} className="monday-medium hover:monday-dark">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-monday-blue hover:bg-blue-600"
            disabled={createTimeEntryMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createTimeEntryMutation.isPending ? "Saving..." : "Log Time"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
