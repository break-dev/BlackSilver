import React, { useState } from "react";
import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Button,
  Divider,
  ActionIcon,
} from "@mantine/core";
import { InboxStackIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { DataTableEstandar } from "../../../../presentation/utils/datatable-estandar";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import { type DataTableColumn } from "mantine-datatable";
import dayjs from "dayjs";
import type { RES_ResumenEntregasReq } from "../../service/control-consumo.responses";
import { HistorialConsumos } from "./historial-consumos";
import { isActivoFijo, isConsumible, isOtros } from "./helpers";

export interface GroupedEntrega {
  id_requerimiento_almacen_entrega: number;
  fecha_hora_entrega: string;
  detalles: RES_ResumenEntregasReq[];
}

export interface GroupedRequerimiento {
  id_requerimiento_almacen: number;
  correlativo_requerimiento: string | number;
  fecha_requerimiento: string;
  es_auditable: boolean | number;
  empleado_solicitante: string;
  mina: string;
  almacen_destino: string;
  entregas: GroupedEntrega[];
}

interface CardRequerimientoProps {
  req: GroupedRequerimiento;
  loading: boolean;
  onConsumir: (det: RES_ResumenEntregasReq) => void;
}

export const CardRequerimiento = ({
  req,
  loading,
  onConsumir,
}: CardRequerimientoProps) => {
  const [expandedRecordIds, setExpandedRecordIds] = useState<number[]>([]);

  // Define columns matching kardex style guide
  const columns: DataTableColumn<RES_ResumenEntregasReq>[] = [
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
        <Group gap={6}>
          <Text size="xs" fw={700} className="text-white">
            {r.producto}
          </Text>
          <Divider my="xs" orientation="horizontal" />
          <Group gap={4}>
            {isActivoFijo(r) && (
              <Badge
                color="pink"
                variant="light"
                size="xs"
                className="font-extrabold h-4"
              >
                Activo Fijo
              </Badge>
            )}
            {isConsumible(r) && (
              <Badge
                color="cyan"
                variant="light"
                size="xs"
                className="font-extrabold h-4"
              >
                Consumible
              </Badge>
            )}
            {isOtros(r) && (
              <Badge
                color="zinc"
                variant="light"
                size="xs"
                className="font-extrabold h-4"
              >
                Otros
              </Badge>
            )}
          </Group>
        </Group>
      ),
    },
    {
      accessor: "requerido_entregado",
      title: "Entregado",
      textAlign: "center",
      width: 180,
      render: (r) => {
        const showReqUnit = isOtros(r);
        const qty = showReqUnit
          ? r.cantidad_entregada_req
          : r.cantidad_entregada_base;
        const unit = showReqUnit
          ? r.unidad_medida_req_abv
          : r.unidad_medida_base_abv;
        return (
          <Group gap="xs" justify="center" wrap="nowrap">
            <Badge variant="light" color="teal" size="sm" className="font-bold">
              {formatNumber(qty)} {unit}
            </Badge>
          </Group>
        );
      },
    },
    {
      accessor: "consumido",
      title: "Consumido",
      textAlign: "center",
      width: 180,
      render: (r) => {
        const showReqUnit = isOtros(r);
        const qty = showReqUnit
          ? r.cantidad_consumida_base *
            (r.cantidad_entregada_req / r.cantidad_entregada_base)
          : r.cantidad_consumida_base;
        const unit = showReqUnit
          ? r.unidad_medida_req_abv
          : r.unidad_medida_base_abv;
        return (
          <Group gap="xs" justify="center" wrap="nowrap">
            <Text size="xs" className="text-zinc-400 font-medium">
              {formatNumber(qty)} {unit}
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
        const showReqUnit = isOtros(r);
        const qty = showReqUnit
          ? (r.cantidad_entregada_base - r.cantidad_consumida_base) *
            (r.cantidad_entregada_req / r.cantidad_entregada_base)
          : r.cantidad_entregada_base - r.cantidad_consumida_base;
        const unit = showReqUnit
          ? r.unidad_medida_req_abv
          : r.unidad_medida_base_abv;
        const restanteBase =
          r.cantidad_entregada_base - r.cantidad_consumida_base;
        return (
          <Group gap="xs" justify="center" wrap="nowrap">
            <Badge
              variant="light"
              color={restanteBase > 0 ? "yellow.4" : "green.4"}
              size="sm"
              className="font-bold"
            >
              {formatNumber(qty)} {unit}
            </Badge>
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
        let estado_consumo:
          | "Sin Consumir"
          | "Consumo Parcial"
          | "Consumo Total" = "Sin Consumir";
        if (consumido >= entregado) {
          estado_consumo = "Consumo Total";
        } else if (consumido > 0) {
          estado_consumo = "Consumo Parcial";
        }

        let color = "gray";
        if (estado_consumo === "Consumo Parcial") {
          color = "blue";
        } else if (estado_consumo === "Consumo Total") {
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
      width: 160,
      render: (r) => {
        const restante = r.cantidad_entregada_base - r.cantidad_consumida_base;
        const isExpanded = expandedRecordIds.includes(
          r.id_entrega_requerimiento_detalle,
        );
        const toggleExpand = (e: React.MouseEvent) => {
          e.stopPropagation();
          setExpandedRecordIds((prev) =>
            isExpanded
              ? prev.filter((id) => id !== r.id_entrega_requerimiento_detalle)
              : [...prev, r.id_entrega_requerimiento_detalle],
          );
        };
        return (
          <Group gap="xs" justify="center" wrap="nowrap">
            {restante > 0 ? (
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
              <span className="text-zinc-500 text-xs font-semibold px-2">
                Completado
              </span>
            )}
            <ActionIcon
              size="sm"
              variant="subtle"
              color="indigo"
              className="text-zinc-400 hover:text-white"
              onClick={toggleExpand}
            >
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </ActionIcon>
          </Group>
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
            size="xs"
            fw={700}
            className="text-white uppercase tracking-tight"
            mt={3}
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
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1 text-amber-200 shadow-xs relative bottom-1">
            <span className="text-amber-400/80 font-black uppercase tracking-wider text-[9px]">
              Almacén:
            </span>
            <span className="font-extrabold text-[11px]">
              {req.almacen_destino}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 font-extrabold uppercase tracking-wider text-[9px] mr-1.5">
              Solicitante:
            </span>
            <span className="text-zinc-300 font-semibold">
              {req.empleado_solicitante}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 font-extrabold uppercase tracking-wider text-[9px] mr-1.5">
              Mina Destino:
            </span>
            <span className="text-zinc-300 font-semibold">{req.mina}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-400 font-extrabold uppercase tracking-wider text-[9px] mr-1.5">
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
                <Text size="10px" fw={700} className="uppercase" c={"gray"}>
                  Entrega Realizada:
                </Text>
                <Text size="10px" fw={800} className="uppercase" c={"teal.6"}>
                  {dayjs(entrega.fecha_hora_entrega).format("DD/MM/YYYY HH:mm")}
                </Text>
              </Group>
            </div>

            {/* DataTableEstandar showing delivered details */}
            <DataTableEstandar
              idAccessor="id_entrega_requerimiento_detalle"
              columns={columns}
              records={entrega.detalles}
              loading={loading}
              minHeight={0}
              rowExpansion={{
                trigger: "never",
                expanded: {
                  recordIds: expandedRecordIds,
                  onRecordIdsChange: setExpandedRecordIds,
                },
                content: ({ record }: { record: RES_ResumenEntregasReq }) => (
                  <HistorialConsumos record={record} />
                ),
              }}
            />
          </div>
        ))}
      </Stack>
    </Card>
  );
};
