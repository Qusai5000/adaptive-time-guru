
import React, { useState } from 'react';
import { useTasks, Task } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Edit, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const { completeTask, uncompleteTask, updateTask, deleteTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCheckboxChange = () => {
    if (task.completed) {
      uncompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateTask(task.id, { title: editTitle });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className={cn(
        "group flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 animate-scale-in",
        task.completed && "bg-gray-50"
      )}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleCheckboxChange}
              className={cn(
                "transition-all duration-200",
                task.completed ? "text-green-500" : ""
              )}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="h-8"
                />
                <Button size="sm" variant="ghost" onClick={() => {
                  setEditTitle(task.title);
                  setIsEditing(false);
                }}>
                  <X className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span 
                  className={cn(
                    "text-sm font-medium transition-all truncate",
                    task.completed && "line-through text-gray-400"
                  )}
                >
                  {task.title}
                </span>
                
                {task.completedPomodoros !== undefined && task.completedPomodoros > 0 && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {task.completedPomodoros} {task.completedPomodoros === 1 ? 'pomodoro' : 'pomodoros'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setIsEditing(true)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit task</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setShowDeleteDialog(true)}
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete task</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete task</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                deleteTask(task.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const TaskList: React.FC = () => {
  const { tasks, addTask } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask({ title: newTaskTitle.trim() });
      setNewTaskTitle('');
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddTask} className="flex gap-2">
        <Input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Active Tasks</h3>
          {activeTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex justify-center mb-2">
                <Circle className="h-8 w-8 text-muted" />
              </div>
              <p className="text-sm">No active tasks</p>
              <p className="text-xs mt-1">Add a task to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {completedTasks.length > 0 && (
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Completed Tasks</h3>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
