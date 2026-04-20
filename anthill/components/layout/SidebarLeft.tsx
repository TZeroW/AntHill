"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarLeft({ toggleSidebar, isOpen }: { toggleSidebar?: () => void, isOpen?: boolean }) {
  const pathname = usePathname();
  
  return (
    <aside className="sidebar-left">
      {toggleSidebar && (
        <button className="btn-sidebar-edge" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
      )}
      <nav className="main-menu">
        <Link href="/" className={pathname === '/' ? 'active' : ''}>
          <img src="/assets/general/home.svg" alt="" />
          <span>Home</span>
        </Link>
        <Link href="/explore" className={pathname === '/explore' ? 'active' : ''}>
          <img src="/assets/general/compass.svg" alt="" />
          <span>Explore</span>
        </Link>
        <Link href="/profile" className={pathname === '/profile' ? 'active' : ''}>
          <img src="/assets/general/profile.svg" alt="" />
          <span>Profile</span>
        </Link>
        <Link href="/settings" className={pathname === '/settings' ? 'active' : ''}>
          <img src="/assets/general/settings.svg" alt="" />
          <span>Settings</span>
        </Link>
        <Link href="/login" className={pathname === '/login' ? 'active' : ''}>
          <img src="/assets/general/log_out.svg" alt="" />
          <span>Log out</span>
        </Link>
      </nav>
    </aside>
  );
}
