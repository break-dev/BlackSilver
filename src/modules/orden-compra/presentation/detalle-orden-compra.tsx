import {
  Badge,
  Group,
  Stack,
  Table,
  Text,
  Paper,
  Loader,
  Divider,
} from "@mantine/core";
import {
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  CubeIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../service/orden-compra.responses";
import { formatNumber } from "../../../shared/functions/formatNumber";

interface DetalleOrdenCompraProps {
  orden: RES_OrdenCompra;
  detalles: RES_OrdenCompraDetalle[];
  loading: boolean;
}

export const DetalleOrdenCompra = ({
  orden,
  detalles,
  loading,
}: DetalleOrdenCompraProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="teal" size="lg" />
      </div>
    );
  }

  const symbol = orden.moneda === "Soles" ? "S/." : "$";

  return (
    <Stack gap="xl" className="animate-fade-in p-1">
      {/* Header: Datos Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Paper
          p="md"
          radius="lg"
          className="bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden group hover:bg-emerald-500/10 transition-all"
        >
          <CheckBadgeIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-emerald-400/10 rotate-12" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
              <Text size="xs" c="emerald.3" fw={800} className="uppercase tracking-widest">
                Correlativo OC
              </Text>
            </Group>
            <Text size="md" fw={900} className="text-zinc-100 uppercase font-mono">
              {orden.correlativo}
            </Text>
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          className="bg-indigo-500/5 border border-indigo-500/20 relative overflow-hidden group hover:bg-indigo-500/10 transition-all"
        >
          <BuildingStorefrontIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-indigo-400/10 rotate-12" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <BuildingStorefrontIcon className="w-4 h-4 text-indigo-400" />
              <Text size="xs" c="indigo.3" fw={800} className="uppercase tracking-widest">
                Empresa Compradora
              </Text>
            </Group>
            <Text size="md" fw={800} className="text-zinc-100 truncate">
              {orden.empresa_nombre}
            </Text>
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          className="bg-zinc-800/40 border border-zinc-700/50 relative overflow-hidden group hover:bg-zinc-800/60 transition-all"
        >
          <CalendarDaysIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-zinc-400/10 rotate-12" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <CalendarDaysIcon className="w-4 h-4 text-zinc-400" />
              <Text size="xs" c="zinc.4" fw={800} className="uppercase tracking-widest">
                Fecha de Emisión
              </Text>
            </Group>
            <Text size="md" fw={800} className="text-zinc-100">
              {dayjs(orden.fecha_hora_orden).format("DD/MM/YYYY")}
            </Text>
          </Stack>
        </Paper>
      </div>

      {/* Info Financiera y Referencia */}
      <Paper p="md" radius="lg" className="bg-zinc-900/40 border border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stack gap={4}>
            <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">Referencia</Text>
            <Badge variant="light" color="indigo" radius="sm">Cot: {orden.correlativo_cotizacion}</Badge>
          </Stack>

          <Stack gap={4}>
            <div className="flex items-center gap-1.5 font-bold">
              <BanknotesIcon className="w-3.5 h-3.5 text-emerald-500" />
              <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">Subtotal</Text>
            </div>
            <Text size="sm" fw={800} className="text-zinc-100 font-mono">
              {symbol} {formatNumber(orden.total_antes_igv)}
            </Text>
          </Stack>

          <Stack gap={4}>
            <div className="flex items-center gap-1.5 font-bold">
              <ReceiptPercentIcon className="w-3.5 h-3.5 text-indigo-500" />
              <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">IGV ({orden.porcentaje_igv}%)</Text>
            </div>
            <Text size="sm" fw={800} className="text-zinc-100 font-mono">
              {symbol} {formatNumber(orden.monto_igv)}
            </Text>
          </Stack>

          <Stack gap={4}>
            <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">Total OC</Text>
            <Text size="lg" fw={900} className="text-emerald-400 font-mono leading-none">
              {symbol} {formatNumber(orden.total_despues_igv)}
            </Text>
          </Stack>
        </div>
      </Paper>

      {/* Observación */}
      {orden.observacion && (
        <Paper p="md" radius="lg" className="bg-zinc-900/40 border border-zinc-800 border-l-4 border-l-indigo-500">
          <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest mb-1">Observaciones</Text>
          <Text size="sm" className="text-zinc-300 italic">"{orden.observacion}"</Text>
        </Paper>
      )}

      {/* Tabla de Productos */}
      <div className="space-y-4">
        <Group gap="xs" px="xs">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/10">
            <CubeIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <Text fw={800} className="text-zinc-100 italic tracking-tight text-lg">
            Items de la Orden de Compra
          </Text>
          <Divider orientation="vertical" />
          <Badge variant="outline" color="zinc" radius="sm">
            {detalles.length} Registro(s)
          </Badge>
        </Group>

        <div className="overflow-hidden border border-zinc-800 rounded-2xl bg-zinc-950/20 shadow-2xl">
          <Table verticalSpacing="md" horizontalSpacing="xl">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-12">#</th>
                <th className="px-6 py-4 text-left">Producto</th>
                <th className="px-6 py-4 text-center">Cant. OC</th>
                <th className="px-6 py-4 text-center">Unidad</th>
                <th className="px-6 py-4 text-center">Equivalencia Base</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {detalles.map((det, index) => (
                <tr key={det.id} className="hover:bg-zinc-900/40 transition-colors group">
                  <td className="px-6 py-4 text-center text-zinc-500 text-xs font-mono">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-6 py-4">
                    <Text size="sm" fw={800} className="text-zinc-100">{det.producto_nombre}</Text>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="filled" color="teal" radius="sm" className="font-bold">
                      {formatNumber(det.cantidad_requerida)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Text size="xs" fw={700} className="text-zinc-400 capitalize">{det.unidad_medida_nombre}</Text>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Text size="xs" className="text-zinc-500">
                      {formatNumber(det.cantidad_requerida_base)} {det.unidad_medida_abv}
                      {det.contenido_por_presentacion > 1 && ` (x ${formatNumber(det.contenido_por_presentacion)})`}
                    </Text>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="dot" color="teal" size="xs">
                      {det.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </Stack>
  );
};
