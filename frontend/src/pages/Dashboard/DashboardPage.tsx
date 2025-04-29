import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import Navbar from "@/components/common/Navbar";

interface User {
  firstname: string;
  lastname: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      
      <div className="flex flex-col justify-center items-center mt-20">
        <h1 className="text-4xl font-bold mb-4">Welcome back, {user.firstname}!</h1>
        <p className="text-lg">Email: {user.email}</p>
      </div>
    </div>
  );
  
}
