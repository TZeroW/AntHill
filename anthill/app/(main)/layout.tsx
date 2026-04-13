import TopNav from '../../components/layout/TopNav';
import SidebarLeft from '../../components/layout/SidebarLeft';
import SidebarRight from '../../components/layout/SidebarRight';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      <div className="container">
        <SidebarLeft />
        <main className="feed-center">
          {children}
        </main>
        <SidebarRight />
      </div>
    </>
  );
}
