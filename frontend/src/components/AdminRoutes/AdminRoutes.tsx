import type React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSelectors";
import { Navigate } from "react-router-dom";

type AdminRoutesProps = {
  children: React.ReactNode;
};

const AdminRoutes: React.FC<AdminRoutesProps> = ({ children }) => {
  const user = useSelector(selectUser);

  if (user && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default AdminRoutes;
