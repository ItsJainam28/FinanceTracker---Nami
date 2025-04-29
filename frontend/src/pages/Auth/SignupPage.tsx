import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/axiosInstance";

interface SignupFormInputs {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  currency: string;
}

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormInputs>();
  const navigate = useNavigate();

  const onSubmit = async (data: SignupFormInputs) => {
    try {
      await api.post("/auth/signup", data);
      navigate("/login");
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.error || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen">
      
      {/* Left Side */}
      <div className="w-3/5 bg-gray-800 text-white flex flex-col justify-center items-center p-8">
        <h1 className="text-4xl font-bold mb-4">Join FinanceTracker!</h1>
        <p className="text-lg">Take control of your financial future with ease.</p>
        {/* You can add a nice illustration here later */}
      </div>

      {/* Right Side */}
      <div className="w-2/5 flex justify-center items-center bg-gray-50 p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="First Name"
              {...register("firstname", { required: "First name is required" })}
            />
            {errors.firstname && <p className="text-red-500 text-sm">{errors.firstname.message}</p>}

            <Input
              type="text"
              placeholder="Last Name"
              {...register("lastname", { required: "Last name is required" })}
            />
            {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname.message}</p>}

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

            <Input
              type="text"
              placeholder="Currency (e.g., USD)"
              {...register("currency", { required: "Currency is required" })}
            />
            {errors.currency && <p className="text-red-500 text-sm">{errors.currency.message}</p>}
          </div>

          <Button className="w-full mt-6" type="submit">
            Sign Up
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>

    </div>
  );
}
