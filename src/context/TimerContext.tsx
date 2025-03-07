
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
  distractions?: number; // Track number of distractions
  focusScore?: number; // Calculate focus score based on various metrics
}

// Timer settings 
export interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  adaptiveTimers: boolean; // New setting for AI adaptation
  soundEnabled: boolean; // New setting for background sounds
  distractionAlerts: boolean; // New setting for distraction alerts
}

// Break suggestion type
export interface BreakSuggestion {
  id: string;
  type: 'stretch' | 'hydrate' | 'mindfulness' | 'movement' | 'rest';
  title: string;
  description: string;
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
  distractionCount: number;
  focusScore: number;
  breakSuggestion?: BreakSuggestion;
  
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
  
  // Distraction tracking
  logDistraction: () => void;
  
  // Break suggestions
  getBreakSuggestion: () => BreakSuggestion;
}

// Default timer settings
const defaultSettings: TimerSettings = {
  focusDuration: 25 * 60, // 25 minutes in seconds
  shortBreakDuration: 5 * 60, // 5 minutes in seconds
  longBreakDuration: 15 * 60, // 15 minutes in seconds
  longBreakInterval: 4, // After 4 focus sessions
  autoStartBreaks: false,
  autoStartPomodoros: false,
  adaptiveTimers: true, // Enable by default
  soundEnabled: false,
  distractionAlerts: true,
};

// Break suggestions
const breakSuggestions: BreakSuggestion[] = [
  {
    id: '1',
    type: 'stretch',
    title: 'Stretch Break',
    description: 'Stand up and stretch your arms, legs, and back for 2 minutes.'
  },
  {
    id: '2',
    type: 'hydrate',
    title: 'Hydration Break',
    description: 'Drink a glass of water to stay hydrated and refresh your mind.'
  },
  {
    id: '3',
    type: 'mindfulness',
    title: 'Mindfulness Moment',
    description: 'Take 10 deep breaths, focusing only on your breathing.'
  },
  {
    id: '4',
    type: 'movement',
    title: 'Quick Movement',
    description: 'Do 10 jumping jacks to get your blood flowing.'
  },
  {
    id: '5',
    type: 'rest',
    title: 'Eye Rest',
    description: 'Look away from screens and focus on something 20 feet away for 20 seconds.'
  },
];

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
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [focusScore, setFocusScore] = useState<number>(100);
  const [breakSuggestion, setBreakSuggestion] = useState<BreakSuggestion | undefined>();
  
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
  
  // Reset distraction count when starting a new focus session
  useEffect(() => {
    if (mode === 'focus' && status === 'running') {
      setDistractionCount(0);
    }
  }, [mode, status]);
  
  // Get a break suggestion based on previous sessions
  const getBreakSuggestion = useCallback(() => {
    // Simple random suggestion for now, will be enhanced with AI
    const randomIndex = Math.floor(Math.random() * breakSuggestions.length);
    const suggestion = breakSuggestions[randomIndex];
    setBreakSuggestion(suggestion);
    return suggestion;
  }, []);
  
  // Log a distraction
  const logDistraction = useCallback(() => {
    if (mode === 'focus' && status === 'running') {
      setDistractionCount(prev => prev + 1);
      
      // Decrease focus score for distractions
      setFocusScore(prev => Math.max(prev - 5, 0));
      
      // Show distraction alert if enabled
      if (settings.distractionAlerts) {
        toast({
          title: "Distraction detected",
          description: "Try to maintain your focus for the entire session",
          variant: "destructive",
        });
      }
    }
  }, [mode, status, settings.distractionAlerts]);
  
  // Calculate focus score based on session completion and distractions
  const calculateFocusScore = useCallback((completed: boolean, sessionDuration: number, totalDuration: number) => {
    // Base score depends on completion
    const completionScore = completed ? 100 : Math.round((sessionDuration / totalDuration) * 70);
    
    // Reduce score based on distractions (each distraction reduces score by 5 points)
    const distractionPenalty = distractionCount * 5;
    
    // Calculate final score
    const finalScore = Math.max(0, completionScore - distractionPenalty);
    
    return finalScore;
  }, [distractionCount]);
  
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
    
    // Provide break suggestion if moving to a break
    if (mode === 'focus') {
      getBreakSuggestion();
    }
    
    // Save session to history if it was a focus session
    if (mode === 'focus') {
      const focusScore = calculateFocusScore(true, settings.focusDuration, settings.focusDuration);
      
      const newSession: TimerSession = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        mode: 'focus',
        duration: settings.focusDuration,
        completed: true,
        taskId: currentTaskId,
        distractions: distractionCount,
        focusScore: focusScore,
      };
      
      setSessionHistory(prev => [newSession, ...prev]);
      setSessionsCompleted(prev => prev + 1);
      
      // Update focus score
      setFocusScore(focusScore);
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
    
    // Adaptive timer adjustment (basic implementation)
    if (settings.adaptiveTimers && mode === 'focus') {
      // Simple implementation: adjust focus duration based on distractions
      // In a real AI implementation, this would use more sophisticated algorithms
      const recentSessions = sessionHistory.slice(0, 5);
      
      // Count average distractions
      const totalDistractions = recentSessions.reduce((sum, session) => sum + (session.distractions || 0), 0);
      const avgDistractions = recentSessions.length > 0 ? totalDistractions / recentSessions.length : 0;
      
      if (avgDistractions > 5) {
        // If many distractions, suggest shorter focus periods
        const newFocusDuration = Math.max(15 * 60, settings.focusDuration - 5 * 60);
        if (newFocusDuration !== settings.focusDuration) {
          toast({
            title: "AI Suggestion",
            description: "You seem to get distracted frequently. Try shorter focus periods.",
          });
          setSettings({...settings, focusDuration: newFocusDuration});
        }
      } else if (avgDistractions < 1 && settings.focusDuration < 45 * 60) {
        // If few distractions, suggest longer focus periods
        const newFocusDuration = Math.min(45 * 60, settings.focusDuration + 5 * 60);
        if (newFocusDuration !== settings.focusDuration) {
          toast({
            title: "AI Suggestion",
            description: "Great focus! You might benefit from longer focus periods.",
          });
          setSettings({...settings, focusDuration: newFocusDuration});
        }
      }
    }
    
  }, [mode, settings, sessionsCompleted, currentTaskId, distractionCount, setSessionHistory, calculateFocusScore, getBreakSuggestion]);
  
  // Timer controls
  const startTimer = useCallback(() => {
    setStatus('running');
  }, []);
  
  const pauseTimer = useCallback(() => {
    setStatus('paused');
    
    // Log a distraction when manually pausing a focus session
    if (mode === 'focus') {
      logDistraction();
    }
  }, [mode, logDistraction]);
  
  const resetTimer = useCallback(() => {
    if (mode === 'focus') {
      setTimeRemaining(settings.focusDuration);
    } else if (mode === 'shortBreak') {
      setTimeRemaining(settings.shortBreakDuration);
    } else {
      setTimeRemaining(settings.longBreakDuration);
    }
    setStatus('idle');
    setDistractionCount(0);
  }, [mode, settings]);
  
  const skipTimer = useCallback(() => {
    // Save incomplete session if it was a focus session
    if (mode === 'focus') {
      const focusScore = calculateFocusScore(false, settings.focusDuration - timeRemaining, settings.focusDuration);
      
      const newSession: TimerSession = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        mode: 'focus',
        duration: settings.focusDuration - timeRemaining, // Only count elapsed time
        completed: false,
        taskId: currentTaskId,
        distractions: distractionCount,
        focusScore: focusScore,
      };
      
      setSessionHistory(prev => [newSession, ...prev]);
      setFocusScore(focusScore);
    }
    
    // Move to next mode
    if (mode === 'focus') {
      const isLongBreakDue = (sessionsCompleted % settings.longBreakInterval === 0);
      setMode(isLongBreakDue ? 'longBreak' : 'shortBreak');
      
      // Get break suggestion
      getBreakSuggestion();
    } else {
      setMode('focus');
    }
    
    setStatus('idle');
    setDistractionCount(0);
  }, [mode, timeRemaining, settings, sessionsCompleted, currentTaskId, distractionCount, setSessionHistory, calculateFocusScore, getBreakSuggestion]);
  
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
        distractionCount,
        focusScore,
        breakSuggestion,
        settings,
        updateSettings,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        setMode,
        setCurrentTaskId,
        logDistraction,
        getBreakSuggestion,
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
