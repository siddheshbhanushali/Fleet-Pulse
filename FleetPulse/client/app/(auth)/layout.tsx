import React from "react";
import { AuthCarousel } from "./_components/auth-carousel";
import { Activity } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex bg-background text-foreground font-sans">
      {/* Left Panel - Carousel & Branding */}
      <div className="relative hidden lg:flex flex-col justify-between w-1/2 overflow-hidden border-r border-border">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          <AuthCarousel />
        </div>

        {/* Header content overlaying carousel */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              FleetPulse
            </span>
          </div>

          {/* Hero Text */}
          <div className="max-w-lg mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight font-serif tracking-tight">
              Precision logistics.
              <br />
              Uncompromising clarity.
            </h1>
            <p className="text-base text-zinc-200 font-light max-w-md">
              Streamline your transportation management with intelligent routing and real-time tracking in a unified workspace.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white overflow-y-auto">
        {/* Form Container */}
        <div className="w-full max-w-[400px] relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
