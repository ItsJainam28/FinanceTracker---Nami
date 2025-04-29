import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/axiosInstance";

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await api.post("/auth/login", data);
      const { token } = response.data;
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen">
      
      {/* Left Side */}
      <div className="w-3/5 bg-gray-800 text-white flex flex-col justify-center items-center p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to FinanceTracker!</h1>
        <p className="text-lg">Track your budget, control your expenses, grow your wealth.</p>
        {/* Later you can add an image/illustration here */}
      </div>

      {/* Right Side */}
      <div className="w-2/5 flex justify-center items-center bg-gray-50 p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

            <Input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <Button className="w-full mt-6" type="submit">
            Login
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>

    </div>
  );
}
