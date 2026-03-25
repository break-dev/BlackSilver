import { useEffect } from "react";
import { Loader, Stack, Text } from "@mantine/core";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { useRegistroEntrega } from "../../hooks/useRegistroEntrega";
import type { RES_DetallePrestamo } from "../../service/prestamos-atencion.responses";
import { 
  ReceptorInfo, 
  ProductoEntregaCard, 
  FormActions 
} from "./components";

interface Props {
  idPrestamo: number;
  idAlmacenPrestamista: number;
  selectedItemsIds: number[];
  detallesPrestamo: RES_DetallePrestamo[];
  idEmpleadoDefault: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const RegistrarEntregaModal = ({ 
  idPrestamo, 
  idAlmacenPrestamista, 
  selectedItemsIds, 
  detallesPrestamo,
  idEmpleadoDefault,
  onSuccess, 
  onCancel 
}: Props) => {
  const {
    loading,
    itemsAEntregar,
    lotes,
    entregaCantidades,
    empleados,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    observacion,
    setObservacion,
    submitting,
    error,
    totalEntregaGeneralBase,
    cargarDatosIniciales,
    handleCantLoteChange,
    registrarEntrega,
  } = useRegistroEntrega({
    idAlmacenPrestamista,
    selectedItemsIds,
    detallesPrestamo,
    idEmpleadoDefault,
    onSuccess,
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  if (loading) {
    return (
      <Stack align="center" py={50}>
        <Loader size="xl" color="indigo" type="bars" />
        <Text size="sm" fw={900} className="uppercase tracking-[0.3em] animate-pulse italic text-indigo-400">Preparando Bodega...</Text>
      </Stack>
    );
  }

  if (itemsAEntregar.length === 0) {
    return (
      <Stack align="center" py={30}>
          <Text c="red" fw={900} className="italic">No hay items seleccionados para entregar.</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" className="font-sans">
      {/* Información del Receptor y Obs */}
      <ReceptorInfo
        empleados={empleados}
        idEmpleadoRecibe={idEmpleadoRecibe}
        setIdEmpleadoRecibe={setIdEmpleadoRecibe}
        observacion={observacion}
        setObservacion={setObservacion}
      />

      {/* Listado de Productos como Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
            <ArchiveBoxIcon className="w-5 h-5 text-indigo-400" />
            <Text fw={900} className="text-sm text-zinc-400 tracking-widest uppercase italic">Selección de Lotes y Cantidades</Text>
        </div>

        <Stack gap="lg">
          {itemsAEntregar.map((detalle) => (
            <ProductoEntregaCard
              key={detalle.id_prestamo_detalle}
              idDetalle={detalle.id_prestamo_detalle}
              detalle={detalle}
              lotes={lotes.filter(l => l.id_producto === detalle.id_producto)}
              loadingLotes={false} // Ya vienen en el batch inicial
              entregaCantidades={entregaCantidades}
              handleCantLoteChange={handleCantLoteChange}
            />
          ))}
        </Stack>
      </div>

      {/* Acciones del Formulario */}
      <FormActions
        onCancel={onCancel}
        handleConfirmar={() => registrarEntrega(idPrestamo)}
        isProcessing={submitting}
        canSave={!!idEmpleadoRecibe && totalEntregaGeneralBase > 0}
      />

      {error && (
        <Text
          c="red"
          size="xs"
          ta="center"
          fw={800}
          className="italic bg-red-950/10 py-3 rounded-2xl border border-red-900/30 font-mono tracking-wide"
        >
          {error}
        </Text>
      )}
    </Stack>
  );
};
