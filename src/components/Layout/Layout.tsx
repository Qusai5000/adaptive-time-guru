
import React, { ReactNode } from 'react';
import Header from './Header';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className={cn(
        "flex-1 px-4 pt-4 pb-24 md:pt-20 md:pb-6 max-w-4xl mx-auto w-full animate-fade-in", 
        className
      )}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
