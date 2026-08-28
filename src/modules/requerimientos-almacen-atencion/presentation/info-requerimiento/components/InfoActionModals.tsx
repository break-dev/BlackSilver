import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Textarea,
  Stack,
  Group,
  Text,
  Loader,
} from "@mantine/core";
import type { RES_Trazabilidad } from "../../../../../service/responses/_generic/trazabilidad";
import { DetalleLog } from "../detalle/detalle-log";

interface InfoActionModalsProps {
  openedTrace: boolean;
  closeTrace: () => void;
  selectedItemId: number | null;
  eventos: RES_Trazabilidad[];
  selectedItemName: string;
  loadingTrazabilidad: boolean;
  openedRechazo: boolean;
  closeRechazo: () => void;
  comentarioAccion: string;
  setComentarioAccion: (v: string) => void;
  idsParaAccionMasiva: number[];
  isProcessing: number | null;
  handleRechazar: () => Promise<void> | void;
  handleDecisionMasiva: (estado: import("../../../../../shared/enums/requerimiento-almacen/requerimiento").Estado_RequerimientoDetalle) => Promise<void> | void;
  openedAprobar: boolean;
  closeAprobar: () => void;
  handleAprobar: () => Promise<void> | void;
}

export const InfoActionModals = ({
  openedTrace,
  closeTrace,
  selectedItemId,
  eventos,
  selectedItemName,
  loadingTrazabilidad,
  openedRechazo,
  closeRechazo,
  comentarioAccion,
  setComentarioAccion,
  idsParaAccionMasiva,
  isProcessing,
  handleRechazar,
  handleDecisionMasiva,
  openedAprobar,
  closeAprobar,
  handleAprobar,
}: InfoActionModalsProps) => {
  const [traceLoaded, setTraceLoaded] = useState(false);

  useEffect(() => {
    if (openedTrace) setTraceLoaded(true);
    if (!openedTrace) setTraceLoaded(false);
  }, [openedTrace]);

  return (
    <>
      <Modal
        opened={openedTrace}
        onClose={closeTrace}
        title={`Trazabilidad${selectedItemName ? ` · ${selectedItemName}` : ""}`}
        size="lg"
        centered
      >
        {selectedItemId !== null ? (
          traceLoaded ? (
            <DetalleLog
              loading={loadingTrazabilidad}
              eventos={eventos}
              producto={selectedItemName}
            />
          ) : (
            <Stack align="center" py="xl">
              <Loader color="indigo" />
            </Stack>
          )
        ) : (
          <Text c="zinc.5">Selecciona un item para ver su trazabilidad.</Text>
        )}
      </Modal>

      <Modal
        opened={openedAprobar}
        onClose={closeAprobar}
        title={
          selectedItemId
            ? "¿Desea aprobar este producto? Puede ingresar un comentario opcional."
            : `¿Desea aprobar ${idsParaAccionMasiva.length} productos? Puede ingresar un comentario opcional.`
        }
        centered
      >
        <Stack>
          <Textarea
            placeholder="Comentario (opcional)"
            autosize
            minRows={2}
            value={comentarioAccion}
            onChange={(e) => setComentarioAccion(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeAprobar}>
              Cancelar
            </Button>
            <Button
              color="green"
              loading={
                selectedItemId
                  ? isProcessing === selectedItemId
                  : isProcessing === -1
              }
              onClick={() =>
                selectedItemId
                  ? handleAprobar()
                  : (
                      handleDecisionMasiva as unknown as (
                        e: "Aprobado" | "Rechazado",
                      ) => Promise<void>
                    )("Aprobado")
              }
            >
              Aprobar
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={openedRechazo}
        onClose={closeRechazo}
        title={
          selectedItemId
            ? "¿Desea rechazar este producto? Puede ingresar un comentario opcional."
            : `¿Desea rechazar ${idsParaAccionMasiva.length} productos? Puede ingresar un comentario opcional.`
        }
        centered
      >
        <Stack>
          <Textarea
            placeholder="Comentario (opcional)"
            autosize
            minRows={2}
            value={comentarioAccion}
            onChange={(e) => setComentarioAccion(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeRechazo}>
              Cancelar
            </Button>
            <Button
              color="red"
              loading={
                selectedItemId
                  ? isProcessing === selectedItemId
                  : isProcessing === -1
              }
              onClick={() =>
                selectedItemId
                  ? handleRechazar()
                  : (
                      handleDecisionMasiva as unknown as (
                        e: "Aprobado" | "Rechazado",
                      ) => Promise<void>
                    )("Rechazado")
              }
            >
              Rechazar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
