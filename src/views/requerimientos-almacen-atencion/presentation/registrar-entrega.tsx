import {
  Button,
  Group,
  Loader,
  NumberInput,
  Paper,
  Stack,
  Table,
  Text,
  Textarea,
  Select,
  Badge,
} from "@mantine/core";
import {
  ClipboardDocumentCheckIcon,
  BarsArrowDownIcon,
  ClockIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { BlackcitoLogo } from "../../../presentation/assets/imports";
import { useRegistrarEntrega } from "../hooks/useRegistrarEntrega";

export interface IUseHook {
  setError: (msg: string) => void;
}

interface RegistrarEntregaProps {
  idRequerimiento: number;
  idRequerimientoDetalle: number;
  idProducto: number;
  idAlmacen: number;
  productoNombre: string;
  cantidadSolicitada: number;
  cantidadAtendida: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const RegistrarEntrega = ({
  idRequerimiento,
  idRequerimientoDetalle,
  idProducto,
  idAlmacen,
  onSuccess,
  onCancel,
}: RegistrarEntregaProps) => {
  const {
    loading,
    itemData,
    historial,
    entregaCantidades,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    observacion,
    setObservacion,
    error,
    isProcessing,
    empleados,
    totalEntregaBase,
    equivReq,
    stockDisponibleBase,
    handleCantChange,
    handleConfirmar,
  } = useRegistrarEntrega({
    idRequerimiento,
    idRequerimientoDetalle,
    idProducto,
    idAlmacen,
    onSuccess,
  });

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  if (!itemData) return <Text c="red">Error al cargar datos del ítem</Text>;

  return (
    <Stack gap="lg" className="font-sans">
      {/* 1. CABECERA: PRODUCTO Y MÉTRICAS (Estilo Refinado) */}
      <Paper
        p="lg"
        radius="lg"
        className="bg-zinc-900/40 border border-zinc-800 shadow-sm overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Group gap="md">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <CubeIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <Text
                size="xs"
                c="indigo.4"
                fw={800}
                className="uppercase tracking-widest mb-0.5 opacity-80"
              >
                Producto Solicitado
              </Text>
              <Text
                size="xl"
                fw={900}
                className="text-white leading-tight mb-1"
              >
                {itemData.producto}
              </Text>
              <Group gap="xs">
                <Text size="sm" fw={800} c="indigo.3">
                  {Number(itemData.cantidad_solicitada).toFixed(2)}{" "}
                  {itemData.unidad_medida}
                </Text>
                <Text size="xs" c="zinc-5" fw={700}>
                  Equivale a:
                </Text>
                <Text size="xs" c="zinc.3" fw={800}>
                  {Number(itemData.cantidad_solicitada_base).toFixed(2)}{" "}
                  {itemData.unidad_medida_base}
                </Text>
                <Text size="10px" c="zinc.6" fw={700} className="italic">
                  ({Number(equivReq).toFixed(2)} {itemData.unidad_medida_base}/
                  {itemData.unidad_medida})
                </Text>
              </Group>
            </div>
          </Group>

          <div className="flex gap-2">
            <div className="text-right px-5 py-1.5 border border-zinc-800/50 rounded-xl bg-zinc-900/30">
              <Text
                size="9px"
                c="green.5"
                fw={900}
                className="uppercase tracking-widest mb-1"
              >
                Stock Disp.
              </Text>
              <Group gap={4} justify="flex-end" align="baseline">
                <Text
                  size="lg"
                  fw={900}
                  className="text-green-500 font-mono leading-none"
                >
                  {Number(stockDisponibleBase).toFixed(2)}
                </Text>
                <Text size="10px" fw={800} c="zinc.5" className="uppercase">
                  {itemData.unidad_medida_base}
                </Text>
              </Group>
            </div>
            <div className="text-right px-5 py-1.5 bg-pink-500/5 rounded-xl border border-pink-500/10">
              <Text
                size="9px"
                c="pink.5"
                fw={900}
                className="uppercase tracking-widest mb-1"
              >
                Pendiente
              </Text>
              <Group gap={4} justify="flex-end" align="baseline">
                <Text
                  size="lg"
                  fw={900}
                  className="text-pink-500 font-mono leading-none"
                >
                  {Number(itemData.pendiente_base || 0).toFixed(2)}
                </Text>
                <Text size="10px" fw={800} c="zinc.5" className="uppercase">
                  {itemData.unidad_medida_base}
                </Text>
              </Group>
            </div>
          </div>
        </div>
      </Paper>

      {/* 2. FORMULARIO SELECCIÓN RECEPTOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
        <Select
          label="¿Quién recibe el material?"
          placeholder="Buscar por Nombre"
          data={empleados}
          searchable
          required
          withAsterisk
          value={idEmpleadoRecibe}
          onChange={setIdEmpleadoRecibe}
          size="sm"
          radius="lg"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            label: "text-zinc-300 mb-1 font-medium text-sm",
          }}
        />
        <Textarea
          label="Observación de la Entrega"
          placeholder="Escriba detalles adicionales si es necesario..."
          value={observacion}
          onChange={(e) => setObservacion(e.currentTarget.value)}
          size="sm"
          radius="lg"
          minRows={1}
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 py-2",
            label: "text-zinc-300 mb-1 font-medium text-sm",
          }}
        />
      </div>

      {/* 4. TABLA DE LOTES (Ajustada al estilo ordenado) */}
      <div className="space-y-4">
        <Group gap="xs" px={4} align="center">
          <BarsArrowDownIcon className="w-5 h-5 text-indigo-400" />
          <Text
            fw={900}
            size="sm"
            className="text-white uppercase tracking-widest"
          >
            Lotes Disponibles para Entrega
          </Text>
        </Group>

        <div className="overflow-hidden border border-zinc-800 rounded-3xl bg-zinc-950/40 shadow-2xl">
          <Table
            verticalSpacing="lg"
            horizontalSpacing="xl"
            className="border-collapse"
          >
            <thead className="bg-zinc-900/80 text-zinc-400 text-[11px] font-bold border-b border-zinc-800">
              <tr>
                <th className="py-4 pl-8" style={{ width: "18%" }}>
                  Cód. Lote
                </th>
                <th className="text-left" style={{ width: "18%" }}>
                  Vencimiento
                </th>
                <th className="text-right" style={{ width: "22%" }}>
                  Stock Disponible
                </th>
                <th className="text-center w-40">Cant. a Despachar</th>
                <th className="text-right pr-8" style={{ width: "18%" }}>
                  Nuevo Saldo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {!itemData.lotes || itemData.lotes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center text-zinc-600 italic"
                  >
                    No hay lotes con stock disponible en este almacén.
                  </td>
                </tr>
              ) : (
                itemData.lotes.map((lote) => {
                  const idLoteProd = lote.id_lote!; // Assert as mapped
                  const cant = entregaCantidades[idLoteProd] || 0;
                  const saldo = (lote.stock_actual_base || 0) - cant;
                  const equivLote =
                    Number(lote.contenido_por_presentacion) || 1;

                  // Cálculo de vencimiento
                  const fechaVenc = lote.fecha_vencimiento
                    ? dayjs(lote.fecha_vencimiento)
                    : null;
                  const hoy = dayjs().startOf("day");
                  const diasRestantes = fechaVenc
                    ? fechaVenc.diff(hoy, "day")
                    : null;
                  const esCritico =
                    diasRestantes !== null && diasRestantes <= 5; // Valor por defecto o configurable
                  const esVencido = diasRestantes !== null && diasRestantes < 0;

                  return (
                    <tr
                      key={lote.id_lote}
                      className="hover:bg-zinc-900/40 transition-all group border-b border-zinc-800/30"
                    >
                      <td className="py-5 pl-8 text-left">
                        <Badge
                          variant="light"
                          color="violet"
                          radius="sm"
                          size="sm"
                          className="font-black"
                        >
                          {lote.correlativo}
                        </Badge>
                      </td>
                      <td className="text-left">
                        {lote.fecha_vencimiento ? (
                          <div className="flex flex-col gap-1">
                            <Text
                              size="11px"
                              fw={800}
                              className="text-zinc-200"
                            >
                              {dayjs(lote.fecha_vencimiento).format(
                                "DD/MM/YYYY",
                              )}
                            </Text>
                            <Badge
                              variant="dot"
                              size="xs"
                              color={
                                esVencido
                                  ? "red"
                                  : esCritico
                                    ? "orange"
                                    : "teal"
                              }
                              className="px-0 font-bold"
                            >
                              {esVencido
                                ? "Vencido"
                                : `${diasRestantes} días por vencer`}
                            </Badge>
                          </div>
                        ) : (
                          <Text
                            size="11px"
                            fw={700}
                            c="zinc.7"
                            className="italic"
                          >
                            No aplica
                          </Text>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex flex-col gap-1.5 items-end">
                          <Group gap="xs" wrap="nowrap" justify="flex-end">
                            <Badge
                              variant="filled"
                              color="cyan"
                              radius="sm"
                              size="sm"
                              className="text-white fw-bold shadow-xs"
                            >
                              {Number(lote.stock_actual).toFixed(2)}{" "}
                              {lote.unidad_medida}
                            </Badge>
                            <div className="w-px h-8 bg-zinc-800" />
                            <Badge
                              variant="filled"
                              color="pink"
                              radius="sm"
                              size="sm"
                              className="text-white fw-bold shadow-xs"
                            >
                              {Number(lote.stock_actual_base).toFixed(2)}{" "}
                              {itemData.unidad_medida_base}
                            </Badge>
                          </Group>
                          <Text
                            size="10px"
                            fw={700}
                            c="zinc.5"
                            className="italic opacity-80 mr-1"
                          >
                            ({Number(equivLote).toFixed(2)}{" "}
                            {itemData.unidad_medida_base}/{lote.unidad_medida})
                          </Text>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center">
                          <NumberInput
                            size="sm"
                            radius="md"
                            min={0}
                            max={lote.stock_actual_base}
                            value={cant}
                            onChange={(val) =>
                              handleCantChange(lote.id_lote, Number(val))
                            }
                            placeholder="0.00"
                            className="w-32"
                            classNames={{
                              input:
                                "bg-zinc-900 border-zinc-800 focus:border-indigo-500 text-white text-center font-black text-sm h-10 shadow-sm",
                            }}
                          />
                        </div>
                      </td>
                      <td className="text-right pr-8">
                        <div className="flex flex-col items-end">
                          <Text
                            size="lg"
                            fw={900}
                            c={saldo < 0 ? "red.5" : "white"}
                            className="font-mono tracking-tighter leading-none"
                          >
                            {Number(saldo).toFixed(2)}
                          </Text>
                          <Text
                            size="10px"
                            fw={800}
                            c="zinc.5"
                            className="font-bold opacity-80"
                          >
                            {itemData.unidad_medida_base}
                          </Text>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* MENSAJE INFORMATIVO (BlackcitoLogo) */}
      <div className="bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10 flex gap-6 items-center">
        <img
          src={BlackcitoLogo}
          alt="Blackcito"
          className="w-14 h-14 animate-bounce object-contain"
        />
        <Text size="sm" c="zinc.3" fw={600} className="leading-relaxed italic">
          Al confirmar, se descontará el stock de los lotes seleccionados y se
          registrará el movimiento en el Kardex.
        </Text>
      </div>

      {/* 5. HISTORIAL DE ENTREGAS (Rediseño) */}
      <div className="space-y-4">
        <Group gap="xs" px={4} align="center">
          <ClockIcon className="w-5 h-5 text-zinc-500" />
          <Text fw={900} size="sm" className="text-zinc-400">
            Historial de Entregas
          </Text>
        </Group>

        <div className="overflow-hidden border border-zinc-800 rounded-3xl bg-zinc-950/20 max-h-64 overflow-y-auto shadow-sm">
          <Table
            verticalSpacing="md"
            horizontalSpacing="xl"
            className="border-collapse"
          >
            <thead className="bg-zinc-900/50 text-zinc-400 text-[11px] font-bold border-b border-zinc-800">
              <tr>
                <th className="py-4 pl-8" style={{ width: "18%" }}>
                  Cod. Entrega
                </th>
                <th className="text-left" style={{ width: "18%" }}>
                  Fecha
                </th>
                <th className="text-left">Entregado a</th>
                <th className="text-right" style={{ width: "20%" }}>
                  Cantidad ({itemData.unidad_medida_base})
                </th>
                <th className="text-center" style={{ width: "12%" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {historial.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-zinc-700 italic text-sm"
                  >
                    No registra entregas previas para este ítem.
                  </td>
                </tr>
              ) : (
                historial.map((h) => (
                  <tr
                    key={h.id_requerimiento_almacen_entrega}
                    className="text-zinc-400 hover:bg-zinc-900/40 transition-all group"
                  >
                    <td className="py-4 pl-8">
                      <Badge
                        variant="light"
                        color="violet"
                        radius="sm"
                        size="sm"
                        className="font-black"
                      >
                        {h.correlativo}
                      </Badge>
                    </td>
                    <td className="text-left">
                      <div className="flex flex-col">
                        <Text size="11px" fw={700} className="text-zinc-300">
                          {dayjs(h.fecha_hora_entrega * 1000).format(
                            "DD/MM/YYYY",
                          )}
                        </Text>
                        <Text
                          size="10px"
                          fw={600}
                          c="zinc.6"
                          className="uppercase"
                        >
                          {dayjs(h.fecha_hora_entrega * 1000).format("HH:mm A")}
                        </Text>
                      </div>
                    </td>
                    <td>
                      <Text size="sm" fw={700} className="text-zinc-300">
                        {h.empleado_recibe}
                      </Text>
                    </td>
                    <td className="text-right pr-6">
                      <div className="flex flex-col items-end">
                        <Text
                          size="md"
                          fw={900}
                          className="text-emerald-500 font-mono tracking-tighter leading-none"
                        >
                          +{Number(h.cantidad).toFixed(2)}
                        </Text>
                        <Text
                          size="10px"
                          fw={800}
                          c="zinc.6"
                          className="font-bold opacity-80"
                        >
                          {itemData.unidad_medida_base}
                        </Text>
                      </div>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        color="zinc"
                        radius="md"
                        className="font-bold text-[10px] hover:bg-zinc-800 text-zinc-500"
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* 6. PIE DE FORMULARIO */}
      <Group
        justify="flex-end"
        gap="md"
        className="pt-8 border-t border-zinc-800 mt-4"
      >
        <Button
          variant="subtle"
          radius="lg"
          size="md"
          onClick={onCancel}
          className="text-zinc-400 hover:text-white px-8 font-bold"
        >
          Cancelar
        </Button>
        <Button
          size="md"
          radius="lg"
          leftSection={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
          disabled={
            !idEmpleadoRecibe ||
            totalEntregaBase <= 0 ||
            totalEntregaBase > (itemData.pendiente_base || 0) ||
            isProcessing
          }
          loading={isProcessing}
          onClick={handleConfirmar}
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0 px-10"
        >
          Guardar
        </Button>
      </Group>
      {error && (
        <Text
          c="red"
          size="xs"
          ta="center"
          fw={800}
          className="italic bg-red-950/10 py-3 rounded-2xl border border-red-900/30 font-mono tracking-wide mt-2"
        >
          {error}
        </Text>
      )}
    </Stack>
  );
};
