import { Stack, Text, Group, Badge, Button, Divider } from "@mantine/core";
import {
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import type { RES_TransferenciaOC } from "../service/oc-recepcion-transferencias.responses";

interface Props {
  transferencia: RES_TransferenciaOC;
  onOpenHistorial: () => void;
  onOpenNuevaRecepcion: () => void;
}

export const DetalleTransferenciaModal = ({
  transferencia,
  onOpenHistorial,
  onOpenNuevaRecepcion,
}: Props) => {
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "Recepción Completa":
        return "teal";
      case "Recepcionado Parcialmente":
        return "orange";
      default:
        return "blue";
    }
  };

  const detalles = transferencia.detalles || [];

  return (
    <Stack gap="xl">
      {/* Cabecera */}
      <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800/80">
        <Group justify="space-between" align="flex-start" mb="md">
          <Group gap="sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <Text
                size="sm"
                c="dimmed"
                fw={800}
                className="uppercase tracking-widest mb-0.5"
              >
                Transferencia
              </Text>
              <Text
                size="xl"
                fw={900}
                className="text-white tracking-tight leading-none"
              >
                {transferencia.correlativo}
              </Text>
            </div>
          </Group>
          <Badge
            size="lg"
            variant="light"
            color={getBadgeColor(transferencia.estado)}
            className="font-bold"
          >
            {transferencia.estado}
          </Badge>
        </Group>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Group gap="sm" wrap="nowrap">
            <BuildingStorefrontIcon className="w-5 h-5 text-zinc-500 shrink-0" />
            <div>
              <Text
                size="10px"
                fw={800}
                c="dimmed"
                className="uppercase tracking-widest"
              >
                Almacén Destino
              </Text>
              <Text size="sm" fw={700} className="text-zinc-200 truncate">
                {transferencia.almacen_destino}
              </Text>
            </div>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <CalendarDaysIcon className="w-5 h-5 text-zinc-500 shrink-0" />
            <div>
              <Text
                size="10px"
                fw={800}
                c="dimmed"
                className="uppercase tracking-widest"
              >
                Fecha Transferencia
              </Text>
              <Text size="sm" fw={700} className="text-zinc-200">
                {dayjs(transferencia.fecha_hora_transferencia).format(
                  "DD/MM/YYYY HH:mm",
                )}
              </Text>
            </div>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <UserIcon className="w-5 h-5 text-zinc-500 shrink-0" />
            <div>
              <Text
                size="10px"
                fw={800}
                c="dimmed"
                className="uppercase tracking-widest"
              >
                Enviado Por
              </Text>
              <Text size="sm" fw={700} className="text-zinc-200 truncate">
                {transferencia.empleado_transferencia}
              </Text>
            </div>
          </Group>
        </div>

        {transferencia.observacion && (
          <div className="mt-4 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50">
            <Text
              size="10px"
              fw={800}
              c="dimmed"
              className="uppercase tracking-widest mb-1"
            >
              Observación
            </Text>
            <Text size="sm" className="text-zinc-300 italic">
              "{transferencia.observacion}"
            </Text>
          </div>
        )}

        {transferencia.evidencias && transferencia.evidencias.length > 0 && (
          <div className="mt-4">
            <Text
              size="10px"
              fw={800}
              c="dimmed"
              className="uppercase tracking-widest mb-2"
            >
              Evidencias Adjuntas
            </Text>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {transferencia.evidencias.map((ev, i) => (
                <ArchivoCard key={i} archivo={ev} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <Group justify="flex-end" gap="sm">
        <Button
          variant="light"
          color="gray"
          radius="md"
          leftSection={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
          onClick={onOpenHistorial}
          className="hover:bg-zinc-800/50 transition-colors"
        >
          Historial de Recepciones
        </Button>
        {transferencia.estado !== "Recepción Completa" && (
          <Button
            variant="filled"
            color="indigo"
            radius="md"
            leftSection={<PlusIcon className="w-5 h-5" />}
            onClick={onOpenNuevaRecepcion}
            className="shadow-lg shadow-indigo-500/20"
          >
            Nueva Recepción
          </Button>
        )}
      </Group>

      <Divider color="zinc.8" variant="dashed" />

      {/* Productos */}
      <div>
        <Text size="sm" fw={800} className="text-white mb-4">
          Productos Transferidos
        </Text>
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Lote Origen</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3 text-center">Estado Recepción</th>
                <th className="px-4 py-3 text-right">Cant. Transferida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {detalles.map((d) => (
                <tr
                  key={d.id_transferencia_detalle}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Text
                      size="xs"
                      fw={700}
                      className="font-mono text-zinc-400"
                    >
                      {d.lote_correlativo}
                    </Text>
                  </td>
                  <td className="px-4 py-3">
                    <Text size="xs" fw={800} className="text-zinc-200">
                      {d.producto}
                    </Text>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      color={getBadgeColor(d.estado)}
                      variant="dot"
                      size="xs"
                      className="font-bold bg-zinc-950"
                    >
                      {d.estado}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <Text
                        size="sm"
                        fw={800}
                        className="text-indigo-400 font-mono"
                      >
                        {formatNumber(d.cantidad_transferida_base)}
                      </Text>
                      <Text
                        size="10px"
                        fw={800}
                        c="zinc.5"
                        className="uppercase pt-0.5"
                      >
                        {d.unidad_medida_base_abv}
                      </Text>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Stack>
  );
};
