import { Stack, Group, Button } from "@mantine/core";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useRegistroRecepcion } from "../../hooks/useRegistroRecepcion";
import type { RES_PrestamoEntregaDetalleExtendido } from "../../hooks/useRegistroRecepcion";
import { ProductoRecepcionCard } from "./components/ProductoRecepcionCard";
import type { RES_TicketLote } from "../../../../service/responses/lote-producto";

interface Props {
  idAlmacenSolicitante: number;
  detalles: RES_PrestamoEntregaDetalleExtendido[];
  onSuccess: (lotesNuevos?: RES_TicketLote[]) => void;
  idEntrega?: number;
  tipoEntrega?: "Solicitud" | "Prestamo" | "Reposicion";
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
    toggleActivoSeleccionado,
    getLotError,
    loadingAction,
    handleSubmit,
    unidades,
    loadingUnidades,
    lotesDisponibles,
    loadingLotesDisp,
    errors,
    isFormValid,
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
            key={grouped.id_producto}
            grouped={grouped}
            index={index}
            setLotValue={setLotValue}
            addLot={addLot}
            removeLot={removeLot}
            updateTabularAdjustment={updateTabularAdjustment}
            toggleActivoSeleccionado={toggleActivoSeleccionado}
            getLotError={getLotError}
            lotesDisponibles={lotesDisponibles}
            loadingLotes={loadingLotesDisp}
            unidades={unidades}
            loadingUnidades={loadingUnidades}
            cantidadTotalError={errors[`groups.${index}.cantidad_total`]}
          />
        ))}
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
