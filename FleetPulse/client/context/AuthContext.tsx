"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "../lib/axios";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const publicRoutes = ["/login", "/register"];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!user && !isPublicRoute) {
        router.push("/login");
      } else if (user && isPublicRoute) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    setUser(userData);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin h-8 w-8 border-4 border-black dark:border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
