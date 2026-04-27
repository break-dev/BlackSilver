import { useEffect } from "react";
import { Loader, Stack, Text } from "@mantine/core";
import { useRegistroTransferenciaOC } from "../../hooks/useRegistroTransferenciaOC";
import { ReceptorInfo } from "./components/ReceptorInfo";
import { ProductoTransferenciaCard } from "./components/ProductoTransferenciaCard";
import { FormActions } from "./components/FormActions";
import type { RES_OrdenCompraRecepcionDetalle } from "../../../../service/responses/ordenes-compra/orden-compra-recepcion";

interface Props {
  idRecepcion: number;
  idAlmacenDestino: number;
  idAlmacenRecepcionista: number;
  selectedItemsIds: number[];
  detallesRecepcion: RES_OrdenCompraRecepcionDetalle[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const RegistrarTransferenciaModal = ({
  idRecepcion,
  idAlmacenDestino,
  idAlmacenRecepcionista,
  selectedItemsIds,
  detallesRecepcion,
  onSuccess,
  onCancel,
}: Props) => {
  const {
    loading,
    itemsATransferir,
    lotes,
    transferenciaCantidades,
    personal,
    idPersonalRecibe,
    setIdPersonalRecibe,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    submitting,
    error,
    totalTransferenciaGeneralBase,
    cargarDatosIniciales,
    handleCantLoteChange,
    registrarTransferencia,
    handleCrearPersonal,
  } = useRegistroTransferenciaOC({
    idAlmacenRecepcionista,
    selectedItemsIds,
    detallesRecepcion,
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

  if (itemsATransferir.length === 0) {
    return (
      <Stack align="center" py={30}>
        <Text c="red" fw={900} className="italic">
          No hay items seleccionados para transferir.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" className="font-sans py-2">
      {/* Información del Receptor y Obs */}
      <ReceptorInfo
        personal={personal.map((p) => ({
          value: p.id_personal.toString(),
          label: `${p.nombre_completo} - ${p.dni}`,
        }))}
        idPersonalRecibe={idPersonalRecibe}
        setIdPersonalRecibe={setIdPersonalRecibe}
        onAddPersonal={handleCrearPersonal}
        observacion={observacion}
        setObservacion={setObservacion}
        evidencias={evidencias}
        setEvidencias={setEvidencias}
      />

      {/* Listado de Productos como Cards */}
      <Stack gap="xl">
        {itemsATransferir.map((detalle) => (
          <ProductoTransferenciaCard
            key={detalle.id_recepcion_detalle}
            idDetalle={detalle.id_recepcion_detalle}
            detalle={detalle}
            lotes={lotes.filter((l) => l.id_producto === detalle.id_producto)}
            loadingLotes={false} // Ya vienen en el batch inicial
            transferenciaCantidades={transferenciaCantidades}
            handleCantLoteChange={handleCantLoteChange}
          />
        ))}
      </Stack>

      {/* Acciones del Formulario */}
      <FormActions
        onCancel={onCancel}
        handleConfirmar={() =>
          registrarTransferencia(idRecepcion, idAlmacenDestino)
        }
        isProcessing={submitting}
        canSave={!!idPersonalRecibe && totalTransferenciaGeneralBase > 0}
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
