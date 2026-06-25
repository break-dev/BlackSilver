import { useEffect } from "react";
import {
  Badge,
  Paper,
  Group,
  Text,
  Switch,
  Alert,
  Button,
  Stack,
  ActionIcon,
  Checkbox,
} from "@mantine/core";
import { CubeIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import { NuevoLoteForm } from "./NuevoLoteForm";
import { LotesDisponiblesTable } from "./LotesDisponiblesTable";
import type {
  GroupedReception,
  DTO_RecibirLotExtendido,
} from "../../../hooks/useRegistroRecepcion";
import type { RES_LoteDisponible } from "../../../../../service/responses/lote-producto";
import type { RES_UnidadMedida } from "../../../../../service/responses/unidad-medida";
import { TipoBien } from "../../../../../shared/enums/_generic/tipo-bien";
import { cn } from "../../../../../shared/functions/cn";
import { validarAjusteLoteClient } from "../../../../../shared/functions/validar-lote";

interface ProductoRecepcionCardProps {
  group: GroupedReception;
  groupIndex: number;
  setLotValue: <K extends keyof DTO_RecibirLotExtendido>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_RecibirLotExtendido[K],
  ) => void;
  addLot: (groupIndex: number, lotIndex: number) => void;
  removeLot: (groupIndex: number, lotIndex: number) => void;
  updateTabularAdjustment: (
    groupIndex: number,
    lotIndex: number,
    idLote: number,
    isActive: boolean,
    qty?: number,
  ) => void;
  toggleActivoSeleccionado?: (groupIndex: number, detailIndex: number) => void;
  getLotError: (
    groupIndex: number,
    lotIndex: number,
    field: keyof DTO_RecibirLotExtendido,
  ) => string | null;
  unidades: RES_UnidadMedida[];
  loadingUnidades: boolean;
  allLotes: RES_LoteDisponible[];
  loadingLotes: boolean;
  cantidadTotalError?: string;
}

export const ProductoRecepcionCard = ({
  group,
  groupIndex,
  setLotValue,
  addLot,
  removeLot,
  updateTabularAdjustment,
  toggleActivoSeleccionado,
  getLotError,
  unidades,
  loadingUnidades,
  allLotes,
  loadingLotes,
  cantidadTotalError,
}: ProductoRecepcionCardProps) => {
  const isPerecible = group.es_perecible;
  const isActivoFijo = group.tipo_bien === TipoBien.ActivoFijo;

  const lotes = allLotes.filter((l) => l.id_producto === group.id_producto);

  useEffect(() => {
    if (loadingLotes || isActivoFijo) return;

    group.lots.forEach((lot, lotIndex) => {
      if (lot.es_nuevo_lote) return;

      const originDetail = group.detalles_origen.find(
        (d) => d.id_entrega_detalle === lot.id_entrega_detalle,
      );

      const hasCompatible = lotes.some((lote) =>
        validarAjusteLoteClient(
          {
            id_orden_compra: lote.id_orden_compra,
            id_orden_compra_detalle: lote.id_orden_compra_detalle,
            serie_factura_compra: lote.serie_factura_compra,
            numero_factura_compra: lote.numero_factura_compra,
            costo_por_unidad: lote.costo_por_unidad,
            id_orden_compra_comprobante: lote.id_orden_compra_comprobante,
          },
          originDetail
            ? {
                lote_id_orden_compra: originDetail.lote_id_orden_compra,
                lote_id_orden_compra_detalle:
                  originDetail.lote_id_orden_compra_detalle,
                lote_serie_factura: originDetail.lote_serie_factura,
                lote_numero_factura: originDetail.lote_numero_factura,
                lote_costo_por_unidad: originDetail.lote_costo_por_unidad,
                id_lote_producto: originDetail.id_lote_producto,
                lote_id_orden_compra_comprobante:
                  originDetail.lote_id_orden_compra_comprobante,
              }
            : null,
          null,
        ),
      );

      if (!hasCompatible) {
        setLotValue(groupIndex, lotIndex, "es_nuevo_lote", true);
      }
    });
  }, [
    loadingLotes,
    lotes,
    group.lots,
    isActivoFijo,
    group.id_producto,
    group.detalles_origen,
    groupIndex,
    setLotValue,
  ]);

  return (
    <Paper
      shadow="md"
      radius="lg"
      className="bg-zinc-900/30 border border-zinc-800/80 overflow-hidden relative"
    >
      {/* Header del Producto */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/50 p-4 px-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/20 shadow-inner">
              <CubeIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <Text
                size="md"
                fw={900}
                className="text-white tracking-tight leading-tight"
              >
                {group.producto}
              </Text>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  variant="dot"
                  color="teal"
                  size="xs"
                  className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 font-bold px-3 py-3 rounded-lg"
                >
                  Total a Recibir: {formatNumber(group.total_entregado_base)}{" "}
                  {group.unidad_base_abv}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Stack gap={0}>
        {isActivoFijo ? (
          <div className="p-5 space-y-4">
            <Stack gap="xs">
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                className="uppercase tracking-wider"
              >
                Seleccione los activos físicos recibidos:
              </Text>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.detalles_origen.map((origen, detIdx) => {
                  const pendiente =
                    Number(origen.cantidad_base) -
                    (Number(origen.cantidad_recibida_total_base) || 0);
                  const isRecibido = pendiente <= 0;

                  return (
                    <div
                      key={origen.id_entrega_detalle}
                      className={cn(
                        "p-4 rounded-xl border flex items-center justify-between transition-all",
                        isRecibido
                          ? "bg-zinc-950/20 border-zinc-800/40 opacity-60 cursor-not-allowed"
                          : origen.selected
                            ? "bg-indigo-950/20 border-indigo-500/40 shadow-sm shadow-indigo-500/5 cursor-pointer"
                            : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700/80 cursor-pointer",
                      )}
                      onClick={() => {
                        if (!isRecibido && toggleActivoSeleccionado) {
                          toggleActivoSeleccionado(groupIndex, detIdx);
                        }
                      }}
                    >
                      <Group gap="sm">
                        <Checkbox
                          checked={isRecibido ? true : !!origen.selected}
                          disabled={isRecibido}
                          onChange={() => {}} // handled by onClick of parent
                          color="indigo"
                          radius="xs"
                        />
                        <Stack gap={1}>
                          <Text
                            size="sm"
                            fw={800}
                            className="text-white leading-tight"
                          >
                            {origen.correlativo_activo_fijo}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {isRecibido
                              ? "Ya recepcionado"
                              : "Pendiente de ingreso"}
                          </Text>
                        </Stack>
                      </Group>
                      <Badge
                        variant="light"
                        color={
                          isRecibido
                            ? "teal"
                            : origen.selected
                              ? "indigo"
                              : "zinc"
                        }
                        size="xs"
                        radius="sm"
                        className="font-bold"
                      >
                        {isRecibido
                          ? "RECIBIDO"
                          : origen.selected
                            ? "SELECCIONADO"
                            : "OMITIR"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Stack>
          </div>
        ) : (
          group.lots.map((lot: DTO_RecibirLotExtendido, lotIndex: number) => {
            const esNuevoLote = lot.es_nuevo_lote;
            const fieldError = getLotError(
              groupIndex,
              lotIndex,
              "id_lote_existente",
            );

            const originDetail = group.detalles_origen.find(
              (d) => d.id_entrega_detalle === lot.id_entrega_detalle,
            );

            return (
              <div
                key={lotIndex}
                className="px-5 py-4 space-y-4 relative group/lot"
              >
                <div className="flex justify-between items-center mb-2">
                  <Group gap="sm" wrap="nowrap">
                    <Text
                      size="xs"
                      fw={800}
                      c="dimmed"
                      className="uppercase tracking-widest whitespace-nowrap"
                    >
                      Partida #{lotIndex + 1}
                    </Text>
                    {lot.lote_correlativo && (
                      <Badge
                        variant="dot"
                        color="yellow"
                        size="xs"
                        className="bg-zinc-800/50 border-zinc-700/50 text-amber-400 font-bold px-2.5 py-2.5 rounded-lg"
                      >
                        Origen: {lot.lote_correlativo}
                        {lot.lote_serie_factura || lot.lote_numero_factura
                          ? ` (${[lot.lote_serie_factura, lot.lote_numero_factura].filter(Boolean).join("-")})`
                          : ""}
                      </Badge>
                    )}
                  </Group>
                  <Group gap="xs">
                    {!isActivoFijo && (
                      <Button
                        size="xs"
                        variant="light"
                        color="indigo"
                        radius="xl"
                        leftSection={<PlusIcon className="w-3.5 h-3.5" />}
                        onClick={() => addLot(groupIndex, lotIndex)}
                      >
                        Dividir
                      </Button>
                    )}
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
                  </Group>
                </div>

                <Group justify="space-between">
                  <Group gap="xs">
                    <Text
                      size="xs"
                      fw={700}
                      c={esNuevoLote ? "zinc.4" : "emerald.4"}
                    >
                      Ingresar a Lote Existente
                    </Text>
                    <Switch
                      checked={esNuevoLote}
                      onChange={(e) => {
                        const checked = e.currentTarget.checked;
                        setLotValue(
                          groupIndex,
                          lotIndex,
                          "es_nuevo_lote",
                          checked,
                        );
                      }}
                      color="indigo"
                      size="sm"
                    />
                    <Text
                      size="xs"
                      fw={700}
                      c={esNuevoLote ? "indigo.3" : "zinc.4"}
                    >
                      Generar Lote Nuevo
                    </Text>
                  </Group>
                </Group>

                {!esNuevoLote && (
                  <div className="bg-zinc-950/20 p-3 rounded-xl border border-zinc-800/30 mb-2 space-y-3">
                    <LotesDisponiblesTable
                      lotes={lotes}
                      loading={loadingLotes}
                      selectedAjustes={lot.ajustes || {}}
                      onUpdateTabular={(id, active, qty) =>
                        updateTabularAdjustment(
                          groupIndex,
                          lotIndex,
                          id,
                          active,
                          qty,
                        )
                      }
                      unidadBaseAbv={group.unidad_base_abv}
                      maxQty={lot.cantidad_base}
                      detallesOrigen={originDetail ? [originDetail] : []}
                    />
                    {fieldError && (
                      <Text size="xs" color="red" mt={4} fw={700}>
                        {fieldError}
                      </Text>
                    )}
                  </div>
                )}

                {esNuevoLote && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                    <NuevoLoteForm
                      groupIndex={groupIndex}
                      lotIndex={lotIndex}
                      lot={lot}
                      setLotValue={setLotValue}
                      getLotError={getLotError}
                      unidades={unidades}
                      loadingUnidades={loadingUnidades}
                      unidadBaseAbv={group.unidad_base_abv}
                      esPerecible={isPerecible}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </Stack>

      {cantidadTotalError && (
        <Alert
          color="red"
          variant="filled"
          icon={<CubeIcon className="w-4 h-4" />}
          m="md"
          radius="md"
        >
          <Text size="xs" fw={700}>
            {cantidadTotalError}
          </Text>
        </Alert>
      )}
    </Paper>
  );
};
