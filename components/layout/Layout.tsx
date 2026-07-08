import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ScrollToTopButton from '../ui/ScrollToTopButton';
import TelegramButton from '../ui/TelegramButton';
import BottomNav from '../ui/BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Desktop Sidebar — hidden on mobile via Sidebar's own className */}
      <Sidebar onCollapsedChange={setIsSidebarCollapsed} />

      {/* Mobile & Desktop Header — adjusting width and visibility in Header.tsx */}
      <Header isSidebarCollapsed={isSidebarCollapsed} />

      {/* Main content: shifts right on desktop to account for sidebar width */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <main className="p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      <ScrollToTopButton />
      <TelegramButton />
      <BottomNav />
    </div>
  );
};

export default Layout;