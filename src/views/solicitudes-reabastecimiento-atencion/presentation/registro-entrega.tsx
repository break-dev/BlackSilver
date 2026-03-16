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
  MapPinIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useRegistroEntrega } from "../hooks/useRegistroEntrega";
import type { RES_DetalleSolicitud } from "../service/solicitudes-atencion.responses";
import { formatNumber } from "../../../presentation/functions/formatNumber";

interface RegistroEntregaProps {
  idSolicitud: number;
  selectedDetalles: RES_DetalleSolicitud[];
  onSuccess: () => void;
}

export const RegistroEntrega = ({
  idSolicitud,
  selectedDetalles: baseDetalles,
  onSuccess,
}: RegistroEntregaProps) => {
  const {
    loadingInitial,
    loadingLotes,
    almacenesPrincipales,
    empleados,
    lotesPorProducto,
    idAlmacenEntrega,
    setIdAlmacenEntrega,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    observacion,
    setObservacion,
    entregaCantidades,
    handleCantChange,
    handleConfirmar,
    isProcessing,
    errorLocal,
    selectedDetalles,
  } = useRegistroEntrega({
    idSolicitud,
    selectedDetalles: baseDetalles,
    onSuccess,
  });

  if (loadingInitial) {
    return (
      <div className="flex justify-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  return (
    <Stack gap="lg" className="font-sans">
      <Paper
        p="md"
        radius="lg"
        className="bg-zinc-900/40 border border-zinc-800 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Almacén de Salida (Principal)"
            placeholder="Seleccione Almacén"
            data={almacenesPrincipales.map((a) => ({
              value: String(a.id),
              label: a.nombre,
            }))}
            value={idAlmacenEntrega}
            onChange={setIdAlmacenEntrega}
            required
            size="sm"
            radius="lg"
            leftSection={<MapPinIcon className="w-4 h-4" />}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white",
              label: "text-zinc-300 mb-1 font-medium text-sm",
            }}
          />
          <Select
            label="¿Quién recibe los materiales?"
            placeholder="Buscar por Nombre"
            data={empleados.map((e) => ({
              value: String(e.id),
              label: e.nombre_completo,
            }))}
            searchable
            required
            value={idEmpleadoRecibe}
            onChange={setIdEmpleadoRecibe}
            size="sm"
            radius="lg"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white",
              label: "text-zinc-300 mb-1 font-medium text-sm",
            }}
          />
          <Textarea
            label="Observación"
            placeholder="Detalles adicionales..."
            value={observacion}
            onChange={(e) => setObservacion(e.currentTarget.value)}
            size="sm"
            radius="lg"
            minRows={1}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white py-2",
              label: "text-zinc-300 mb-1 font-medium text-sm",
            }}
          />
        </div>
      </Paper>

      {loadingLotes ? (
        <div className="flex justify-center py-10">
          <Loader size="sm" />
        </div>
      ) : (
        <Stack gap="xl">
          {selectedDetalles.map((detalle) => {
            const lotes = lotesPorProducto[detalle.id_producto] || [];
            const cantTotalProducto = lotes.reduce(
              (acc, l) => acc + (entregaCantidades[l.id_lote] || 0),
              0,
            );

            return (
              <Paper
                key={detalle.id_solicitud_detalle}
                p="lg"
                radius="lg"
                className={`border transition-all relative overflow-hidden ${cantTotalProducto > 0 ? "bg-indigo-900/10 border-indigo-500/30" : "bg-zinc-900/40 border-zinc-800"}`}
              >
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${cantTotalProducto > 0 ? "bg-indigo-500" : "bg-zinc-700"}`}
                />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <Group gap="md" wrap="nowrap">
                    <div
                      className={`p-3 rounded-xl border ${cantTotalProducto > 0 ? "bg-indigo-500/20" : "bg-zinc-800/50"}`}
                    >
                      <CubeIcon
                        className={`w-5 h-5 ${cantTotalProducto > 0 ? "text-indigo-400" : "text-zinc-400"}`}
                      />
                    </div>
                    <div>
                      <Text
                        size="md"
                        fw={900}
                        className="text-white leading-tight mb-1"
                      >
                        {detalle.producto}
                      </Text>
                      <Group gap="xs">
                        <Text size="sm" fw={800} c="zinc.3">
                          {formatNumber(detalle.cantidad_solicitada)}{" "}
                          {detalle.unidad_medida_sol_abv}
                        </Text>
                        <Text
                          size="10px"
                          c="zinc.5"
                          fw={700}
                          className="italic"
                        >
                          Pendiente: {formatNumber(detalle.pendiente_base)}{" "}
                          {detalle.unidad_medida_base_abv}
                        </Text>
                      </Group>
                    </div>
                  </Group>
                  <div className="flex items-center gap-4">
                    <Stack gap={0} align="flex-end">
                      <Text
                        size="xs"
                        c="indigo.4"
                        fw={800}
                        className="uppercase tracking-widest"
                      >
                        A Entregar
                      </Text>
                      <Text
                        size="lg"
                        fw={900}
                        className={
                          cantTotalProducto > 0
                            ? "text-indigo-400"
                            : "text-zinc-600"
                        }
                      >
                        {formatNumber(cantTotalProducto)}{" "}
                        {detalle.unidad_medida_base_abv}
                      </Text>
                    </Stack>
                  </div>
                </div>

                <div className="overflow-hidden border border-zinc-800/50 rounded-xl bg-zinc-950/40">
                  <Table verticalSpacing="sm" horizontalSpacing="md">
                    <thead className="bg-zinc-900/60 text-zinc-400 text-xs font-bold border-b border-zinc-800/50">
                      <tr>
                        <th className="py-3 pl-6">Lote</th>
                        <th className="text-center">Stock</th>
                        <th className="pr-6 text-right">Cant. a Despachar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                      {lotes.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-6 text-center text-zinc-600 italic text-xs"
                          >
                            No hay lotes disponibles.
                          </td>
                        </tr>
                      ) : (
                        lotes.map((lote) => {
                          const cant = entregaCantidades[lote.id_lote] || 0;
                          return (
                            <tr
                              key={lote.id_lote}
                              className={`${cant > 0 ? "bg-indigo-950/20" : "hover:bg-zinc-900/30"} transition-all`}
                            >
                              <td className="py-3 pl-6">
                                <Stack gap={2}>
                                  <Badge
                                    variant="light"
                                    color={cant > 0 ? "indigo" : "violet"}
                                    radius="sm"
                                    size="sm"
                                  >
                                    {lote.correlativo}
                                  </Badge>
                                  {lote.fecha_vencimiento && (
                                    <Text size="10px" c="dimmed">
                                      Venc:{" "}
                                      {dayjs(lote.fecha_vencimiento).format(
                                        "DD/MM/YYYY",
                                      )}
                                    </Text>
                                  )}
                                </Stack>
                              </td>
                              <td className="text-center">
                                <Stack gap={2} align="center">
                                  <Text
                                    size="sm"
                                    fw={800}
                                    className="text-zinc-200"
                                  >
                                    {formatNumber(lote.stock_actual_base)}{" "}
                                    {detalle.unidad_medida_base_abv}
                                  </Text>
                                  {lote.unidad_medida_abv !==
                                    detalle.unidad_medida_base_abv && (
                                    <Text size="xs" c="dimmed">
                                      {formatNumber(lote.stock_actual)}{" "}
                                      {lote.unidad_medida_abv}
                                    </Text>
                                  )}
                                </Stack>
                              </td>
                              <td className="text-right pr-6">
                                <NumberInput
                                  size="sm"
                                  radius="md"
                                  min={0}
                                  max={lote.stock_actual_base}
                                  placeholder="0"
                                  value={cant || ""}
                                  onChange={(val) =>
                                    handleCantChange(
                                      lote.id_lote,
                                      detalle.id_producto,
                                      Number(val),
                                    )
                                  }
                                  classNames={{
                                    input: `bg-zinc-900 border-zinc-800 focus:border-indigo-500 font-bold text-right ${cant > 0 ? "text-indigo-400 border-indigo-500/50" : "text-white"}`,
                                  }}
                                  rightSection={
                                    <Text size="xs" c="dimmed" mr="xs">
                                      {detalle.unidad_medida_base_abv}
                                    </Text>
                                  }
                                  rightSectionWidth={60}
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
      )}

      {errorLocal && (
        <Text
          c="red"
          size="xs"
          fw={800}
          className="italic bg-red-950/10 py-3 rounded-xl border border-red-900/30 text-center"
        >
          {errorLocal}
        </Text>
      )}

      <Group
        justify="flex-end"
        gap="md"
        className="pt-6 border-t border-zinc-800"
      >
        <Button
          variant="subtle"
          radius="lg"
          size="sm"
          className="text-zinc-400 font-bold"
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          radius="lg"
          leftSection={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
          disabled={!idAlmacenEntrega || !idEmpleadoRecibe || isProcessing}
          loading={isProcessing}
          onClick={handleConfirmar}
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-bold px-8 shadow-lg"
        >
          Guardar Entrega
        </Button>
      </Group>
    </Stack>
  );
};
