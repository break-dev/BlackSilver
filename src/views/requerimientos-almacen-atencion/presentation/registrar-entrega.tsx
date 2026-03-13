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
  CubeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useRegistrarEntregaBatch } from "../hooks/useRegistrarEntrega";
import type {
  RES_DetalleRequerimiento,
  DetalleRequerimientoExtendido,
} from "../service/atencion.responses";

interface RegistrarEntregaProps {
  idRequerimiento: number;
  idAlmacen: number;
  selectedItemsIds: number[];
  detallesRequerimiento: RES_DetalleRequerimiento[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const RegistrarEntrega = ({
  idRequerimiento,
  idAlmacen,
  selectedItemsIds,
  detallesRequerimiento,
  onSuccess,
  onCancel,
}: RegistrarEntregaProps) => {
  const {
    loading,
    selectedDetalles,
    lotesPorProducto,
    entregaCantidades,
    empleados,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    observacion,
    setObservacion,
    error,
    isProcessing,
    totalEntregaGeneralBase,
    handleCantChange,
    handleConfirmar,
  } = useRegistrarEntregaBatch({
    idRequerimiento,
    idAlmacen,
    selectedItemsIds,
    detallesRequerimiento,
    onSuccess,
  });

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );

  if (selectedDetalles.length === 0)
    return <Text c="red">No hay ítems seleccionados o válidos.</Text>;

  return (
    <Stack gap="lg" className="font-sans">
      {/* 1. SELECCIÓN RECEPTOR Y OBSERVACIÓN */}
      <Paper
        p="md"
        radius="lg"
        className="bg-zinc-900/40 border border-zinc-800 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="¿Quién recibe los materiales?"
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
            label="Observación"
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
      </Paper>

      {/* 2. PRODUCTOS Y LOTES */}
      <Stack gap="xl">
        {selectedDetalles.map((detalle_req: DetalleRequerimientoExtendido) => {
          const lotes = lotesPorProducto[detalle_req.id_producto] || [];
          const pendienteBase = Number(
            detalle_req.cantidad_solicitada_base -
              detalle_req.cantidad_entregada_base || 0,
          );

          const tEntregadoProductoActualBase = lotes.reduce(
            (acc, l) => acc + (entregaCantidades[l.id_lote] || 0),
            0,
          );

          return (
            <Paper
              key={detalle_req.id_requerimiento_almacen_detalle}
              p="lg"
              radius="lg"
              className={`border transition-all overflow-hidden relative shadow-sm hover:shadow-md ${tEntregadoProductoActualBase > 0 ? "bg-indigo-900/10 border-indigo-500/30" : "bg-zinc-900/40 border-zinc-800"}`}
            >
              <div
                className={`absolute top-0 left-0 w-1 h-full ${tEntregadoProductoActualBase > 0 ? "bg-indigo-500" : "bg-zinc-700"}`}
              />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <Group gap="md">
                  <div
                    className={`p-3 rounded-xl border ${tEntregadoProductoActualBase > 0 ? "bg-indigo-500/20 border-indigo-500/20" : "bg-zinc-800/50 border-zinc-700/30"}`}
                  >
                    <CubeIcon
                      className={`w-5 h-5 ${tEntregadoProductoActualBase > 0 ? "text-indigo-400" : "text-zinc-400"}`}
                    />
                  </div>
                  <div>
                    <Text
                      size="md"
                      fw={900}
                      className="text-white leading-tight mb-1"
                    >
                      {detalle_req.producto}
                    </Text>
                    <Group gap="xs">
                      <Text size="sm" fw={800} c="zinc.3">
                        {Number(detalle_req.cantidad_solicitada).toFixed(2)}{" "}
                        {detalle_req.unidad_medida_base_abv}
                      </Text>
                      {detalle_req.unidad_medida_abv !==
                        detalle_req.unidad_medida_base_abv && (
                        <Text
                          size="10px"
                          c="zinc.5"
                          fw={700}
                          className="italic"
                        >
                          (Eqv:{" "}
                          {Number(detalle_req.cantidad_solicitada_base).toFixed(
                            2,
                          )}{" "}
                          {detalle_req.unidad_medida_base_abv})
                        </Text>
                      )}
                      <Text size="10px" c="zinc.5" fw={700} className="italic">
                        (Stock minimo:{" "}
                        {Number(detalle_req.stock_minimo).toFixed(2)}{" "}
                        {detalle_req.unidad_medida_base_abv})
                      </Text>
                    </Group>
                  </div>
                </Group>

                <div className="flex gap-2">
                  <div className="text-right px-4 py-1.5 bg-pink-500/5 rounded-xl border border-pink-500/10">
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
                        size="md"
                        fw={900}
                        className="text-pink-500 font-mono leading-none"
                      >
                        {pendienteBase.toFixed(2)}
                      </Text>
                      <Text
                        size="9px"
                        fw={800}
                        c="zinc.5"
                        className="uppercase"
                      >
                        {detalle_req.unidad_medida_base_abv}
                      </Text>
                    </Group>
                  </div>
                  <div
                    className={`text-right px-4 py-1.5 rounded-xl border ${tEntregadoProductoActualBase > 0 ? "bg-indigo-500/10 border-indigo-500/30" : "bg-zinc-800/20 border-zinc-800"}`}
                  >
                    <Text
                      size="9px"
                      c={
                        tEntregadoProductoActualBase > 0 ? "indigo.3" : "zinc.5"
                      }
                      fw={900}
                      className="uppercase tracking-widest mb-1"
                    >
                      A Entregar
                    </Text>
                    <Group gap={4} justify="flex-end" align="baseline">
                      <Text
                        size="md"
                        fw={900}
                        className={`font-mono leading-none ${tEntregadoProductoActualBase > 0 ? "text-indigo-400" : "text-zinc-500"}`}
                      >
                        {tEntregadoProductoActualBase.toFixed(2)}
                      </Text>
                      <Text
                        size="9px"
                        fw={800}
                        c="zinc.5"
                        className="uppercase"
                      >
                        {detalle_req.unidad_medida_base_abv}
                      </Text>
                    </Group>
                  </div>
                </div>
              </div>

              {/* Lotes Table */}
              <div className="overflow-hidden border border-zinc-800/50 rounded-xl bg-zinc-950/40">
                <Table
                  verticalSpacing="sm"
                  horizontalSpacing="md"
                  className="border-collapse"
                >
                  <thead className="bg-zinc-900/60 text-zinc-400 text-xs font-bold border-b border-zinc-800/50">
                    <tr>
                      <th className="py-3 pl-6" style={{ width: "25%" }}>
                        Lote
                      </th>
                      <th className="" style={{ width: "20%" }}>
                        Vencimiento
                      </th>
                      <th className="" style={{ width: "25%" }}>
                        Stock Disponible
                      </th>
                      <th className="pr-6 text-right" style={{ width: "30%" }}>
                        Cant. a Despachar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {lotes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 text-center text-zinc-600 italic text-xs"
                        >
                          No hay lotes con stock disponible para este producto.
                        </td>
                      </tr>
                    ) : (
                      lotes.map((lote) => {
                        const cant = entregaCantidades[lote.id_lote] || 0;
                        const esCritico =
                          lote.dias_para_vencer !== null &&
                          lote.dias_para_vencer <= 5;
                        const esVencido =
                          lote.dias_para_vencer !== null &&
                          lote.dias_para_vencer < 0;

                        return (
                          <tr
                            key={lote.id_lote}
                            className={`${cant > 0 ? "bg-indigo-950/20" : "hover:bg-zinc-900/30"} transition-all`}
                          >
                            <td className="py-3 pl-6 text-center">
                              <Badge
                                variant="light"
                                color={cant > 0 ? "indigo" : "violet"}
                                radius="sm"
                                size="sm"
                                className="font-black"
                              >
                                {lote.correlativo}
                              </Badge>
                            </td>
                            <td className="text-center">
                              {lote.fecha_vencimiento ? (
                                <div className="flex flex-col gap-0.5">
                                  <Text
                                    size="10px"
                                    fw={800}
                                    className="text-zinc-300"
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
                                    className="px-0 font-bold scale-90 origin-left"
                                  >
                                    {esVencido
                                      ? "Vencido"
                                      : `${lote.dias_para_vencer} d.`}
                                  </Badge>
                                </div>
                              ) : (
                                <Text
                                  size="10px"
                                  fw={700}
                                  c="zinc.7"
                                  className="italic"
                                >
                                  No aplica
                                </Text>
                              )}
                            </td>
                            <td className="text-center flex flex-row gap-2 py-2 justify-center">
                              {lote.unidad_medida_abv !==
                                detalle_req.unidad_medida_base_abv && (
                                <Text
                                  size="sm"
                                  fw={800}
                                  className="text-green-500/80 font-mono"
                                  component="div"
                                >
                                  <div className="flex flex-row items-center justify-center gap-1.5">
                                    <Badge
                                      variant="filled"
                                      color="teal.9"
                                      radius="md"
                                      className="text-white font-bold h-7 px-3 shadow-lg shadow-teal-900/40"
                                    >
                                      {lote.stock_actual}{" "}
                                      {lote.unidad_medida_abv}
                                    </Badge>

                                    <div className="flex items-center gap-1 mt-1 px-1">
                                      {/* Verificamos que las unidades sean distintas antes de renderizar el texto */}

                                      <Text size="10px" c="white" fw={800}>
                                        {lote.contenido_por_presentacion}
                                        {
                                          detalle_req.unidad_medida_base_abv
                                        } x {lote.unidad_medida_abv}
                                      </Text>
                                    </div>
                                  </div>
                                </Text>
                              )}

                              <div className="flex flex-row items-center justify-center gap-1.5">
                                <Badge
                                  variant="light"
                                  color="pink.6"
                                  radius="md"
                                  className="font-bold h-7 px-3 border border-pink-500/20"
                                >
                                  {lote.stock_actual_base}{" "}
                                  {detalle_req.unidad_medida_base_abv}
                                </Badge>
                              </div>
                            </td>
                            <td className="text-center pr-6">
                              <NumberInput
                                size="xs"
                                radius="md"
                                min={0}
                                max={lote.stock_actual_base}
                                value={cant}
                                onChange={(val) =>
                                  handleCantChange(
                                    lote.id_lote,
                                    detalle_req.id_producto,
                                    Number(val),
                                  )
                                }
                                placeholder="0.00"
                                className="w-28 ml-auto"
                                classNames={{
                                  input: `bg-zinc-900 border-zinc-800 focus:border-indigo-500 text-center font-black text-sm h-8 shadow-sm ${cant > 0 ? "text-indigo-400 border-indigo-500/50" : "text-white"}`,
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Paper>
          );
        })}
      </Stack>

      {/* 3. PIE DE FORMULARIO */}
      <Group
        justify="flex-end"
        gap="md"
        className="pt-6 border-t border-zinc-800 mt-2"
      >
        <Button
          variant="subtle"
          radius="lg"
          size="sm"
          onClick={onCancel}
          className="text-zinc-400 hover:text-white px-8 font-bold"
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          radius="lg"
          leftSection={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
          disabled={
            !idEmpleadoRecibe || totalEntregaGeneralBase <= 0 || isProcessing
          }
          loading={isProcessing}
          onClick={handleConfirmar}
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0 px-8"
        >
          Guardar Entrega
        </Button>
      </Group>

      {error && (
        <Text
          c="red"
          size="xs"
          ta="center"
          fw={800}
          className="italic bg-red-950/10 py-3 rounded-2xl border border-red-900/30 font-mono tracking-wide"
        >
          {error}
        </Text>
      )}
    </Stack>
  );
};
