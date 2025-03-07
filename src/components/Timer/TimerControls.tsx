import React from 'react';
import { useTimer } from '@/context/TimerContext';
import { useTasks } from '@/context/TaskContext';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw, SkipForward, BrainCircuit, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import VoiceControl from '../Voice/VoiceControl';

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
    setCurrentTaskId,
    settings,
    updateSettings,
    distractionCount,
    focusScore,
    breakSuggestion
  } = useTimer();

  const { tasks, incrementTaskPomodoro } = useTasks();
  
  const availableTasks = tasks.filter(task => !task.completed);

  const handleStartTimer = () => {
    startTimer();
    if (mode === 'focus' && currentTaskId) {
      incrementTaskPomodoro(currentTaskId);
    }
  };
  
  const toggleAdaptiveTimer = () => {
    updateSettings({ adaptiveTimers: !settings.adaptiveTimers });
    toast({
      title: settings.adaptiveTimers ? "AI adaptation disabled" : "AI adaptation enabled",
      description: settings.adaptiveTimers 
        ? "Timer durations will no longer adapt to your focus patterns" 
        : "Timer durations will now adapt based on your focus patterns",
    });
  };
  
  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
    toast({
      title: settings.soundEnabled ? "Sound disabled" : "Sound enabled",
      description: settings.soundEnabled 
        ? "Background sounds are now turned off" 
        : "Background sounds will play during focus sessions",
    });
  };
  
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isIdle = status === 'idle';
  const isCompleted = status === 'completed';
  
  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
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
      
      {(mode === 'shortBreak' || mode === 'longBreak') && breakSuggestion && (
        <div className="w-full px-4 py-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
          <h4 className="font-medium text-blue-700">{breakSuggestion.title}</h4>
          <p className="text-sm text-blue-600 mt-1">{breakSuggestion.description}</p>
        </div>
      )}
      
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
      
      {mode === 'focus' && (isRunning || isPaused) && (
        <div className="flex justify-between px-1">
          <Badge variant="outline" className={cn(
            "text-xs",
            distractionCount > 0 ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
          )}>
            {distractionCount} distraction{distractionCount !== 1 ? 's' : ''}
          </Badge>
          
          <Badge variant="outline" className={cn(
            "text-xs",
            focusScore >= 80 ? "bg-green-50 text-green-700 border-green-200" : 
            focusScore >= 50 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : 
            "bg-red-50 text-red-700 border-red-200"
          )}>
            Focus score: {focusScore}
          </Badge>
        </div>
      )}
      
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
      
      <div className="flex justify-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            settings.adaptiveTimers ? "bg-purple-50 border-purple-200" : ""
          )}
          onClick={toggleAdaptiveTimer}
        >
          <BrainCircuit className={cn(
            "h-4 w-4", 
            settings.adaptiveTimers ? "text-purple-600" : "text-gray-500"
          )} />
          <span className={settings.adaptiveTimers ? "text-purple-600" : ""}>
            {settings.adaptiveTimers ? "AI Enabled" : "AI Disabled"}
          </span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            settings.soundEnabled ? "bg-indigo-50 border-indigo-200" : ""
          )}
          onClick={toggleSound}
        >
          {settings.soundEnabled ? (
            <>
              <Volume2 className="h-4 w-4 text-indigo-600" />
              <span className="text-indigo-600">Sound On</span>
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4 text-gray-500" />
              <span>Sound Off</span>
            </>
          )}
        </Button>
        
        <VoiceControl />
      </div>
    </div>
  );
};

export default TimerControls;
