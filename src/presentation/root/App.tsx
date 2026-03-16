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
} from "../layouts/logistica.layout";
// Vistas
import { LoginPage } from "../../views/login/presentation/login.page";
import { HomePage } from "../pages/home.page";
import { ConcesionesPage } from "../../views/concesiones/presentation/concesiones.page";
import { MinasPage } from "../../views/minas-labores/presentation/minas.page";
import { EmpresasPage } from "../../views/empresas/presentation/empresas.page";
import { CategoriasPage } from "../../views/categorias/presentation/categorias.page";
import { EmpleadosPage } from "../../views/empleados/presentation/empleados.page";
import { AlmacenesPage } from "../../views/almacenes/presentation/almacenes.page";
import { ProductosPage } from "../../views/productos/presentation/productos.page";
import OrganigramaPage from "../../views/organigrama/presentation/organigrama.page";
import { LotesPage } from "../../views/lotes-productos/presentation/lotes-page/lotes.page";
import { RequerimientosAlmacenPage } from "../../views/requerimientos-almacen/presentation/requerimientos-almacen.page";
import { RequerimientosAlmacenAtencionPage } from "../../views/requerimientos-almacen-atencion/presentation/atencion-requerimientos.page";
import { KardexProductosPage } from "../../views/kardex-productos/presentation/kardex.page";
import { RolesPage } from "../../views/roles/presentation/roles.page";
import { CuentasPage } from "../../views/cuentas/presentation/cuentas.page";
import { SolicitudesReabastecimientoPage } from "../../views/solicitudes-reabastecimiento/presentation/solicitudes-reabastecimiento.page";
import { PerfilPage } from "../../views/perfil/presentation/perfil.page";

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
        <Route
          path="/perfil"
          element={<PerfilPage />}
        />

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
          </Route>
        </Route>

        {/* Redireccion */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
};
