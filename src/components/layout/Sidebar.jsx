import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUserFriends,
  FaClipboardList,
  FaTv,
  FaImages,
  FaCalendarAlt,
} from "react-icons/fa";

export default function Sidebar({ collapsed, mobileOpen, closeSidebar }) {
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const permissions = admin?.permissions || [];

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <FaHome /> },
    { name: "Employees", path: "/employees", icon: <FaUsers /> },
    { name: "VisitorLogs", path: "/visitorLogs", icon: <FaUserFriends /> },
    {
      name: "Devices",
      path: "/devices",
      icon: <FaTv />,
      permission: "manage_devices",
    },
    { name: "Creatives", path: "/creatives", icon: <FaImages /> },
    { name: "Scheduler", path: "/scheduler", icon: <FaCalendarAlt /> },
  ];

  return (
    <div
      className={`sidebar shadow ${mobileOpen ? "open" : ""}`}
      style={{
        width: collapsed ? "80px" : "240px",
        background: "#1e293b",
      }}
    >
      {/* Logo */}

      <div className="text-center text-white py-3 border-bottom border-secondary">
        <h5 className="mb-0 fw-bold">{collapsed ? "VMS" : "VMS Admin"}</h5>
      </div>

      {/* Menu */}

      <ul className="nav flex-column p-2">
        {menuItems
          .filter((item) => {
            if (!item.permission) return true;
            return permissions.includes(item.permission);
          })
          .map((item, index) => {
            const active = location.pathname === item.path;

            return (
              <li key={index} className="nav-item my-1">
                <Link
                  to={item.path}
                  onClick={closeSidebar}
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded 
          ${active ? "bg-primary text-white" : "text-light"}`}
                >
                  <span style={{ fontSize: "18px" }}>{item.icon}</span>
                  {!collapsed && item.name}
                </Link>
              </li>
            );
          })}
      </ul>

      <style>{`

      .sidebar {
  min-height: 100vh;
  height: 100%; /* Ensure it spans full height */
  transition: all .3s ease;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1060; /* Higher than Header */
  overflow-y: auto; /* Allow menu scroll if too many items */
}

      .nav-link {
  white-space: nowrap;
  overflow: hidden;
  transition: all .25s ease;
}
      .nav-link:hover{
        background:rgba(255,255,255,0.1);
        transform:translateX(4px);
      }

      /* MOBILE */

      @media (max-width:768px){

        .sidebar{
          position:fixed;
          left:-260px;
          top:0;
          z-index:1050;
        }

        .sidebar.open{
          left:0;
        }

      }

      `}</style>
    </div>
  );
}
