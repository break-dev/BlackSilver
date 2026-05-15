import { Loader, Stack } from "@mantine/core";
import { useGestionAtencion } from "../../hooks/useGestionAtencion";
import type { RES_RequerimientoAlmacen } from "../../../../service/responses/requerimientos-almacen/requerimiento-almacen";
import { InfoHeader } from "./components/InfoHeader";
import { InfoStats } from "./components/InfoStats";
import { InfoProgress } from "./components/InfoProgress";
import { InfoItemsTable } from "./components/InfoItemsTable";
import { InfoActionModals } from "./components/InfoActionModals";

interface InfoRequerimientoProps {
  requerimiento: RES_RequerimientoAlmacen;
  idAlmacen: number;
  onSuccess: (ids?: number[]) => void;
}

export const InfoRequerimiento = ({
  requerimiento,
  idAlmacen,
  onSuccess,
}: InfoRequerimientoProps) => {
  const {
    loading,
    detalles,
    eventos,
    loadingTrazabilidad,
    openedTrace,
    openTrace,
    closeTrace,
    openedRechazo,
    openRechazo,
    closeRechazo,
    openedEntregaBatch,
    openEntregaBatch,
    closeEntregaBatch,
    openedHistorialGlobal,
    openHistorialGlobal,
    closeHistorialGlobal,
    selectedItemId,
    setSelectedItemId,
    selectedItemName,
    setSelectedItemName,
    selectedItemsIds,
    toggleItemSelection,
    isAllEligibleSelected,
    hasPartialEligibleSelection,
    toggleSelectAllEligible,
    comentarioAccion,
    setComentarioAccion,
    openedAprobar,
    openAprobar,
    closeAprobar,
    isProcessing,
    progresoGeneral,
    handleAprobar,
    handleRechazar,
    handleDecisionMasiva,
    idsParaAccionMasiva,
    toggleSeleccionMasiva,
    isAllPendingSelected,
    seleccionarTodoLoPendiente,
    getStatusColor,
    logistica,
  } = useGestionAtencion({
    idRequerimiento: requerimiento.id_requerimiento,
    onSuccess,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  if (!detalles) return null;

  return (
    <Stack gap="xl" className="pb-10">
      <InfoHeader requerimiento={requerimiento} />

      <InfoStats requerimiento={requerimiento} />

      <InfoProgress progresoGeneral={progresoGeneral} />

      <InfoItemsTable
        detalles={detalles}
        selectedItemsIds={selectedItemsIds}
        toggleItemSelection={toggleItemSelection}
        isAllEligibleSelected={isAllEligibleSelected}
        hasPartialEligibleSelection={hasPartialEligibleSelection}
        toggleSelectAllEligible={toggleSelectAllEligible}
        openHistorialGlobal={openHistorialGlobal}
        openEntregaBatch={openEntregaBatch}
        idsParaAccionMasiva={idsParaAccionMasiva}
        setSelectedItemId={setSelectedItemId}
        openAprobar={openAprobar}
        openRechazo={openRechazo}
        logistica={logistica}
        isAllPendingSelected={isAllPendingSelected}
        seleccionarTodoLoPendiente={seleccionarTodoLoPendiente}
        getStatusColor={getStatusColor}
        toggleSeleccionMasiva={toggleSeleccionMasiva}
        setSelectedItemName={setSelectedItemName}
        openTrace={openTrace}
        isProcessing={isProcessing}
      />

      <InfoActionModals
        openedTrace={openedTrace}
        closeTrace={closeTrace}
        selectedItemId={selectedItemId}
        eventos={eventos}
        selectedItemName={selectedItemName}
        loadingTrazabilidad={loadingTrazabilidad}
        openedRechazo={openedRechazo}
        closeRechazo={closeRechazo}
        comentarioAccion={comentarioAccion}
        setComentarioAccion={setComentarioAccion}
        idsParaAccionMasiva={idsParaAccionMasiva}
        isProcessing={isProcessing}
        handleRechazar={handleRechazar}
        handleDecisionMasiva={handleDecisionMasiva}
        openedAprobar={openedAprobar}
        closeAprobar={closeAprobar}
        handleAprobar={handleAprobar}
        openedEntregaBatch={openedEntregaBatch}
        closeEntregaBatch={closeEntregaBatch}
        requerimiento={requerimiento}
        idAlmacen={idAlmacen}
        selectedItemsIds={selectedItemsIds}
        detalles={detalles}
        openedHistorialGlobal={openedHistorialGlobal}
        closeHistorialGlobal={closeHistorialGlobal}
        logistica={{
          opened: logistica.isOpen,
          close: logistica.close,
          onSuccess: logistica.onSuccess,
        }}
      />
    </Stack>
  );
};
