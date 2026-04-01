import { Stack, Group, Button, Switch, Textarea, Alert, Text, Collapse } from "@mantine/core";
import { CheckCircleIcon, ExclamationTriangleIcon, PhotoIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useRegistroRecepcion } from "../../hooks/useRegistroRecepcion";
import { ProductoRecepcionCard } from "./components/ProductoRecepcionCard";
import type { RES_DetalleEntregaReabastecimiento } from "../../service/reabastecimiento.responses";

interface Props {
  idAlmacenSolicitante: number;
  detalles: RES_DetalleEntregaReabastecimiento[];
  onSuccess: () => void;
  idEntrega?: number;
  tipoEntrega?: "Solicitud" | "Prestamo";
  isGlobal?: boolean;
}

export const RegistroRecepcion = ({
  idAlmacenSolicitante,
  detalles,
  onSuccess,
  idEntrega,
  tipoEntrega,
  isGlobal,
}: Props) => {
  const {
    groupedItems,
    setLotValue,
    addLot,
    removeLot,
    updateTabularAdjustment,
    getLotError,
    loadingAction,
    fetchLotesProducto,
    handleSubmit,
    unidades,
    loadingUnidades,
    errors,
    isFormValid,
    conIncidencia,
    setConIncidencia,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    isPartialReception,
  } = useRegistroRecepcion({
    idAlmacenSolicitante,
    detalles,
    onSuccess,
    idEntrega,
    tipoEntrega,
    isGlobal,
  });

  return (
    <form onSubmit={handleSubmit} className="font-sans space-y-4">
      <Stack gap="xl">
        {groupedItems.map((grouped, index) => (
          <ProductoRecepcionCard
            key={grouped.id_solicitud_reabastecimiento_detalle}
            grouped={grouped}
            index={index}
            setLotValue={setLotValue}
            addLot={addLot}
            removeLot={removeLot}
            updateTabularAdjustment={updateTabularAdjustment}
            getLotError={getLotError}
            fetchLotesProducto={fetchLotesProducto}
            unidades={unidades}
            loadingUnidades={loadingUnidades}
            cantidadTotalError={errors[`groups.${index}.cantidad_total`]}
          />
        ))}

        <AnimatePresence>
          {isPartialReception && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert
                color="orange"
                variant="light"
                title="Recepción Parcial Detectada"
                icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                radius="md"
                classNames={{
                  root: "bg-orange-500/10 border-orange-500/20",
                  title: "text-orange-400 font-black uppercase tracking-wider text-xs",
                }}
              >
                <Stack gap="xs">
                  <Text size="xs" className="text-orange-200/80">
                    Has modificado las cantidades para recibir menos de lo entregado. ¿Este descuadre se debe a una incidencia en el traslado?
                  </Text>
                  
                  <Group justify="space-between" align="center" className="bg-zinc-950/40 p-3 rounded-lg border border-orange-500/10">
                    <Stack gap={0}>
                      <Text size="xs" fw={800} className="text-white">Marcar como Incidencia</Text>
                      <Text size="10px" className="text-zinc-500">Esto requerirá observación y evidencias obligatorias.</Text>
                    </Stack>
                    <Switch 
                      checked={conIncidencia}
                      onChange={(e) => setConIncidencia(e.currentTarget.checked)}
                      color="orange"
                      size="md"
                    />
                  </Group>

                  <Collapse in={conIncidencia}>
                    <Stack gap="sm" mt="sm">
                      <Textarea 
                        label="Observación de la Incidencia"
                        placeholder="Describa el motivo del descuadre..."
                        required
                        value={observacion}
                        onChange={(e) => setObservacion(e.currentTarget.value)}
                        error={errors["observacion"]}
                        radius="md"
                        size="xs"
                        minRows={3}
                        leftSection={<ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-orange-400" />}
                        classNames={{
                          input: "bg-zinc-900/50 border-orange-500/20 focus:border-orange-500 text-white",
                          label: "text-zinc-400 font-bold text-[10px] uppercase mb-1",
                        }}
                      />
                      
                      <div className="space-y-1">
                        <Text className="text-zinc-400 font-bold text-[10px] uppercase px-1">Evidencias (URLs / Links)</Text>
                        <Textarea 
                          placeholder="Ingrese los links de las fotos o evidencias (separados por comas)..."
                          required
                          value={evidencias.join(", ")}
                          onChange={(e) => setEvidencias(e.currentTarget.value.split(",").map(s => s.trim()).filter(s => s !== ""))}
                          error={errors["evidencias"]}
                          radius="md"
                          size="xs"
                          minRows={2}
                          leftSection={<PhotoIcon className="w-4 h-4 text-orange-400" />}
                          classNames={{
                            input: "bg-zinc-900/50 border-orange-500/20 focus:border-orange-500 text-white",
                          }}
                        />
                        <Text size="10px" c="dimmed" px={2}>* Por ahora, ingrese los links de las imágenes subidas.</Text>
                      </div>
                    </Stack>
                  </Collapse>
                </Stack>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>

      <Group
        justify="flex-end"
        mt="xl"
        className="sticky bottom-0 bg-zinc-950 pb-2 pt-4 border-t border-zinc-800 z-10"
      >
        <Button
          type="submit"
          loading={loadingAction}
          disabled={!isFormValid}
          color="indigo"
          radius="md"
          size="xs"
          leftSection={<CheckCircleIcon className="w-5 h-5" />}
        >
          Confirmar Recepción
        </Button>
      </Group>
    </form>
  );
};
