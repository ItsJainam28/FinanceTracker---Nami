import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login-form";
import api from "@/api/axiosInstance";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import namiPoster from '@/assets/nami-poster-1.svg';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  // Add setValue to the destructuring
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginFormInputs>();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string; title?: string } | null>(null);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      // Clear any previous alerts
      console.log("Vite API URL",import.meta.env.VITE_API_URL);
      setAlert(null);
      
      const response = await api.post("/auth/login", data);
      const { token } = response.data;
      
      // Show success alert
      setAlert({
        type: 'success',
        title: 'Login successful!',
        message: 'Welcome back! Redirecting to your dashboard...'
      });
      
      // Store token and navigate after a brief delay to show the success message
      localStorage.setItem("token", token);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      
      // Show error alert
      setAlert({
        type: 'error',
        title: 'Login failed',
        message: error.response?.data?.error || "Invalid credentials. Please try again."
      });
    }
  };

  return (
    <div className="dark hide-scrollbar scrollbar-hide">
      <div className="grid min-h-screen lg:grid-cols-2 bg-background text-foreground">
        
        {/* Left Side */}
        <div className="bg-black flex items-center justify-center p-8 overflow-hidden scrollbar-hide">
          <img 
            src={namiPoster}
            alt="Nami Poster" 
            className="h-full w-full object-cover scrollbar-hide  lg:h-auto lg:w-auto lg:max-w-none lg:max-h-full scale-140"
          />
        </div>

        {/* Right Side */}
        <div className="bg-background flex justify-center items-center p-8 scrollbar-hide">
          <div className="w-full max-w-md space-y-6">
            {/* Alert Component */}
            {alert && (
              <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
                {alert.type === 'error' ? <AlertCircleIcon /> : <CheckCircle2Icon />}
                {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}
            
            <LoginForm 
              onSubmit={handleSubmit(onSubmit)}
              register={register}
              errors={errors}
              setValue={setValue}
            />
          </div>
        </div>

      </div>
    </div>
  );
}