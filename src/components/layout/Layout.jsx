import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  // Define widths here to keep logic consistent
  const sidebarWidth = collapsed ? "80px" : "240px";

  return (
    <div className="layout">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        closeSidebar={closeSidebar}
      />

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="fixed-top w-100 vh-100 bg-black opacity-50 d-md-none" 
          style={{ zIndex: 1040 }}
          onClick={closeSidebar}
        ></div>
      )}

      <div
        className="main-wrapper"
        style={{
          // FIX: Subtract sidebar width from total width to prevent overflow
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth})`,
          transition: "all .3s ease",
        }}
      >
        <Header toggleSidebar={toggleSidebar} />

        <div className="p-3 p-md-4 bg-light min-vh-100">
          <Outlet />
        </div>
      </div>

      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }

        .main-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        @media(max-width: 768px) {
          .main-wrapper {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}