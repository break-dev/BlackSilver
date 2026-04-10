import {
  Stack,
  Group,
  Button,
  Text,
} from "@mantine/core";
import {
  PlusIcon,
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
}

export const RegistroCotizacion = ({
  onSuccess,
  onCancel,
  modalProductosOpened,
  setModalProductosOpened,
}: RegistroCotizacionProps) => {
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

  const productosEnriquecidos = productos.map(p => {
    const maestro = maestros.catalogo.find(m => m.id_producto === p.id_producto);
    return {
      ...p,
      nombre: maestro?.nombre || "Producto desconocido",
      codigo: maestro?.codigo || "---",
      id_unidad_medida_base: maestro?.id_unidad_medida_base || 0,
      unidad_medida_base: maestro?.unidad_medida_base || "unidades"
    };
  });

  return (
    <Stack gap="xl" className="min-h-[70vh]">
      {/* Área Principal (Ancho Completo) */}
      <div className="flex-1">
        <Group justify="space-between" align="flex-end" mb="md">
           <Stack gap={0}>
              <Text fw={800} size="xl" className="text-white tracking-tight">Comparativo</Text>
              <Text size="xs" className="text-zinc-500 italic">Ingrese las distintas cotizaciones que desea comparar</Text>
           </Stack>
           <Button
              variant="filled"
              color="emerald"
              radius="xl"
              leftSection={<PlusIcon className="w-5 h-5" />}
              onClick={agregarCotizacion}
              className="shadow-lg shadow-emerald-900/20"
              styles={{
                root: { border: '1px solid rgba(255, 255, 255, 0.4)' }
              }}
           >
              Añadir Cotización
           </Button>
        </Group>

        {productos.length === 0 && cotizaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-900/5">
            <BuildingOffice2Icon className="w-20 h-20 text-zinc-800 mb-6 opacity-50" />
            <Text size="lg" fw={700} className="text-zinc-500">Prepare su comparativo</Text>
            <Text size="sm" className="text-zinc-600 italic">Haga clic en el botón superior derecho para añadir productos</Text>
          </div>
        ) : (
          <ComparativoTabla
            productos={productosEnriquecidos}
            cotizaciones={cotizaciones}
            unidadesMedida={maestros.unidades.map((u) => ({
              value: String(u.id_unidad_medida),
              label: u.nombre,
            }))}
            proveedores={maestros.proveedores}
            loadingProveedores={loadingMaestros}
            onUpdateHeader={updateCotizacionHeader}
            onUpdateDetail={updateCotizacionDetail}
            onRemoveCotizacion={eliminarCotizacion}
          />
        )}
      </div>

      {/* Acciones del Modal (Pie de Página) */}
      <Group justify="flex-end" gap="md" mt="xl">
        <Button
          variant="subtle"
          onClick={onCancel}
          disabled={loading}
          radius="lg"
          size="sm"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          Cancelar
        </Button>
        <Button
          loading={loading}
          onClick={handleSave}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0 px-8"
        >
          Registrar Cotización
        </Button>
      </Group>

      <ModalSeleccionProductos
        opened={modalProductosOpened}
        onClose={() => setModalProductosOpened(false)}
        onSelect={(id) => agregarProductoAlComparador(id)}
        seleccionadosActuales={productos.map((p) => p.id_producto)}
      />
    </Stack>
  );
};
