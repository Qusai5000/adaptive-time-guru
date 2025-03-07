
import React from 'react';
import Layout from '@/components/Layout/Layout';
import TaskList from '@/components/Tasks/TaskList';
import { useTasks } from '@/context/TaskContext';

const Tasks = () => {
  const { tasks } = useTasks();
  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Tasks</h1>
        {totalCount > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {completedCount}/{totalCount} complete
            </span>
          </div>
        )}
      </div>
      
      <TaskList />
    </Layout>
  );
};

export default Tasks;
