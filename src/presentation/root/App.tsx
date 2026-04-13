import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/public.layout";
import { AuthLayout } from "../layouts/auth/auth.layout";
import { ProtectedRoute } from "./protectedRoute";
import { PublicRoute } from "./publicRoute";
import { PlaceholderPage } from "../pages/placeholder.page";
// Layouts
import {
  ConfiguracionLayout,
  EmpresasLayout,
  PersonalLayout,
  UsuariosLayout,
} from "../layouts/configuracion.layout";
import {
  LogisticaLayout,
  InventarioLayout,
  RequerimientoAlmacenLayout,
  SolicitudReabastecimientoLayout,
  PrestamosAlmacenLayout,
  ComprasLayout,
} from "../layouts/logistica.layout";
// Vistas
import { LoginPage } from "../../modules/login/presentation/login.page";
import { HomePage } from "../pages/home/home.page";
import { ConcesionesPage } from "../../modules/concesiones/presentation/concesiones.page";
import { MinasPage } from "../../modules/minas-labores/presentation/minas.page";
import { EmpresasPage } from "../../modules/empresas/presentation/empresas.page";
import { CategoriasPage } from "../../modules/categorias/presentation/categorias.page";
import { EmpleadosPage } from "../../modules/empleados/presentation/empleados.page";
import { AlmacenesPage } from "../../modules/almacenes/presentation/almacenes.page";
import { ProductosPage } from "../../modules/productos/presentation/productos.page";
import OrganigramaPage from "../../modules/organigrama/presentation/organigrama.page";
import { LotesPage } from "../../modules/lotes-productos/presentation/lotes-page/lotes.page";
import { RequerimientosAlmacenPage } from "../../modules/requerimientos-almacen/presentation/requerimientos-almacen.page";
import { RequerimientosAlmacenAtencionPage } from "../../modules/requerimientos-almacen-atencion/presentation/atencion-requerimientos.page";
import { KardexProductosPage } from "../../modules/kardex-productos/presentation/kardex.page";
import { RolesPage } from "../../modules/roles/presentation/roles.page";
import { CuentasPage } from "../../modules/cuentas/presentation/cuentas.page";
import { SolicitudesReabastecimientoPage } from "../../modules/solicitudes-reabastecimiento/presentation/solicitudes-reabastecimiento.page";
import { PerfilPage } from "../../modules/perfil/presentation/perfil.page";
import { SolicitudesReabastecimientoAtencionPage } from "../../modules/solicitudes-reabastecimiento-atencion/presentation/atencion-solicitudes.page";
import { AtencionPrestamosPage } from "../../modules/prestamos-almacen-atencion/presentation/atencion-prestamos.page";
import { PrestamosAlmacenPage } from "../../modules/prestamos-almacen/presentation/prestamos-almacen.page.tsx";
import { ProveedoresPage } from "../../modules/proveedores/presentation/proveedores-page/proveedores.page.tsx";
import CotizacionesPage from "../../modules/cotizaciones/presentation/cotizaciones.page";

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
        <Route path="/login" element={<LoginPage />} />
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
        <Route path="/home" element={<HomePage />} />

        {/* Perfil */}
        <Route path="/perfil" element={<PerfilPage />} />

        {/* Configuracion */}
        <Route path="/configuracion" element={<ConfiguracionLayout />}>
          {/* Empresas */}
          <Route path="empresas" element={<EmpresasLayout />}>
            <Route path="empresas" element={<EmpresasPage />} />
            <Route path="almacenes" element={<AlmacenesPage />} />
            <Route path="concesiones" element={<ConcesionesPage />} />
            <Route path="minas" element={<MinasPage />} />
          </Route>

          {/* Personal */}
          <Route path="personal" element={<PersonalLayout />}>
            <Route path="areas_cargos" element={<OrganigramaPage />} />
            <Route path="trabajadores" element={<EmpleadosPage />} />
          </Route>

          {/* Usuarios */}
          <Route path="usuarios" element={<UsuariosLayout />}>
            <Route path="roles" element={<RolesPage />} />
            <Route path="cuentas" element={<CuentasPage />} />
          </Route>
        </Route>

        {/* Logistica */}
        <Route path="/logistica" element={<LogisticaLayout />}>
          {/* Inventario */}
          <Route path="inventario" element={<InventarioLayout />}>
            <Route path="categorias" element={<CategoriasPage />} />
            <Route
              path="familias"
              element={<PlaceholderPage titulo="Familias" />}
            />
            <Route path="productos" element={<ProductosPage />} />
            <Route path="lotes" element={<LotesPage />} />
            <Route path="kardex" element={<KardexProductosPage />} />
          </Route>

          {/* Requerimientos de Almacen */}
          <Route
            path="requerimiento_almacen"
            element={<RequerimientoAlmacenLayout />}
          >
            <Route
              path="requerimientos"
              element={<RequerimientosAlmacenPage />}
            />
            <Route
              path="atencion_requerimientos"
              element={<RequerimientosAlmacenAtencionPage />}
            />
          </Route>

          {/* Solicitudes de Reabastecimiento */}
          <Route
            path="solicitud_reabastecimiento"
            element={<SolicitudReabastecimientoLayout />}
          >
            <Route
              path="solicitudes"
              element={<SolicitudesReabastecimientoPage />}
            />
            <Route
              path="atencion_solicitudes"
              element={<SolicitudesReabastecimientoAtencionPage />}
            />
          </Route>

          {/* Préstamos entre Almacenes */}
          <Route path="prestamos_almacen" element={<PrestamosAlmacenLayout />}>
            <Route path="prestamos" element={<PrestamosAlmacenPage />} />
            <Route
              path="atencion_prestamos"
              element={<AtencionPrestamosPage />}
            />
          </Route>

          {/* Compras */}
          <Route path="compras" element={<ComprasLayout />}>
            <Route path="proveedores" element={<ProveedoresPage />} />
            <Route path="cotizaciones" element={<CotizacionesPage />} />
          </Route>
        </Route>

        {/* Redireccion */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
};
