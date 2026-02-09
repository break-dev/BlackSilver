import { Navigate } from "react-router-dom";
import { AuthStore } from "../../stores/auth.store";

// Componente que protege rutas autenticadas
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = AuthStore.getState().isAuthenticated;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
