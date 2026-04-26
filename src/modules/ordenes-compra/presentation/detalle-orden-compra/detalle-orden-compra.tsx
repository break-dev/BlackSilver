import {
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  ActionIcon,
} from "@mantine/core";
import {
  ClockIcon,
  CubeIcon,
  ListBulletIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  UserIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../../service/responses/ordenes-compra/orden-compra";

interface DetalleOrdenCompraProps {
  orden: RES_OrdenCompra;
  detalles: RES_OrdenCompraDetalle[];
  loading: boolean;
  progresoGeneral?: number;
}

export const DetalleOrdenCompra = ({
  orden,
  detalles,
  loading,
  progresoGeneral: propProgreso,
}: DetalleOrdenCompraProps) => {
  // Cálculo interno del progreso si no se recibe por props
  const progresoGeneral =
    propProgreso ??
    (orden.estado === "Completada"
      ? 100
      : orden.estado === "En Recepción"
        ? 50
        : 0);
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  const symbol = orden.moneda === "Soles" ? "S/." : "$";

  return (
    <Stack gap="xl" className="animate-fade-in pb-10">
      {/* Header: Datos Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        <Paper
          p="md"
          radius="lg"
          className="bg-violet-500/6 border border-violet-500/20 relative overflow-hidden group hover:bg-violet-500/10 transition-all"
        >
          <CheckBadgeIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-violet-400/10 rotate-12 group-hover:scale-110 transition-transform" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <CheckBadgeIcon className="w-4 h-4 text-violet-400" />
              <Text
                size="xs"
                c="violet.3"
                fw={800}
                className="uppercase tracking-widest"
              >
                Cód. Orden
              </Text>
            </Group>
            <Text
              size="md"
              fw={900}
              className="text-zinc-100 tracking-tight leading-tight font-mono"
            >
              {orden.correlativo}
            </Text>
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          className="bg-indigo-500/6 border border-indigo-500/20 relative overflow-hidden group hover:bg-indigo-500/10 transition-all"
        >
          <BuildingStorefrontIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-indigo-400/10 rotate-12 group-hover:scale-110 transition-transform" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <BuildingStorefrontIcon className="w-4 h-4 text-indigo-500" />
              <Text
                size="xs"
                c="indigo.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Entidad Emisora
              </Text>
            </Group>
            <Text
              size="sm"
              fw={800}
              className="text-zinc-100 tracking-tight leading-tight line-clamp-1"
            >
              {orden.empresa}
            </Text>
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          className="bg-amber-500/6 border border-amber-500/20 relative overflow-hidden group hover:bg-amber-500/10 transition-all"
        >
          <UserIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-amber-400/10 rotate-12 group-hover:scale-110 transition-transform" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <UserIcon className="w-4 h-4 text-amber-500" />
              <Text
                size="xs"
                c="amber.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Proveedor
              </Text>
            </Group>
            <Text
              size="sm"
              fw={800}
              className="text-zinc-100 tracking-tight leading-tight line-clamp-1"
            >
              {orden.proveedor}
            </Text>
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          className="bg-zinc-500/6 border border-zinc-500/20 relative overflow-hidden group hover:bg-zinc-500/10 transition-all"
        >
          <ClockIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-zinc-400/10 rotate-12 group-hover:scale-110 transition-transform" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <ClockIcon className="w-4 h-4 text-zinc-500" />
              <Text
                size="xs"
                c="zinc.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Fecha Emisión
              </Text>
            </Group>
            <Text
              size="md"
              fw={800}
              className="text-zinc-100 tracking-tight leading-tight font-mono"
            >
              {dayjs(orden.fecha_hora_orden).format("DD/MM/YYYY")}
            </Text>
          </Stack>
        </Paper>
      </div>

      {/* Sub-header: Estados y Condiciones */}
      <Paper
        p="md"
        radius="lg"
        bg="transparent"
        className="border border-zinc-800/50 mx-2"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stack gap={4}>
            <Text
              size="xs"
              c="zinc.5"
              fw={800}
              className="uppercase tracking-widest"
            >
              Estado de Orden
            </Text>
            <Badge
              color="indigo"
              variant="light"
              size="sm"
              radius="sm"
              className="font-bold border border-indigo-900/30"
            >
              {orden.estado}
            </Badge>
          </Stack>

          <Stack gap={4}>
            <Group gap={6}>
              <BanknotesIcon className="w-3.5 h-3.5 text-emerald-500" />
              <Text
                size="xs"
                c="zinc.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Forma de Pago
              </Text>
            </Group>
            <Text size="sm" fw={800} className="text-zinc-100 italic">
              {orden.metodo_pago}
            </Text>
          </Stack>

          <Stack gap={4}>
            <Group gap={6}>
              <CurrencyDollarIcon className="w-3.5 h-3.5 text-cyan-500" />
              <Text
                size="xs"
                c="zinc.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Moneda
              </Text>
            </Group>
            <Text size="sm" fw={800} className="text-zinc-100 italic">
              {orden.moneda}
            </Text>
          </Stack>

          <Stack gap={4}>
            <Group gap={6}>
              <DocumentTextIcon className="w-3.5 h-3.5 text-amber-500" />
              <Text
                size="xs"
                c="zinc.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Referencia
              </Text>
            </Group>
            <Badge variant="light" color="amber" radius="sm" size="xs">
              {orden.correlativo_cotizacion || "Sin Ref."}
            </Badge>
          </Stack>
        </div>
      </Paper>

      {/* Barra de Progreso */}
      <Paper
        p="md"
        radius="xl"
        className="bg-zinc-900/50 border border-zinc-800 mx-2"
      >
        <Group justify="space-between" mb={8} px={4}>
          <Text
            size="xs"
            fw={800}
            className="text-zinc-400 tracking-tighter uppercase"
          >
            Cumplimiento Logístico
          </Text>
          <Text size="sm" fw={900} c="indigo.4">
            {progresoGeneral}%
          </Text>
        </Group>
        <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-linear-to-r from-indigo-500 to-indigo-400 transition-all duration-1000"
            style={{ width: `${progresoGeneral}%` }}
          />
        </div>
      </Paper>

      {/* Tabla de Items */}
      <div className="space-y-4 px-2">
        <Group justify="space-between" align="center" px={4}>
          <Group gap="xs">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <ListBulletIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <Text
              fw={800}
              className="text-zinc-100 italic tracking-tight text-lg"
            >
              Detalle de Productos
            </Text>
          </Group>
          <Badge
            variant="light"
            color="indigo"
            radius="md"
            size="sm"
            className="font-bold py-3 px-4 uppercase tracking-widest"
          >
            {detalles.length} {detalles.length === 1 ? "Producto" : "Productos"}
          </Badge>
        </Group>

        <div className="overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950/20">
          <Table verticalSpacing="md" horizontalSpacing="xl">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-12">#</th>
                <th className="px-6 py-4 text-left">Producto</th>
                <th className="px-6 py-4 text-center">Cant. Solicitada</th>
                <th className="px-6 py-4 text-center">Almacén</th>
                <th className="px-6 py-4 text-center">Costo Unit.</th>
                <th className="px-6 py-4 text-center">Subtotal</th>
                <th className="px-6 py-4 text-center w-16">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {detalles.map((det, index) => (
                <tr
                  key={det.id_orden_compra_detalle}
                  className="hover:bg-zinc-900/40 transition-colors group"
                >
                  <td className="px-6 py-4 text-center text-zinc-500 text-xs font-mono">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-6 py-4">
                    <Stack gap={4}>
                      <Group gap="sm">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-indigo-500/50 transition-all">
                          <CubeIcon className="w-4 h-4 text-zinc-400" />
                        </div>
                        <Text
                          size="sm"
                          fw={800}
                          className="text-zinc-100 tracking-tight"
                        >
                          {det.producto}
                        </Text>
                      </Group>
                      <Group gap={4}>
                        {det.es_fiscalizado && (
                          <Badge
                            variant="filled"
                            color="red"
                            size="9px"
                            radius="xs"
                            className="font-black"
                          >
                            FISCALIZADO
                          </Badge>
                        )}
                        {det.es_perecible && (
                          <Badge
                            variant="filled"
                            color="orange"
                            size="9px"
                            radius="xs"
                            className="font-black"
                          >
                            PERECIBLE
                          </Badge>
                        )}
                      </Group>
                    </Stack>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Stack gap={0} align="center">
                      <Text size="sm" fw={800} className="text-zinc-100">
                        {formatNumber(det.cantidad_requerida)}{" "}
                        {det.unidad_medida_oc_abv}
                      </Text>
                      {det.id_unidad_medida_base !==
                        det.id_unidad_medida_oc && (
                        <Text size="10px" c="zinc.5" fw={700}>
                          Equiv: {det.contenido_por_presentacion}{" "}
                          {det.unidad_medida_base_abv}
                        </Text>
                      )}
                    </Stack>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Text
                      size="xs"
                      fw={700}
                      c="zinc.4"
                      className="italic line-clamp-1"
                    >
                      {det.almacen_recepcionista}
                    </Text>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Text
                      size="sm"
                      fw={800}
                      className="text-zinc-100 font-mono"
                    >
                      {symbol} {formatNumber(det.precio_unitario)}
                    </Text>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Text
                      size="sm"
                      fw={900}
                      className="text-zinc-100 font-mono"
                    >
                      {symbol}{" "}
                      {formatNumber(
                        det.precio_unitario * det.cantidad_requerida,
                      )}
                    </Text>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ActionIcon
                      variant="subtle"
                      color="zinc"
                      radius="md"
                      className="opacity-40 hover:opacity-100"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Resumen Financiero y Observaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-2">
        <Stack gap="md" className="lg:col-span-7">
          <Paper
            p="md"
            radius="lg"
            className="bg-zinc-950/20 border border-zinc-800/50"
          >
            <Group gap="xs" mb="sm">
              <InformationCircleIcon className="w-4 h-4 text-zinc-500" />
              <Text
                size="xs"
                fw={800}
                c="zinc.5"
                className="uppercase tracking-widest"
              >
                Observaciones de la Orden
              </Text>
            </Group>
            <Text
              size="sm"
              c="zinc.4"
              className="italic leading-relaxed whitespace-pre-wrap"
            >
              {orden.observacion ||
                "No se registraron observaciones comerciales o técnicas adicionales."}
            </Text>
          </Paper>

          {/* Liquidación de Gastos (opcional si hay flete/otros) */}
          {(Number(orden.costo_flete) > 0 ||
            Number(orden.otros_gastos) > 0) && (
            <Paper
              p="md"
              radius="lg"
              className="bg-zinc-950/20 border border-zinc-800/50"
            >
              <Group gap="xs" mb="md">
                <ArrowPathIcon className="w-4 h-4 text-zinc-500" />
                <Text
                  size="xs"
                  fw={800}
                  c="zinc.5"
                  className="uppercase tracking-widest"
                >
                  Gastos Logísticos Adicionales
                </Text>
              </Group>
              <div className="grid grid-cols-2 gap-4">
                <Stack gap={2}>
                  <Text size="10px" c="zinc.6" fw={700} className="uppercase">
                    Costo de Flete
                  </Text>
                  <Text size="sm" fw={800} className="text-zinc-200">
                    {symbol} {formatNumber(orden.costo_flete)}
                  </Text>
                </Stack>
                <Stack gap={2}>
                  <Text size="10px" c="zinc.6" fw={700} className="uppercase">
                    Otros Gastos
                  </Text>
                  <Text size="sm" fw={800} className="text-zinc-200">
                    {symbol} {formatNumber(orden.otros_gastos)}
                  </Text>
                </Stack>
              </div>
            </Paper>
          )}
        </Stack>

        <Paper
          p="lg"
          radius="xl"
          className="lg:col-span-5 bg-indigo-500/3 border border-indigo-500/20 relative overflow-hidden h-full"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />

          <Stack gap="md">
            <Text
              size="xs"
              fw={900}
              c="indigo.4"
              className="uppercase tracking-[0.2em] border-b border-indigo-500/20 pb-2"
            >
              Liquidación Económica
            </Text>

            <div className="space-y-3">
              <Group justify="space-between">
                <Text size="xs" c="zinc.5" fw={700} className="uppercase">
                  Subtotal Gravado
                </Text>
                <Text size="sm" fw={800} className="text-zinc-200 font-mono">
                  {symbol} {formatNumber(orden.total_antes_igv)}
                </Text>
              </Group>

              <Group justify="space-between">
                <Group gap={6}>
                  <Text size="xs" c="zinc.5" fw={700} className="uppercase">
                    IGV ({orden.porcentaje_igv}%)
                  </Text>
                  {orden.incluye_igv && (
                    <Badge variant="filled" color="teal" size="9px" radius="xs">
                      INCLUIDO
                    </Badge>
                  )}
                </Group>
                <Text size="sm" fw={800} className="text-zinc-200 font-mono">
                  {symbol} {formatNumber(orden.monto_igv)}
                </Text>
              </Group>

              <div className="pt-4 mt-4 border-t border-indigo-500/30">
                <Group justify="space-between">
                  <Stack gap={0}>
                    <Text
                      size="xs"
                      fw={900}
                      c="indigo.4"
                      className="uppercase tracking-widest"
                    >
                      Total Orden
                    </Text>
                    <Text size="9px" c="zinc.6" fw={700} className="uppercase">
                      Cifra Final Liquidadas
                    </Text>
                  </Stack>
                  <Text
                    size="xl"
                    fw={900}
                    className="text-white font-mono tracking-tighter"
                  >
                    {symbol} {formatNumber(orden.total_despues_igv)}
                  </Text>
                </Group>
              </div>
            </div>
          </Stack>
        </Paper>
      </div>
    </Stack>
  );
};
