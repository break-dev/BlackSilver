import { useEffect } from "react";
import { Loader, Stack, Text } from "@mantine/core";
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
    evidencias,
    setEvidencias,
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
        <Loader size="xl" color="indigo" />
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
    <Stack gap="xl" className="font-sans py-2">
      {/* Información del Receptor y Obs */}
      <ReceptorInfo
        empleados={empleados}
        idEmpleadoRecibe={idEmpleadoRecibe}
        setIdEmpleadoRecibe={setIdEmpleadoRecibe}
        observacion={observacion}
        setObservacion={setObservacion}
        evidencias={evidencias}
        setEvidencias={setEvidencias}
      />

      {/* Listado de Productos como Cards */}
      <Stack gap="xl">
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
