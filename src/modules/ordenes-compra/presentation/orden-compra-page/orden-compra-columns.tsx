import { Badge, Group, Stack, Text, ActionIcon, Tooltip } from "@mantine/core";
import {
  FileText,
  Clock,
  CircleDollarSign,
  Eye,
  TrendingUp,
} from "lucide-react";
import dayjs from "dayjs";
import { type DataTableColumn } from "mantine-datatable";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import { Estado_OrdenCompra } from "../../../../shared/enums/orden-compra/orden-compra";
import type { RES_OrdenCompra } from "../../../../service/responses/ordenes-compra/orden-compra";

export const COLOR_BY_STATE: Record<string, { color: string; label: string }> =
  {
    [Estado_OrdenCompra.Generada]: { color: "teal", label: "Generada" },
    [Estado_OrdenCompra.EnRecepcion]: { color: "blue", label: "En Recepción" },
    [Estado_OrdenCompra.Anulada]: { color: "red", label: "Anulada" },
    [Estado_OrdenCompra.Cerrada]: { color: "gray", label: "Cerrada" },
    [Estado_OrdenCompra.Completada]: { color: "green", label: "Completada" },
  };

interface GetColumnsProps {
  handleVerDetalle: (orden: RES_OrdenCompra) => void;
  handlePrintOC: (orden: RES_OrdenCompra) => void;
  printingId: number | null;
}

export const getOrdenCompraColumns = ({
  handleVerDetalle,
  handlePrintOC,
  printingId,
}: GetColumnsProps): DataTableColumn<RES_OrdenCompra>[] => [
  {
    accessor: "index",
    title: "#",
    textAlign: "center",
    width: 50,
  },
  {
    accessor: "correlativo",
    title: "Código",
    width: 160,
    render: (item) => (
      <Group gap="sm" wrap="nowrap">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <FileText size={16} className="text-indigo-400" />
        </div>
        <Stack gap={0}>
          <Text
            size="sm"
            fw={900}
            className="text-white font-mono tracking-tighter leading-none"
          >
            {item.correlativo}
          </Text>
        </Stack>
      </Group>
    ),
  },
  {
    accessor: "empresa",
    title: "Entidad Compradora",
    width: 280,
    render: (item) => (
      <Stack gap={4}>
        <Text
          size="sm"
          fw={800}
          className="text-zinc-100 truncate leading-tight"
        >
          {item.empresa}
        </Text>
        <Group gap={6}>
          <TrendingUp size={12} className="text-emerald-500" />
          <Text size="10px" c="zinc.5" fw={700}>
            RUC: {item.empresa_ruc}
          </Text>
        </Group>
      </Stack>
    ),
  },
  {
    accessor: "correlativo_cotizacion",
    title: "Ref. Cotización",
    width: 150,
    render: (item) => (
      <Badge
        variant="light"
        color="pink"
        radius="sm"
        className="font-black px-3"
      >
        {item.correlativo_cotizacion}
      </Badge>
    ),
  },
  {
    accessor: "fecha_hora_orden",
    title: "Fecha",
    width: 180,
    render: (item) => (
      <Group gap="sm" wrap="nowrap">
        <Clock size={16} className="text-zinc-500" />
        <Stack gap={0}>
          <Text size="xs" fw={800} className="text-zinc-200">
            {dayjs(item.fecha_hora_orden).format("DD MMM YYYY")}
          </Text>
          <Text size="10px" c="zinc.6" fw={700} className="uppercase">
            {dayjs(item.fecha_hora_orden).format("HH:mm A")}
          </Text>
        </Stack>
      </Group>
    ),
  },
  {
    accessor: "total_despues_igv",
    title: "Importe",
    textAlign: "right",
    width: 180,
    render: (item) => (
      <Group justify="flex-end" gap={8}>
        <Stack gap={0} align="flex-end">
          <Text
            size="xs"
            fw={900}
            className="text-emerald-400 font-mono leading-none"
          >
            {item.moneda === "Soles" ? "S/." : "$"}{" "}
            {formatNumber(Number(item.total_despues_igv))}
          </Text>
        </Stack>
        <CircleDollarSign size={20} className="text-emerald-500/40" />
      </Group>
    ),
  },
  {
    accessor: "estado",
    title: "Estado",
    width: 150,
    render: (item) => {
      const stateInfo = COLOR_BY_STATE[item.estado] ?? {
        color: "gray",
        label: item.estado,
      };
      return (
        <Badge
          variant="gradient"
          gradient={
            item.estado === Estado_OrdenCompra.Completada
              ? { from: "emerald.7", to: "emerald.9" }
              : { from: stateInfo.color + ".6", to: stateInfo.color + ".9" }
          }
          size="md"
          radius="sm"
          className="font-black tracking-widest"
        >
          {stateInfo.label.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessor: "acciones",
    title: "Operaciones",
    textAlign: "center",
    width: 140,
    render: (item) => (
      <Group gap="xs" justify="center">
        <Tooltip label="Explorar Detalles" withArrow>
          <ActionIcon
            variant="filled"
            color="indigo"
            radius="xl"
            size="lg"
            onClick={() => handleVerDetalle(item)}
            className="shadow-lg hover:scale-110 transition-transform"
          >
            <Eye size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Exportar a PDF" withArrow>
          <ActionIcon
            variant="light"
            color="zinc"
            radius="xl"
            size="lg"
            loading={printingId === item.id_orden_compra}
            onClick={() => handlePrintOC(item)}
            className="hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
          >
            <FileText size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    ),
  },
];
