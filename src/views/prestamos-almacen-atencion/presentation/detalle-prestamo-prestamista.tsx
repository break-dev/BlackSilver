import { useEffect } from "react";
import {
  Badge,
  Button,
  Group,
  Loader,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import {
  ArchiveBoxIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import type { RES_PrestamoAtencion } from "../service/prestamos-atencion.responses";
import { useDespacharPrestamo } from "../hooks/useDespacharPrestamo";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import { formatNumber } from "../../../presentation/functions/formatNumber";

interface Props {
  prestamo: RES_PrestamoAtencion;
  idAlmacenPrestamista: number;
  onDespachoRegistrado: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SectionHeader = ({ icon: Icon, title, color = "indigo" }: { icon: any; title: string; color?: string }) => {
  const colors: Record<string, { text: string; line: string }> = {
    indigo:  { text: "text-indigo-400",  line: "from-indigo-500/50" },
    emerald: { text: "text-emerald-400", line: "from-emerald-500/50" },
    amber:   { text: "text-amber-400",   line: "from-amber-500/50" },
  };
  const c = colors[color] ?? colors.indigo;
  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${c.text}`} />
        <Text fw={700} size="sm" c="white" className="uppercase tracking-tight">{title}</Text>
      </div>
      <div className={`h-0.5 w-full bg-gradient-to-r ${c.line} to-transparent rounded-full`} />
    </div>
  );
};

export const DetallePrestamoPrestamista = ({ prestamo, idAlmacenPrestamista, onDespachoRegistrado }: Props) => {
  const {
    detallePrestamo,
    loadingDetalle,
    empleados,
    lotesDisponibles,
    loadingLotes,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    fechaEntrega,
    setFechaEntrega,
    observacion,
    setObservacion,
    seleccionLotes,
    submitting,
    cargarDetallePrestamo,
    cargarLotesProducto,
    seleccionarLote,
    setCantidadDespacho,
    registrarDespacho,
  } = useDespacharPrestamo(idAlmacenPrestamista);

  useEffect(() => {
    cargarDetallePrestamo(prestamo.id_prestamo);
  }, [prestamo.id_prestamo, cargarDetallePrestamo]);

  // Cargar lotes apenas tengamos los detalles
  useEffect(() => {
    if (!detallePrestamo) return;
    detallePrestamo.detalles.forEach((d) => {
      cargarLotesProducto(d.id_producto, d.id_prestamo_detalle);
    });
  }, [detallePrestamo, cargarLotesProducto]);

  if (loadingDetalle) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <Text size="xs" c="dimmed" className="uppercase tracking-widest">
          Cargando detalle del préstamo...
        </Text>
      </div>
    );
  }

  return (
    <Stack gap={24} p="md">
      {/* Cabecera / Resumen del Préstamo */}
      <section>
        <SectionHeader icon={ClipboardDocumentListIcon} title="1. Detalle de la Solicitud de Préstamo" color="indigo" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Código", value: prestamo.correlativo, badge: true },
            { label: "Almacén Solicitante", value: prestamo.almacen_solicitante },
            { label: "Estado", value: prestamo.estado, badge: true },
            { label: "Fecha Solicitud", value: dayjs(prestamo.fecha_hora_prestamo).format("DD/MM/YYYY HH:mm") },
          ].map(({ label, value, badge }) => (
            <Paper key={label} p="sm" radius="lg" className="bg-zinc-900/40 border border-zinc-800/50">
              <Text size="9px" fw={900} c="dimmed" className="uppercase tracking-widest mb-1">{label}</Text>
              {badge ? (
                <Badge variant="light" color="indigo" className="font-mono font-bold">{value}</Badge>
              ) : (
                <Text size="sm" fw={700} c="white">{value}</Text>
              )}
            </Paper>
          ))}
        </div>

        {/* Ítems solicitados */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/20">
          <Table variant="unstyled" className="w-full text-zinc-300">
            <thead className="bg-zinc-900/50 text-zinc-500 text-[10px] uppercase font-black">
              <tr>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-center">Cantidad Solicitada</th>
                <th className="px-4 py-3 text-center">Estado Ítem</th>
                <th className="px-4 py-3 text-left">Comentario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {detallePrestamo?.detalles.map((d) => (
                <tr key={d.id_prestamo_detalle} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <Text size="sm" fw={800} c="white">{d.producto}</Text>
                    <Text size="9px" c="dimmed" className="uppercase">{d.unidad_medida}</Text>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="light" color="amber" size="lg">
                      {formatNumber(d.cantidad_solicitada)} {d.unidad_medida_abv}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="dot" color="blue" size="sm">{d.estado}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Text size="xs" c="dimmed">{d.comentario ?? "—"}</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>

      {/* Historial de Entregas Previas */}
      {(detallePrestamo?.entregas?.length ?? 0) > 0 && (
        <section>
          <SectionHeader icon={TruckIcon} title="Entregas Registradas" color="emerald" />
          <Stack gap="sm">
            {detallePrestamo!.entregas.map((e) => (
              <Paper key={e.id_entrega} p="md" radius="xl" className="bg-zinc-900/30 border border-zinc-800/50">
                <Group justify="space-between" mb="xs">
                  <Group gap="sm">
                    <Badge variant="light" color="emerald" className="font-mono font-bold">{e.correlativo}</Badge>
                    <Text size="xs" c="dimmed">{dayjs(e.fecha_hora_entrega).format("DD/MM/YYYY HH:mm")}</Text>
                  </Group>
                  <Badge variant="dot" size="xs">{e.estado}</Badge>
                </Group>
                <Group gap="xl">
                  <div>
                    <Text size="9px" fw={900} c="dimmed" className="uppercase">Entregó</Text>
                    <Text size="xs" fw={700} c="white">{e.empleado_entrega}</Text>
                  </div>
                  <div>
                    <Text size="9px" fw={900} c="dimmed" className="uppercase">Recibió</Text>
                    <Text size="xs" fw={700} c="white">{e.empleado_recibe}</Text>
                  </div>
                  {e.observacion && (
                    <div>
                      <Text size="9px" fw={900} c="dimmed" className="uppercase">Obs.</Text>
                      <Text size="xs" c="zinc.4">{e.observacion}</Text>
                    </div>
                  )}
                </Group>
              </Paper>
            ))}
          </Stack>
        </section>
      )}

      {/* Sección de Despacho */}
      <section className="animate-in fade-in slide-in-from-top-4 duration-500">
        <SectionHeader icon={ArchiveBoxIcon} title="2. Registrar Despacho" color="amber" />

        {/* Form general (receptor + fecha) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Select
            label="Empleado que Recibe"
            placeholder="Seleccione..."
            leftSection={<UserCircleIcon className="w-4 h-4 text-zinc-400" />}
            data={empleados.map((e) => ({
              value: String(e.id_empleado),
              label: `${e.nombre_completo} - ${e.dni}`,
            }))}
            value={idEmpleadoRecibe}
            onChange={setIdEmpleadoRecibe}
            searchable
            radius="lg"
            classNames={{
              input: "bg-zinc-900/50 border-zinc-800 text-white",
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "text-zinc-300 hover:bg-zinc-800",
              label: "text-zinc-300 mb-1 font-semibold",
            }}
          />
          <CustomDatePicker
            label="Fecha de Entrega"
            value={fechaEntrega}
            onChange={(v) => setFechaEntrega(v as Date | null)}
            radius="lg"
          />
        </div>
        <Textarea
          label="Observación (opcional)"
          placeholder="Anotaciones sobre el despacho..."
          value={observacion}
          onChange={(e) => setObservacion(e.currentTarget.value)}
          radius="lg"
          mb="md"
          classNames={{
            input: "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
            label: "text-zinc-300 mb-1 font-semibold",
          }}
        />

        {/* Tabla de selección de lotes por ítem */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/10">
          <Table variant="unstyled" className="w-full text-zinc-300">
            <thead className="bg-zinc-900/50 text-zinc-500 text-[10px] uppercase font-black">
              <tr>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-center">Solicitado</th>
                <th className="px-4 py-3 text-center min-w-[200px]">
                  <div className="flex items-center justify-center gap-1">
                    <CalendarDaysIcon className="w-3 h-3" />
                    Lote a Despachar
                  </div>
                </th>
                <th className="px-4 py-3 text-center">Cantidad a Entregar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {detallePrestamo?.detalles.map((d) => {
                const lotes = lotesDisponibles[d.id_prestamo_detalle] ?? [];
                const loadingEste = loadingLotes[d.id_prestamo_detalle] ?? false;
                const seleccion = seleccionLotes[d.id_prestamo_detalle];

                return (
                  <tr key={d.id_prestamo_detalle} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <Text size="sm" fw={800} c="white">{d.producto}</Text>
                      <Text size="9px" c="dimmed" className="uppercase">{d.unidad_medida}</Text>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="light" color="amber">
                        {formatNumber(d.cantidad_solicitada)} {d.unidad_medida_abv}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {loadingEste ? (
                        <div className="flex justify-center">
                          <Loader size="sm" type="dots" color="indigo" />
                        </div>
                      ) : lotes.length === 0 ? (
                        <Text size="xs" c="red">Sin stock disponible</Text>
                      ) : (
                        <Select
                          placeholder="Elija un lote..."
                          data={lotes.map((l) => ({
                            value: String(l.id_lote),
                            label: `${l.correlativo} — Stock: ${formatNumber(l.stock_actual)} ${d.unidad_medida_abv}`,
                          }))}
                          value={seleccion ? String(seleccion.id_lote_salida) : null}
                          onChange={(val) => {
                            if (!val) return;
                            const lote = lotes.find((l) => l.id_lote === Number(val));
                            if (lote) {
                              seleccionarLote(
                                d.id_prestamo_detalle,
                                lote.id_lote,
                                d.cantidad_solicitada,
                                d.contenido_por_presentacion
                              );
                            }
                          }}
                          radius="lg"
                          size="xs"
                          classNames={{
                            input: "bg-zinc-900/50 border-zinc-800 text-white",
                            dropdown: "bg-zinc-900 border-zinc-800",
                            option: "text-zinc-300 hover:bg-zinc-800 text-xs",
                          }}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Tooltip
                        label={seleccion ? undefined : "Primero seleccione un lote"}
                        withArrow
                        disabled={!!seleccion}
                      >
                        <div className="flex items-center gap-1 justify-center px-2 py-1 rounded-lg border border-zinc-700 bg-zinc-950/40 w-fit mx-auto">
                          <NumberInput
                            variant="unstyled"
                            value={seleccion?.cantidad ?? ""}
                            onChange={(val) =>
                              setCantidadDespacho(
                                d.id_prestamo_detalle,
                                Number(val),
                                d.contenido_por_presentacion
                              )
                            }
                            min={0}
                            max={
                              seleccion
                                ? (lotesDisponibles[d.id_prestamo_detalle]?.find(
                                    (l) => l.id_lote === seleccion.id_lote_salida
                                  )?.stock_actual ?? 9999)
                                : 0
                            }
                            disabled={!seleccion}
                            hideControls
                            size="xs"
                            placeholder="0"
                            classNames={{
                              input: "w-[50px] text-center text-xs font-black bg-transparent text-emerald-400",
                            }}
                          />
                          <Text size="9px" fw={900} c="dimmed" className="uppercase">{d.unidad_medida_abv}</Text>
                        </div>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </section>

      {/* Botón de despacho */}
      <Group justify="flex-end" mt="xl">
        <Button
          onClick={() => registrarDespacho(prestamo.id_prestamo, onDespachoRegistrado)}
          loading={submitting}
          disabled={Object.keys(seleccionLotes).length === 0 || !idEmpleadoRecibe}
          radius="xl"
          size="md"
          leftSection={<CheckCircleIcon className="w-5 h-5" />}
          className="bg-zinc-100 text-zinc-900 font-black hover:bg-white px-10 shadow-indigo-500/20 shadow-xl transition-all active:scale-95"
        >
          Registrar Despacho
        </Button>
      </Group>
    </Stack>
  );
};
