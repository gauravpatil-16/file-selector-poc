import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/organisms/Header";

const Layout = () => {
  const location = useLocation();
  const isPublicBookingPage = location.pathname.startsWith('/config/');
  
  return (
    <div className="min-h-screen bg-background">
      {!isPublicBookingPage && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;