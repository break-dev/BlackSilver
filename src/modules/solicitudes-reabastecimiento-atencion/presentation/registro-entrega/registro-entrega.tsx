import { Stack } from "@mantine/core";
import { useRegistroEntrega } from "../../hooks/useRegistroEntrega";
import type { RES_SolicitudDetalle } from "../../../../service/responses/solicitudes-reabastecimiento/solicitud";
import {
  ReceptorInfo,
  ProductoEntregaCard,
  FormActions,
} from "../registro-entrega/components";

interface RegistroEntregaProps {
  idSolicitud: number;
  idEmpleadoSolicitante: number;
  selectedDetalles: RES_SolicitudDetalle[];
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
    loadingAlmacenes,
    loadingEmpleados,
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
    handleCantLoteChange,
    handleConfirmar,
    isProcessing,
    errorLocal,
    selectedDetalles,
    evidencias,
    setEvidencias,
  } = useRegistroEntrega({
    idSolicitud,
    idEmpleadoSolicitante,
    selectedDetalles: baseDetalles,
    onSuccess,
  });

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
        loadingAlmacenes={loadingAlmacenes}
        empleados={empleados.map((e) => ({
          value: String(e.id_empleado),
          label: e.nombre_completo,
        }))}
        idEmpleadoRecibe={idEmpleadoRecibe}
        setIdEmpleadoRecibe={setIdEmpleadoRecibe}
        loadingEmpleados={loadingEmpleados}
        observacion={observacion}
        setObservacion={setObservacion}
        evidencias={evidencias}
        setEvidencias={setEvidencias}
      />

      <Stack gap="xl">
        {selectedDetalles.map((detalle) => (
          <ProductoEntregaCard
            key={detalle.id_solicitud_detalle}
            detalle={detalle}
            lotes={lotesPorProducto[detalle.id_producto] || []}
            entregaCantidades={entregaCantidades}
            loadingLotes={loadingLotes}
            handleCantChange={handleCantChange}
            handleCantLoteChange={handleCantLoteChange}
          />
        ))}
      </Stack>

      <FormActions
        onCancel={onCancel || (() => {})}
        onSubmit={handleConfirmar}
        isProcessing={isProcessing}
        canSubmit={canSubmit}
        errorLocal={errorLocal}
      />
    </Stack>
  );
};
