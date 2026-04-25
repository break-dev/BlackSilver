import {
  Badge,
  Group,
  Stack,
  Table,
  Text,
  Paper,
  Loader,
  Divider,
  ActionIcon,
  Grid,
  Box,
  Center,
} from "@mantine/core";
import {
  Building2,
  Calendar,
  Link2,
  Truck,
  FileText,
  PackageCheck,
  AlertTriangle,
  Banknote,
  ReceiptText,
  Info,
  Clock,
  History,
  CornerDownRight,
  ShieldCheck,
  BoxSelect,
} from "lucide-react";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import gsap from "gsap";
// import useSound from "use-sound"; // Descomentar cuando existan los archivos mp3
import { OrdenCompraService } from "../../service/orden-compra.service";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../../service/responses/ordenes-compra/orden-compra";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { TrazabilidadOrdenCompra } from "./trazabilidad-orden-compra";
import type { RES_Trazabilidad } from "../../../../service/responses/_generic/trazabilidad";

interface DetalleOrdenCompraProps {
  orden: RES_OrdenCompra;
  detalles: RES_OrdenCompraDetalle[];
  loading: boolean;
}

const STATUS_ITEM_COLORS: Record<string, string> = {
  Pendiente: "orange",
  "En Recepción": "pink",
  Recibido: "emerald",
  Completado: "emerald",
};

export const DetalleOrdenCompra = ({
  orden,
  detalles,
  loading,
}: DetalleOrdenCompraProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // const [playClick] = useSound("/sounds/click.mp3", { volume: 0.5 });

  const [openedSeguimiento, { open: openSeg, close: closeSeg }] =
    useDisclosure(false);
  const [selectedItem, setSelectedItem] =
    useState<RES_OrdenCompraDetalle | null>(null);
  const [logs, setLogs] = useState<RES_Trazabilidad[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const cards = gsap.utils.toArray(".gsap-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50, rotateX: -15 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "expo.out",
        },
      );

      gsap.fromTo(
        ".gsap-progress",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.5, ease: "power4.inOut", delay: 0.5 },
      );
    }
  }, [loading, detalles]);

  if (loading) {
    return (
      <Center py={100} className="flex-col gap-6">
        <Loader color="indigo" size="xl" type="dots" />
        <Text
          c="dimmed"
          fw={700}
          className="tracking-widest uppercase animate-pulse"
        >
          Sincronizando Orden de Compra...
        </Text>
      </Center>
    );
  }

  const handleVerSeguimiento = async (item: RES_OrdenCompraDetalle) => {
    setSelectedItem(item);
    openSeg();
    setLoadingLogs(true);
    try {
      const res = await OrdenCompraService.get_seguimiento(
        item.id_orden_compra_detalle,
      );
      if (res.success) {
        setLogs(res.data);
      }
    } catch {
      console.error("Error al cargar seguimiento");
    } finally {
      setLoadingLogs(false);
    }
  };

  const symbol = orden.moneda === "Soles" ? "S/." : "$";

  const progresoGeneral =
    orden.estado === "Completada"
      ? 100
      : orden.estado === "En Recepción"
        ? 50
        : 0;

  return (
    <Stack
      gap="xl"
      className="p-4"
      ref={containerRef}
      style={{ perspective: "1000px" }}
    >
      {/* SECCIÓN 1: CABECERA PREMIUM */}
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper
            p="xl"
            radius="28px"
            className="gsap-card bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md relative overflow-hidden h-full shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText size={120} />
            </div>

            <Stack gap="xl">
              <Group justify="space-between" align="flex-start">
                <Stack gap={0}>
                  <Text
                    size="xs"
                    c="indigo.4"
                    fw={900}
                    className="uppercase tracking-[0.2em] mb-1"
                  >
                    Documento Oficial
                  </Text>
                  <Text
                    size="32px"
                    fw={900}
                    className="text-white tracking-tighter leading-none"
                  >
                    {orden.correlativo}
                  </Text>
                </Stack>
                <Badge
                  variant="gradient"
                  gradient={{ from: "indigo", to: "cyan" }}
                  size="xl"
                  radius="md"
                  className="h-10 px-6 font-black border border-white/10 shadow-lg shadow-indigo-500/20"
                >
                  {orden.estado.toUpperCase()}
                </Badge>
              </Group>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Group wrap="nowrap" align="flex-start" gap="md">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <Building2 className="text-emerald-400" size={24} />
                    </div>
                    <Stack gap={2}>
                      <Text
                        size="xs"
                        c="zinc.5"
                        fw={800}
                        className="uppercase tracking-widest"
                      >
                        Empresa Emisora
                      </Text>
                      <Text size="md" fw={800} className="text-zinc-100">
                        {orden.empresa}
                      </Text>
                      <Text size="xs" c="zinc.6" fw={600}>
                        RUC: {orden.empresa_ruc}
                      </Text>
                    </Stack>
                  </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Group wrap="nowrap" align="flex-start" gap="md">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                      <Truck className="text-purple-400" size={24} />
                    </div>
                    <Stack gap={2}>
                      <Text
                        size="xs"
                        c="zinc.5"
                        fw={800}
                        className="uppercase tracking-widest"
                      >
                        Proveedor Asignado
                      </Text>
                      <Text size="md" fw={800} className="text-zinc-100">
                        {orden.proveedor}
                      </Text>
                      <Text size="xs" c="zinc.6" fw={600}>
                        ID: {orden.documento_proveedor}
                      </Text>
                    </Stack>
                  </Group>
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper
            p="xl"
            radius="28px"
            className="gsap-card bg-linear-to-br from-indigo-600/20 to-zinc-900/40 border border-indigo-500/20 backdrop-blur-md h-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 text-indigo-500/10 rotate-12">
              <Calendar size={140} />
            </div>

            <Stack gap="lg" className="relative z-10">
              <Group gap={8}>
                <Calendar className="text-indigo-400" size={18} />
                <Text
                  size="sm"
                  fw={800}
                  className="text-zinc-200 uppercase tracking-widest"
                >
                  Cronología
                </Text>
              </Group>

              <Stack gap="xs">
                <div className="flex justify-between items-center p-3 bg-zinc-950/40 rounded-xl border border-zinc-800">
                  <Text size="xs" c="zinc.5" fw={700}>
                    Fecha Emisión
                  </Text>
                  <Text size="sm" fw={900} className="text-zinc-200 font-mono">
                    {dayjs(orden.fecha_hora_orden).format("DD/MM/YYYY")}
                  </Text>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-950/40 rounded-xl border border-zinc-800">
                  <Text size="xs" c="zinc.5" fw={700}>
                    Método de Pago
                  </Text>
                  <Badge
                    variant="light"
                    color="indigo"
                    radius="sm"
                    className="font-bold"
                  >
                    {orden.metodo_pago}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-950/40 rounded-xl border border-zinc-800">
                  <Text size="xs" c="zinc.5" fw={700}>
                    Cotización Ref.
                  </Text>
                  <Group gap={4}>
                    <Link2 size={12} className="text-pink-400" />
                    <Text
                      size="sm"
                      fw={900}
                      className="text-pink-300 font-mono"
                    >
                      {orden.correlativo_cotizacion}
                    </Text>
                  </Group>
                </div>
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* PROGRESO GLOBAL */}
      <Paper
        p="lg"
        radius="20px"
        className="gsap-card bg-zinc-900/20 border border-zinc-800/50 backdrop-blur-sm overflow-hidden"
      >
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            <PackageCheck size={18} className="text-emerald-500" />
            <Text
              size="xs"
              fw={900}
              className="text-zinc-400 uppercase tracking-tighter"
            >
              Estado de Atención Logística
            </Text>
          </Group>
          <Text
            size="sm"
            fw={900}
            className="text-emerald-400 font-mono italic"
          >
            {progresoGeneral}% COMPLETADO
          </Text>
        </Group>
        <Box className="relative h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
          <Box
            className="gsap-progress absolute inset-y-0 left-0 bg-linear-to-r from-emerald-600 via-teal-400 to-cyan-400 origin-left"
            style={{ width: `${progresoGeneral}%` }}
          />
        </Box>
      </Paper>

      {/* TABLA DE ITEMS REIMAGINADA */}
      <div className="space-y-4">
        <Group justify="space-between" align="center" px="md">
          <Group gap="md">
            <div className="p-2.5 bg-zinc-100 rounded-xl">
              <BoxSelect size={20} className="text-zinc-900" />
            </div>
            <Stack gap={0}>
              <Text
                size="lg"
                fw={900}
                className="text-white tracking-tight italic leading-none"
              >
                Items Solicitados
              </Text>
              <Text
                size="xs"
                c="zinc.5"
                fw={700}
                className="uppercase tracking-widest mt-1"
              >
                Inventario Detallado
              </Text>
            </Stack>
          </Group>
        </Group>

        <Paper
          radius="24px"
          className="gsap-card bg-zinc-950/40 border border-zinc-800/80 overflow-hidden shadow-2xl backdrop-blur-xl"
        >
          <Table verticalSpacing="lg" horizontalSpacing="xl">
            <thead className="bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] text-center w-12">
                  #
                </th>
                <th className="px-6 py-5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] text-left">
                  Especificación Técnica
                </th>
                <th className="px-6 py-5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] text-left">
                  Destino & Logística
                </th>
                <th className="px-6 py-5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                  Volumen
                </th>
                <th className="px-6 py-5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] text-right">
                  Valuación
                </th>
                <th className="px-6 py-5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                  Trazabilidad
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {detalles.map((det, index) => {
                const subtotalItem =
                  det.cantidad_requerida * det.precio_unitario;
                const isDiferentUnit =
                  det.id_unidad_medida_base !== det.id_unidad_medida_oc;

                return (
                  <tr
                    key={det.id_orden_compra_detalle}
                    className="hover:bg-white/2 transition-colors group"
                  >
                    <td className="px-6 py-6 text-center text-zinc-600 font-mono text-xs font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-6 text-left">
                      <Stack gap={6}>
                        <Text
                          size="sm"
                          fw={900}
                          className="text-zinc-100 leading-tight"
                        >
                          {det.producto}
                        </Text>
                        <Group gap={6}>
                          {det.es_fiscalizado && (
                            <Badge
                              variant="dot"
                              color="red"
                              size="xs"
                              radius="sm"
                            >
                              Fiscalizado
                            </Badge>
                          )}
                          {det.es_perecible && (
                            <Badge
                              variant="dot"
                              color="orange"
                              size="xs"
                              radius="sm"
                            >
                              Perecible
                            </Badge>
                          )}
                          <Badge
                            variant="light"
                            color={STATUS_ITEM_COLORS[det.estado] || "zinc"}
                            size="xs"
                            radius="sm"
                            className="font-black uppercase tracking-widest"
                          >
                            {det.estado}
                          </Badge>
                        </Group>
                      </Stack>
                    </td>
                    <td className="px-6 py-6 text-left">
                      <Stack gap={4}>
                        <Group gap={6} wrap="nowrap">
                          <CornerDownRight
                            size={14}
                            className="text-indigo-500"
                          />
                          <Text size="xs" fw={800} className="text-zinc-300">
                            {det.almacen_recepcionista}
                          </Text>
                        </Group>
                        <Group gap={6} wrap="nowrap">
                          <Clock size={12} className="text-zinc-500" />
                          <Text size="10px" c="dimmed" fw={700}>
                            Plazo: {det.tiempo_entrega}{" "}
                            {det.tiempo_entrega_periodo}
                          </Text>
                        </Group>
                      </Stack>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <Stack gap={2} align="center">
                        <Text
                          size="md"
                          fw={900}
                          className="text-white font-mono"
                        >
                          {formatNumber(det.cantidad_requerida)}
                        </Text>
                        <Text
                          size="10px"
                          fw={900}
                          className="text-indigo-400 uppercase tracking-widest"
                        >
                          {det.unidad_medida_oc_abv}
                        </Text>
                        {isDiferentUnit && (
                          <Text
                            size="9px"
                            c="dimmed"
                            fs="italic"
                            fw={700}
                            className="mt-1"
                          >
                            ({det.contenido_por_presentacion}{" "}
                            {det.unidad_medida_base_abv} / unid)
                          </Text>
                        )}
                      </Stack>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Stack gap={2} align="flex-end">
                        <Text
                          size="sm"
                          fw={900}
                          className="text-emerald-400 font-mono"
                        >
                          {symbol} {formatNumber(subtotalItem)}
                        </Text>
                        <Text size="10px" c="zinc.6" fw={700}>
                          Unid: {symbol}
                          {formatNumber(det.precio_unitario)}
                        </Text>
                      </Stack>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <ActionIcon
                        variant="subtle"
                        color="zinc"
                        size="xl"
                        radius="xl"
                        onClick={() => handleVerSeguimiento(det)}
                        className="hover:bg-indigo-500/10 hover:text-indigo-400 transition-all active:scale-90"
                      >
                        <History size={20} />
                      </ActionIcon>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Paper>
      </div>

      {/* FOOTER FINANCIERO: DISEÑO DE RECIBO PREMIUM */}
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper
            p="xl"
            radius="24px"
            className="gsap-card bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-md h-full"
          >
            <Stack gap="md">
              <Group gap="md">
                <div className="p-2 bg-zinc-800 rounded-lg">
                  <Info size={18} className="text-zinc-400" />
                </div>
                <Text
                  size="sm"
                  fw={900}
                  className="text-zinc-300 uppercase tracking-widest"
                >
                  Observaciones Generales
                </Text>
              </Group>
              <Text
                size="sm"
                className="text-zinc-500 leading-relaxed italic border-l-2 border-zinc-800 pl-6 py-2"
              >
                {orden.observacion ||
                  "Sin anotaciones técnicas o logísticas registradas para este movimiento comercial."}
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper
            p="xl"
            radius="24px"
            className="gsap-card bg-linear-to-b from-zinc-800/50 to-zinc-950 border border-zinc-800 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <Stack gap="lg">
              <Text
                size="xs"
                fw={900}
                c="zinc.5"
                className="uppercase tracking-[0.3em]"
              >
                Resumen de Inversión
              </Text>

              <Stack gap="xs">
                <div className="flex justify-between items-center px-2">
                  <Group gap={8}>
                    <Banknote size={14} className="text-zinc-600" />
                    <Text size="sm" c="zinc.4" fw={700}>
                      Subtotal Mercadería
                    </Text>
                  </Group>
                  <Text size="sm" fw={800} className="text-zinc-200 font-mono">
                    {symbol} {formatNumber(orden.total_antes_igv)}
                  </Text>
                </div>

                {Number(orden.costo_flete) > 0 && (
                  <div className="flex justify-between items-center px-2">
                    <Group gap={8}>
                      <Truck size={14} className="text-orange-500/60" />
                      <Text size="sm" c="zinc.4" fw={700}>
                        Servicio Flete / Envío
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={800}
                      className="text-orange-300 font-mono"
                    >
                      + {symbol} {formatNumber(orden.costo_flete)}
                    </Text>
                  </div>
                )}

                {Number(orden.otros_gastos) > 0 && (
                  <div className="flex justify-between items-center px-2">
                    <Group gap={8}>
                      <AlertTriangle size={14} className="text-yellow-500/60" />
                      <Text size="sm" c="zinc.4" fw={700}>
                        Gastos Operativos Adicionales
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={800}
                      className="text-yellow-300 font-mono"
                    >
                      + {symbol} {formatNumber(orden.otros_gastos)}
                    </Text>
                  </div>
                )}

                <div className="flex justify-between items-center px-2">
                  <Group gap={8}>
                    <ReceiptText size={14} className="text-pink-500/60" />
                    <Text size="sm" c="zinc.4" fw={700}>
                      Impuesto IGV ({orden.porcentaje_igv}%)
                    </Text>
                  </Group>
                  <Group gap={8} align="center">
                    {orden.incluye_igv && (
                      <Badge
                        size="xs"
                        color="pink"
                        variant="dot"
                        className="font-bold"
                      >
                        Incluido
                      </Badge>
                    )}
                    <Text
                      size="sm"
                      fw={800}
                      className="text-pink-300 font-mono"
                    >
                      {symbol} {formatNumber(orden.monto_igv)}
                    </Text>
                  </Group>
                </div>
              </Stack>

              <Divider color="zinc.8" variant="dashed" />

              <Group
                justify="space-between"
                align="flex-end"
                className="bg-white/3 p-4 rounded-2xl border border-white/5"
              >
                <Stack gap={0}>
                  <Text
                    size="xs"
                    fw={900}
                    className="text-indigo-400 uppercase tracking-widest leading-none mb-2"
                  >
                    Total Consolidado
                  </Text>
                  <Text size="sm" c="zinc.5" fw={700} className="leading-none">
                    Valores Netos ({orden.moneda})
                  </Text>
                </Stack>
                <Text
                  size="32px"
                  fw={900}
                  className="text-white font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] leading-none"
                >
                  <span className="text-lg mr-1 opacity-50">{symbol}</span>
                  {formatNumber(orden.total_despues_igv)}
                </Text>
              </Group>

              <Group
                gap={6}
                justify="center"
                className="opacity-30 hover:opacity-100 transition-opacity cursor-default"
              >
                <ShieldCheck size={12} className="text-emerald-500" />
                <Text
                  size="10px"
                  fw={800}
                  className="uppercase tracking-[0.2em] text-zinc-500"
                >
                  Documento Verificado por el Sistema
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* MODAL DE SEGUIMIENTO */}
      <ModalEstandar
        opened={openedSeguimiento}
        close={closeSeg}
        title="Historial de Movimientos & Trazabilidad"
        size="lg"
      >
        <TrazabilidadOrdenCompra
          eventos={logs}
          loading={loadingLogs}
          productoNombre={selectedItem?.producto}
        />
      </ModalEstandar>
    </Stack>
  );
};
