import type { ReactNode } from "react"
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUser } from "../../features/auth/authSelectors";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const user = useSelector(selectUser);
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }

  return (<>{children}</>);
}

export default ProtectedRoute