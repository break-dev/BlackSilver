import {
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Textarea,
  Tooltip,
  ActionIcon,
  Checkbox,
  Center,
} from "@mantine/core";
import {
  ArchiveBoxIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  UserCircleIcon,
  ClockIcon,
  XCircleIcon,
  BuildingOffice2Icon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import type { RES_PrestamoAtencion } from "../service/prestamos-atencion.responses";
import { useDetallePrestamo } from "../hooks/useDetallePrestamo";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistrarEntregaModal } from "./registro-entrega/registrar-entrega-modal";
import { HistorialEntregasPrestamo } from "./historial-entregas-prestamo";
import { TrazabilidadPrestamo } from "./trazabilidad-prestamo";
import { PrestamoStatusBadge } from "./components/prestamo-status-badge";
import { formatNumber } from "../../../presentation/functions/formatNumber";

interface Props {
  prestamo: RES_PrestamoAtencion;
  idAlmacenPrestamista: number;
  onDespachoRegistrado: () => void;
}

const InfoCardDetalle = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <Paper p="md" radius="lg" className="bg-zinc-900/40 border border-zinc-800/50 relative overflow-hidden group">
    <Icon className="absolute -right-2 -bottom-2 w-16 h-16 text-zinc-400/5 rotate-12 group-hover:scale-110 transition-transform" />
    <Stack gap={2} className="relative z-10 w-full h-full">
      <Group gap={6}>
        <Icon className={`w-4 h-4 text-zinc-500`} />
        <Text size="xs" fw={800} c="zinc.5" className="uppercase tracking-widest">{label}</Text>
      </Group>
      <div className="flex-1 flex items-center">
        <Text size="md" fw={900} c="white" className="leading-tight tracking-tight">{value}</Text>
      </div>
    </Stack>
  </Paper>
);

export const DetallePrestamo = ({ prestamo, idAlmacenPrestamista, onDespachoRegistrado }: Props) => {
  const {
    loading,
    detalles,
    entregas,
    progresoGeneral,
    // Modales
    openedTrace, openTrace, closeTrace,
    openedAprobar, openAprobar, closeAprobar,
    openedRechazo, openRechazo, closeRechazo,
    openedNuevaEntrega, openNuevaEntrega, closeNuevaEntrega,
    openedHistorial, openHistorial, closeHistorial,
    // Selección
    setSelectedItemId,
    selectedItemName, setSelectedItemName,
    comentarioAccion, setComentarioAccion,
    isProcessing,
    trazabilidad,
    loadingTrace,
    obtenerTrazabilidad,
    handleCambiarEstado,
    selectedItemsIds,
    toggleItemSelection,
    cargarDatos
  } = useDetallePrestamo({ idPrestamo: prestamo.id_prestamo, onSuccess: onDespachoRegistrado });

  if (loading) {
    return (
      <Center py={60}>
        <Stack gap="xs" align="center">
          <Loader size="lg" color="indigo" type="dots" />
          <Text size="xs" c="dimmed" className="uppercase tracking-widest animate-pulse font-black">Sincronizando préstamo...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap={24} className="pb-8">
      {/* Resumen Principal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
        <InfoCardDetalle icon={BuildingOffice2Icon} label="Hacia Almacén" value={prestamo.almacen_solicitante} />
        <InfoCardDetalle icon={CheckBadgeIcon} label="Código Préstamo" value={prestamo.correlativo} />
        <InfoCardDetalle icon={UserCircleIcon} label="Responsable Solicitante" value={prestamo.registrado_por} />
        <InfoCardDetalle icon={CalendarDaysIcon} label="Solicitado el" value={dayjs(prestamo.fecha_hora_prestamo).format("DD/MM/YYYY")} />
      </div>

      {/* Progreso General */}
      <Paper p="lg" radius="xl" className="bg-zinc-900/60 border border-zinc-800 mx-2 shadow-2xl backdrop-blur-md">
        <Group justify="space-between" mb={10} px={4}>
          <Group gap={6}>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <Text size="xs" fw={900} className="text-zinc-500 tracking-wider uppercase">Estado de Atención del Préstamo</Text>
          </Group>
          <Text size="sm" fw={900} color="indigo.4" className="tabular-nums italic">{progresoGeneral}%</Text>
        </Group>
        <div className="h-3 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-700/20">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            style={{ width: `${progresoGeneral}%` }}
          />
        </div>
      </Paper>

      {/* Listado de Productos */}
      <div className="space-y-4">
        <Group justify="space-between" px={4} align="center">
          <Group gap="xs">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <Stack gap={0}>
              <Text fw={900} className="text-2xl text-zinc-100 italic tracking-tighter leading-none font-black">Productos Solicitados</Text>
              <Text size="xs" c="dimmed" className="tracking-widest uppercase font-black opacity-50">Gestión de stock y aprobación</Text>
            </Stack>
          </Group>

          <Group gap="sm">
            <Button
              variant="outline"
              color="indigo"
              size="sm"
              radius="xl"
              leftSection={<ClockIcon className="w-4 h-4" />}
              onClick={openHistorial}
              className="bg-zinc-900/50"
            >
              Entregas Realizadas ({entregas.length})
            </Button>
            <Button
              color="indigo"
              size="sm"
              radius="xl"
              leftSection={<TruckIcon className="w-4 h-4" />}
              disabled={selectedItemsIds.length === 0}
              onClick={openNuevaEntrega}
              className="shadow-indigo-500/30 shadow-xl border-indigo-400/50"
            >
              Procesar Despacho ({selectedItemsIds.length})
            </Button>
          </Group>
        </Group>

        <div className="overflow-x-auto border border-zinc-800 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-zinc-950/40 backdrop-blur-2xl">
          <Table verticalSpacing="md" horizontalSpacing="xl">
            <thead className="bg-zinc-900/80 text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-zinc-800/50">
              <tr>
                <th className="px-6 py-5 text-center w-12 opacity-50">#</th>
                <th className="px-4 py-5 text-center w-12">
                  <Tooltip label="Marcar para Despacho" position="top" withArrow>
                    <ArchiveBoxIcon className="w-5 h-5 mx-auto text-zinc-600" />
                  </Tooltip>
                </th>
                <th className="px-6 py-5 text-left">Producto</th>
                <th className="px-6 py-5 text-center">Cant. Solicitada</th>
                <th className="px-6 py-5 text-center w-48">Entregado</th>
                <th className="px-6 py-5 text-center">Estado</th>
                <th className="px-6 py-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {detalles.map((d, idx) => {
                const isApprovedToDispatch = d.estado.toLowerCase().includes("aprobado") || d.estado.toLowerCase().includes("iniciado") || d.estado.toLowerCase().includes("entrega");
                const porcentaje = Math.round((d.cantidad_prestada_base / d.cantidad_solicitada_base) * 100) || 0;

                return (
                  <tr key={idx} className="hover:bg-zinc-900/50 transition-all duration-300 group">
                    <td className="px-6 py-5 text-center text-[10px] font-black text-zinc-700">{idx + 1}</td>
                    <td className="px-4 py-5 text-center">
                      <Checkbox
                        checked={selectedItemsIds.includes(d.id_prestamo_detalle)}
                        onChange={() => toggleItemSelection(d.id_prestamo_detalle)}
                        disabled={!isApprovedToDispatch}
                        color="indigo"
                        size="sm"
                        className="cursor-pointer flex justify-center translate-y-px"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <Stack gap={2}>
                        <Text size="sm" fw={900} className="text-zinc-100 group-hover:text-indigo-400 transition-colors tracking-tight">{d.producto}</Text>
                        <Group gap={4}>
                          <Text size="9px" fw={900} color="dimmed" className="uppercase tracking-[0.1em] opacity-40">{d.unidad_medida}</Text>
                          {d.comentario && <Tooltip label={d.comentario}><ActionIcon size="xs" variant="transparent" color="yellow"><ClockIcon className="w-3 h-3" /></ActionIcon></Tooltip>}
                        </Group>
                      </Stack>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Group gap={4} justify="center">
                        <Badge variant="filled" color="indigo.9" radius="sm" className="font-mono font-black py-3 px-3 shadow-inner">{formatNumber(d.cantidad_solicitada)} {d.unidad_medida_abv}</Badge>
                        {d.unidad_medida_base_abv !== d.unidad_medida_abv && (
                          <Badge variant="dot" color="pink" size="xs" className="font-black italic opacity-70">{formatNumber(d.cantidad_solicitada_base)} {d.unidad_medida_base_abv}</Badge>
                        )}
                      </Group>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Stack gap={4}>
                        <Group justify="space-between" px={2}>
                          <Text size="10px" fw={900} className="text-zinc-500 tabular-nums uppercase">{formatNumber(d.cantidad_prestada)} <span className="text-[8px] opacity-40">{d.unidad_medida_abv}</span></Text>
                          <Text size="10px" fw={900} color="indigo.4" className="italic font-mono">{porcentaje}%</Text>
                        </Group>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                          <div className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)] transition-all duration-700" style={{ width: `${porcentaje}%` }} />
                        </div>
                      </Stack>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <PrestamoStatusBadge estado={d.estado} />
                    </td>
                    <td className="px-6 py-5">
                      <Group gap={8} justify="center">
                        <Tooltip label="Línea de Vida / Seguimiento" withArrow>
                          <ActionIcon
                            variant="subtle"
                            color="zinc"
                            size="lg"
                            className="hover:bg-zinc-800/50"
                            onClick={() => {
                              setSelectedItemId(d.id_prestamo_detalle);
                              setSelectedItemName(d.producto);
                              obtenerTrazabilidad(d.id_prestamo_detalle);
                              openTrace();
                            }}
                          >
                            <ClockIcon className="w-5 h-5" />
                          </ActionIcon>
                        </Tooltip>

                        {d.estado.toLowerCase().includes("pendiente") && (
                          <>
                            <Tooltip label="Dar Vía Libre (Aprobar)" withArrow>
                              <ActionIcon
                                variant="light"
                                color="green"
                                radius="lg"
                                size="lg"
                                onClick={() => {
                                  setSelectedItemId(d.id_prestamo_detalle);
                                  openAprobar();
                                }}
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Impedir Préstamo (Rechazar)" withArrow>
                              <ActionIcon
                                variant="light"
                                color="red"
                                radius="lg"
                                size="lg"
                                onClick={() => {
                                  setSelectedItemId(d.id_prestamo_detalle);
                                  openRechazo();
                                }}
                              >
                                <XCircleIcon className="w-5 h-5" />
                              </ActionIcon>
                            </Tooltip>
                          </>
                        )}
                      </Group>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>

      {/* MODALES TÉCNICOS */}

      {/* Trazabilidad (Línea de vida) */}
      <ModalEstandar opened={openedTrace} close={closeTrace} title="Seguimiento de Producto en Préstamo" size="md">
        <TrazabilidadPrestamo eventos={trazabilidad} loading={loadingTrace} />
      </ModalEstandar>

      {/* Aprobación */}
      <ModalEstandar opened={openedAprobar} close={closeAprobar} title="Aprobar Ítem de Préstamo" size="sm">
        <Stack gap="xl">
          <Paper p="md" radius="lg" className="bg-emerald-500/5 border border-emerald-500/20 text-center">
            <Text size="sm" c="emerald.3" fw={600}>Estás por aprobar el despacho de <span className="font-black text-white">{selectedItemName}</span>. Se podrá proceder con la salida física del producto.</Text>
          </Paper>
          <Textarea
            placeholder="Ej: Autorizado para despacho inmediato..."
            label="Detalle u Observación (Opcional)"
            radius="md"
            value={comentarioAccion}
            onChange={(e) => setComentarioAccion(e.currentTarget.value)}
          />
          <Group justify="end">
            <Button variant="subtle" color="zinc" radius="xl" onClick={closeAprobar}>Cancelar</Button>
            <Button
              color="green"
              radius="xl"
              loading={isProcessing}
              onClick={() => handleCambiarEstado("Aprobado")}
              className="px-8 shadow-green-500/20 shadow-lg"
            >
              Confirmar Aprobación
            </Button>
          </Group>
        </Stack>
      </ModalEstandar>

      {/* Rechazo */}
      <ModalEstandar opened={openedRechazo} close={closeRechazo} title="Rechazar ítem de Préstamo" size="sm">
        <Stack gap="xl">
          <Paper p="md" radius="lg" className="bg-red-500/5 border border-red-500/20 text-center">
            <Text size="sm" c="red.3" fw={600}>¿Por qué no se puede atender el préstamo de <span className="font-black text-white">{selectedItemName}</span>? El motivo es obligatorio.</Text>
          </Paper>
          <Textarea
            placeholder="Motivo detallado del rechazo..."
            label="Motivo o Comentario"
            radius="md"
            value={comentarioAccion}
            onChange={(e) => setComentarioAccion(e.currentTarget.value)}
            required
          />
          <Group justify="end">
            <Button variant="subtle" color="zinc" radius="xl" onClick={closeRechazo}>Volver</Button>
            <Button
              color="red"
              radius="xl"
              disabled={!comentarioAccion.trim()}
              loading={isProcessing}
              onClick={() => handleCambiarEstado("Rechazado")}
              className="px-8 shadow-red-500/20 shadow-lg"
            >
              Confirmar Rechazo
            </Button>
          </Group>
        </Stack>
      </ModalEstandar>

      {/* Registro de Despacho físico */}
      <ModalEstandar
        opened={openedNuevaEntrega}
        close={closeNuevaEntrega}
        title="Registrar Despacho de Materiales (Préstamo)"
        size="80%"
      >
        <RegistrarEntregaModal
          idPrestamo={prestamo.id_prestamo}
          idAlmacenPrestamista={idAlmacenPrestamista}
          selectedItemsIds={selectedItemsIds}
          detallesPrestamo={detalles}
          onSuccess={() => {
            closeNuevaEntrega();
            cargarDatos();
            onDespachoRegistrado();
          }}
          onCancel={closeNuevaEntrega}
        />
      </ModalEstandar>

      {/* Historial de Movimientos (Entregas) */}
      <ModalEstandar opened={openedHistorial} close={closeHistorial} title="Historial Comercial de Despachos" size="70%">
        <HistorialEntregasPrestamo entregas={entregas} />
      </ModalEstandar>
    </Stack>
  );
};
