import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/public.layout.tsx";
import { AuthLayout } from "../layouts/auth/auth.layout.tsx";
import { ProtectedRoute } from "./protectedRoute.tsx";
import { PublicRoute } from "./publicRoute.tsx";
import { PlaceholderPage } from "../pages/placeholder.page.tsx";
// Layouts
import {
  ConfiguracionLayout,
  EmpresasLayout,
  PersonalLayout,
  UsuariosLayout,
} from "../layouts/configuracion.layout.tsx";
import {
  LogisticaLayout,
  InventarioLayout,
  RequerimientoAlmacenLayout,
  SolicitudReabastecimientoLayout,
  PrestamosAlmacenLayout,
  ComprasLayout,
} from "../layouts/logistica.layout.tsx";
// Vistas
import { LoginPage } from "../../modules/login/presentation/login.page.tsx";
import { HomePage } from "../pages/home/home.page.tsx";
import { ConcesionesPage } from "../../modules/concesiones/presentation/concesiones.page.tsx";
import { MinasPage } from "../../modules/minas-labores/presentation/minas.page.tsx";
import { EmpresasPage } from "../../modules/empresas/presentation/empresas.page.tsx";
import { CategoriasPage } from "../../modules/categorias/presentation/categorias.page.tsx";
import { EmpleadosPage } from "../../modules/empleados/presentation/empleados.page.tsx";
import { AlmacenesPage } from "../../modules/almacenes/presentation/almacenes.page.tsx";
import { ProductosPage } from "../../modules/productos/presentation/productos.page.tsx";
import OrganigramaPage from "../../modules/organigrama/presentation/organigrama.page.tsx";
import { LotesPage } from "../../modules/lotes-productos/presentation/lotes-page/lotes.page.tsx";
// import { RequerimientosAlmacenPage } from "../../modules/requerimientos-almacen/presentation/requerimientos-almacen.page.tsx";
import { RequerimientosAlmacenAtencionPage } from "../../modules/requerimientos-almacen-atencion/presentation/atencion-requerimientos.page.tsx";
import { KardexProductosPage } from "../../modules/kardex-productos/presentation/kardex.page.tsx";
import { RolesPage } from "../../modules/roles/presentation/roles.page.tsx";
import { CuentasPage } from "../../modules/cuentas/presentation/cuentas.page.tsx";
import { SolicitudesReabastecimientoPage } from "../../modules/solicitudes-reabastecimiento/presentation/solicitudes-reabastecimiento.page.tsx";
import { PerfilPage } from "../../modules/perfil/presentation/perfil.page.tsx";
import { SolicitudesReabastecimientoAtencionPage } from "../../modules/solicitudes-reabastecimiento-atencion/presentation/atencion-solicitudes.page.tsx";
import { AtencionPrestamosPage } from "../../modules/prestamos-almacen-atencion/presentation/atencion-prestamos.page.tsx";
import { PrestamosAlmacenPage } from "../../modules/prestamos-almacen/presentation/prestamos-almacen.page.tsx";
import { ProveedoresPage } from "../../modules/proveedores/presentation/proveedores-page/proveedores.page.tsx";
import CotizacionesPage from "../../modules/cotizaciones/presentation/cotizaciones.page.tsx";
import { OrdenesCompraPage } from "../../modules/ordenes-compra/presentation/ordenes-compra-page.tsx";
import { RecepcionTransferenciasOCPage } from "../../modules/ordenes-compra-recepcion-transferencias/presentation/oc-recepcion-transferencias.page.tsx";

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
            {/* <Route
              path="requerimientos"
              element={<RequerimientosAlmacenPage />}
            /> */}
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
            <Route path="ordenes-compra" element={<OrdenesCompraPage />} />
            <Route
              path="recepcion-transferencias"
              element={<RecepcionTransferenciasOCPage />}
            />
          </Route>
        </Route>

        {/* Redireccion */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
};
