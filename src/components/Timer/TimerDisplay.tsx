
import React, { useEffect, useState } from 'react';
import { useTimer, TimerMode } from '@/context/TimerContext';
import { cn } from '@/lib/utils';
import { BrainCircuit, LineChart, Mic } from 'lucide-react';

const TimerDisplay: React.FC = () => {
  const { 
    timeRemaining, 
    progress, 
    mode, 
    status,
    sessionsCompleted,
    focusScore,
    settings
  } = useTimer();
  
  // Animation smoothing
  const [displayTime, setDisplayTime] = useState(timeRemaining);
  
  useEffect(() => {
    // Smooth transition for time display
    const timeout = setTimeout(() => {
      setDisplayTime(timeRemaining);
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [timeRemaining]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate dimensions for timer circle
  const size = 300;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (progress / 100) * circumference;

  // Mode-specific styling
  const getModeColor = (currentMode: TimerMode): string => {
    switch (currentMode) {
      case 'focus':
        return 'text-primary stroke-primary';
      case 'shortBreak':
        return 'text-green-500 stroke-green-500';
      case 'longBreak':
        return 'text-blue-500 stroke-blue-500';
      default:
        return 'text-primary stroke-primary';
    }
  };

  const getModeTitle = (currentMode: TimerMode): string => {
    switch (currentMode) {
      case 'focus':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus';
    }
  };

  const animationClass = status === 'running' ? 'animate-breathe' : '';

  // Get focus score color
  const getFocusScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={cn(
        "transition-all duration-500 mb-2 text-center",
        getModeColor(mode).replace('stroke-', 'text-')
      )}>
        <h2 className="text-2xl font-medium">{getModeTitle(mode)}</h2>
        <div className="text-muted-foreground text-sm mt-1">
          Session: {sessionsCompleted + 1}
        </div>
      </div>
      
      {/* Feature indicators */}
      <div className="flex items-center gap-2 mb-2">
        {/* AI Indicator for adaptive timers */}
        {settings.adaptiveTimers && (
          <div className="flex items-center gap-1 text-purple-500 bg-purple-50 px-2 py-1 rounded-full text-xs">
            <BrainCircuit className="h-3 w-3" />
            <span>AI Active</span>
          </div>
        )}
        
        {/* Voice Control Indicator */}
        {settings.voiceControlEnabled && (
          <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-full text-xs">
            <Mic className="h-3 w-3" />
            <span>Voice Ready</span>
          </div>
        )}
      </div>
      
      <div className="relative my-4">
        <svg 
          width={size} 
          height={size} 
          className={animationClass}
        >
          {/* Background Circle */}
          <circle
            className="stroke-muted transition-all duration-300"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress Circle */}
          <circle
            className={cn(
              "transition-all duration-300 ease-in-out",
              getModeColor(mode)
            )}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ 
              '--timer-progress': progressOffset + 'px',
            } as React.CSSProperties}
          />
          
          {/* Time Text */}
          <text
            x="50%"
            y="50%"
            dy="0.3em"
            textAnchor="middle"
            className={cn(
              "font-mono text-4xl md:text-6xl font-semibold transition-all duration-300",
              getModeColor(mode).replace('stroke-', 'fill-')
            )}
          >
            {formatTime(displayTime)}
          </text>
        </svg>
        
        {status === 'running' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full rounded-full animate-pulse opacity-10 bg-current" />
          </div>
        )}
      </div>
      
      {/* Focus Score (only show during focus mode) */}
      {mode === 'focus' && (
        <div className="mt-2 flex items-center gap-2">
          <LineChart className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Focus Score:</span>
          <span className={cn(
            "font-semibold",
            getFocusScoreColor(focusScore)
          )}>
            {focusScore}
          </span>
        </div>
      )}
    </div>
  );
};

export default TimerDisplay;
