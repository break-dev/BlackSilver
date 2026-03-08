import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/public";
import { AuthLayout } from "../layouts/auth/auth";
import { ProtectedRoute } from "./protectedRoute";
import { PublicRoute } from "./publicRoute";
import { PlaceholderPage } from "../pages/placeholder";
// Vistas
import { Login } from "../pages/login";
import { Home } from "../pages/home";
import { ConcesionesPage } from "../pages/concesiones/concesiones";
import MinasPage from "../pages/minas/minas";
import { EmpresasPage } from "../pages/empresas/empresas";
import { CategoriasPage } from "../pages/categorias/categorias";
import { EmpleadosPage } from "../pages/empleados/empleados";
import AlmacenesPage from "../../views/almacenes/presentation/almacenes.page";
import { ProductosPage } from "../pages/productos/productos";
import { LotesPage } from "../pages/lotes/lotes";
import { KardexProductosPage } from "../pages/kardex-productos/kardex-productos";
import { RequerimientosAlmacenPage } from "../pages/requerimientos-almacen/requerimientos-almacen";
import { RequerimientosAlmacenEntregasPage } from "../pages/requerimientos-almacen-entregas/requerimientos-almacen-entregas";
import { SolicitudesReabastecimiento } from "../pages/solicitudes-reabastecimiento/solicitudes-reabastecimiento";

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
          element={<ConcesionesPage />}
        />
        <Route path="/configuracion/empresas/minas" element={<MinasPage />} />
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
          element={<CategoriasPage />}
        />
        <Route
          path="/logistica/inventario/familias"
          element={<PlaceholderPage titulo="Familias" />}
        />
        <Route
          path="/logistica/inventario/productos"
          element={<ProductosPage />}
        />
        <Route path="/logistica/inventario/lotes" element={<LotesPage />} />
        <Route
          path="/logistica/inventario/kardex"
          element={<KardexProductosPage />}
        />
        {/* Solicitudes de Almacen */}
        <Route
          path="/logistica/requerimiento_almacen/requerimientos"
          element={<RequerimientosAlmacenPage />}
        />
        <Route
          path="/logistica/requerimiento_almacen/atencion_requerimientos"
          element={<RequerimientosAlmacenEntregasPage />}
        />
        {/* Solicitudes de Reabastecimiento */}
        <Route
          path="/logistica/solicitud_reabastecimiento/solicitudes"
          element={<SolicitudesReabastecimiento />}
        />
        <Route
          path="/logistica/solicitud_reabastecimiento/atencion_solicitudes"
          element={<PlaceholderPage titulo="Solicitudes de Reabastecimiento" />}
        />
        //#endregion
      </Route>
    </Routes>
  );
};
