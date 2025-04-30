import { useNavigate, NavLink } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navLinkStyle =
    "text-sm font-medium text-white hover:text-blue-300 transition-colors";

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-md flex justify-between items-center">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-8">
        <div className="text-xl font-bold tracking-wide">FinanceTracker</div>

        <div className="flex items-center gap-6">
          <NavLink to="/dashboard" className={navLinkStyle}>
            Dashboard
          </NavLink>
          <NavLink to="/budgets" className={navLinkStyle}>
            Budgets
          </NavLink>
          <NavLink to="/expenses" className={navLinkStyle}>
            Expenses
          </NavLink>
          <NavLink to="/scheduled-expenses" className={navLinkStyle}>
            Scheduled Expenses
          </NavLink>
          <NavLink to="/categories" className={navLinkStyle}>
            Categories
          </NavLink>
        </div>
      </div>

      {/* Right: Logout */}
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm"
      >
        Logout
      </button>
    </nav>
  );
}

