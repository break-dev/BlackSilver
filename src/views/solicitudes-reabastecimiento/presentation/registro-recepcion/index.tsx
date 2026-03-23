import { Stack, Group, Button } from "@mantine/core";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useRegistroRecepcion } from "../../hooks/useRegistroRecepcion";
import { ProductoRecepcionCard } from "./components/ProductoRecepcionCard";
import type { RES_DetalleEntregaReabastecimiento } from "../../service/reabastecimiento.responses";

interface Props {
  idAlmacenSolicitante: number;
  detalles: RES_DetalleEntregaReabastecimiento[];
  onSuccess: () => void;
}

export const RegistroRecepcion = ({
  idAlmacenSolicitante,
  detalles,
  onSuccess,
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
  } = useRegistroRecepcion({
    idAlmacenSolicitante,
    detalles,
    onSuccess,
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
      </Stack>

      <Group
        justify="flex-end"
        mt="xl"
        className="sticky bottom-0 bg-zinc-950 pb-2 pt-4 border-t border-zinc-800 z-10"
      >
        <Button
          type="submit"
          loading={loadingAction}
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
