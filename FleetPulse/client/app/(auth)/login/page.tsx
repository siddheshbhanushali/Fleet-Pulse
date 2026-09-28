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
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { login } = useAuth();

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", data);
      if (response.data.success) {
        toast.success("Successfully logged in!");
        login(response.data.token, response.data.user);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center lg:hidden">
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-serif tracking-tight lg:hidden">
            FleetPulse
          </span>
        </div>
      
      <div className="space-y-1.5 mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-foreground font-serif">Welcome back</h2>
        <p className="text-muted-foreground text-sm font-normal">
          Enter your credentials to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground font-semibold text-sm">
            Email address <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="name@example.com" 
            className={`bg-background text-foreground placeholder:text-muted-foreground h-11 rounded-md focus-visible:ring-0 transition-colors ${
              errors.email ? "border-red-500 focus-visible:border-red-500" : "border-input focus-visible:border-primary"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-foreground font-semibold text-sm">
              Password <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`bg-background text-foreground placeholder:text-muted-foreground h-11 rounded-md focus-visible:ring-0 transition-colors pr-10 ${
                errors.password ? "border-red-500 focus-visible:border-red-500" : "border-input focus-visible:border-primary"
              }`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <Button 
          className="w-full h-11 rounded-md text-sm font-medium mt-6 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors border-0 disabled:opacity-50" 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 pt-8 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Access for Evaluation</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Admin',           email: 'admin@fleetpulse.io' },
            { label: 'Fleet Manager',   email: 'manager@fleetpulse.io' },
            { label: 'Driver',          email: 'driver@fleetpulse.io' },
            { label: 'Finance Analyst', email: 'analyst@fleetpulse.io' }
          ].map((role) => (
            <button
              key={role.label}
              type="button"
              onClick={() => {
                setValue("email", role.email);
                setValue("password", "password123");
              }}
              className="flex flex-col items-start p-3 text-left border border-border rounded-lg hover:border-primary hover:bg-muted transition-all focus:outline-none"
            >
              <span className="text-sm font-semibold text-foreground">{role.label}</span>
              <span className="text-xs text-muted-foreground mt-0.5 truncate w-full">{role.email}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-left">
        <p className="text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-foreground hover:underline underline-offset-4 transition-all">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
