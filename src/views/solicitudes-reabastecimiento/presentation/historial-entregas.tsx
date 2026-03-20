import { useState } from "react";
import {
  Loader,
  Stack,
  Text,
  Badge,
  Paper,
  Group,
  Collapse,
  UnstyledButton,
  Button,
} from "@mantine/core";
import dayjs from "dayjs";
import { useHistorialEntregas } from "../hooks/useHistorialEntregas";
import {
  TruckIcon,
  CalendarDaysIcon,
  UserIcon,
  CubeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { formatNumber } from "../../../presentation/functions/formatNumber";
import type { RES_DetalleEntregaReabastecimiento } from "../service/reabastecimiento.responses";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroRecepcion } from "./registro-recepcion";

interface HistorialProps {
  idSolicitud: number;
}

export const HistorialEntregas = ({ idSolicitud }: HistorialProps) => {
  const { loading, entregas, error, reload } = useHistorialEntregas(idSolicitud);
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [recepcionData, setRecepcionData] = useState<{
    idEntrega: number;
    detallesPendientes: RES_DetalleEntregaReabastecimiento[];
  } | null>(null);

  const handleOpenRecepcion = (
    idEntrega: number,
    detallesPendientes: RES_DetalleEntregaReabastecimiento[],
  ) => {
    setRecepcionData({ idEntrega, detallesPendientes });
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  if (error)
    return (
      <Text c="red" ta="center">
        {error}
      </Text>
    );
  if (entregas.length === 0)
    return (
      <div className="py-12 text-center flex flex-col items-center gap-3">
        <div className="p-4 bg-zinc-900/30 rounded-full border border-zinc-800/50">
          <TruckIcon className="w-8 h-8 text-zinc-600" />
        </div>
        <Text c="zinc.5" size="sm" fw={600}>
          No se han registrado entregas para esta solicitud.
        </Text>
      </div>
    );

  return (
    <Stack gap="xl" className="font-sans pt-2 pb-6 px-2">
      {entregas.map((h, index) => {
        const expanded =
          expandedIds[h.id_reabastecimiento_entrega] ?? index === 0;
        return (
          <Paper
            key={h.id_reabastecimiento_entrega}
            radius="xl"
            className="bg-zinc-900/30 border border-zinc-800/80 transition-all hover:bg-zinc-900/50 relative overflow-hidden p-4"
          >
            <UnstyledButton
              component="div"
              className="w-full"
              onClick={() => toggleExpand(h.id_reabastecimiento_entrega)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="md" wrap="nowrap">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl">
                    <TruckIcon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <Stack gap={1}>
                    <Group gap="xs">
                      <Text size="sm" fw={900} className="text-white">
                        {h.correlativo}
                      </Text>
                      <Badge variant="light" color="teal" size="xs">
                        {h.estado}
                      </Badge>
                    </Group>
                    <Group gap="xs" className="text-zinc-400">
                      <CalendarDaysIcon className="w-4 h-4 text-indigo-400/70" />
                      <Text size="xs" fw={600}>
                        {dayjs(h.fecha_hora_entrega).format("DD/MM/YYYY HH:mm")}
                      </Text>
                    </Group>
                  </Stack>
                </Group>
                <Group gap="xs">
                  {h.detalles?.some((d) => d.estado_entrega_detalle === "Entregado") && (
                    <Button
                      size="xs"
                      color="indigo"
                      variant="filled"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRecepcion(
                          h.id_reabastecimiento_entrega,
                          (h.detalles || []).filter((d) => d.estado_entrega_detalle === "Entregado")
                        );
                      }}
                    >
                      Recibir Pendientes
                    </Button>
                  )}
                  <div className="w-8 h-8 rounded-full bg-zinc-800/40 flex items-center justify-center border border-zinc-700/50">
                    {expanded ? (
                      <ChevronUpIcon className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </Group>
              </Group>
            </UnstyledButton>
            <Collapse in={expanded}>
              <div className="mt-4 pt-4 border-t border-zinc-800/30">
                <Group gap="sm" mb="md" px="md">
                  <UserIcon className="w-4 h-4 text-zinc-500" />
                  <Text size="xs" c="dimmed">
                    Atendido por:{" "}
                    <span className="text-white">{h.empleado_entrega}</span>
                  </Text>
                  <div className="w-1 h-1 rounded-full bg-zinc-700 mx-2" />
                  <UserIcon className="w-4 h-4 text-zinc-500" />
                  <Text size="xs" c="dimmed">
                    Entregado a:{" "}
                    <span className="text-white">{h.empleado_recibe}</span>
                  </Text>
                </Group>
                {h.observacion && (
                  <Paper
                    p="sm"
                    radius="md"
                    className="bg-zinc-950/50 border border-zinc-800 mb-4 mx-4 shadow-inner"
                  >
                    <Text
                      size="xs"
                      c="dimmed"
                      mb={4}
                      fw={800}
                      className="uppercase tracking-widest"
                    >
                      Observaciones
                    </Text>
                    <Text size="sm" className="italic leading-relaxed">
                      {h.observacion}
                    </Text>
                  </Paper>
                )}

                <Group gap="xs" mb="sm" mx="md">
                  <CubeIcon className="w-4 h-4 text-indigo-400/70" />
                  <Text
                    size="xs"
                    fw={800}
                    c="zinc.4"
                    className="uppercase tracking-widest"
                  >
                    Productos Entregados
                  </Text>
                </Group>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 pb-2">
                  {h.detalles?.map((d) => (
                    <div
                      key={d.id_entrega_detalle}
                      className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/40 flex justify-between items-center group/item hover:border-indigo-500/30 transition-colors"
                    >
                      <Stack gap={2}>
                        <Text size="sm" fw={900} className="text-zinc-100">
                          {d.producto}
                        </Text>
                        <Group gap={4}>
                          <Badge
                            size="xs"
                            variant="light"
                            color="indigo"
                            className="font-bold"
                          >
                            Lote: {d.correlativo}
                          </Badge>
                          {d.estado_entrega_detalle === "Recibido" && (
                            <Badge
                              size="xs"
                              variant="light"
                              color="teal"
                              leftSection={
                                <CheckBadgeIcon className="w-3 h-3" />
                              }
                            >
                              Recibido
                            </Badge>
                          )}
                        </Group>
                      </Stack>
                      <Stack gap={1} align="flex-end">
                        <Text
                          size="md"
                          fw={900}
                          className="text-emerald-400 font-mono"
                        >
                          +{formatNumber(d.cantidad_lote)}{" "}
                          <span className="text-xs font-sans">
                            {d.unidad_lote_abv}
                          </span>
                        </Text>
                        {d.estado_entrega_detalle === "Entregado" && (
                          <Badge
                            size="md"
                            variant="dot"
                            color="orange"
                            className="mt-1"
                          >
                            Pendiente
                          </Badge>
                        )}
                      </Stack>
                    </div>
                  ))}
                </div>
              </div>
            </Collapse>
          </Paper>
        );
      })}
      {/* Modal de Recepción de Entregas */}
      <ModalEstandar
        opened={!!recepcionData}
        close={() => setRecepcionData(null)}
        title="Recepción de Productos"
        size="70%"
      >
        {recepcionData && (
          <RegistroRecepcion
            idEntrega={recepcionData.idEntrega}
            detalles={recepcionData.detallesPendientes}
            onSuccess={() => {
              setRecepcionData(null);
              reload();
            }}
          />
        )}
      </ModalEstandar>
    </Stack>
  );
};
