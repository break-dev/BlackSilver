import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

// Componente que redirige si ya esta autenticado
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
