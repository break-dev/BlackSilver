import {
  Stack,
  Group,
  Button,
  Text,
} from "@mantine/core";
import {
  PlusIcon,
  BuildingOffice2Icon,
  CheckBadgeIcon,
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
    agregarProductoAlComparador,
    agregarCotizacion,
    eliminarCotizacion,
    updateCotizacionHeader,
    updateCotizacionDetail,
    handleSave,
    maestros,
  } = useRegistroCotizacion(onSuccess);

  const productosEnriquecidos = productos.map((p) => {
    const found = maestros.catalogo.find((cp) => cp.id_producto === p.id_producto);
    return {
      ...p,
      nombre: found?.nombre || "Cargando...",
      codigo: found?.codigo || "---",
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
            onUpdateHeader={updateCotizacionHeader}
            onUpdateDetail={updateCotizacionDetail}
            onRemoveCotizacion={eliminarCotizacion}
          />
        )}
      </div>

      {/* Footer del Modal (Abajo a la Izquierda) */}
      <div className="border-t border-zinc-900 pt-6 mt-4 pb-2">
        <Group gap="md">
          <Button
            leftSection={<CheckBadgeIcon className="w-5 h-5" />}
            onClick={handleSave}
            loading={loading}
            radius="xl"
            size="md"
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 px-8"
          >
            Guardar Comparativo
          </Button>
          <Button
            variant="subtle"
            color="gray"
            onClick={onCancel}
            radius="xl"
            className="text-zinc-500 hover:text-white"
          >
            Cancelar y Cerrar
          </Button>
        </Group>
      </div>

      <ModalSeleccionProductos
        opened={modalProductosOpened}
        onClose={() => setModalProductosOpened(false)}
        onSelect={(id) => agregarProductoAlComparador(id)}
        seleccionadosActuales={productos.map((p) => p.id_producto)}
      />
    </Stack>
  );
};
