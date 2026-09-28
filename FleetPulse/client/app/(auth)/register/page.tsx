"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";
import { FiCamera, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

const registerSchema = z.object({
  fname: z.string().min(1, "First name is required"),
  lname: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  role_id: z.number({ required_error: "Please select a role" }),
  notes: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role_id: 3, // Driver default
    },
  });

  const selectedRoleId = watch("role_id");
  const passwordValue = watch("password") || "";

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        first_name: data.fname,
        last_name: data.lname,
        email: data.email,
        password: data.password,
        phone: data.phone,
      };
      const response = await api.post("/auth/register", payload);
      if (response.data.success) {
        toast.success("Account created successfully!");
        login(response.data.token, response.data.user);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfilePreview(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full py-4">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            FleetPulse
          </span>
        </div>
      
      <div className="space-y-1.5 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
        <p className="text-muted-foreground text-sm font-normal">
          Fill in your details below to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Profile Upload */}
        <div className="flex flex-col mb-4">
          <Label className="text-black font-semibold text-sm mb-3">Profile Picture</Label>
          <div className="flex items-center gap-4">
            {!profilePreview ? (
              <div className="relative w-16 h-16 rounded-full border border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center cursor-pointer group overflow-hidden transition-colors hover:border-black hover:bg-zinc-100">
                <div className="text-zinc-400 group-hover:text-black flex flex-col items-center transition-colors">
                  <FiCamera className="w-5 h-5 mb-0.5" />
                </div>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
              </div>
            ) : (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-zinc-200">
                <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <FiX className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
            
            <div className="text-xs text-zinc-500 font-normal flex flex-col justify-center h-16">
              {profilePreview ? (
                <>
                  <p className="text-black font-medium mb-1">Image selected</p>
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-600 font-medium self-start transition-colors"
                  >
                    Remove photo
                  </button>
                </>
              ) : (
                <>
                  <p>Upload a high-res image.</p>
                  <p>JPG, PNG, or GIF up to 5MB.</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fname" className="text-black font-semibold text-sm">
              First name <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input 
              id="fname" 
              placeholder="John" 
              className={`bg-white text-black placeholder:text-zinc-400 h-10 rounded-md focus-visible:ring-0 transition-colors ${
                errors.fname ? "border-red-500 focus-visible:border-red-500" : "border-zinc-300 focus-visible:border-black"
              }`}
              {...register("fname")} 
            />
            {errors.fname && <p className="text-xs text-red-500 font-medium mt-1">{errors.fname.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lname" className="text-black font-semibold text-sm">
              Last name <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input 
              id="lname" 
              placeholder="Doe" 
              className={`bg-white text-black placeholder:text-zinc-400 h-10 rounded-md focus-visible:ring-0 transition-colors ${
                errors.lname ? "border-red-500 focus-visible:border-red-500" : "border-zinc-300 focus-visible:border-black"
              }`}
              {...register("lname")} 
            />
            {errors.lname && <p className="text-xs text-red-500 font-medium mt-1">{errors.lname.message}</p>}
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-black font-semibold text-sm">
            Email address <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="name@example.com" 
            className={`bg-white text-black placeholder:text-zinc-400 h-10 rounded-md focus-visible:ring-0 transition-colors ${
              errors.email ? "border-red-500 focus-visible:border-red-500" : "border-zinc-300 focus-visible:border-black"
            }`}
            {...register("email")} 
          />
          {errors.email && <p className="text-xs text-red-500 font-medium mt-1">{errors.email.message}</p>}
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-black font-semibold text-sm">
            Password <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"}
              placeholder="••••••••" 
              className={`bg-white text-black placeholder:text-zinc-400 h-10 rounded-md focus-visible:ring-0 transition-colors pr-10 ${
                errors.password ? "border-red-500 focus-visible:border-red-500" : "border-zinc-300 focus-visible:border-black"
              }`}
              {...register("password")} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {watchPassword.length > 0 && (
            <div className="pt-1 space-y-1.5">
              <div className="flex gap-1 h-1 w-full">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div 
                    key={level} 
                    className={`h-full flex-1 rounded-full transition-colors ${
                      strengthScore >= level 
                        ? strengthScore <= 2 ? "bg-red-500" 
                        : strengthScore === 3 ? "bg-yellow-500" 
                        : strengthScore >= 4 ? "bg-green-500" : ""
                        : "bg-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium text-right ${
                strengthScore <= 2 ? "text-red-500" : strengthScore === 3 ? "text-yellow-600" : "text-green-600"
              }`}>
                {strengthScore <= 2 ? "Weak" : strengthScore === 3 ? "Good" : "Strong"}
              </p>
            </div>
          )}
          {errors.password && <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-black font-semibold text-sm">Phone number</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+1 (555) 000-0000" 
              className="bg-white border-zinc-300 text-black placeholder:text-zinc-400 h-10 rounded-md focus-visible:ring-0 focus-visible:border-black transition-colors"
              {...register("phone")} 
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-black font-semibold text-sm">Address</Label>
            <Input 
              id="address" 
              placeholder="123 Main St" 
              className="bg-white border-zinc-300 text-black placeholder:text-zinc-400 h-10 rounded-md focus-visible:ring-0 focus-visible:border-black transition-colors"
              {...register("address")} 
            />
          </div>
        </div>
        
        <Button 
          className="w-full h-11 rounded-md text-sm font-medium mt-6 bg-black hover:bg-zinc-800 text-white transition-colors border-0 disabled:opacity-50" 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-8 text-left">
        <p className="text-zinc-500 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-black hover:underline underline-offset-4 transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
