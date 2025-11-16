import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api";

type ProtectedRouteProps = {
  allowRoles?: string[];
};

export default function ProtectedRoute({ allowRoles }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    api.get("/users/me/")
      .then(res => setRole(res.data.role))
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!role) return <Navigate to="/landing" replace />;

  if (allowRoles && !allowRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())) {
    const redirectMap: Record<string, string> = {
      learner: "/",
      admin: "/admin",
      superadmin: "/superadmin"
    };
    return <Navigate to={redirectMap[role.toLowerCase()] || "/login"} replace />;
  }

  return <Outlet />;
}
