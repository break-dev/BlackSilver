import { forwardRef, useImperativeHandle } from "react";
import { Group, Button } from "@mantine/core";
import { useRegistroCotizacion } from "../hooks/useRegistroCotizacion";
import { ComparativoTabla } from "./comparativo/comparativo-tabla";
import { ModalSeleccionProductos } from "./modal-seleccion-productos";
import { ModalAsistenteAprobacion } from "./comparativo/modal-asistente-aprobacion";
import { usePrint } from "../../../hooks/usePrint";
import { CotizacionPDF } from "./cotizacion-pdf";
import type { 
  RES_Cotizacion, 
  RES_CotizacionDetalle, 
  RES_RegistroComparativo,
  RES_MaestroProveedor,
  RES_MaestroProducto,
  RES_MaestroUnidadMedida,
  RES_MaestroEmpresa
} from "../service/cotizaciones.responses";
import type { DTO_RegistrarComparativo } from "../service/cotizaciones.requests";
import { Estado_Cotizacion, Estado_Cotizacion_Detalle } from "../../../shared/enums/cotizacion/cotizacion";

interface RegistroCotizacionProps {
  onSuccess: () => void;
  onCancel: () => void;
  modalProductosOpened: boolean;
  setModalProductosOpened: (opened: boolean) => void;
  isCollapsed: boolean;
  onAutoCollapse?: (collapsed: boolean) => void;
}

export const RegistroCotizacion = forwardRef<
  { agregarCotizacion: () => void },
  RegistroCotizacionProps
>(
  (
    {
      onSuccess,
      onCancel,
      modalProductosOpened,
      setModalProductosOpened,
      isCollapsed,
      onAutoCollapse,
    },
    ref,
  ) => {
    const { print } = usePrint();

    const handleInternalSuccess = (
      data: RES_RegistroComparativo,
      payload: DTO_RegistrarComparativo,
      currentMaestros: {
        proveedores: RES_MaestroProveedor[];
        catalogo: RES_MaestroProducto[];
        unidades: RES_MaestroUnidadMedida[];
        empresas: RES_MaestroEmpresa[];
      },
    ) => {
      if (data && payload) {
        const creadas = data.cotizaciones_ids || [];
        const cotizacionesPDFData = payload.cotizaciones.map((c, idx) => {
          const dataCreada = creadas.find((rc) => rc.index === idx);
          const nombresEmpresas = (c.empresas_ids || []).map((id: number) => 
            (currentMaestros?.empresas || []).find((e: RES_MaestroEmpresa) => e.id_empresa === id)?.razon_social || "---"
          );
          const cotRes: RES_Cotizacion = {
            id: dataCreada?.id || 0,
            correlativo: dataCreada?.correlativo || "---",
            numero_correlativo: 0,
            id_proveedor: c.id_proveedor,
            proveedor_nombre: currentMaestros.proveedores.find((p) => p.id_proveedor === c.id_proveedor)?.razon_social || "Desconocido",
            id_comparativo: data.id_comparativo,
            comparativo_fecha: new Date().toISOString(),
            moneda: c.moneda,
            metodo_pago: c.metodo_pago,
            fecha_vencimiento_pago: c.fecha_vencimiento_pago ?? null,
            total_antes_igv: c.total_antes_igv,
            incluye_igv: c.incluye_igv,
            porcentaje_igv: c.porcentaje_igv,
            monto_igv: c.monto_igv,
            total_despues_igv: c.total_despues_igv,
            observacion: c.observacion ?? null,
            estado: Estado_Cotizacion.Generada,
            evidencias: null,
            fecha_hora_cotizacion: new Date().toISOString(),
            created_at: new Date().toISOString()
          };
          
          const detallesRes: RES_CotizacionDetalle[] = c.detalles.map((d) => {
             const maestro = currentMaestros.catalogo.find((m) => m.id_producto === d.id_producto);
             const uni = currentMaestros.unidades.find((u) => u.id_unidad_medida === d.id_unidad_medida);
             return {
                id: 0,
                id_cotizacion: cotRes.id,
                id_producto: d.id_producto,
                id_comparativo_detalle: 0,
                producto_nombre: maestro?.nombre || "---",
                cantidad: d.cantidad,
                id_unidad_medida: d.id_unidad_medida,
                unidad_medida_nombre: uni?.nombre || "---",
                unidad_medida_abv: uni?.abreviatura || "---",
                unidad_medida_base_abv: uni?.abreviatura || "---",
                contenido_por_presentacion: d.contenido_por_presentacion,
                cantidad_base: d.cantidad_base,
                precio_unitario: d.precio_unitario,
                precio_unitario_base: d.precio_unitario_base,
                no_cotiza: d.no_cotiza ? 1 : 0,
                comentario: d.comentario ?? null,
                estado: Estado_Cotizacion_Detalle.Pendiente
             } as unknown as RES_CotizacionDetalle;
          });

          return { cotizacion: cotRes, detalles: detallesRes, empresas: nombresEmpresas };
        });

        if (cotizacionesPDFData.length > 0) {
          print(<CotizacionPDF cotizaciones={cotizacionesPDFData} />, {
            documentTitle: "Cotizaciones Generadas",
          });
        }
      }
      onSuccess();
    };

    const {
      productos,
      cotizaciones,
      loading,
      loadingMaestros,
      toggleProductoEnComparador,
      productosEnUsoIds,
      agregarCotizacion,
      eliminarCotizacion,
      updateCotizacionHeader,
      updateCotizacionDetail,
      toggleCotizacionNoCotiza,
      handleSave,
      maestros,
      wizardAprobacionOpened,
      setWizardAprobacionOpened,
      wizardPayload,
    } = useRegistroCotizacion(handleInternalSuccess);

    // Exponemos la función al componente padre (CotizacionesPage)
    useImperativeHandle(ref, () => ({
      agregarCotizacion,
    }));

    const productosEnriquecidos = productos.map((p) => {
      const maestro = maestros.catalogo.find(
        (m) => m.id_producto === p.id_producto,
      );
      return {
        ...p,
        nombre: maestro?.nombre || "Producto desconocido",
        codigo: maestro?.codigo || "---",
        id_unidad_medida_base: maestro?.id_unidad_medida_base || 0,
        unidad_medida_base: maestro?.unidad_medida_base || "unidades",
        unidad_medida_abreviatura: maestro?.unidad_medida_abreviatura || "UND",
      };
    });

    return (
      <div className="flex flex-col h-[calc(100vh-180px)] overflow-hidden">
        {/* Área de la Tabla (La tabla maneja su propio scroll interno) */}
        <div className="flex-1 min-h-0 pr-1">
          <ComparativoTabla
            productos={productosEnriquecidos}
            cotizaciones={cotizaciones}
            unidadesMedida={maestros.unidades.map((u) => ({
              value: String(u.id_unidad_medida),
              label: u.nombre,
              abreviatura: u.abreviatura,
            }))}
            proveedores={maestros.proveedores}
            empresas={maestros.empresas}
            loadingProveedores={loadingMaestros}
            onUpdateHeader={updateCotizacionHeader}
            onUpdateDetail={updateCotizacionDetail}
            onToggleNoCotiza={toggleCotizacionNoCotiza}
            onRemoveCotizacion={eliminarCotizacion}
            isCollapsed={isCollapsed}
            onAutoCollapse={onAutoCollapse}
          />
        </div>

        {/* Footer Fijo con Acciones */}
        <div className="pt-2 flex-none bg-zinc-950">
          <Group justify="flex-end" gap="md">
            <Button
              variant="subtle"
              onClick={onCancel}
              disabled={loading}
              radius="xl"
              size="sm"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              Cancelar
            </Button>
            <Button
              loading={loading}
              onClick={handleSave}
              radius="xl"
              size="sm"
              className="bg-zinc-100 text-zinc-900 font-bold hover:bg-white shadow-lg border-0 px-8"
              disabled={productos.length === 0 || cotizaciones.length === 0}
            >
              Registrar Cotización
            </Button>
          </Group>
        </div>

        <ModalSeleccionProductos
          opened={modalProductosOpened}
          onClose={() => setModalProductosOpened(false)}
          onToggle={(id) => toggleProductoEnComparador(id)}
          seleccionadosActuales={productos.map((p) => p.id_producto)}
          productosBloqueados={productosEnUsoIds}
        />

        <ModalAsistenteAprobacion
          opened={wizardAprobacionOpened}
          onClose={() => setWizardAprobacionOpened(false)}
          payloadOriginal={wizardPayload}
          todasLasCotizaciones={wizardPayload?.cotizaciones || []}
          maestros={maestros}
          onSuccessCompleto={onSuccess}
        />
      </div>
    );
  },
);

RegistroCotizacion.displayName = "RegistroCotizacion";
