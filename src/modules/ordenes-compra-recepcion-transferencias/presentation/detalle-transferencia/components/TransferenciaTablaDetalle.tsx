import { Badge, Group, Text, Table, Button, Loader } from "@mantine/core";
import {
  CubeIcon,
  PlusIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import type { RES_OCTransferenciaDetalle } from "../../../../../service/responses/ordenes-compra/orden-compra-transferencia";

interface Props {
  detalles: RES_OCTransferenciaDetalle[];
  loading?: boolean;
  onOpenHistorial: () => void;
  onOpenNuevaRecepcion: () => void;
  estado: string;
}

export const TransferenciaTablaDetalle = ({
  detalles,
  loading = false,
  onOpenHistorial,
  onOpenNuevaRecepcion,
  estado,
}: Props) => {
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "Recepción Completa":
        return "green";
      case "Recepcionado Parcialmente":
        return "orange";
      default:
        return "indigo";
    }
  };

  return (
    <div className="space-y-4 px-2">
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <CubeIcon className="w-5 h-5 text-indigo-400" />
          <Text
            size="sm"
            fw={800}
            className="text-zinc-100 italic tracking-tight"
          >
            Items Transferidos ({detalles.length})
          </Text>
        </Group>

        <Group gap="md">
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            radius="xl"
            leftSection={
              <ClipboardDocumentCheckIcon className="w-5 h-5 text-zinc-400" />
            }
            onClick={onOpenHistorial}
            className="hover:bg-zinc-800/40 transition-all font-bold"
          >
            Historial de Recepciones
          </Button>
          {estado !== "Recepción Completa" && (
            <Button
              variant="filled"
              color="indigo"
              size="xs"
              radius="xl"
              leftSection={<PlusIcon className="w-5 h-5" />}
              onClick={onOpenNuevaRecepcion}
              className="shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all font-bold px-8"
            >
              Nueva Recepción
            </Button>
          )}
        </Group>
      </Group>

      <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-950/20">
        <Table verticalSpacing="md" horizontalSpacing="xl">
          <thead className="bg-zinc-900/80 text-zinc-400 text-xs font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4 text-center w-12">#</th>
              <th className="px-6 py-4 text-left">Lote</th>
              <th className="px-6 py-4 text-left">Producto</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Cantidad Transferida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader size="sm" color="indigo" type="dots" />
                    <Text size="xs" fw={700} c="indigo.4" className="uppercase tracking-widest animate-pulse">
                      Cargando detalles...
                    </Text>
                  </div>
                </td>
              </tr>
            ) : detalles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center">
                  <Text size="sm" fw={600} c="zinc.5">
                    No hay ítems transferidos disponibles.
                  </Text>
                </td>
              </tr>
            ) : (
              detalles.map((d, idx) => (
                <tr
                  key={d.id_transferencia_detalle}
                  className="hover:bg-zinc-900/40 transition-colors group"
                >
                  <td className="px-6 py-4 text-center text-xs font-mono text-zinc-500">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <Text
                      size="xs"
                      fw={800}
                      className="text-indigo-400/80 font-mono"
                    >
                      {d.lote_correlativo}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="sm" fw={800} className="text-zinc-100">
                      {d.producto}
                    </Text>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge
                      color={getBadgeColor(d.estado)}
                      variant="light"
                      size="sm"
                      radius="sm"
                      className="font-bold uppercase tracking-wider px-3"
                    >
                      {d.estado}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Group gap={4} justify="flex-end">
                      <Text size="sm" fw={900} className="text-white font-mono">
                        {formatNumber(d.cantidad_transferida_base)}
                      </Text>
                      <Text size="xs" fw={800} c="zinc.5" className="uppercase">
                        {d.unidad_medida_base_abv}
                      </Text>
                    </Group>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};
