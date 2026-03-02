import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

// Componente que protege rutas autenticadas
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
