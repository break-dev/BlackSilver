import { useState } from "react";
import {
  Stack,
  Text,
  Badge,
  Group,
  Tooltip,
  ActionIcon,
  Paper,
  Divider,
} from "@mantine/core";
import dayjs from "dayjs";
import {
  ArrowPathIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { usePrint } from "../../../hooks/usePrint";
import { useOrdenCompra } from "../hooks/useOrdenCompra";
import { OrdenCompraService } from "../service/orden-compra.service";
import { OrdenCompraPDF } from "./orden-compra-pdf";
import { useNotify } from "../../../hooks/useNotify";
import { Estado_OrdenCompra } from "../../../shared/enums/orden-compra/orden-compra";
import type { RES_OrdenCompra } from "../service/orden-compra.responses";

// ─── Colores por estado ──────────────────────────────────────────────────────
const COLOR_BY_STATE: Record<string, { color: string; label: string }> = {
  [Estado_OrdenCompra.Generada]:    { color: "teal",   label: "Generada" },
  [Estado_OrdenCompra.EnRecepcion]: { color: "blue",   label: "En Recepción" },
  [Estado_OrdenCompra.Anulada]:     { color: "red",    label: "Anulada" },
  [Estado_OrdenCompra.Cerrada]:     { color: "gray",   label: "Cerrada" },
  [Estado_OrdenCompra.Completada]:  { color: "green",  label: "Completada" },
};

export const OrdenCompraPage = () => {
  useTitlePage("Órdenes de Compra");

  const { ordenes, loading, fetchOrdenes } = useOrdenCompra();
  const { print } = usePrint();
  const { notify } = useNotify();
  const [printingId, setPrintingId] = useState<number | null>(null);

  const handlePrintOC = async (orden: RES_OrdenCompra) => {
    setPrintingId(orden.id);
    try {
      const res = await OrdenCompraService.get_detalles(orden.id);
      if (res.success) {
        print(<OrdenCompraPDF orden={orden} detalles={res.data.detalles} />, {
          documentTitle: `OC - ${orden.correlativo}`,
        });
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({ type: "error", content: "No se pudo generar el PDF." });
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <ClipboardDocumentCheckIcon className="w-6 h-6 text-emerald-400" />
          <Text fw={800} size="lg" className="text-white">
            Órdenes de Compra
          </Text>
          <Badge variant="light" color="teal" size="sm">
            {ordenes.length} registros
          </Badge>
        </Group>
        <Tooltip label="Actualizar" withArrow>
          <ActionIcon
            variant="subtle"
            color="zinc"
            onClick={fetchOrdenes}
            loading={loading}
          >
            <ArrowPathIcon className="w-4 h-4" />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Divider color="zinc.8" />

      {/* Listado */}
      {loading ? (
        <Stack align="center" gap="md" py={100}>
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            <ArrowPathIcon className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <Text size="xs" fw={900} className="uppercase tracking-[0.3em] text-zinc-500">
            Cargando Órdenes...
          </Text>
        </Stack>
      ) : ordenes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-4xl bg-zinc-900/10">
          <ClipboardDocumentCheckIcon className="w-12 h-12 text-zinc-700 mb-4" />
          <Text size="sm" fw={700} className="text-zinc-400 uppercase tracking-widest">
            No hay Órdenes de Compra
          </Text>
          <Text size="xs" c="dimmed" className="mt-1">
            Se generan automáticamente al aprobar una cotización.
          </Text>
        </div>
      ) : (
        <Stack gap="sm">
          {ordenes.map((orden) => {
            const stateInfo = COLOR_BY_STATE[orden.estado] ?? { color: "gray", label: orden.estado };
            const symbol = orden.moneda === "Soles" ? "S/." : "$";

            return (
              <Paper
                key={orden.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 hover:border-emerald-800/40 transition-all"
              >
                <Group justify="space-between" wrap="nowrap">
                  {/* Info principal */}
                  <Group gap="md" wrap="nowrap" className="flex-1 min-w-0">
                    {/* Correlativo */}
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed" className="uppercase tracking-wider">
                        Orden
                      </Text>
                      <Text size="sm" fw={900} className="text-emerald-400 font-mono">
                        {orden.correlativo}
                      </Text>
                    </Stack>

                    <Divider orientation="vertical" color="zinc.8" />

                    {/* Empresa */}
                    <Stack gap={0} className="min-w-0">
                      <Text size="xs" c="dimmed">Empresa compradora</Text>
                      <Text size="sm" fw={700} className="text-white truncate">
                        {orden.empresa_nombre}
                      </Text>
                      {orden.empresa_ruc && (
                        <Text size="11px" c="dimmed">RUC: {orden.empresa_ruc}</Text>
                      )}
                    </Stack>

                    <Divider orientation="vertical" color="zinc.8" />

                    {/* Cotización origen */}
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">Cotización</Text>
                      <Text size="xs" fw={700} className="text-indigo-300 font-mono">
                        {orden.correlativo_cotizacion}
                      </Text>
                    </Stack>

                    <Divider orientation="vertical" color="zinc.8" />

                    {/* Fecha */}
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">Fecha</Text>
                      <Text size="xs" fw={600} className="text-zinc-300">
                        {dayjs(orden.fecha_hora_orden).format("DD/MM/YYYY")}
                      </Text>
                    </Stack>
                  </Group>

                  {/* Acciones */}
                  <Group gap="sm" wrap="nowrap">
                    <Stack gap={0} align="flex-end">
                      <Text size="xs" c="dimmed" className="uppercase tracking-wider">
                        Total
                      </Text>
                      <Text size="sm" fw={900} className="text-emerald-400 font-mono">
                        {symbol} {formatNumber(Number(orden.total_despues_igv))}
                      </Text>
                    </Stack>

                    <Badge
                      variant={orden.estado === Estado_OrdenCompra.Completada ? "filled" : "light"}
                      color={stateInfo.color}
                      size="sm"
                    >
                      {stateInfo.label}
                    </Badge>

                    {/* Botón PDF */}
                    <Tooltip label="Ver Orden de Compra (PDF)" withArrow>
                      <ActionIcon
                        variant="light"
                        color="teal"
                        radius="xl"
                        size="sm"
                        loading={printingId === orden.id}
                        onClick={() => handlePrintOC(orden)}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      )}
    </div>
  );
};

export default OrdenCompraPage;
