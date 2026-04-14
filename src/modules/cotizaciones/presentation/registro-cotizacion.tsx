import { forwardRef, useImperativeHandle } from "react";
import { Group, Button } from "@mantine/core";
import { useRegistroCotizacion } from "../hooks/useRegistroCotizacion";
import { ComparativoTabla } from "./comparativo/comparativo-tabla";
import { ModalSeleccionProductos } from "./modal-seleccion-productos";

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
    } = useRegistroCotizacion(onSuccess);

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
      </div>
    );
  },
);

RegistroCotizacion.displayName = "RegistroCotizacion";
