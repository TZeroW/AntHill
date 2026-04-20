"use client";
import React, { useState, useEffect } from 'react';
import TopNav from './TopNav';
import SidebarLeft from './SidebarLeft';

export default function NavigationManager() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.remove('sidebar-closed');
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
      document.body.classList.add('sidebar-closed');
    }
  }, [isSidebarOpen]);

  return (
    <>
      <TopNav />
      <SidebarLeft toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isOpen={isSidebarOpen} />
    </>
  );
}
