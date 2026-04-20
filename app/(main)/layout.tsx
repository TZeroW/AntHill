import NavigationManager from '../../components/layout/NavigationManager';
import SidebarRight from '../../components/layout/SidebarRight';
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavigationManager />
      <div className="container" id="main-container">
        <main className="feed-center">
          {children}
        </main>
        <SidebarRight />
      </div>
    </>
  );
}
