import Link from 'next/link';

export default function SidebarLeft() {
  return (
    <aside className="sidebar-left">
      <nav className="main-menu">
        <Link href="/" className="active">
          <img src="/assets/general/home.svg" alt="" />
          <span>Home</span>
        </Link>
        <Link href="/explore">
          <img src="/assets/general/compass.svg" alt="" />
          <span>Explore</span>
        </Link>
        <Link href="/profile">
          <img src="/assets/general/profile.svg" alt="" />
          <span>Profile</span>
        </Link>
        <Link href="/settings">
          <img src="/assets/general/settings.svg" alt="" />
          <span>Settings</span>
        </Link>
        <Link href="/login">
          <img src="/assets/general/log_out.svg" alt="" />
          <span>Log out</span>
        </Link>
      </nav>
    </aside>
  );
}
