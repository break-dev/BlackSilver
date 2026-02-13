import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/public";
import { AuthLayout } from "../layouts/auth/auth";
import { ProtectedRoute } from "./protectedRoute";
import { PublicRoute } from "./publicRoute";
import { Login } from "../pages/login";
import { Home } from "../pages/home";
import { PlaceholderPage } from "../pages/placeholder";
import { EmpresasConcesiones } from "../pages/empresas/concesiones/concesiones";
import { EmpresasLabores } from "../pages/empresas/labores/labores";
import { EmpresasPage } from "../pages/empresas/empresas/empresas";
import { InventarioCategorias } from "../pages/inventario/categorias/categorias";

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
        {/* Redireccion a login si intenta acceder a una ruta que no existe */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Rutas protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <AuthLayout />
          </ProtectedRoute>
        }
      >
        {/* Inicio */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        {/* Perfil */}
        <Route
          path="/perfil"
          element={<PlaceholderPage titulo="Mi Perfil" />}
        />
        {/* Redireccion a home si intenta acceder a una ruta que no existe */}
        <Route path="*" element={<Navigate to="/home" replace />} />
        //#region Configuracion
        {/* Empresas */}
        <Route
          path="/configuracion/empresas/empresas"
          element={<EmpresasPage />}
        />
        <Route
          path="/configuracion/empresas/almacenes"
          element={<PlaceholderPage titulo="Almacenes" />}
        />
        <Route
          path="/configuracion/empresas/concesiones"
          element={<EmpresasConcesiones />}
        />
        <Route
          path="/configuracion/empresas/labores"
          element={<EmpresasLabores />}
        />
        {/* Personal */}
        <Route
          path="/configuracion/personal/areas"
          element={<PlaceholderPage titulo="Áreas" />}
        />
        <Route
          path="/configuracion/personal/cargos"
          element={<PlaceholderPage titulo="Cargos" />}
        />
        <Route
          path="/configuracion/personal/trabajadores"
          element={<PlaceholderPage titulo="Trabajadores" />}
        />
        {/* Usuarios */}
        <Route
          path="/configuracion/usuarios/roles"
          element={<PlaceholderPage titulo="Roles" />}
        />
        <Route
          path="/configuracion/usuarios/cuentas"
          element={<PlaceholderPage titulo="Cuentas" />}
        />
        //#endregion
        {/*  */}
        //#region Logistica
        {/* Inventario */}
        <Route
          path="/logistica/inventario/categorias"
          element={<InventarioCategorias />}
        />
        <Route
          path="/logistica/inventario/familias"
          element={<PlaceholderPage titulo="Familias" />}
        />
        <Route
          path="/logistica/inventario/productos"
          element={<PlaceholderPage titulo="Productos" />}
        />
        <Route
          path="/logistica/inventario/lotes"
          element={<PlaceholderPage titulo="Lotes" />}
        />
        <Route
          path="/logistica/inventario/kardex"
          element={<PlaceholderPage titulo="Kardex" />}
        />
        {/* Solicitudes de Almacen */}
        <Route
          path="/logistica/almacen/solicitudes"
          element={<PlaceholderPage titulo="Solicitudes" />}
        />
        <Route
          path="/logistica/almacen/atenciones"
          element={<PlaceholderPage titulo="Atenciones" />}
        />
        <Route
          path="/logistica/almacen/entregas"
          element={<PlaceholderPage titulo="Entregas" />}
        />
        //#endregion
      </Route>
    </Routes>
  );
};
