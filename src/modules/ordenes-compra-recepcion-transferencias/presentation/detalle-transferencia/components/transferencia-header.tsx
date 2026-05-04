import { Stack, Paper, Text, Group } from "@mantine/core";
import {
  CalendarDaysIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  InboxStackIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import type { RES_OCTransferencia } from "../../../../../service/responses/ordenes-compra/orden-compra-transferencia";
import {
  HeaderCard,
  InfoItem,
} from "../../../../prestamos-almacen-atencion/presentation/components/detail-elements";
import { ArchivoCard } from "../../../../../presentation/utils/archivo/archivo-card";

interface Props {
  transferencia: RES_OCTransferencia;
}

export const TransferenciaHeader = ({ transferencia }: Props) => {
  return (
    <Stack gap="md">
      {/* Grid de Cabecera Estilo Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        <HeaderCard
          icon={BuildingStorefrontIcon}
          label="Origen"
          value={transferencia.almacen_origen}
          color="indigo"
        />
        <HeaderCard
          icon={MapPinIcon}
          label="Destino"
          value={transferencia.almacen_destino}
          color="emerald"
        />
        <HeaderCard
          icon={UserIcon}
          label="Enviado Por"
          value={transferencia.empleado_transferencia}
          color="zinc"
        />
        <HeaderCard
          icon={CalendarDaysIcon}
          label="Fecha Envío"
          value={dayjs(transferencia.fecha_hora_transferencia).format(
            "DD/MM/YYYY",
          )}
          color="amber"
        />
      </div>

      {/* Referencias y Datos de Control */}
      <Paper
        p="md"
        radius="lg"
        className="bg-transparent border border-zinc-800/50 mx-2"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <InfoItem
            label="Orden de Compra"
            value={transferencia.codigo_orden_compra || "N/A"}
            icon={DocumentTextIcon}
            isMono
          />
          <InfoItem
            label="Nro. Recepción"
            value={transferencia.numero_recepcion || "N/A"}
            icon={InboxStackIcon}
            isMono
          />
          <InfoItem
            label="Estado"
            value={transferencia.estado}
            color={
              transferencia.estado === "Recepción Completa" ? "green" : "orange"
            }
          />
        </div>
      </Paper>

      {/* Observaciones y Evidencias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-2">
        {/* Observación */}
        <Paper
          p="md"
          radius="lg"
          className="bg-zinc-900/20 border border-zinc-800 h-full flex flex-col"
        >
          <Stack gap={4} className="flex-1">
            <Group gap={6}>
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-zinc-500" />
              <Text
                size="xs"
                c="zinc.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Observaciones del Envío
              </Text>
            </Group>
            <Text
              size="sm"
              className="text-zinc-300 italic leading-relaxed pl-6 whitespace-pre-wrap"
            >
              {transferencia.observacion || "Sin observaciones."}
            </Text>
          </Stack>
        </Paper>

        {/* Evidencias */}
        <Paper
          p="md"
          radius="lg"
          className="bg-zinc-900/20 border border-zinc-800 h-full flex flex-col"
        >
          <Stack gap={4} className="flex-1">
            <Group gap={6}>
              <DocumentTextIcon className="w-4 h-4 text-zinc-500" />
              <Text
                size="xs"
                c="zinc.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Evidencias Adjuntas
              </Text>
            </Group>
            {transferencia.evidencias && transferencia.evidencias.length > 0 ? (
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3 pl-6 pt-1">
                {transferencia.evidencias.map((archivo, index) => (
                  <ArchivoCard key={index} archivo={archivo} />
                ))}
              </div>
            ) : (
              <Text
                size="sm"
                className="text-zinc-500 italic leading-relaxed pl-6"
              >
                No hay evidencias adjuntas.
              </Text>
            )}
          </Stack>
        </Paper>
      </div>
    </Stack>
  );
};
