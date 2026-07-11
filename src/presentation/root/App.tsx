import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/public.layout.tsx";
import { AuthLayout } from "../layouts/auth/auth.layout.tsx";
import { ProtectedRoute } from "./protectedRoute.tsx";
import { PublicRoute } from "./publicRoute.tsx";
// import { PlaceholderPage } from "../pages/placeholder.page.tsx";
// Layouts
import { GenericLayout } from "../layouts/generic.layout.tsx";
// Vistas
import { LoginPage } from "../../modules/login/presentation/login.page.tsx";
import { HomePage } from "../pages/home/home.page.tsx";
import { ConcesionesPage } from "../../modules/concesiones/presentation/concesiones.page.tsx";
import { MinasPage } from "../../modules/minas-labores/presentation/minas.page.tsx";
import { EmpresasPage } from "../../modules/empresas/presentation/empresas.page.tsx";
import { CategoriasPage } from "../../modules/categorias/presentation/categorias.page.tsx";
import { PersonalPage } from "../../modules/personal/presentation/personal.page.tsx";
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
import { ClientesPage } from "../../modules/clientes/presentation/clientes-page/clientes.page.tsx";
import { ProveedoresPage } from "../../modules/proveedores/presentation/proveedores-page/proveedores.page.tsx";
import CotizacionesPage from "../../modules/cotizaciones/presentation/cotizaciones.page.tsx";
import { OrdenesCompraPage } from "../../modules/ordenes-compra/presentation/ordenes-compra-page.tsx";
import { RecepcionTransferenciasOCPage } from "../../modules/ordenes-compra-recepcion-transferencias/presentation/oc-recepcion-transferencias.page.tsx";
import { ActivosFijosPage } from "../../modules/activos-fijos/presentation/activos-fijos.page.tsx";
import { useEffect } from "react";
import { onSocketEvent } from "../../service/_socket.ts";
import { useAuditoriaStore } from "../../stores/auditoria.store.ts";
import ModoAuditoriaPage from "../../modules/modo-auditoria/presentation/ModoAuditoriaPage.tsx";
import { ControlConsumoPage } from "../../modules/control-consumo/presentation/control-consumo.page.tsx";
import { ControlUsoPage } from "../../modules/control-uso/presentation/control-uso.page.tsx";
import { LoteMineralPage } from "../../modules/lote-mineral/presentation/lote-mineral.page.tsx";
import { MantenimientoPage } from "../../modules/mantenimiento-activos/presentation/mantenimiento.page.tsx";
import { ProduccionMineralPage } from "../../modules/produccion-mineral/presentation/produccion.page.tsx";
import ProgramacionHorariosPage from "../../modules/programacion-horarios/presentation/programacion-horarios.page.tsx";
import MarcarAsistenciaPage from "../../modules/asistencia/presentation/marcar-asistencia.page.tsx";
import AsistenciaPage from "../../modules/asistencia/presentation/asistencia.page.tsx";

export const App = () => {
  const { setModoAuditoria } = useAuditoriaStore();

  useEffect(() => {
    // Escuchar el evento global de modo auditoría
    const channel = onSocketEvent(
      "global-audit-mode",
      "audit.mode.toggled",
      (data: { en_modo_auditable: boolean }) => {
        console.log("[App] Evento de Auditoría recibido:", data);
        setModoAuditoria(data.en_modo_auditable);
      },
    );

    return () => {
      channel.stopListening(".audit.mode.toggled");
    };
  }, [setModoAuditoria]);

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
      </Route>

      {/* Ruta oculta de auditoría (Sin layout) */}
      <Route path="/modo-auditoria" element={<ModoAuditoriaPage />} />

      {/* Ruta plana de marcar asistencia (Sin layout) */}
      <Route path="/marcar-asistencia" element={<MarcarAsistenciaPage />} />

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
        <Route path="/configuracion" element={<GenericLayout />}>
          {/* Empresas */}
          <Route path="empresas" element={<GenericLayout />}>
            <Route path="empresas" element={<EmpresasPage />} />
            <Route path="almacenes" element={<AlmacenesPage />} />
            <Route path="concesiones" element={<ConcesionesPage />} />
            <Route path="minas" element={<MinasPage />} />
          </Route>

          {/* Personal */}
          <Route path="personal" element={<GenericLayout />}>
            <Route path="areas_cargos" element={<OrganigramaPage />} />
            <Route path="trabajadores" element={<PersonalPage />} />
          </Route>

          {/* Usuarios */}
          <Route path="usuarios" element={<GenericLayout />}>
            <Route path="roles" element={<RolesPage />} />
            <Route path="cuentas" element={<CuentasPage />} />
          </Route>

          {/* Socios Comerciales */}
          <Route path="socios-comerciales" element={<GenericLayout />}>
            <Route path="proveedores" element={<ProveedoresPage />} />
            <Route path="clientes" element={<ClientesPage />} />
          </Route>
        </Route>

        {/* Logistica */}
        <Route path="/logistica" element={<GenericLayout />}>
          {/* Inventario */}
          <Route path="inventario" element={<GenericLayout />}>
            <Route path="categorias" element={<CategoriasPage />} />
            {/* <Route
              path="familias"
              element={<PlaceholderPage titulo="Familias" />}
            /> */}
            <Route path="productos" element={<ProductosPage />} />
            <Route path="activos" element={<ActivosFijosPage />} />
            <Route path="lotes" element={<LotesPage />} />
            <Route path="kardex" element={<KardexProductosPage />} />
          </Route>

          {/* Requerimientos de Almacen */}
          <Route path="requerimiento_almacen" element={<GenericLayout />}>
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
          <Route path="solicitud_reabastecimiento" element={<GenericLayout />}>
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
          <Route path="prestamos_almacen" element={<GenericLayout />}>
            <Route path="prestamos" element={<PrestamosAlmacenPage />} />
            <Route
              path="atencion_prestamos"
              element={<AtencionPrestamosPage />}
            />
          </Route>

          {/* Compras */}
          <Route path="compras" element={<GenericLayout />}>
            <Route path="cotizaciones" element={<CotizacionesPage />} />
            <Route path="ordenes-compra" element={<OrdenesCompraPage />} />
            <Route
              path="recepcion-transferencias"
              element={<RecepcionTransferenciasOCPage />}
            />
          </Route>
        </Route>

        <Route path="/operaciones" element={<GenericLayout />}>
          <Route path="control-activos" element={<GenericLayout />}>
            <Route path="consumo" element={<ControlConsumoPage />} />
            <Route path="uso" element={<ControlUsoPage />} />
            <Route path="mantenimiento" element={<MantenimientoPage />} />
          </Route>
          <Route path="produccion" element={<GenericLayout />}>
            <Route path="lote-mineral" element={<LoteMineralPage />} />
            <Route
              path="produccion-mineral"
              element={<ProduccionMineralPage />}
            />
          </Route>
        </Route>

        {/* Recursos Humanos */}
        <Route path="/recursos-humanos" element={<GenericLayout />}>
          <Route path="control-personal" element={<GenericLayout />}>
            <Route
              path="programacion-horarios"
              element={<ProgramacionHorariosPage />}
            />
            <Route path="asistencia" element={<AsistenciaPage />} />
          </Route>
        </Route>

        {/* Redireccion */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
};
