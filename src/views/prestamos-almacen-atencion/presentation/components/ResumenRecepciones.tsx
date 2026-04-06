import { useState, useEffect } from "react";
import {
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Loader,
  Collapse,
  UnstyledButton,
} from "@mantine/core";
import {
  UserIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleBottomCenterTextIcon,
  PaperClipIcon,
  CalendarDaysIcon,
  InboxArrowDownIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { PrestamosAtencionService } from "../../service/prestamos-atencion.service";
import { formatNumber } from "../../../../presentation/functions/formatNumber";
import { ArchivoCard } from "../../../../presentation/utils/archivo-card";
import type {
  RES_RecepcionEvento,
  RES_RecepcionDetalle,
} from "../../service/prestamos-atencion.responses";
import type { IArchivo } from "../../../../shared/interfaces";

interface Props {
  idEntrega: number;
}

export const ResumenRecepciones = ({
  idEntrega,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [recepciones, setRecepciones] = useState<RES_RecepcionEvento[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res =
          await PrestamosAtencionService.obtenerHistorialRecepcionesEntrega(
            idEntrega,
          );
        if (res.success && res.data) {
          setRecepciones(res.data);
        }
      } catch (error) {
        console.error("Error al cargar recepciones", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idEntrega]);

  if (loading)
    return (
      <Group justify="center" p="md">
        <Loader size="xs" color="indigo" variant="dots" />
        <Text
          size="xs"
          c="indigo.4"
          fw={700}
          className="uppercase tracking-widest animate-pulse"
        >
          Consultando recepciones...
        </Text>
      </Group>
    );

  if (recepciones.length === 0) return null;

  return (
    <div className="mt-3 animate-in fade-in duration-500">
      <Stack gap="xs">
        {recepciones.map((rec, idx) => {
          const tieneDetalle =
            !!rec.observacion ||
            (Array.isArray(rec.evidencias) && rec.evidencias.length > 0);
          const isOpen = !!expandedIds[rec.id_recepcion];

          return (
            <Paper
              key={rec.id_recepcion}
              radius="md"
              className={`border overflow-hidden transition-all duration-300 hover:bg-zinc-900/30 ${
                rec.con_incidencia
                  ? "border-rose-500/25 shadow-[0_0_12px_rgba(99,102,241,0.06)] hover:border-rose-500/40"
                  : "border-zinc-500/25 hover:border-zinc-500/50"
              }`}
            >
              {/* ── Cabecera ─────────────────────────────────── */}
              <UnstyledButton
                onClick={() => tieneDetalle && toggleExpand(rec.id_recepcion)}
                className={`w-full transition-colors ${
                  tieneDetalle
                    ? "cursor-pointer hover:bg-zinc-900/70"
                    : "cursor-default"
                } bg-zinc-950/50`}
              >
                <div className="p-3">
                  {/* Fila superior: ícono + número + badges */}
                  <Group justify="space-between" wrap="nowrap" mb={8}>
                    <Group gap="sm">
                      {/* Ícono de ingreso */}
                      <div
                        className={`p-1.5 rounded-lg ${rec.con_incidencia ? "bg-indigo-500/10" : "bg-emerald-500/10"}`}
                      >
                        <InboxArrowDownIcon
                          className={`w-4 h-4 ${rec.con_incidencia ? "text-indigo-400" : "text-emerald-400"}`}
                        />
                      </div>

                      <Text size="xs" fw={900} className="text-white">
                        Recepción #{recepciones.length - idx}
                      </Text>

                      {rec.con_incidencia && (
                        <Badge
                          size="xs"
                          variant="light"
                          color="pink"
                          leftSection={
                            <ExclamationTriangleIcon className="w-2.5 h-2.5" />
                          }
                        >
                          Incidencia
                        </Badge>
                      )}
                    </Group>

                    {/* Flecha solo si tiene detalle */}
                    {tieneDetalle &&
                      (isOpen ? (
                        <ChevronUpIcon className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-zinc-500" />
                      ))}
                  </Group>

                  {/* Recepcionado por + fecha */}
                  <Group gap="xs">
                    <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                    <Text size="xs" c="dimmed">
                      Recepcionado por:{" "}
                      <span className="text-zinc-200 font-semibold">
                        {rec.empleado_registro}
                      </span>
                    </Text>
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-500" />
                    <Text size="xs" c="dimmed">
                      {dayjs(rec.fecha_hora_recepcion).format(
                        "DD/MM/YYYY - HH:mm",
                      )}
                    </Text>
                  </Group>

                  {/* Productos recibidos */}
                  <Group gap={4} wrap="wrap" mt="xs">
                    {rec.detalles.map((det: RES_RecepcionDetalle) => (
                      <span
                        key={det.id_recepcion_detalle}
                        className="inline-flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/50 px-2 py-0.5 rounded-full"
                      >
                        <Text size="xs" className="text-zinc-400">
                          {det.producto}
                        </Text>
                        <Text
                          size="xs"
                          fw={900}
                          className="text-emerald-400 font-mono"
                        >
                          +{formatNumber(det.cantidad_recepcionada_base)}
                          <span className="text-zinc-500 font-normal ml-0.5">
                            {det.unidad_medida_base_abv}
                          </span>
                        </Text>
                      </span>
                    ))}
                  </Group>
                </div>
              </UnstyledButton>

              {/* ── Detalle de Incidencia (desplegable) ────── */}
              <Collapse in={isOpen}>
                <Stack
                  gap="sm"
                  p="sm"
                  pt={0}
                  className="border-t border-zinc-800/40 bg-zinc-950/20"
                >
                  <div className="pt-3">
                    {/* Observación */}
                    {rec.observacion && (
                      <div className="mb-3">
                        <Group gap="xs" mb={5}>
                          <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5 text-indigo-400/70" />
                          <Text
                            size="10px"
                            fw={800}
                            c="zinc.5"
                            className="uppercase tracking-widest"
                          >
                            Observación
                          </Text>
                        </Group>
                        <Text
                          size="xs"
                          className="italic text-zinc-300 leading-relaxed whitespace-pre-wrap pl-1"
                        >
                          {rec.observacion}
                        </Text>
                      </div>
                    )}

                    {/* Evidencias */}
                    {Array.isArray(rec.evidencias) &&
                      rec.evidencias.length > 0 && (
                        <div>
                          <Group gap="xs" mb={6}>
                            <PaperClipIcon className="w-3.5 h-3.5 text-indigo-400/70" />
                            <Text
                              size="10px"
                              fw={800}
                              c="zinc.5"
                              className="uppercase tracking-widest"
                            >
                              Evidencias ({rec.evidencias.length})
                            </Text>
                          </Group>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {rec.evidencias.map((ev: IArchivo, i: number) => (
                              <ArchivoCard key={i} archivo={ev} />
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </Stack>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>
    </div>
  );
};
