import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, Play, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TaskWithAssignee } from "@shared/schema";

interface TimeTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskWithAssignee | null;
}

export default function TimeTrackingModal({ isOpen, onClose, task }: TimeTrackingModalProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [description, setDescription] = useState("");
  const [manualHours, setManualHours] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const startTimer = () => {
    setIsTracking(true);
    setStartTime(new Date());
    setCurrentTime(0);
  };

  const stopTimer = () => {
    if (startTime) {
      const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60 / 60 * 100) / 100;
      setManualHours(elapsed.toString());
    }
    setIsTracking(false);
    setStartTime(null);
  };

  const handleSubmit = async () => {
    if (!task || (!manualHours && !isTracking)) {
      toast({
        title: "Error",
        description: "Please enter hours or use the timer",
        variant: "destructive",
      });
      return;
    }

    const hours = parseFloat(manualHours) || currentTime;

    try {
      // Here you would implement the API call to save time entry
      console.log('Saving time entry:', {
        taskId: task.id,
        hours,
        description,
        date: new Date().toISOString().split('T')[0],
      });

      toast({
        title: "Success",
        description: "Time entry logged successfully",
      });
      
      onClose();
      setDescription("");
      setManualHours("");
      setCurrentTime(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log time entry",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 monday-dark">
            <Clock className="h-5 w-5 text-monday-blue" />
            <span>Track Time - {task?.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Timer Section */}
          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold monday-dark">
              {formatTime(currentTime)}
            </div>
            <div className="flex justify-center space-x-3">
              {!isTracking ? (
                <Button onClick={startTimer} className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Start Timer
                </Button>
              ) : (
                <Button onClick={stopTimer} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Timer
                </Button>
              )}
            </div>
          </div>

          <div className="border-t border-monday-border pt-6">
            <div className="text-center text-sm monday-medium mb-4">
              or enter time manually
            </div>
            
            <div className="space-y-4">
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
                <Label htmlFor="description" className="text-sm font-medium monday-dark">
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="What did you work on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 border-monday-border focus:ring-monday-blue focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-monday-border">
          <Button variant="outline" onClick={onClose} className="monday-medium hover:monday-dark">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-monday-blue hover:bg-blue-600">
            Log Time
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
