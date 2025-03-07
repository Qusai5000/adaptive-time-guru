
import React from 'react';
import { useTimer } from '@/context/TimerContext';
import { useTasks } from '@/context/TaskContext';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TimerControls: React.FC = () => {
  const { 
    status, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    skipTimer,
    mode,
    setMode,
    currentTaskId,
    setCurrentTaskId
  } = useTimer();

  const { tasks, incrementTaskPomodoro } = useTasks();
  
  // Only show non-completed tasks
  const availableTasks = tasks.filter(task => !task.completed);

  const handleStartTimer = () => {
    startTimer();
    // Increment pomodoro count when starting a focus session with a task selected
    if (mode === 'focus' && currentTaskId) {
      incrementTaskPomodoro(currentTaskId);
    }
  };
  
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isIdle = status === 'idle';
  const isCompleted = status === 'completed';
  
  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      {/* Mode selector */}
      <div className="flex justify-center gap-2">
        <Button
          variant={mode === 'focus' ? 'default' : 'outline'}
          className={cn(
            "flex-1 transition-all",
            mode === 'focus' ? 'bg-primary text-white' : 'bg-transparent'
          )}
          onClick={() => setMode('focus')}
          disabled={!isIdle && !isCompleted}
        >
          Focus
        </Button>
        <Button
          variant={mode === 'shortBreak' ? 'default' : 'outline'}
          className={cn(
            "flex-1 transition-all",
            mode === 'shortBreak' ? 'bg-green-500 text-white border-green-500' : 'bg-transparent'
          )}
          onClick={() => setMode('shortBreak')}
          disabled={!isIdle && !isCompleted}
        >
          Short Break
        </Button>
        <Button
          variant={mode === 'longBreak' ? 'default' : 'outline'}
          className={cn(
            "flex-1 transition-all",
            mode === 'longBreak' ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent'
          )}
          onClick={() => setMode('longBreak')}
          disabled={!isIdle && !isCompleted}
        >
          Long Break
        </Button>
      </div>
      
      {/* Task selector (only show for focus mode) */}
      {mode === 'focus' && (
        <div className="w-full">
          <Select
            value={currentTaskId || "none"}
            onValueChange={setCurrentTaskId}
            disabled={isRunning || isPaused}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a task (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No task selected</SelectItem>
              {availableTasks.map(task => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Timer controls */}
      <div className="flex justify-center items-center gap-4">
        {isRunning ? (
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2"
            onClick={pauseTimer}
          >
            <Pause className="h-6 w-6" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full",
              mode === 'focus' ? 'bg-primary' : 
              mode === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'
            )}
            onClick={handleStartTimer}
            disabled={isCompleted}
          >
            <Play className="h-6 w-6 ml-1" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-2"
          onClick={resetTimer}
          disabled={isIdle && !isCompleted}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-2"
          onClick={skipTimer}
          disabled={isCompleted}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default TimerControls;
