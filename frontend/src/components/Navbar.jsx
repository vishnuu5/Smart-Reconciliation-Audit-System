import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Menu, LogOut, User } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-dark text-black shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div
            className="text-xl sm:text-2xl font-bold cursor-pointer hover:text-primary transition shrink-0"
            onClick={() => navigate("/dashboard")}
          >
            ReconcileAI
          </div>
          <div className="hidden md:flex gap-6 lg:gap-8 items-center">
            <a
              href="/dashboard"
              className="text-sm lg:text-base hover:text-primary transition duration-200 font-medium"
            >
              Dashboard
            </a>
            <a
              href="/upload"
              className="text-sm lg:text-base hover:text-primary transition duration-200 font-medium"
            >
              Upload
            </a>
            <a
              href="/reconciliation"
              className="text-sm lg:text-base hover:text-primary transition duration-200 font-medium"
            >
              Reconciliation
            </a>
            <a
              href="/audit"
              className="text-sm lg:text-base hover:text-primary transition duration-200 font-medium"
            >
              Audit
            </a>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:block text-right text-xs sm:text-sm">
              <p className="font-semibold">{user?.name || "User"}</p>
              <p className="text-gray-400">{user?.role || "Viewer"}</p>
            </div>
            <button
              className="md:hidden p-2 hover:bg-dark-700 rounded transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="bg-primary p-2 rounded-full hover:bg-blue-600 transition duration-200"
                aria-label="User menu"
              >
                <User size={20} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-dark rounded-lg shadow-xl z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 rounded-lg transition font-medium"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-dark-700 border-t border-dark-600">
          <div className="px-4 py-3 space-y-3 max-w-7xl mx-auto">
            <a
              href="/dashboard"
              className="block px-3 py-2 rounded hover:bg-dark-600 transition text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="/upload"
              className="block px-3 py-2 rounded hover:bg-dark-600 transition text-sm font-medium"
            >
              Upload
            </a>
            <a
              href="/reconciliation"
              className="block px-3 py-2 rounded hover:bg-dark-600 transition text-sm font-medium"
            >
              Reconciliation
            </a>
            <a
              href="/audit"
              className="block px-3 py-2 rounded hover:bg-dark-600 transition text-sm font-medium"
            >
              Audit
            </a>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded bg-primary hover:bg-blue-600 transition flex items-center gap-2 text-white text-sm font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
