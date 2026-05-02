import { useState, useEffect } from "react";
import {
  Stack,
  Text,
  Group,
  Paper,
  Badge,
  Loader,
  UnstyledButton,
  Collapse,
} from "@mantine/core";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentCheckIcon,
  PaperClipIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import { useListarRecepciones } from "../hooks/useListarRecepciones";

interface Props {
  idTransferencia: number;
}

export const HistorialRecepcionesModal = ({ idTransferencia }: Props) => {
  const { recepciones, loading, cargarRecepciones } = useListarRecepciones();
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    cargarRecepciones(idTransferencia);
  }, [idTransferencia, cargarRecepciones]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 h-64">
        <Loader color="indigo" size="lg" variant="bars" />
        <Text
          size="sm"
          fw={800}
          c="dimmed"
          mt="md"
          className="animate-pulse tracking-widest uppercase"
        >
          Cargando Historial...
        </Text>
      </div>
    );
  }

  if (!recepciones || recepciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-64 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
        <div className="w-16 h-16 rounded-full bg-zinc-900/50 flex items-center justify-center mb-4">
          <ClipboardDocumentCheckIcon className="w-8 h-8 text-zinc-600" />
        </div>
        <Text size="md" fw={800} c="zinc.4">
          Sin Recepciones
        </Text>
        <Text size="sm" c="dimmed" className="max-w-xs mt-1">
          Aún no se han registrado recepciones físicas para esta transferencia.
        </Text>
      </div>
    );
  }

  return (
    <Stack gap="md" p="md" className="bg-zinc-950 rounded-xl">
      {recepciones.map((recepcion, index) => {
        const isExpanded = expandedIds[recepcion.id_recepcion] || false;
        const totalItems = recepcion.detalles?.length || 0;

        return (
          <Paper
            key={recepcion.id_recepcion}
            radius="lg"
            className={`border transition-all duration-200 overflow-hidden ${
              isExpanded
                ? "bg-zinc-900/50 border-indigo-500/40 shadow-lg"
                : "bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/30"
            }`}
          >
            {/* Header Clickable */}
            <UnstyledButton
              onClick={() => toggleExpand(recepcion.id_recepcion)}
              className="w-full p-4 md:p-5"
            >
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Group gap="md" wrap="nowrap">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${
                      isExpanded
                        ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
                        : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400"
                    }`}
                  >
                    <ClipboardDocumentCheckIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <Group gap="xs" mb={4}>
                      <Text
                        size="sm"
                        fw={900}
                        className="text-white tracking-tight"
                      >
                        Recepción #{recepciones.length - index}
                      </Text>
                      {recepcion.con_incidencia && (
                        <Badge
                          color="red"
                          variant="filled"
                          size="xs"
                          radius="sm"
                          className="font-bold"
                        >
                          CON INCIDENCIA
                        </Badge>
                      )}
                    </Group>
                    <Group gap="lg" wrap="wrap">
                      <Group gap="xs">
                        <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-500" />
                        <Text size="xs" c="zinc.4" fw={600}>
                          {dayjs(recepcion.fecha_hora_recepcion).format(
                            "DD/MM/YYYY HH:mm",
                          )}
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                        <Text
                          size="xs"
                          c="zinc.4"
                          fw={600}
                          className="truncate max-w-[150px]"
                        >
                          {recepcion.empleado_registro}
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <CubeIcon className="w-3.5 h-3.5 text-zinc-500" />
                        <Text size="xs" c="zinc.4" fw={600}>
                          {totalItems} items
                        </Text>
                      </Group>
                    </Group>
                  </div>
                </Group>
                <div className="shrink-0 p-2 bg-zinc-800/50 rounded-full border border-zinc-700/50">
                  {isExpanded ? (
                    <ChevronUpIcon className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </Group>
            </UnstyledButton>

            {/* Contenido Expandible */}
            <Collapse in={isExpanded}>
              <div className="p-5 pt-0 border-t border-zinc-800/50 bg-zinc-950/30">
                <Stack gap="lg" mt="md">
                  {/* Observación general */}
                  {recepcion.observacion && (
                    <div>
                      <Text
                        size="10px"
                        fw={900}
                        c="dimmed"
                        className="uppercase tracking-widest mb-2"
                      >
                        Observación General
                      </Text>
                      <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50">
                        <Text size="sm" c="zinc.3" className="italic">
                          "{recepcion.observacion}"
                        </Text>
                      </div>
                    </div>
                  )}

                  {/* Evidencias */}
                  {recepcion.evidencias && recepcion.evidencias.length > 0 && (
                    <div>
                      <Group gap="xs" mb="sm">
                        <PaperClipIcon className="w-4 h-4 text-zinc-500" />
                        <Text
                          size="10px"
                          fw={900}
                          c="dimmed"
                          className="uppercase tracking-widest"
                        >
                          Evidencias Adjuntas ({recepcion.evidencias.length})
                        </Text>
                      </Group>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {recepcion.evidencias.map((archivo, i) => (
                          <ArchivoCard key={i} archivo={archivo} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tabla de Productos Recepcionados */}
                  {recepcion.detalles && recepcion.detalles.length > 0 && (
                    <div>
                      <Group gap="xs" mb="sm">
                        <DocumentTextIcon className="w-4 h-4 text-zinc-500" />
                        <Text
                          size="10px"
                          fw={900}
                          c="dimmed"
                          className="uppercase tracking-widest"
                        >
                          Productos Recepcionados
                        </Text>
                      </Group>
                      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="px-4 py-3">Producto</th>
                              <th className="px-4 py-3 text-center">Estado</th>
                              <th className="px-4 py-3 text-right">
                                Cant. Recibida
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800">
                            {recepcion.detalles.map((d) => (
                              <tr
                                key={d.id_recepcion_detalle}
                                className="hover:bg-zinc-800/30"
                              >
                                <td className="px-4 py-3">
                                  <Text
                                    size="xs"
                                    fw={700}
                                    className="text-zinc-200"
                                  >
                                    {d.producto}
                                  </Text>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Badge
                                    color={
                                      d.estado === "Recepción Completa"
                                        ? "teal"
                                        : "orange"
                                    }
                                    variant="light"
                                    size="xs"
                                  >
                                    {d.estado}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Text
                                    size="xs"
                                    fw={800}
                                    className="text-emerald-400 font-mono"
                                  >
                                    {formatNumber(d.cantidad_recepcionada_base)}{" "}
                                    {d.unidad_medida_base_abv}
                                  </Text>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Stack>
              </div>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
};
