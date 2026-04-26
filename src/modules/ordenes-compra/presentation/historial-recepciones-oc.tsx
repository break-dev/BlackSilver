import { useEffect, useState } from "react";
import {
  Stack,
  Text,
  Group,
  Paper,
  Badge,
  Table,
  Loader,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Divider,
} from "@mantine/core";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  PhotoIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import type { RES_OrdenCompraRecepcion } from "../../../service/responses/ordenes-compra/orden-compra-recepcion";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { OrdenCompraService } from "../service/orden-compra.service";

interface Props {
  idOrdenCompra: number;
}

export const HistorialRecepcionesOC = ({ idOrdenCompra }: Props) => {
  const [recepciones, setRecepciones] = useState<RES_OrdenCompraRecepcion[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    OrdenCompraService.getHistorialRecepciones(idOrdenCompra)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setRecepciones(res.data);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [idOrdenCompra]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  if (recepciones.length === 0) {
    return (
      <div className="text-center py-20">
        <Text c="dimmed" fs="italic" size="sm">
          Aún no se han registrado recepciones para esta orden de compra.
        </Text>
      </div>
    );
  }

  return (
    <Stack gap="xl" className="animate-fade-in p-4">
      {recepciones.map((r) => (
        <Paper
          key={r.id_recepcion}
          p="xl"
          radius="2xl"
          className="bg-zinc-900/40 border border-zinc-800 shadow-xl overflow-hidden group hover:border-indigo-500/30 transition-all"
        >
          <Group justify="space-between" mb="lg">
            <Group gap="md">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                <CalendarDaysIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <Stack gap={2}>
                <Text
                  fw={900}
                  size="lg"
                  className="text-white tracking-tight leading-tight"
                >
                  Recepción #{r.numero_correlativo}
                </Text>
                <Group gap="xs">
                  <Text size="xs" c="dimmed" fw={700}>
                    {dayjs(r.fecha_hora_recepcion).format(
                      "DD [de] MMMM, YYYY - HH:mm",
                    )}
                  </Text>
                  <Badge variant="dot" color="indigo" size="xs" radius="sm">
                    {r.estado}
                  </Badge>
                </Group>
              </Stack>
            </Group>

            <Group gap="lg">
              <Stack gap={2} align="flex-end">
                <Text
                  size="10px"
                  c="zinc.5"
                  fw={800}
                  className="uppercase tracking-widest"
                >
                  Almacén
                </Text>
                <Group gap={6}>
                  <BuildingStorefrontIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <Text size="xs" fw={800} className="text-zinc-200">
                    {r.almacen_recepcionista}
                  </Text>
                </Group>
              </Stack>
              {r.guia_remision && (
                <Stack gap={2} align="flex-end">
                  <Text
                    size="10px"
                    c="zinc.5"
                    fw={800}
                    className="uppercase tracking-widest"
                  >
                    Guía Remisión
                  </Text>
                  <Group gap={6}>
                    <DocumentTextIcon className="w-3.5 h-3.5 text-zinc-500" />
                    <Text size="xs" fw={800} className="text-zinc-200">
                      {r.guia_remision}
                    </Text>
                  </Group>
                </Stack>
              )}
            </Group>
          </Group>

          {r.observacion && (
            <Paper
              p="md"
              radius="lg"
              className="bg-zinc-950/40 border border-zinc-800/50 mb-lg"
            >
              <Text
                size="xs"
                c="zinc.4"
                fw={600}
                fs="italic"
                className="leading-relaxed"
              >
                "{r.observacion}"
              </Text>
            </Paper>
          )}

          <ScrollArea className="rounded-xl border border-zinc-800/50 overflow-hidden">
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <thead className="bg-zinc-800/50 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th>Producto</th>
                  <th className="text-center">Cant. Recibida</th>
                  <th className="text-center">Cant. Base</th>
                  <th className="text-center w-20">Estado</th>
                </tr>
              </thead>
              <tbody>
                {r.detalles?.map((det) => (
                  <tr
                    key={det.id_recepcion_detalle}
                    className="hover:bg-zinc-800/30"
                  >
                    <td>
                      <Text size="xs" fw={800} className="text-zinc-200">
                        {det.producto}
                      </Text>
                    </td>
                    <td className="text-center">
                      <Text
                        size="xs"
                        fw={800}
                        className="text-zinc-100 font-mono"
                      >
                        {formatNumber(det.cantidad_recepcionada)}{" "}
                        {det.unidad_medida_oc_abv}
                      </Text>
                    </td>
                    <td className="text-center">
                      <Text
                        size="xs"
                        fw={700}
                        c="indigo.3"
                        className="font-mono"
                      >
                        {formatNumber(det.cantidad_recepcionada_base)}{" "}
                        {det.unidad_medida_base_abv}
                      </Text>
                    </td>
                    <td className="text-center">
                      <Badge
                        variant="light"
                        color={
                          det.estado === "Recepción Completa"
                            ? "teal"
                            : "orange"
                        }
                        size="xs"
                        radius="sm"
                      >
                        {det.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>

          {r.evidencias && r.evidencias.length > 0 && (
            <Group gap="xs" mt="lg">
              {r.evidencias.map((ev, idx) => (
                <Tooltip key={idx} label="Ver evidencia">
                  <ActionIcon
                    variant="light"
                    color="indigo"
                    size="lg"
                    radius="md"
                    onClick={() => window.open(ev.url, "_blank")}
                  >
                    <PhotoIcon className="w-5 h-5" />
                  </ActionIcon>
                </Tooltip>
              ))}
            </Group>
          )}

          <Divider mt="xl" className="opacity-10" />
          <Group justify="flex-end" mt="md">
            <Text size="10px" c="dimmed" fw={700} className="italic uppercase">
              Registrado por: {r.empleado_recepcion}
            </Text>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
};
