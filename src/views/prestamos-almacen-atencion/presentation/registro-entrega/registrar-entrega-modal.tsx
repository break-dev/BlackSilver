import { useEffect } from "react";
import {
  Badge,
  Button,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  Paper,
} from "@mantine/core";
import {
  CheckCircleIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  ArchiveBoxIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useRegistroEntrega } from "../../hooks/useRegistroEntrega";
import { CustomDatePicker } from "../../../../presentation/utils/date-picker-input";
import { formatNumber } from "../../../../presentation/functions/formatNumber";
import type { RES_DetallePrestamo } from "../../service/prestamos-atencion.responses";

interface Props {
  idPrestamo: number;
  idAlmacenPrestamista: number;
  selectedItemsIds: number[];
  detallesPrestamo: RES_DetallePrestamo[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const RegistrarEntregaModal = ({ 
  idPrestamo, 
  idAlmacenPrestamista, 
  selectedItemsIds, 
  detallesPrestamo,
  onSuccess, 
  onCancel 
}: Props) => {
  const {
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
  } = useRegistroEntrega(idAlmacenPrestamista);

  const itemsADespachar = detallesPrestamo.filter(d => selectedItemsIds.includes(d.id_prestamo_detalle));

  useEffect(() => {
    cargarDetallePrestamo(idPrestamo);
    if (itemsADespachar.length > 0) {
      itemsADespachar.forEach((d) => {
        cargarLotesProducto(d.id_producto, d.id_prestamo_detalle);
      });
    }
  }, [idPrestamo]);

  const canSubmit = Object.keys(seleccionLotes).length > 0 && idEmpleadoRecibe && !submitting;

  return (
    <Stack gap="xl" className="animate-fade-in">
      {/* Cabecera del Formulario */}
      <Paper p="xl" radius="2xl" className="bg-zinc-900/40 border border-zinc-800/60 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Stack gap="xs">
                <Group gap={6}>
                    <UserCircleIcon className="w-4 h-4 text-indigo-400" />
                    <Text size="xs" fw={900} className="text-zinc-500 uppercase tracking-widest">Responsable que Recibe</Text>
                </Group>
                <Select
                    placeholder="Busque un empleado..."
                    data={empleados.map((e) => ({
                        value: String(e.id_empleado),
                        label: `${e.nombre_completo} - ${e.dni}`,
                    }))}
                    value={idEmpleadoRecibe}
                    onChange={setIdEmpleadoRecibe}
                    searchable
                    radius="md"
                    size="md"
                />
            </Stack>

            <Stack gap="xs">
                <Group gap={6}>
                    <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
                    <Text size="xs" fw={900} className="text-zinc-500 uppercase tracking-widest">Fecha y Hora de Salida</Text>
                </Group>
                <CustomDatePicker
                    value={fechaEntrega}
                    onChange={(v) => setFechaEntrega(v as Date | null)}
                    radius="md"
                />
            </Stack>
        </div>

        <Stack gap="xs" mt="xl">
            <Group gap={6}>
                <ClipboardDocumentCheckIcon className="w-4 h-4 text-indigo-400" />
                <Text size="xs" fw={900} className="text-zinc-500 uppercase tracking-widest">Observaciones del Despacho</Text>
            </Group>
            <Textarea
                placeholder="Indique detalles sobre el transporte, guía de remisión u otros..."
                value={observacion}
                onChange={(e) => setObservacion(e.currentTarget.value)}
                radius="md"
                minRows={2}
            />
        </Stack>
      </Paper>

      {/* Listado de Ítems a Despachar */}
      <div className="space-y-4">
        <Group gap="xs" px="md">
            <ArchiveBoxIcon className="w-5 h-5 text-indigo-400" />
            <Text fw={900} className="text-lg text-zinc-100 italic tracking-tight uppercase">Confirmación de Cantidades y Lotes</Text>
        </Group>

        <div className="overflow-x-auto rounded-[1.5rem] border border-zinc-800/80 bg-zinc-950/40 shadow-2xl backdrop-blur-xl">
          <Table verticalSpacing="lg" horizontalSpacing="xl">
            <thead className="bg-zinc-900/90 text-zinc-500 text-[10px] uppercase font-black tracking-widest border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left">Producto en Préstamo</th>
                <th className="px-6 py-4 text-center">Saldo Pendiente</th>
                <th className="px-6 py-4 text-center min-w-[250px]">Lote / Stock Disponible</th>
                <th className="px-6 py-4 text-center">Cant. a Despachar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {itemsADespachar.map((d) => {
                const lotes = lotesDisponibles[d.id_prestamo_detalle] || [];
                const loadingEste = loadingLotes[d.id_prestamo_detalle] || false;
                const seleccion = seleccionLotes[d.id_prestamo_detalle];
                const pendienteBase = d.cantidad_solicitada_base - d.cantidad_prestada_base;
                const ratioItem = d.contenido_por_presentacion || 1;

                return (
                  <tr key={d.id_prestamo_detalle} className="hover:bg-zinc-900/30 transition-all group">
                    <td className="px-6 py-4">
                      <Stack gap={2}>
                        <Text size="sm" fw={900} c="white" className="group-hover:text-indigo-400 transition-colors">{d.producto}</Text>
                        <Text size="9px" fw={900} color="dimmed" className="uppercase tracking-[0.15em] opacity-40">{d.unidad_medida}</Text>
                      </Stack>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="light" color="amber" radius="sm" size="lg" className="font-mono font-black">
                        {formatNumber(pendienteBase / ratioItem)} {d.unidad_medida_abv}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {loadingEste ? (
                        <Group justify="center" gap="xs">
                            <Loader size="xs" type="dots" color="indigo" />
                            <Text size="xs" c="indigo.4" fw={800} className="uppercase italic tracking-widest">Consultando bodega...</Text>
                        </Group>
                      ) : lotes.length === 0 ? (
                        <Badge variant="filled" color="red.9" radius="sm" className="font-black uppercase tracking-widest px-4 border border-red-500/20 shadow-red-500/5 shadow-lg">Sin Stock Físico</Badge>
                      ) : (
                        <Select
                          placeholder="Seleccione un lote con stock..."
                          data={lotes.map((l) => ({
                            value: String(l.id_lote),
                            label: `${l.correlativo} — Disp: ${formatNumber(l.stock_actual_base / ratioItem)} ${d.unidad_medida_abv}`,
                          }))}
                          value={seleccion ? String(seleccion.id_lote_salida) : null}
                          onChange={(val) => {
                            if (!val) return;
                            const lote = lotes.find((l) => l.id_lote === Number(val));
                            if (lote) {
                                // Sugerimos el saldo pendiente completo
                                const cantSugerida = pendienteBase / ratioItem;
                                seleccionarLote(
                                    d.id_prestamo_detalle,
                                    lote.id_lote,
                                    cantSugerida,
                                    lote.contenido_por_presentacion
                                );
                            }
                          }}
                          radius="md"
                          size="sm"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <NumberInput
                        variant="unstyled"
                        value={seleccion?.cantidad_lote ?? ""}
                        onChange={(val) => {
                            const lote = lotes.find(l => l.id_lote === seleccion?.id_lote_salida);
                            if (lote) {
                                setCantidadDespacho(
                                    d.id_prestamo_detalle,
                                    Number(val),
                                    lote.contenido_por_presentacion
                                );
                            }
                        }}
                        placeholder="0.00"
                        min={0.01}
                        decimalScale={3}
                        hideControls
                        size="md"
                        className="w-28 mx-auto"
                        classNames={{ input: "text-center text-md font-black bg-zinc-900/80 text-emerald-400 rounded-xl border border-zinc-800 focus:border-emerald-500/50 transition-all placeholder:text-zinc-800" }}
                      />
                      {seleccion && (
                          <Text size="9px" fw={900} c="dimmed" mt={4} className="uppercase tracking-widest opacity-40">
                              Equiv: {formatNumber(seleccion.cantidad_base)} {d.unidad_medida_base_abv}
                          </Text>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Botones de Acción */}
      <Group justify="end" gap="md" mt="xl">
        <Button variant="subtle" color="zinc" radius="xl" size="md" className="font-black italic px-8 hover:bg-zinc-900" onClick={onCancel}>
            Descartar
        </Button>
        <Button
          onClick={() => registrarDespacho(idPrestamo, onSuccess)}
          loading={submitting}
          disabled={!canSubmit}
          radius="xl"
          size="md"
          leftSection={<CheckCircleIcon className="w-6 h-6" />}
          className="bg-zinc-100 text-zinc-900 font-black hover:bg-white px-12 shadow-[0_15px_30px_-5px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02]"
        >
          Confirmar Despacho Físico
        </Button>
      </Group>
    </Stack>
  );
};
