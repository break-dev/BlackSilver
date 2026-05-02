import {
  Paper,
  UnstyledButton,
  Group,
  Stack,
  Text,
  Badge,
  Tooltip,
  ActionIcon,
  Button,
  Collapse,
  Divider,
} from "@mantine/core";
import dayjs from "dayjs";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentMagnifyingGlassIcon,
  ClipboardDocumentCheckIcon,
  BuildingStorefrontIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { formatNumber } from "../../../../../../shared/functions/formatNumber";
import { MetodoPago } from "../../../../../../shared/enums/_generic/metodo-pago";
import { Estado_Cotizacion } from "../../../../../../shared/enums/cotizacion/cotizacion";
import { MONEDAS } from "../../../../../../shared/variables/monedas";
import type { RES_Cotizacion } from "../../../../../../service/responses/cotizaciones/cotizacion";
import { CotizacionFinancials } from "./CotizacionFinancials";
import { CotizacionDetalleItem } from "./CotizacionDetalleItem";

interface CotizacionCardProps {
  cot: RES_Cotizacion;
  isExpanded: boolean;
  onToggle: () => void;
  onPrintCotizacion: (cot: RES_Cotizacion) => void;
  onPrintOC: (id: number) => void;
  onApprove: (id: number) => void;
  printingOCId: number | null;
  stateConfig: { color: string; label: string; variant: string };
}

export const CotizacionCard = ({
  cot,
  isExpanded,
  onToggle,
  onPrintCotizacion,
  onPrintOC,
  onApprove,
  printingOCId,
  stateConfig,
}: CotizacionCardProps) => {
  return (
    <Paper
      radius="xl"
      className="bg-zinc-950/50 border border-zinc-800/60 transition-all hover:border-zinc-700/60 overflow-hidden"
    >
      {/* Cabecera de la cotización individual */}
      <UnstyledButton component="div" className="w-full" onClick={onToggle}>
        <div className="px-4 py-3">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              {/* Correlativo */}
              <div className="font-mono bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                <Text size="xs" fw={900} className="text-indigo-300">
                  {cot.correlativo}
                </Text>
              </div>

              <Stack gap={1}>
                <Group gap="xs" wrap="nowrap">
                  <Text size="sm" fw={800} className="text-white leading-tight">
                    {cot.proveedor}
                  </Text>
                  <Badge
                    variant={stateConfig.variant}
                    color={stateConfig.color}
                    size="xs"
                    radius="sm"
                    className="font-bold border border-current/10"
                  >
                    {stateConfig.label}
                  </Badge>
                  {cot.id_orden_compra && (
                    <Badge variant="light" color="teal" size="xs" radius="sm">
                      OC generada
                    </Badge>
                  )}
                </Group>
                <Group gap="xs" wrap="nowrap">
                  <Text size="xs" c="dimmed" className="font-mono">
                    {cot.tipo_entidad_proveedor === "Jurídica" ? "RUC" : "DNI"}:{" "}
                    {cot.documento_proveedor}
                  </Text>
                </Group>
                <Group gap="xs">
                  {/* Método pago */}
                  <Badge
                    variant="light"
                    color={
                      cot.metodo_pago === MetodoPago.Credito ? "violet" : "cyan"
                    }
                    size="xs"
                  >
                    {cot.metodo_pago === MetodoPago.Credito
                      ? `Crédito${cot.fecha_vencimiento_pago ? ` · Vence ${dayjs(cot.fecha_vencimiento_pago).format("DD/MM/YY")}` : ""}`
                      : "Contado"}
                  </Badge>
                  {/* Moneda */}
                  <Badge variant="outline" color="zinc" size="xs">
                    {cot.moneda}
                  </Badge>
                </Group>
              </Stack>
            </Group>

            <Group gap="sm" wrap="nowrap">
              {/* Total */}
              <Stack gap={0} align="flex-end" className="hidden sm:flex">
                <Text
                  size="xs"
                  c="dimmed"
                  fw={700}
                  className="uppercase tracking-wider"
                >
                  Total
                </Text>
                <Text size="sm" fw={900} className="text-emerald-400 font-mono">
                  {Object.values(MONEDAS).find((m) => m.label === cot.moneda)
                    ?.symbol ?? "S/"}{" "}
                  {formatNumber(Number(cot.total_despues_igv))}
                </Text>
              </Stack>

              {/* Botón Imprimir Cotizacion */}
              <Tooltip label="Ver Cotización" withArrow>
                <ActionIcon
                  variant="light"
                  color="indigo"
                  radius="xl"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrintCotizacion(cot);
                  }}
                >
                  <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                </ActionIcon>
              </Tooltip>

              {/* Botón Ver Orden de Compra */}
              {cot.id_orden_compra && (
                <Tooltip label="Ver Orden de Compra" withArrow>
                  <ActionIcon
                    variant="light"
                    color="teal"
                    radius="xl"
                    size="sm"
                    loading={printingOCId === cot.id_orden_compra}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrintOC(cot.id_orden_compra!);
                    }}
                  >
                    <ClipboardDocumentCheckIcon className="w-4 h-4" />
                  </ActionIcon>
                </Tooltip>
              )}

              {/* Botón Aprobar */}
              <Button
                size="xs"
                radius="xl"
                color="green"
                variant="filled"
                leftSection={<CheckBadgeIcon className="w-3.5 h-3.5" />}
                disabled={cot.estado === Estado_Cotizacion.Aprobada}
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(cot.id_cotizacion);
                }}
              >
                Aprobar
              </Button>

              <div className="w-6 h-6 rounded-full bg-zinc-800/40 flex items-center justify-center shrink-0">
                {isExpanded ? (
                  <ChevronUpIcon className="w-3.5 h-3.5 text-zinc-500" />
                ) : (
                  <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </div>
            </Group>
          </Group>
        </div>
      </UnstyledButton>

      {/* Detalles expandibles de la cotización */}
      <Collapse in={isExpanded}>
        <div className="px-4 pb-4 pt-0">
          <Divider color="zinc.8" mb="sm" />

          {/* Desglose financiero */}
          <CotizacionFinancials cot={cot} />

          {/* Observación */}
          {cot.observacion && (
            <Paper
              p="xs"
              radius="md"
              mb="sm"
              className="bg-zinc-900/60 border border-zinc-800"
            >
              <Text
                size="xs"
                c="dimmed"
                fw={800}
                className="uppercase tracking-widest mb-1"
              >
                Observaciones
              </Text>
              <Text size="xs" className="italic text-zinc-300">
                {cot.observacion}
              </Text>
            </Paper>
          )}

          {/* Empresas Compradoras */}
          {(() => {
            const cotEmpresas = cot.empresas;
            if (cotEmpresas.length === 0) return null;
            return (
              <div className="mb-4">
                <Group gap="xs" mb="xs" px="xs">
                  <BuildingStorefrontIcon className="w-3.5 h-3.5 text-emerald-400/70" />
                  <Text
                    size="xs"
                    fw={800}
                    c="zinc.4"
                    className="uppercase tracking-widest"
                  >
                    Empresas Compradoras ({cotEmpresas.length})
                  </Text>
                </Group>
                <div className="flex flex-wrap gap-2 px-1">
                  {cotEmpresas.map((emp) => (
                    <div
                      key={emp.id_empresa}
                      className="bg-zinc-900/70 rounded-xl border border-zinc-800/40 px-3 py-2 hover:border-emerald-500/20 transition-colors flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <Text
                        size="11px"
                        fw={700}
                        className="text-zinc-200 leading-tight"
                      >
                        {emp.razon_social}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Tabla de productos */}
          <Group gap="xs" mb="xs" px="xs">
            <CubeIcon className="w-3.5 h-3.5 text-indigo-400/70" />
            <Text
              size="xs"
              fw={800}
              c="zinc.4"
              className="uppercase tracking-widest"
            >
              Productos Cotizados ({cot.detalles.length})
            </Text>
          </Group>

          <div className="grid grid-cols-1 gap-2">
            {cot.detalles.map((det) => (
              <CotizacionDetalleItem
                key={det.id_cotizacion_detalle}
                det={det}
                moneda={cot.moneda}
              />
            ))}
          </div>
        </div>
      </Collapse>
    </Paper>
  );
};
