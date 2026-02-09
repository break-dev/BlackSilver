import { Navigate } from "react-router-dom";
import { AuthStore } from "../../stores/auth.store";

// Componente que redirige si ya esta autenticado
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = AuthStore.getState().isAuthenticated;

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
