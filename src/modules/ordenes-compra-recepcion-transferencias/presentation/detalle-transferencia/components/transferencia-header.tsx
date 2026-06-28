import { Stack, Paper, Text, Group, Badge } from "@mantine/core";
import {
  CalendarDaysIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  InboxStackIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  TruckIcon,
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

      {/* Detalles de Transporte */}
      {transferencia.medio_entrega && (
        <Paper
          p="md"
          radius="lg"
          className="bg-zinc-950/40 border border-zinc-800/60 mx-2"
        >
          <div className="flex gap-3 items-start">
            <TruckIcon className="w-5 h-5 text-indigo-400/50 mt-0.5 shrink-0" />
            <div className="w-full">
              <Text size="10px" fw={800} c="zinc.5" className="uppercase tracking-widest mb-2">
                Detalles de Envío y Transporte
              </Text>
              <Group gap="xl" wrap="wrap">
                <div>
                  <Text size="10px" c="dimmed">MEDIO</Text>
                  <Badge size="xs" variant="light" color={transferencia.medio_entrega === "Propio" ? "teal" : transferencia.medio_entrega === "Agencia" ? "cyan" : "indigo"}>
                    {transferencia.medio_entrega}
                  </Badge>
                </div>
                {transferencia.medio_entrega === "Propio" && (
                  <>
                    {transferencia.empleado_recibe && (
                      <div>
                        <Text size="10px" c="dimmed">CHOFER / ENCARGADO</Text>
                        <Text size="xs" fw={700}>{transferencia.empleado_recibe}</Text>
                      </div>
                    )}
                    {transferencia.serie_guia_remitente && (
                      <div>
                        <Text size="10px" c="dimmed">GUÍA REMITENTE</Text>
                        <Text size="xs" fw={700}>{transferencia.serie_guia_remitente}-{transferencia.numero_guia_remitente}</Text>
                      </div>
                    )}
                  </>
                )}
                {transferencia.medio_entrega === "Terceros" && (
                  <>
                    {transferencia.proveedor_transporte && (
                      <div>
                        <Text size="10px" c="dimmed">TRANSPORTISTA</Text>
                        <Text size="xs" fw={700}>{transferencia.proveedor_transporte}</Text>
                      </div>
                    )}
                    {transferencia.serie_factura && (
                      <div>
                        <Text size="10px" c="dimmed">FACTURA</Text>
                        <Text size="xs" fw={700}>{transferencia.serie_factura}-{transferencia.numero_factura}</Text>
                      </div>
                    )}
                    {transferencia.serie_guia_remitente && (
                      <div>
                        <Text size="10px" c="dimmed">GUÍA REMITENTE</Text>
                        <Text size="xs" fw={700}>{transferencia.serie_guia_remitente}-{transferencia.numero_guia_remitente}</Text>
                      </div>
                    )}
                    {transferencia.serie_guia_transportista && (
                      <div>
                        <Text size="10px" c="dimmed">GUÍA TRANSPORTISTA</Text>
                        <Text size="xs" fw={700}>{transferencia.serie_guia_transportista}-{transferencia.numero_guia_transportista}</Text>
                      </div>
                    )}
                    {transferencia.costo_envio !== undefined && transferencia.costo_envio !== null && (
                      <div>
                        <Text size="10px" c="dimmed">COSTO</Text>
                        <Text size="xs" fw={700} c="emerald.4" className="font-mono">S/. {Number(transferencia.costo_envio).toFixed(2)}</Text>
                      </div>
                    )}
                  </>
                )}
                {transferencia.medio_entrega === "Agencia" && (
                  <>
                    {transferencia.agencia_transporte && (
                      <div>
                        <Text size="10px" c="dimmed">AGENCIA</Text>
                        <Text size="xs" fw={700}>{transferencia.agencia_transporte}</Text>
                      </div>
                    )}
                    {transferencia.serie_factura && (
                      <div>
                        <Text size="10px" c="dimmed">COMPROBANTE</Text>
                        <Text size="xs" fw={700}>{transferencia.serie_factura}-{transferencia.numero_factura}</Text>
                      </div>
                    )}
                    {transferencia.serie_guia_transportista && (
                      <div>
                        <Text size="10px" c="dimmed">GUÍA TRANSPORTISTA</Text>
                        <Text size="xs" fw={700}>{transferencia.serie_guia_transportista}-{transferencia.numero_guia_transportista}</Text>
                      </div>
                    )}
                    {transferencia.costo_envio !== undefined && transferencia.costo_envio !== null && Number(transferencia.costo_envio) > 0 && (
                      <div>
                        <Text size="10px" c="dimmed">COSTO</Text>
                        <Text size="xs" fw={700} c="emerald.4" className="font-mono">S/. {Number(transferencia.costo_envio).toFixed(2)}</Text>
                      </div>
                    )}
                  </>
                )}
              </Group>
            </div>
          </div>
        </Paper>
      )}

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
