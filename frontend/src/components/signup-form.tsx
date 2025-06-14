import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormRegister, FieldErrors, Control, Controller } from "react-hook-form"
import { Link } from "react-router-dom"

interface SignupFormInputs {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  currency: string;
}

interface SignupFormProps extends React.ComponentProps<"form"> {
  register: UseFormRegister<SignupFormInputs>;
  control: Control<SignupFormInputs>;
  errors: FieldErrors<SignupFormInputs>;
  className?: string;
}

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "KRW", label: "KRW - South Korean Won" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
  { value: "HKD", label: "HKD - Hong Kong Dollar" },
  { value: "NOK", label: "NOK - Norwegian Krone" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "DKK", label: "DKK - Danish Krone" },
  { value: "NZD", label: "NZD - New Zealand Dollar" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "ZAR", label: "ZAR - South African Rand" },
  { value: "RUB", label: "RUB - Russian Ruble" },
];

export function SignupForm({
  className,
  register,
  control,
  errors,
  ...props
}: SignupFormProps) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to create your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-3">
            <Label htmlFor="firstname">First Name</Label>
            <Input 
              id="firstname" 
              type="text" 
              placeholder="John" 
              {...register("firstname", { required: "First name is required" })}
            />
            {errors.firstname && (
              <p className="text-red-500 text-sm">{errors.firstname.message}</p>
            )}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="lastname">Last Name</Label>
            <Input 
              id="lastname" 
              type="text" 
              placeholder="Doe" 
              {...register("lastname", { required: "Last name is required" })}
            />
            {errors.lastname && (
              <p className="text-red-500 text-sm">{errors.lastname.message}</p>
            )}
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            {...register("password", { 
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            {...register("confirmPassword", { 
              required: "Please confirm your password",
              validate: (value, formValues) => {
                return value === formValues.password || "Passwords do not match";
              }
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="currency">Currency</Label>
          <Controller
            name="currency"
            control={control}
            rules={{ required: "Please select a currency" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.currency && (
            <p className="text-red-500 text-sm">{errors.currency.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" className="underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </form>
  )
}