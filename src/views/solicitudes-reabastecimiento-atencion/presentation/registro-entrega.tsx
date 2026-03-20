import { Loader, Paper, Stack, Text } from "@mantine/core";
import { useRegistroEntrega } from "../hooks/useRegistroEntrega";
import type { RES_DetalleSolicitud } from "../service/solicitudes-atencion.responses";
import {
  ReceptorInfo,
  ProductoEntregaCard,
  FormActions,
} from "./registro-entrega/components";

interface RegistroEntregaProps {
  idSolicitud: number;
  selectedDetalles: RES_DetalleSolicitud[];
  onSuccess: () => void;
  onCancel?: () => void;
}

export const RegistroEntrega = ({
  idSolicitud,
  selectedDetalles: baseDetalles,
  onSuccess,
  onCancel,
}: RegistroEntregaProps) => {
  const {
    loadingInitial,
    loadingLotes,
    almacenesPrincipales,
    empleados,
    lotesPorProducto,
    idAlmacenEntrega,
    setIdAlmacenEntrega,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    observacion,
    setObservacion,
    entregaCantidades,
    handleCantChange,
    handleConfirmar,
    isProcessing,
    errorLocal,
    selectedDetalles,
  } = useRegistroEntrega({
    idSolicitud,
    selectedDetalles: baseDetalles,
    onSuccess,
  });

  if (loadingInitial) {
    return (
      <div className="flex justify-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  const canSubmit = !!idAlmacenEntrega && !!idEmpleadoRecibe && !isProcessing;

  return (
    <Stack gap="xl" className="font-sans py-2">
      <ReceptorInfo
        almacenesPrincipales={almacenesPrincipales.map((a) => ({
          value: String(a.id_almacen),
          label: a.nombre,
        }))}
        idAlmacenEntrega={idAlmacenEntrega}
        setIdAlmacenEntrega={setIdAlmacenEntrega}
        empleados={empleados.map((e) => ({
          value: String(e.id_empleado),
          label: e.nombre_completo,
        }))}
        idEmpleadoRecibe={idEmpleadoRecibe}
        setIdEmpleadoRecibe={setIdEmpleadoRecibe}
        observacion={observacion}
        setObservacion={setObservacion}
      />

      {loadingLotes ? (
        <div className="flex justify-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
          <Loader size="md" color="indigo" />
        </div>
      ) : (
        <Stack gap="xl">
          {selectedDetalles.map((detalle) => (
            <ProductoEntregaCard
              key={detalle.id_solicitud_detalle}
              detalle={detalle}
              lotes={lotesPorProducto[detalle.id_producto] || []}
              entregaCantidades={entregaCantidades}
              handleCantChange={handleCantChange}
            />
          ))}
        </Stack>
      )}

      {errorLocal && (
        <Paper
          p="md"
          radius="xl"
          className="bg-red-500/5 border border-red-500/20 shadow-sm"
        >
          <Text
            c="red.4"
            size="sm"
            fw={800}
            className="italic text-center tracking-tight"
          >
            {errorLocal}
          </Text>
        </Paper>
      )}

      <FormActions
        onCancel={onCancel || (() => {})}
        onSubmit={handleConfirmar}
        isProcessing={isProcessing}
        canSubmit={canSubmit}
      />
    </Stack>
  );
};
