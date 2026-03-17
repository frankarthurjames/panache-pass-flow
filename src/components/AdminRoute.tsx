import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
