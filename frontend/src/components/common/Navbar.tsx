import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove token from storage
    navigate("/login"); // redirect back to login
  };

  return (
    <nav className="flex items-center justify-between bg-gray-900 text-white px-8 py-4 shadow-md">
      <div className="text-2xl font-bold">FinanceTracker</div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md"
      >
        Logout
      </button>
    </nav>
  );
}
