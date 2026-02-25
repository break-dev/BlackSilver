import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/public";
import { AuthLayout } from "../layouts/auth/auth";
import { ProtectedRoute } from "./protectedRoute";
import { PublicRoute } from "./publicRoute";
import { Login } from "../pages/login";
import { Home } from "../pages/home";
import { PlaceholderPage } from "../pages/placeholder";
import { EmpresasConcesiones } from "../pages/empresas/concesiones/concesiones";
import { MinasPage } from "../pages/empresas/minas/minas";
import { EmpresasPage } from "../pages/empresas/empresas/empresas";
import { InventarioCategorias } from "../pages/inventario/categorias/categorias";
import { EmpleadosPage } from "../pages/personal/empleados/empleados";
import { AlmacenesPage } from "../pages/empresas/almacenes/almacenes";
import { InventarioProductos } from "../pages/inventario/productos/productos";
import { LotesPage } from "../pages/inventario/lotes/lotes";
import { KardexPage } from "../pages/inventario/kardex/kardex";
import { RequerimientosPage } from "../pages/requerimientos_almacen/requerimientos/requerimientos";
import { AtencionesPage } from "../pages/requerimientos_almacen/atenciones/atenciones";

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
          element={<AlmacenesPage />}
        />
        <Route
          path="/configuracion/empresas/concesiones"
          element={<EmpresasConcesiones />}
        />
        {/* Redirect ruta antigua para compatibilidad mientras se actualiza BD */}

        <Route
          path="/configuracion/empresas/minas"
          element={<MinasPage />}
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
          element={<EmpleadosPage />}
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
          element={<InventarioProductos />}
        />
        <Route
          path="/logistica/inventario/lotes"
          element={<LotesPage />}
        />
        <Route
          path="/logistica/inventario/kardex"
          element={<KardexPage />}
        />
        {/* Solicitudes de Almacen */}
        <Route
          path="/logistica/requerimientos_almacen/requerimientos"
          element={<RequerimientosPage />}
        />
        <Route
          path="/logistica/requerimientos_almacen/atencion"
          element={<AtencionesPage />}
        />
        <Route
          path="/logistica/requerimientos_almacen/entregas"
          element={<PlaceholderPage titulo="Entregas" />}
        />
        //#endregion
      </Route>
    </Routes>
  );
};
