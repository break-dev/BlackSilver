import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/public";
import { AuthLayout } from "../layouts/auth";
import { ProtectedRoute } from "./protectedRoute";
import { PublicRoute } from "./publicRoute";

// Paginas
import { Login } from "../pages/public/login";
import { Home } from "../pages/home";
import { PlaceholderPage } from "../pages/placeholder";

export const App = () => {
  return (
    <Routes>
      {/* Rutas publicas */}
      <Route
        element={
          <PublicRoute>
            <PublicLayout />
          </PublicRoute>
        }
      >
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Rutas protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <AuthLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        {/* Configuracion > Empresas */}
        <Route
          path="/configuracion/empresas/empresas"
          element={<PlaceholderPage titulo="Empresas" />}
        />
        <Route
          path="/configuracion/empresas/areas"
          element={<PlaceholderPage titulo="Áreas" />}
        />
        <Route
          path="/configuracion/empresas/almacenes"
          element={<PlaceholderPage titulo="Almacenes" />}
        />
        <Route
          path="/configuracion/empresas/concesiones"
          element={<PlaceholderPage titulo="Concesiones" />}
        />
        <Route
          path="/configuracion/empresas/labores"
          element={<PlaceholderPage titulo="Labores" />}
        />

        {/* Configuracion > Personal */}
        <Route
          path="/configuracion/personal/cargos"
          element={<PlaceholderPage titulo="Cargos" />}
        />
        <Route
          path="/configuracion/personal/trabajadores"
          element={<PlaceholderPage titulo="Trabajadores" />}
        />

        {/* Configuracion > Usuarios */}
        <Route
          path="/configuracion/usuarios/roles"
          element={<PlaceholderPage titulo="Roles" />}
        />
        <Route
          path="/configuracion/usuarios/cuentas"
          element={<PlaceholderPage titulo="Cuentas" />}
        />

        {/* Perfil */}
        <Route
          path="/perfil"
          element={<PlaceholderPage titulo="Mi Perfil" />}
        />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
