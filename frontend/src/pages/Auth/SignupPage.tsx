import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { SignupForm } from "@/components/signup-form";
import api from "@/api/axiosInstance";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";

interface SignupFormInputs {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  currency: string;
}

export default function SignupPage() {
  const { register, handleSubmit, control, formState: { errors } } = useForm<SignupFormInputs>();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string; title?: string } | null>(null);

  const onSubmit = async (data: SignupFormInputs) => {
    try {
      // Clear any previous alerts
      setAlert(null);
      
      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...signupData } = data;
      
      const response = await api.post("/auth/signup", signupData);
      const { token } = response.data;
      
      // Show success alert
      setAlert({
        type: 'success',
        title: 'Account created successfully!',
        message: 'Welcome aboard! Redirecting to your dashboard...'
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
        title: 'Signup failed',
        message: error.response?.data?.error || "Unable to create account. Please try again."
      });
    }
  };

  return (
    <div className="dark">
      <div className="grid min-h-screen lg:grid-cols-2 bg-background text-foreground">
        
        {/* Left Side */}
        <div className="bg-black flex items-center justify-center p-8 overflow-hidden scrollbar-hide">
          <img 
            src="/src/assets/nami-poster-1.svg" 
            alt="Nami Poster" 
            className="h-full w-full object-cover scrollbar-hide h-screen lg:h-auto lg:w-auto lg:max-w-none lg:max-h-full scale-110"
          />
        </div>

        {/* Right Side */}
        <div className="bg-background flex justify-center items-center p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Alert Component */}
            {alert && (
              <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
                {alert.type === 'error' ? <AlertCircleIcon /> : <CheckCircle2Icon />}
                {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}
            
            <SignupForm 
              onSubmit={handleSubmit(onSubmit)}
              register={register}
              control={control}
              errors={errors}
            />
          </div>
        </div>

      </div>
    </div>
  );
}