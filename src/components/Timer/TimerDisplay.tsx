
import React, { useEffect, useState } from 'react';
import { useTimer, TimerMode } from '@/context/TimerContext';
import { cn } from '@/lib/utils';

const TimerDisplay: React.FC = () => {
  const { 
    timeRemaining, 
    progress, 
    mode, 
    status,
    sessionsCompleted
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

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={cn(
        "transition-all duration-500 mb-4 text-center",
        getModeColor(mode).replace('stroke-', 'text-')
      )}>
        <h2 className="text-2xl font-medium">{getModeTitle(mode)}</h2>
        <div className="text-muted-foreground text-sm mt-1">
          Session: {sessionsCompleted + 1}
        </div>
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
    </div>
  );
};

export default TimerDisplay;
