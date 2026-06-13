import { Text, Group, Switch, Divider, ActionIcon } from "@mantine/core";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { DTO_RecepcionLotExtendido, GroupedReceptionOC } from "../../../hooks/registro-recepcion/useRegistroRecepcionOC";
import type { RES_LoteDisponible } from "../../../../../service/responses/lote-producto";
import { LotesDisponiblesTableOC } from "./LotesDisponiblesTableOC";
import { NuevoLoteFormOC } from "./NuevoLoteFormOC";

interface LoteRecepcionRowOCProps {
  lot: DTO_RecepcionLotExtendido;
  lotIndex: number;
  groupIndex: number;
  group: GroupedReceptionOC;
  productLots: RES_LoteDisponible[];
  loadingLotes: boolean;
  getLotError: (
    groupIndex: number,
    lotIndex: number,
    field: keyof DTO_RecepcionLotExtendido,
  ) => string | null;
  setLotValue: <K extends keyof DTO_RecepcionLotExtendido>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_RecepcionLotExtendido[K],
  ) => void;
  removeLot: (groupIndex: number, lotIndex: number) => void;
  updateTabularAdjustment: (
    groupIndex: number,
    lotIndex: number,
    idLote: number,
    active: boolean,
    qty?: number,
  ) => void;
  comprobanteSerie?: string;
  comprobanteNumero?: string;
}

export const LoteRecepcionRowOC = ({
  lot,
  lotIndex,
  groupIndex,
  group,
  productLots,
  loadingLotes,
  getLotError,
  setLotValue,
  removeLot,
  updateTabularAdjustment,
  comprobanteSerie = "",
  comprobanteNumero = "",
}: LoteRecepcionRowOCProps) => {
  const esNuevoLote = lot.es_nuevo_lote;

  return (
    <div className="p-5 space-y-4 relative group/lot">
      {lotIndex > 0 && <Divider color="zinc.8" variant="dashed" mb="md" />}
      <div className="flex justify-between items-center mb-2">
        <Text size="xs" fw={800} c="dimmed" className="uppercase">
          Partición #{lotIndex + 1}
        </Text>
        {group.lots.length > 1 && (
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => removeLot(groupIndex, lotIndex)}
          >
            <TrashIcon className="w-4 h-4" />
          </ActionIcon>
        )}
      </div>

      <Group justify="space-between">
        <Group gap="xs">
          <Text size="xs" fw={700} c={esNuevoLote ? "zinc.4" : "emerald.4"}>
            Ajustar Stock
          </Text>
          <Switch
            checked={esNuevoLote}
            onChange={(e) =>
              setLotValue(
                groupIndex,
                lotIndex,
                "es_nuevo_lote",
                e.currentTarget.checked,
              )
            }
            color="indigo"
            size="sm"
          />
          <Text size="xs" fw={700} c={esNuevoLote ? "indigo.3" : "zinc.4"}>
            Nuevo Lote
          </Text>
        </Group>
      </Group>

      {!esNuevoLote && (
        <div className="bg-zinc-950/20 p-3 rounded-xl border border-zinc-800/30 mb-2 space-y-3">
          <LotesDisponiblesTableOC
            lotes={productLots}
            loading={loadingLotes}
            selectedAjustes={lot.ajustes ?? {}}
            onUpdateTabular={(id, active, qty) =>
              updateTabularAdjustment(groupIndex, lotIndex, id, active, qty)
            }
            maxQty={group.cantidad_requerida_base}
            unidadBaseAbv={group.unidad_base_abv}
            idOrdenCompra={group.id_orden_compra}
            precioUnitario={group.precio_unitario}
            serieFactura={comprobanteSerie}
            numeroFactura={comprobanteNumero}
          />
        </div>
      )}

      {esNuevoLote && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-300">
          <NuevoLoteFormOC
            groupIndex={groupIndex}
            lotIndex={lotIndex}
            lot={lot}
            setLotValue={setLotValue}
            getLotError={getLotError}
            unidadBaseAbv={group.unidad_base_abv}
            unidadOCAbv={group.unidad_oc_abv}
            contenidoPorPresentacion={group.contenido_por_presentacion_oc}
            esPerecible={group.es_perecible}
            maxPermitido={group.cantidad_requerida_base}
          />
        </div>
      )}
    </div>
  );
};
