import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar Panel */}
      <Sidebar />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col overflow-y-auto min-h-screen">
        <main className="p-6 md:p-10 flex-grow pb-16">{children}</main>
      </div>
    </div>
  );
}
