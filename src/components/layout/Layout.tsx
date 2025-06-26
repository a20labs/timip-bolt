import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AgentLauncher } from '../agents/AgentLauncher';
import { useAuthStore } from '../../stores/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuthStore();
  const [forceRender, setForceRender] = useState(0);

  // Force re-render when user changes to ensure components update
  useEffect(() => {
    console.log('🏗️ Layout - User changed:', user?.email);
    setForceRender(prev => prev + 1);
  }, [user?.email, user?.role]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-950" key={`layout-${forceRender}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <AgentLauncher />
    </div>
  );
}