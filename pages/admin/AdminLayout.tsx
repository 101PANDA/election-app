import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-emerald-700 text-white"
        : "text-gray-300 hover:bg-emerald-800 hover:text-white"
    }`;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-green-900 text-white flex flex-col">
        <div className="px-6 py-4 border-b border-emerald-800">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="dashboard" className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="candidates" className={navLinkClasses}>
            Manage Candidates
          </NavLink>
          <NavLink to="voters" className={navLinkClasses}>
            Manage Voters
          </NavLink>
          <NavLink to="results-auth" className={navLinkClasses}>
            View Results
          </NavLink>
        </nav>
        <div className="p-4 border-t border-emerald-800">
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-red-700 hover:text-white"
          >
            Logout
          </button>

          <NavLink
            to="/discreet-login"
            title="Discreet Results"
            className="text-gray-500 hover:text-white transition-colors block text-center mt-2 py-1 text-lg"
          >
            *
          </NavLink>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8 bg-emerald-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
