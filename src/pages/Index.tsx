
import React from 'react';
import Layout from '@/components/Layout/Layout';
import TimerDisplay from '@/components/Timer/TimerDisplay';
import TimerControls from '@/components/Timer/TimerControls';
import { useTasks } from '@/context/TaskContext';
import { useTimer } from '@/context/TimerContext';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const { tasks } = useTasks();
  const { currentTaskId } = useTimer();
  
  // Get current task if selected
  const currentTask = currentTaskId 
    ? tasks.find((task) => task.id === currentTaskId)
    : null;
  
  // Get incomplete tasks count
  const incompleteTasks = tasks.filter(task => !task.completed).length;
  
  return (
    <Layout className="flex flex-col items-center justify-start">
      <div className="w-full max-w-md mx-auto">
        {/* Current Task Display */}
        {currentTask && (
          <div className="mb-6 w-full animate-fade-in">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Current Task</p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <p className="font-medium">{currentTask.title}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Statistics info if no task selected */}
        {!currentTask && tasks.length > 0 && (
          <div className="mb-6 w-full animate-fade-in">
            <div 
              className={cn(
                "bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-gray-100 shadow-sm text-center",
                incompleteTasks === 0 ? "bg-green-50/80" : ""
              )}
            >
              {incompleteTasks === 0 ? (
                <>
                  <div className="flex justify-center mb-2">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="font-medium">All tasks completed!</p>
                  <p className="text-sm text-muted-foreground mt-1">Great job today</p>
                </>
              ) : (
                <>
                  <p className="font-medium">{incompleteTasks} task{incompleteTasks !== 1 ? 's' : ''} remaining</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a task to work on during your focus session
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Timer Components */}
        <div className="w-full">
          <TimerDisplay />
          <TimerControls />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
