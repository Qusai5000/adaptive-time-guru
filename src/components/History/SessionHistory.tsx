
import React from 'react';
import { useTimer, TimerSession } from '@/context/TimerContext';
import { useTasks } from '@/context/TaskContext';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Timer } from 'lucide-react';

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

// Group sessions by date (YYYY-MM-DD)
const groupSessionsByDate = (sessions: TimerSession[]): Record<string, TimerSession[]> => {
  return sessions.reduce((groups, session) => {
    const date = new Date(session.date);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(session);
    return groups;
  }, {} as Record<string, TimerSession[]>);
};

// Format the date group header
const formatDateGroup = (dateKey: string): string => {
  const date = new Date(dateKey);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateKey === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`) {
    return 'Today';
  } else if (dateKey === `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`) {
    return 'Yesterday';
  } else {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
};

const SessionHistory: React.FC = () => {
  const { sessionHistory } = useTimer();
  const { tasks } = useTasks();
  
  const groupedSessions = groupSessionsByDate(sessionHistory);
  const dateKeys = Object.keys(groupedSessions).sort().reverse();
  
  // Calculate statistics
  const totalSessions = sessionHistory.length;
  const completedSessions = sessionHistory.filter(session => session.completed).length;
  const totalFocusTime = sessionHistory.reduce((total, session) => total + session.duration, 0);
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  
  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  if (sessionHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <Timer className="h-12 w-12 text-muted" />
        </div>
        <h3 className="text-lg font-medium">No sessions yet</h3>
        <p className="text-muted-foreground mt-2">
          Complete your first focus session to see your history here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Sessions</p>
          <p className="text-2xl font-semibold mt-1">{totalSessions}</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Completion Rate</p>
          <p className="text-2xl font-semibold mt-1">{completionRate}%</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Focus Time</p>
          <p className="text-2xl font-semibold mt-1">{formatTotalTime(totalFocusTime)}</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Daily Average</p>
          <p className="text-2xl font-semibold mt-1">
            {formatTotalTime(Math.round(totalFocusTime / dateKeys.length))}
          </p>
        </div>
      </div>
      
      {/* Sessions by date */}
      <div className="space-y-6">
        {dateKeys.map(dateKey => (
          <div key={dateKey} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">{formatDateGroup(dateKey)}</h3>
            <div className="space-y-2">
              {groupedSessions[dateKey].map((session) => {
                const associatedTask = session.taskId 
                  ? tasks.find(task => task.id === session.taskId) 
                  : undefined;
                
                return (
                  <div key={session.id} className="flex items-center p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      session.completed ? "bg-green-50" : "bg-red-50"
                    )}>
                      {session.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {session.completed ? 'Completed Session' : 'Interrupted Session'}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(session.date)}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(session.duration)}
                          </span>
                          
                          {associatedTask && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                              {associatedTask.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionHistory;
