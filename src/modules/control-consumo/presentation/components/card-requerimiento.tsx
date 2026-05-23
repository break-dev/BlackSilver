import { Card, Group, Stack, Text, Badge, Button } from "@mantine/core";
import { InboxStackIcon } from "@heroicons/react/24/outline";
import { DataTableEstandar } from "../../../../presentation/utils/datatable-estandar";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import { type DataTableColumn } from "mantine-datatable";
import dayjs from "dayjs";
import type {
  RES_ControlConsumo,
  RES_ConsumoDetalle,
} from "../../service/control-consumo.responses";

export interface GroupedEntrega {
  id_requerimiento_almacen_entrega: number;
  fecha_hora_entrega: string;
  detalles: RES_ControlConsumo[];
}

export interface GroupedRequerimiento {
  id_requerimiento_almacen: number;
  correlativo_requerimiento: string | number;
  fecha_requerimiento: string;
  es_auditable: boolean | number;
  contratista_solicitante: string;
  mina: string;
  almacen_destino: string;
  entregas: GroupedEntrega[];
}

interface CardRequerimientoProps {
  req: GroupedRequerimiento;
  loading: boolean;
  onConsumir: (det: RES_ControlConsumo) => void;
}

export const CardRequerimiento = ({
  req,
  loading,
  onConsumir,
}: CardRequerimientoProps) => {
  // Define columns matching kardex style guide
  const columns: DataTableColumn<RES_ControlConsumo>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
    },
    {
      accessor: "producto",
      title: "Producto",
      width: 250,
      render: (r) => (
        <Text size="xs" fw={700} className="text-white">
          {r.producto}
        </Text>
      ),
    },
    {
      accessor: "requerido_entregado",
      title: "Entregado",
      textAlign: "center",
      width: 180,
      render: (r) => (
        <Group gap="xs" justify="center" wrap="nowrap">
          {/* <Badge variant="light" color="indigo" size="sm" className="font-bold">
            Req: {formatNumber(r.cantidad_solicitada)} {r.unidad_medida_req_abv}
          </Badge>
          <div className="w-px h-3 bg-zinc-800 shrink-0" /> */}
          <Badge variant="light" color="teal" size="sm" className="font-bold">
            {formatNumber(r.cantidad_entregada_base)} {r.unidad_medida_base_abv}
          </Badge>
        </Group>
      ),
    },
    {
      accessor: "consumido",
      title: "Consumido",
      textAlign: "center",
      width: 180,
      render: (r) => {
        return (
          <Group gap="xs" justify="center" wrap="nowrap">
            <Text size="xs" className="text-zinc-400 font-medium">
              {formatNumber(r.cantidad_consumida_base)}{" "}
              {r.unidad_medida_base_abv}
            </Text>
          </Group>
        );
      },
    },
    {
      accessor: "restante",
      title: "Por Consumir",
      textAlign: "center",
      width: 180,
      render: (r) => {
        const restante = r.cantidad_entregada_base - r.cantidad_consumida_base;
        return (
          <Group gap="xs" justify="center" wrap="nowrap">
            <Text size="xs" c={restante > 0 ? "amber.4" : "emerald.4"} fw={800}>
              {formatNumber(restante)} {r.unidad_medida_base_abv}
            </Text>
          </Group>
        );
      },
    },
    {
      accessor: "estado_consumo",
      title: "Estado",
      textAlign: "center",
      width: 140,
      render: (r) => {
        const entregado = r.cantidad_entregada_base;
        const consumido = r.cantidad_consumida_base;
        let estado_consumo: "Sin Consumir" | "Consumo Parcial" | "Total" =
          "Sin Consumir";
        if (consumido >= entregado) {
          estado_consumo = "Total";
        } else if (consumido > 0) {
          estado_consumo = "Consumo Parcial";
        }

        let color = "gray";
        if (estado_consumo === "Consumo Parcial") {
          color = "blue";
        } else if (estado_consumo === "Total") {
          color = "teal";
        }
        return (
          <Badge
            color={color}
            variant="light"
            size="xs"
            className="font-bold border border-current/10"
          >
            {estado_consumo}
          </Badge>
        );
      },
    },
    {
      accessor: "acciones",
      title: "Acciones",
      textAlign: "center",
      width: 120,
      render: (r) => {
        const restante = r.cantidad_entregada_base - r.cantidad_consumida_base;
        return restante > 0 ? (
          <Button
            size="xs"
            variant="light"
            color="indigo"
            radius="md"
            className="font-semibold h-7 px-3 border border-indigo-500/10"
            onClick={(e) => {
              e.stopPropagation();
              onConsumir(r);
            }}
          >
            Consumir
          </Button>
        ) : (
          <span className="text-zinc-500 text-xs font-semibold">
            Completado
          </span>
        );
      },
    },
  ];

  return (
    <Card
      radius="24px"
      bg="zinc.900/65"
      className="border border-zinc-800/85 shadow-xl overflow-hidden backdrop-blur-md p-6"
    >
      {/* Requirement Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-zinc-800/60">
        <Group gap="xs">
          <Text
            size="sm"
            fw={800}
            className="text-white uppercase tracking-tight"
          >
            Requerimiento
          </Text>
          <Badge
            color="indigo"
            variant="light"
            size="md"
            radius="md"
            className="font-bold border border-indigo-500/10 px-2 py-2"
          >
            {req.correlativo_requerimiento}
          </Badge>
          {req.es_auditable ? (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0 border border-amber-400/30" />
          ) : null}
        </Group>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-400">
          <div>
            <span className="text-zinc-500 font-extrabold uppercase tracking-wider text-[9px] mr-1.5">
              Solicitante:
            </span>
            <span className="text-zinc-300 font-semibold">
              {req.contratista_solicitante}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 font-extrabold uppercase tracking-wider text-[9px] mr-1.5">
              Mina Destino:
            </span>
            <span className="text-zinc-300 font-semibold">{req.mina}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-extrabold uppercase tracking-wider text-[9px] mr-1.5">
              Almacén:
            </span>
            <span className="text-zinc-300 font-semibold">
              {req.almacen_destino}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500 font-extrabold uppercase tracking-wider text-[9px] mr-1.5">
              Fecha:
            </span>
            <span className="text-zinc-300 font-semibold">
              {dayjs(req.fecha_requerimiento).format("DD/MM/YYYY")}
            </span>
          </div>
        </div>
      </div>

      {/* Deliveries list */}
      <Stack gap="md">
        {req.entregas.map((entrega) => (
          <div
            key={entrega.id_requerimiento_almacen_entrega}
            className="bg-zinc-950/40 border border-zinc-800/40 rounded-2xl p-4 shadow-inner"
          >
            {/* Delivery Subheader */}
            <div className="flex justify-between items-center mb-4">
              <Group gap="xs">
                <div className="p-1 bg-teal-500/10 rounded-lg border border-teal-500/20">
                  <InboxStackIcon className="w-4 h-4 text-teal-400" />
                </div>
                <Text
                  size="xs"
                  fw={800}
                  className="text-zinc-300 uppercase tracking-wider"
                >
                  Entrega Realizada
                </Text>
              </Group>
              <Text size="xs" fw={700} className="text-zinc-500">
                Fecha de Entrega:{" "}
                <span className="text-zinc-300">
                  {dayjs(entrega.fecha_hora_entrega).format("DD/MM/YYYY HH:mm")}
                </span>
              </Text>
            </div>

            {/* DataTableEstandar showing delivered details */}
            <DataTableEstandar
              idAccessor="id_entrega_requerimiento_detalle"
              columns={columns}
              records={entrega.detalles}
              loading={loading}
              minHeight={0}
              rowExpansion={{
                content: ({ record }: { record: RES_ControlConsumo }) => (
                  <div className="p-5 bg-zinc-950/40 border-l-2 border-indigo-500/40 pl-6 py-4 flex flex-col gap-3">
                    <Text size="xs" fw={800} className="text-zinc-400  mb-1">
                      Historial de Consumo ({record.consumos.length})
                    </Text>
                    {record.consumos.length === 0 ? (
                      <Text size="xs" c="dimmed" fs="italic" className="py-1">
                        Sin consumos registrados para esta entrega
                      </Text>
                    ) : (
                      <Stack gap="xs">
                        {record.consumos.map((c: RES_ConsumoDetalle) => (
                          <div
                            key={c.id}
                            className="bg-zinc-900/45 border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl p-3.5 transition-all duration-200"
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                              {/* Left details: Badge, consumption quantity and user comments */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 flex-1">
                                <Badge
                                  color={
                                    c.estado === "Consumo Total"
                                      ? "teal.4"
                                      : "indigo.4"
                                  }
                                  size="xs"
                                  variant="light"
                                  className="font-extrabold uppercase border border-current/10 py-1"
                                >
                                  {c.estado}
                                </Badge>
                                <Text
                                  size="xs"
                                  className="text-zinc-200 font-semibold flex items-center gap-1"
                                >
                                  <span>Consumió</span>
                                  <span className="text-indigo-400 font-extrabold text-sm">
                                    {formatNumber(c.cantidad_base_consumida)}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 uppercase font-bold">
                                    {record.unidad_medida_base_abv}
                                  </span>
                                </Text>
                                <span className="hidden md:inline text-zinc-700 font-light">
                                  |
                                </span>
                                <Text
                                  size="xs"
                                  className="text-zinc-400 italic"
                                >
                                  "{c.comentario_consumo || "Sin comentarios"}"
                                </Text>
                              </div>

                              {/* Right details: Who registered the consumption and when */}
                              <div className="flex flex-row items-center md:items-end gap-x-3 gap-y-0.5 text-[11px] text-zinc-500 border-t md:border-t-0 border-zinc-800/40 pt-2 md:pt-0 w-full md:w-auto self-stretch md:self-auto justify-between md:justify-start">
                                <div>
                                  <span className="text-[9px] text-zinc-500 uppercase font-bold mr-1">
                                    Por:
                                  </span>
                                  <strong className="text-zinc-300 font-semibold">
                                    {c.empleado_registro}
                                  </strong>
                                </div>
                                <div className="text-zinc-400 font-medium">
                                  <span className="text-[9px] text-zinc-600 uppercase font-extrabold mr-1 md:hidden">
                                    Fecha:
                                  </span>
                                  {dayjs(c.fecha_hora_consumo).format(
                                    "DD/MM/YYYY HH:mm",
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </Stack>
                    )}
                  </div>
                ),
              }}
            />
          </div>
        ))}
      </Stack>
    </Card>
  );
};
