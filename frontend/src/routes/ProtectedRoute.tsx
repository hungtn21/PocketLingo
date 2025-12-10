import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext.tsx";

type ProtectedRouteProps = {
  allowRoles?: string[];
};

export default function ProtectedRoute({ allowRoles }: ProtectedRouteProps) {
  try {
    const { user, loading } = useUser();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/landing" replace />;

    if (allowRoles && !allowRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())) {
      const redirectMap: Record<string, string> = {
        learner: "/",
        admin: "/admin",
        superadmin: "/admin" // superadmin giống admin
      };
      return <Navigate to={redirectMap[user.role.toLowerCase()] || "/login"} replace />;
    }

    return <Outlet />;
  } catch (error) {
    // If useUser fails (not in UserProvider), redirect to login
    console.error("ProtectedRoute error:", error);
    return <Navigate to="/login" replace />;
  }
}
