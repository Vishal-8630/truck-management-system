import type React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Navigate } from "react-router-dom";

type AdminRoutesProps = {
  children: React.ReactNode;
};

const AdminRoutes: React.FC<AdminRoutesProps> = ({ children }) => {
  const { user } = useAuthStore();

  if (user && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default AdminRoutes;
