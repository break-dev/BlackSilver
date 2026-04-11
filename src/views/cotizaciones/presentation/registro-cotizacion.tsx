import { forwardRef, useImperativeHandle } from "react";
import {
  Group,
  Button,
  Text,
} from "@mantine/core";
import {
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { useRegistroCotizacion } from "../hooks/useRegistroCotizacion";
import { ComparativoTabla } from "./comparativo-tabla";
import { ModalSeleccionProductos } from "./modal-seleccion-productos";

interface RegistroCotizacionProps {
  onSuccess: () => void;
  onCancel: () => void;
  modalProductosOpened: boolean;
  setModalProductosOpened: (opened: boolean) => void;
  isCollapsed: boolean;
}

export const RegistroCotizacion = forwardRef<
  { agregarCotizacion: () => void },
  RegistroCotizacionProps
>(({
  onSuccess,
  onCancel,
  modalProductosOpened,
  setModalProductosOpened,
  isCollapsed,
}, ref) => {
  const {
    productos,
    cotizaciones,
    loading,
    loadingMaestros,
    agregarProductoAlComparador,
    agregarCotizacion,
    eliminarCotizacion,
    updateCotizacionHeader,
    updateCotizacionDetail,
    handleSave,
    maestros,
  } = useRegistroCotizacion(onSuccess);

  // Exponemos la función al componente padre (CotizacionesPage)
  useImperativeHandle(ref, () => ({
    agregarCotizacion,
  }));

  const productosEnriquecidos = productos.map(p => {
    const maestro = maestros.catalogo.find(m => m.id_producto === p.id_producto);
    return {
      ...p,
      nombre: maestro?.nombre || "Producto desconocido",
      codigo: maestro?.codigo || "---",
      id_unidad_medida_base: maestro?.id_unidad_medida_base || 0,
      unidad_medida_base: maestro?.unidad_medida_base || "unidades",
      unidad_medida_abreviatura: maestro?.unidad_medida_abreviatura || "UND"
    };
  });

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      {/* Área con Scroll para la Tabla */}
      <div className="flex-1 overflow-auto custom-scrollbar pr-1">
        {productos.length === 0 && cotizaciones.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-900/5">
            <BuildingOffice2Icon className="w-20 h-20 text-zinc-800 mb-6 opacity-50" />
            <Text size="lg" fw={800} className="text-zinc-500 uppercase tracking-widest text-center">
              Prepare su comparativo
            </Text>
            <Text size="xs" className="text-zinc-600 italic mt-2 text-center">
              Haga clic en el botón "Añadir Productos" para comenzar
            </Text>
          </div>
        ) : (
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
            onRemoveCotizacion={eliminarCotizacion}
            isCollapsed={isCollapsed}
          />
        )}
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
        onSelect={(id) => agregarProductoAlComparador(id)}
        seleccionadosActuales={productos.map((p) => p.id_producto)}
      />
    </div>
  );
});

RegistroCotizacion.displayName = "RegistroCotizacion";
