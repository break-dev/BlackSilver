import { Stack } from "@mantine/core";
import { useRegistroEntrega } from "../../hooks/useRegistroEntrega";
import type { RES_SolicitudDetalle } from "../../../../service/responses/solicitudes-reabastecimiento/solicitud";
import { ReceptorInfo, ProductoEntregaCard, FormActions } from "./components";

interface RegistroEntregaProps {
  idSolicitud: number;
  idEmpleadoSolicitante: number;
  selectedDetalles: RES_SolicitudDetalle[];
  onSuccess: () => void;
  onCancel?: () => void;
}

export const RegistroEntrega = ({
  idSolicitud,
  idEmpleadoSolicitante,
  selectedDetalles: baseDetalles,
  onSuccess,
  onCancel,
}: RegistroEntregaProps) => {
  const {
    loadingAlmacenes,
    loadingPersonal,
    loadingLotes,
    almacenesPrincipales,
    personal,
    lotesPorProducto,
    activosFijos,
    idAlmacenEntrega,
    setIdAlmacenEntrega,
    transporte,
    onChangeTransporte,
    observacion,
    setObservacion,
    entregaCantidades,
    entregaCantidadesActivos,
    handleCantChange,
    handleCantLoteChange,
    handleCantActivoChange,
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

  const canSubmit = !!idAlmacenEntrega && !!transporte.medio_entrega && !isProcessing;

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
        personal={personal}
        loadingPersonal={loadingPersonal}
        transporte={transporte}
        onChangeTransporte={onChangeTransporte}
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
            activosFijos={activosFijos}
            entregaCantidades={entregaCantidades}
            entregaCantidadesActivos={entregaCantidadesActivos}
            loadingLotes={loadingLotes}
            handleCantChange={handleCantChange}
            handleCantLoteChange={handleCantLoteChange}
            handleCantActivoChange={handleCantActivoChange}
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
