
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ListTodo, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  return (
    <header className="fixed bottom-0 left-0 w-full md:top-0 md:bottom-auto bg-white/80 backdrop-blur-lg border-t md:border-b md:border-t-0 border-gray-100 z-10 px-4 py-2">
      <nav className="max-w-4xl mx-auto flex justify-between items-center">
        <NavLink 
          to="/" 
          className={({ isActive }) => cn(
            "flex flex-col items-center p-3 rounded-lg transition-all duration-300 text-gray-500",
            isActive ? "text-primary font-medium" : "hover:text-gray-700"
          )}
          end
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Timer</span>
        </NavLink>
        
        <NavLink 
          to="/tasks" 
          className={({ isActive }) => cn(
            "flex flex-col items-center p-3 rounded-lg transition-all duration-300 text-gray-500",
            isActive ? "text-primary font-medium" : "hover:text-gray-700"
          )}
        >
          <ListTodo className="h-5 w-5" />
          <span className="text-xs mt-1">Tasks</span>
        </NavLink>
        
        <NavLink 
          to="/history" 
          className={({ isActive }) => cn(
            "flex flex-col items-center p-3 rounded-lg transition-all duration-300 text-gray-500",
            isActive ? "text-primary font-medium" : "hover:text-gray-700"
          )}
        >
          <History className="h-5 w-5" />
          <span className="text-xs mt-1">History</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => cn(
            "flex flex-col items-center p-3 rounded-lg transition-all duration-300 text-gray-500",
            isActive ? "text-primary font-medium" : "hover:text-gray-700"
          )}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
