import {
  Button,
  Group,
  Stack,
  Table,
  Text,
  TextInput,
  Badge,
  Checkbox,
  NumberInput,
  Tooltip,
  Paper,
  ActionIcon,
  SimpleGrid,
} from "@mantine/core";
import {
  BuildingOffice2Icon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  EyeIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useRegistrarPrestamo, type AlmacenAliado } from "../hooks/useRegistrarPrestamo";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import type {
  RES_DetalleSolicitud,
  RES_SolicitudReabastecimiento,
  RES_Prestamo
} from "../service/solicitudes-atencion.responses";
import { EstadoSolicitudDetalle } from "../../../shared/enums/estados";
import { formatNumber } from "../../../presentation/functions/formatNumber";
import { useEffect } from "react";

interface RegistrarPrestamoAlmacenProps {
  solicitud: RES_SolicitudReabastecimiento;
  detalles: RES_DetalleSolicitud[];
  onSuccess: (nuevoPrestamo: RES_Prestamo) => void;
  onCancel: () => void;
}

const inputClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
  dropdown: "bg-zinc-900 border-zinc-800 shadow-2xl ",
  option:
    "hover:bg-zinc-800 text-zinc-300 rounded-md my-1",
  label: "text-zinc-300 mb-1.5 font-semibold tracking-tight",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SectionHeader = ({ icon: Icon, title, color = "amber" }: { icon: any; title: string, color?: string }) => {
  const colors: Record<string, { text: string; line: string }> = {
    amber: { text: "text-amber-500", line: "from-amber-500/50" },
    indigo: { text: "text-indigo-500", line: "from-indigo-500/50" },
    emerald: { text: "text-emerald-500", line: "from-emerald-500/50" },
    teal: { text: "text-teal-500", line: "from-teal-500/50" },
  };

  const activeColor = colors[color as keyof typeof colors] || colors.amber;

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${activeColor.text}`} />
        <Text fw={700} size="sm" c="white" className="tracking-tight uppercase">
          {title}
        </Text>
      </div>
      <div className={`h-0.5 w-full bg-gradient-to-r ${activeColor.line} to-transparent rounded-full`} />
    </div>
  );
};

export const RegistrarPrestamoAlmacen = ({
  solicitud,
  detalles,
  onSuccess,
  onCancel,
}: RegistrarPrestamoAlmacenProps) => {
  const {
    state: {
      submitting,
      idAlmacenPrestamista,
      fechaLimiteDevolucion,
      selectedItemIds,
      cantidades,
      comentarios,
      almacenesAliados,
      loadingAlmacenes,
      stocksAlmacen
    },
    actions: {
      setIdAlmacenPrestamista,
      setFechaLimiteDevolucion,
      toggleSelection,
      setCantidad,
      setComentario,
      handleRegistrar,
      cargarStockPrestamista
    },
  } = useRegistrarPrestamo({ solicitud, detalles, onSuccess });

  useEffect(() => {
    if (idAlmacenPrestamista) {
      cargarStockPrestamista(parseInt(idAlmacenPrestamista));
    }
  }, [idAlmacenPrestamista, selectedItemIds.length, cargarStockPrestamista]);

  return (
    <Stack gap={24} p="md">
      <section>
        <SectionHeader icon={ArchiveBoxIcon} title="1. Seleccione los ítems a pedir prestados" color="amber" />
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/20">
          <Table variant="unstyled" className="w-full text-zinc-300">
            <thead className="bg-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 text-center w-12">Seleccionar</th>
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="px-4 py-2 text-center">Necesario (Total)</th>
                <th className="px-4 py-2 text-center">Pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {detalles
                .filter((item) => {
                  const pendiente =
                    Number(item.cantidad_solicitada) -
                    Number(item.cantidad_entregada || 0) -
                    Number(item.cantidad_prestada_total || 0);

                  return (
                    item.estado !== EstadoSolicitudDetalle.Rechazado &&
                    item.estado !== EstadoSolicitudDetalle.Completado &&
                    item.estado !== EstadoSolicitudDetalle.Cerrado &&
                    pendiente > 0
                  );
                })
                .map((item) => {
                  const isSelected = selectedItemIds.includes(
                    item.id_solicitud_detalle,
                  );
                  const pendiente =
                    Number(item.cantidad_solicitada) -
                    Number(item.cantidad_entregada || 0) -
                    Number(item.cantidad_prestada_total || 0);

                  return (
                    <tr key={item.id_solicitud_detalle} className={`${isSelected ? "bg-amber-500/5" : "opacity-50"} transition-all`}>
                      <td className="px-4 py-2 text-center">
                        <Checkbox
                          size="xs"
                          checked={isSelected}
                          onChange={() => toggleSelection(item.id_solicitud_detalle)}
                          color="amber"
                        />
                      </td>
                      <td className="px-4 py-2 font-semibold text-sm">
                        {item.producto}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Text size="xs" c="dimmed">
                          {formatNumber(item.cantidad_solicitada)} {item.unidad_medida_sol_abv}
                        </Text>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant="light" color={pendiente > 0 ? "amber" : "gray"} size="sm">
                          {formatNumber(Math.max(0, pendiente))} {item.unidad_medida_sol_abv}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </div>
      </section>

      {selectedItemIds.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <SectionHeader icon={BuildingOffice2Icon} title="2. Almacenes con Disponibilidad" color="indigo" />
          {loadingAlmacenes ? (
            <Text size="xs" c="dimmed" fs="italic">Buscando almacenes que puedan ayudarte...</Text>
          ) : almacenesAliados.length > 0 ? (
            <Stack gap="md">
              <div className="flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl mb-1">
                <InformationCircleIcon className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <Text size="xs" c="indigo.4" className="leading-relaxed">
                  Solo se muestran almacenes que cuentan con disponibilidad para <b>todos</b> los productos que has seleccionado arriba. Esto asegura que el préstamo se realice de forma íntegra.
                </Text>
              </div>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
                {almacenesAliados.map((aliado: AlmacenAliado) => {
                  const isPicked = idAlmacenPrestamista === String(aliado.id_almacen);
                  return (
                    <Paper
                      key={aliado.id_almacen}
                      onClick={() =>
                        setIdAlmacenPrestamista((prev) =>
                          prev === String(aliado.id_almacen)
                            ? null
                            : String(aliado.id_almacen)
                        )
                      }
                      p="md"
                      radius="lg"
                      className={`cursor-pointer border-2 transition-all group relative
                        ${isPicked
                          ? "bg-indigo-500/20 border-indigo-400 shadow-md shadow-indigo-500/10"
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                        }
                      `}
                    >
                      <Group justify="space-between" wrap="nowrap" align="center">
                        <Group gap="sm" wrap="nowrap" className="min-w-0 flex-1">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${isPicked
                              ? "bg-indigo-400 text-zinc-950"
                              : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-200"
                              }`}
                          >
                            <BuildingOffice2Icon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <Text
                              size="sm"
                              fw={800}
                              truncate="end"
                              className="tracking-tight text-white m-0"
                            >
                              {aliado.nombre_almacen}
                            </Text>
                          </div>
                        </Group>

                        <Group gap={6} wrap="nowrap" className="shrink-0 flex-none">
                          <Tooltip
                            label="Ver Lotes"
                            withArrow
                            position="top"
                          >
                            <ActionIcon
                              variant="subtle"
                              color="indigo"
                              radius="md"
                              size="md"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `/logistica/inventario/lotes?idAlmacen=${aliado.id_almacen}`,
                                  "_blank"
                                );
                              }}
                              className="hover:bg-indigo-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </ActionIcon>
                          </Tooltip>
                          {isPicked && (
                            <CheckCircleIcon className="w-6 h-6 text-indigo-400" />
                          )}
                        </Group>
                      </Group>
                    </Paper>
                  );
                })}
              </SimpleGrid>
            </Stack>
          ) : (
            <Text size="xs" c="red" fw={700}>Ningún otro almacén tiene stock de lo solicitado.</Text>
          )}
        </section>
      )}

      {idAlmacenPrestamista && selectedItemIds.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <SectionHeader icon={ClipboardDocumentListIcon} title="3. Configurar Cantidades para el Préstamo" color="emerald" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CustomDatePicker
              label="Fecha Límite de Devolución"
              value={fechaLimiteDevolucion}
              onChange={(val) => setFechaLimiteDevolucion(val as Date | null)}
              radius="lg"
              minDate={new Date()}
            />
            <Stack gap={2}>
              <Text size="xs" fw={700} c="zinc.5" className="uppercase tracking-widest">Almacen Prestamista:</Text>
              <Text size="lg" fw={900} variant="gradient" gradient={{ from: 'indigo.4', to: 'indigo.6' }}>
                {almacenesAliados.find(a => String(a.id_almacen) === idAlmacenPrestamista)?.nombre_almacen}
              </Text>
            </Stack>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 shadow-sm bg-zinc-950/10">
            <Table variant="unstyled" className="w-full text-zinc-300">
              <thead className="bg-zinc-900/50 text-zinc-500 text-[10px] uppercase font-black font-mono">
                <tr>
                  <th className="px-4 py-3 text-left min-w-[150px]">Producto</th>
                  <th className="px-4 py-3 text-center min-w-[200px]">Cantidad a Pedir</th>
                  <th className="px-4 py-3 text-center">Disponible</th>
                  <th className="px-4 py-3 text-left font-semibold min-w-[220px]">Comentario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 bg-zinc-900/40">
                {detalles.filter(d => selectedItemIds.includes(d.id_solicitud_detalle)).map(item => {
                  const stockExterno = stocksAlmacen[item.id_solicitud_detalle];
                  const totalStockExternoBase = stockExterno?.reduce((acc, curr) => acc + Number(curr.stock_actual_base), 0) || 0;
                  const totalStockExterno = totalStockExternoBase / (item.contenido_por_presentacion || 1);

                  return (
                    <tr key={item.id_solicitud_detalle} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <Text size="sm" fw={800} c="white">{item.producto}</Text>
                        <Text size="9px" c="dimmed" className="uppercase font-bold">Solicitado: {formatNumber(item.cantidad_solicitada)} {item.unidad_medida_sol_abv}</Text>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {/* Estilo inspirado en Nuevo Requerimiento */}
                        <div className="flex flex-col items-center gap-1">
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border bg-zinc-950/40 w-fit mx-auto transition-all 
                            ${(cantidades[item.id_solicitud_detalle] || 0) > (Number(item.cantidad_solicitada) - Number(item.cantidad_entregada || 0) - Number(item.cantidad_prestada_total || 0))
                              ? "border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.1)]"
                              : "border-zinc-800 focus-within:border-emerald-500"
                            }`}
                          >
                            <NumberInput
                              variant="unstyled"
                              value={cantidades[item.id_solicitud_detalle] || ""}
                              onChange={(val) => setCantidad(item.id_solicitud_detalle, Number(val))}
                              size="xs"
                              hideControls
                              placeholder="0"
                              classNames={{
                                input: `w-fit min-w-[30px] max-w-[70px] text-center font-black text-xs h-5 bg-transparent 
                                  ${(cantidades[item.id_solicitud_detalle] || 0) > (Number(item.cantidad_solicitada) - Number(item.cantidad_entregada || 0) - Number(item.cantidad_prestada_total || 0))
                                    ? "text-orange-400"
                                    : "text-emerald-400"
                                  }`
                              }}
                            />
                            <Text size="9px" fw={900} className="uppercase whitespace-nowrap text-zinc-500 font-mono tracking-tighter">
                              {item.unidad_medida_sol_abv}
                            </Text>
                          </div>

                          {/* Alerta de exceso de pendiente */}
                          {(cantidades[item.id_solicitud_detalle] || 0) > (Number(item.cantidad_solicitada) - Number(item.cantidad_entregada || 0) - Number(item.cantidad_prestada_total || 0)) && (
                            <Tooltip label="Esta cantidad excede lo pendiente de la solicitud original" withArrow position="bottom">
                              <div className="flex items-center gap-1 text-[9px] text-orange-400 font-bold uppercase animate-pulse">
                                <ExclamationTriangleIcon className="w-3 h-3" />
                                Exceso detectado
                              </div>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge color={totalStockExterno > 0 ? "indigo" : "red"} variant="light" size="lg">
                          {formatNumber(totalStockExterno)} {item.unidad_medida_sol_abv}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <TextInput
                          placeholder="Nota opcional..."
                          size="xs"
                          radius="md"
                          value={comentarios[item.id_solicitud_detalle] || ""}
                          onChange={(e) => setComentario(item.id_solicitud_detalle, e.target.value)}
                          classNames={inputClasses}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </section>
      )}

      <Group justify="flex-end" mt="xl">
        <Button variant="subtle" onClick={onCancel} radius="lg" className="text-zinc-500 hover:text-white">
          Cancelar
        </Button>
        <Button
          onClick={handleRegistrar}
          loading={submitting}
          disabled={!idAlmacenPrestamista || selectedItemIds.length === 0}
          radius="xl"
          size="md"
          className="bg-zinc-100 text-zinc-900 font-black hover:bg-white px-10 shadow-indigo-500/20 shadow-xl transition-all active:scale-95"
        >
          Generar Pedido de Préstamo
        </Button>
      </Group>
    </Stack>
  );
};
