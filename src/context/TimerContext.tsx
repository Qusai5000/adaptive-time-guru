
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { toast } from '@/components/ui/use-toast';

// Timer types
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

// Session history
export interface TimerSession {
  id: string;
  date: string;
  mode: TimerMode;
  duration: number;
  completed: boolean;
  taskId?: string;
}

// Timer settings 
export interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

// Context interface
interface TimerContextType {
  // Timer state
  mode: TimerMode;
  status: TimerStatus;
  timeRemaining: number;
  progress: number;
  sessionsCompleted: number;
  sessionHistory: TimerSession[];
  currentTaskId?: string;
  
  // Timer settings
  settings: TimerSettings;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;

  // Timer controls
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  
  // Mode controls
  setMode: (mode: TimerMode) => void;
  setCurrentTaskId: (taskId?: string) => void;
}

// Default timer settings
const defaultSettings: TimerSettings = {
  focusDuration: 25 * 60, // 25 minutes in seconds
  shortBreakDuration: 5 * 60, // 5 minutes in seconds
  longBreakDuration: 15 * 60, // 15 minutes in seconds
  longBreakInterval: 4, // After 4 focus sessions
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

// Create context
const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load settings from localStorage
  const [settings, setSettings] = useLocalStorage<TimerSettings>('timer-settings', defaultSettings);
  
  // Timer state
  const [mode, setMode] = useState<TimerMode>('focus');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.focusDuration);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>();
  
  // Session history
  const [sessionHistory, setSessionHistory] = useLocalStorage<TimerSession[]>('timer-history', []);
  
  // Calculate progress percentage
  const progress = useCallback(() => {
    const totalTime = mode === 'focus' 
      ? settings.focusDuration 
      : mode === 'shortBreak' 
        ? settings.shortBreakDuration 
        : settings.longBreakDuration;
    
    return ((totalTime - timeRemaining) / totalTime) * 100;
  }, [mode, settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration, timeRemaining]);
  
  // Update timer duration when mode or settings change
  useEffect(() => {
    if (status === 'idle') {
      if (mode === 'focus') {
        setTimeRemaining(settings.focusDuration);
      } else if (mode === 'shortBreak') {
        setTimeRemaining(settings.shortBreakDuration);
      } else {
        setTimeRemaining(settings.longBreakDuration);
      }
    }
  }, [mode, status, settings]);
  
  // Timer countdown
  useEffect(() => {
    let interval: number | undefined;
    
    if (status === 'running' && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining <= 0 && status === 'running') {
      // Timer completed
      handleTimerComplete();
    }
    
    return () => clearInterval(interval);
  }, [status, timeRemaining]);
  
  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    // Play sound or notification
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => console.error('Failed to play notification sound:', error));
    
    // Show toast notification
    toast({
      title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Complete!`,
      description: mode === 'focus' 
        ? 'Great job! Take a break.' 
        : 'Break finished. Ready to focus?',
    });
    
    setStatus('completed');
    
    // Save session to history if it was a focus session
    if (mode === 'focus') {
      const newSession: TimerSession = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        mode: 'focus',
        duration: settings.focusDuration,
        completed: true,
        taskId: currentTaskId,
      };
      
      setSessionHistory(prev => [newSession, ...prev]);
      setSessionsCompleted(prev => prev + 1);
    }
    
    // Determine next timer mode
    const isLongBreakDue = mode === 'focus' && ((sessionsCompleted + 1) % settings.longBreakInterval === 0);
    
    if (mode === 'focus') {
      // After focus session, go to break
      setMode(isLongBreakDue ? 'longBreak' : 'shortBreak');
      
      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setTimeout(() => {
          setStatus('running');
        }, 500); // Small delay for better UI experience
      } else {
        setStatus('idle');
      }
    } else {
      // After break, go back to focus
      setMode('focus');
      
      // Auto-start pomodoro if enabled
      if (settings.autoStartPomodoros) {
        setTimeout(() => {
          setStatus('running');
        }, 500); // Small delay for better UI experience
      } else {
        setStatus('idle');
      }
    }
  }, [mode, settings, sessionsCompleted, currentTaskId, setSessionHistory]);
  
  // Timer controls
  const startTimer = useCallback(() => {
    setStatus('running');
  }, []);
  
  const pauseTimer = useCallback(() => {
    setStatus('paused');
  }, []);
  
  const resetTimer = useCallback(() => {
    if (mode === 'focus') {
      setTimeRemaining(settings.focusDuration);
    } else if (mode === 'shortBreak') {
      setTimeRemaining(settings.shortBreakDuration);
    } else {
      setTimeRemaining(settings.longBreakDuration);
    }
    setStatus('idle');
  }, [mode, settings]);
  
  const skipTimer = useCallback(() => {
    // Save incomplete session if it was a focus session
    if (mode === 'focus') {
      const newSession: TimerSession = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        mode: 'focus',
        duration: settings.focusDuration - timeRemaining, // Only count elapsed time
        completed: false,
        taskId: currentTaskId,
      };
      
      setSessionHistory(prev => [newSession, ...prev]);
    }
    
    // Move to next mode
    if (mode === 'focus') {
      const isLongBreakDue = (sessionsCompleted % settings.longBreakInterval === 0);
      setMode(isLongBreakDue ? 'longBreak' : 'shortBreak');
    } else {
      setMode('focus');
    }
    
    setStatus('idle');
  }, [mode, timeRemaining, settings, sessionsCompleted, currentTaskId, setSessionHistory]);
  
  // Update settings
  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // If in idle state, update current timer immediately
    if (status === 'idle') {
      if (mode === 'focus' && newSettings.focusDuration) {
        setTimeRemaining(newSettings.focusDuration);
      } else if (mode === 'shortBreak' && newSettings.shortBreakDuration) {
        setTimeRemaining(newSettings.shortBreakDuration);
      } else if (mode === 'longBreak' && newSettings.longBreakDuration) {
        setTimeRemaining(newSettings.longBreakDuration);
      }
    }
  }, [status, mode, setSettings]);
  
  return (
    <TimerContext.Provider
      value={{
        mode,
        status,
        timeRemaining,
        progress: progress(),
        sessionsCompleted,
        sessionHistory,
        currentTaskId,
        settings,
        updateSettings,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        setMode,
        setCurrentTaskId,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
