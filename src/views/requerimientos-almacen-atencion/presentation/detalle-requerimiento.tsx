import {
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  ActionIcon,
  Tooltip,
  Button,
  Textarea,
} from "@mantine/core";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

import { EstadoDetalleRequerimiento } from "../../../shared/enums/estados";
import { ReqDetalleTrazabilidad } from "./req-detalle-trazabilidad";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistrarEntrega } from "./registrar-entrega";
import type { RES_DetalleRequerimiento } from "../service/atencion.responses";
import { useGestionAtencion } from "../hooks/useGestionAtencion";

import type { RES_RequerimientoAlmacen } from "../service/atencion.responses";

interface GestionAtencionProps {
  requerimiento: RES_RequerimientoAlmacen;
  almacenNombre: string;
  idAlmacen: number;
  onSuccess: () => void;
}

export const DetalleRequerimiento = ({
  requerimiento,
  almacenNombre,
  idAlmacen,
  onSuccess,
}: GestionAtencionProps) => {
  const {
    loading,
    detalle,
    eventos,
    loadingTrazabilidad,
    openedTrace, openTrace, closeTrace,
    openedEntrega, openEntrega, closeEntrega,
    openedRechazo, openRechazo, closeRechazo,
    selectedItemId, setSelectedItemId,
    selectedItemName, setSelectedItemName,
    selectedItemSolicitado, setSelectedItemSolicitado,
    selectedItemAtendido, setSelectedItemAtendido,
    rechazoMotivo, setRechazoMotivo,
    isProcessing,
    progresoGeneral,
    handleAprobar,
    handleRechazar,
    getStatusColor,
    loadData
  } = useGestionAtencion({ idRequerimiento: requerimiento.id_requerimiento, onSuccess });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  if (!detalle) return null;

  return (
    <Stack gap="xl" className="pb-10">
      {/* Header: Datos Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        <HeaderCard 
          icon={UserIcon} 
          label="Solicitante" 
          value={requerimiento.solicitante} 
          color="indigo" 
        />
        <HeaderCard 
          icon={CheckBadgeIcon} 
          label="Cód. Requerimiento" 
          value={requerimiento.correlativo} 
          color="violet" 
        />
        <HeaderCard 
          icon={MapPinIcon} 
          label="Mina Destino" 
          value={requerimiento.mina} 
          color="amber" 
        />
        <HeaderCard 
          icon={BuildingStorefrontIcon} 
          label="Almacén" 
          value={almacenNombre} 
          color="emerald" 
        />
      </div>

      {/* Sub-header: Estados, Fechas */}
      <Paper p="md" radius="lg" className="bg-transparent border border-zinc-800/50 mx-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoItem label="Prioridad" value={requerimiento.premura} color="orange" />
          <InfoItem label="Estado" value={requerimiento.estado} color="green" />
          <InfoItem 
            label="Fecha Requerida" 
            value={requerimiento.fecha_entrega_requerida ? dayjs(requerimiento.fecha_entrega_requerida).format("DD/MM/YYYY") : "No especificada"} 
            icon={CalendarDaysIcon} 
            iconColor="text-rose-400" 
          />
          <InfoItem 
            label="Fecha de Registro" 
            value={dayjs(requerimiento.created_at).format("DD/MM/YYYY HH:mm")} 
            icon={ClockIcon} 
            isMono 
          />
        </div>
      </Paper>

      {/* Barra de Progreso */}
      <Paper p="md" radius="xl" className="bg-zinc-900/50 border border-zinc-800">
        <Group justify="space-between" mb={8} px={4}>
          <Text size="xs" fw={800} className="text-zinc-400 tracking-tighter uppercase">Progreso General de Atención</Text>
          <Text size="sm" fw={900} c="indigo.4">{progresoGeneral}%</Text>
        </Group>
        <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-linear-to-r from-indigo-500 to-indigo-400 transition-all duration-1000"
            style={{ width: `${progresoGeneral}%` }}
          />
        </div>
      </Paper>

      <div className="space-y-4">
        <Group justify="space-between" align="center" px={4}>
          <Group gap="xs">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <TruckIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <Text fw={800} className="text-zinc-100 italic tracking-tight text-lg">Items Solicitados</Text>
          </Group>
          <Badge variant="light" color="indigo" radius="md">
            {detalle.detalles.length} {detalle.detalles.length === 1 ? "Producto" : "Productos"}
          </Badge>
        </Group>

        <div className="overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950/20">
          <Table verticalSpacing="md" horizontalSpacing="xl">
            <thead className="bg-zinc-900/80 text-zinc-400 text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-12">#</th>
                <th className="px-6 py-4 text-left">Producto</th>
                <th className="px-6 py-4 text-right">Cant. Solic.</th>
                <th className="px-6 py-4 text-center w-40">Progreso</th>
                <th className="px-6 py-4 text-center">En Kilos (Base)</th>
                <th className="px-6 py-4 text-left">Comentario</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {detalle.detalles.map((item: RES_DetalleRequerimiento, idx: number) => (
                <tr key={item.id_requerimiento_almacen_detalle} className="hover:bg-zinc-900/40 transition-colors group">
                  <td className="px-6 py-4 text-center text-xs font-mono text-zinc-500">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <Text size="sm" fw={800} className="text-zinc-100 group-hover:text-indigo-400 transition-colors tracking-tight">
                      {item.producto}
                    </Text>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="filled" color="cyan.7" radius="sm" size="sm" className="font-black px-4">
                      {Number(item.cantidad_solicitada || 0).toFixed(2)} {item.unidad_medida}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex justify-between items-center px-1">
                        <Text size="10px" fw={800} c="zinc.5">Atendido: {Number(item.cantidad_entregada || 0).toFixed(2)}</Text>
                        <Text size="10px" fw={900} c="indigo.4">{item.porcentaje_progreso}%</Text>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/30">
                        <div
                          className="h-full bg-linear-to-r from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-700"
                          style={{ width: `${item.porcentaje_progreso}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="filled" color="pink.7" radius="sm" size="sm" className="font-black px-4">
                      {Number(item.cantidad_solicitada_base || 0).toFixed(2)} {item.unidad_medida_base}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="xs" c="zinc.5" className="max-w-[200px] italic leading-tight">
                      {item.comentario || <span className="text-zinc-800/50">Sin observaciones</span>}
                    </Text>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="light" color={getStatusColor(item.estado)} radius="md" size="sm" className="font-bold px-3 py-2.5">
                      {item.estado}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Group gap={8} justify="center" wrap="nowrap">
                      <Tooltip label="Ver Seguimiento" position="top" withArrow>
                        <ActionIcon variant="subtle" color="zinc" onClick={() => {
                          setSelectedItemId(item.id_requerimiento_almacen_detalle);
                          setSelectedItemName(item.producto);
                          openTrace();
                        }}>
                          <ClockIcon className="w-4 h-4" />
                        </ActionIcon>
                      </Tooltip>

                      {item.estado === EstadoDetalleRequerimiento.EsperandoAprobacion.toString() && (
                        <>
                          <Tooltip label="Aprobar" position="top" withArrow>
                            <ActionIcon variant="filled" color="green" onClick={() => handleAprobar(item.id_requerimiento_almacen_detalle)} loading={isProcessing === item.id_requerimiento_almacen_detalle} disabled={isProcessing !== null && isProcessing !== item.id_requerimiento_almacen_detalle}>
                              <CheckCircleIcon className="w-5 h-5 text-white" />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Rechazar" position="top" withArrow>
                            <ActionIcon variant="filled" color="red" onClick={() => {
                              setSelectedItemId(item.id_requerimiento_almacen_detalle);
                              openRechazo();
                            }} disabled={isProcessing !== null}>
                              <XCircleIcon className="w-5 h-5 text-white" />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      )}

                      {(item.estado == EstadoDetalleRequerimiento.Aprobado.toString()) && (
                        <Tooltip label="Ver / Registrar Entrega" position="top" withArrow>
                          <ActionIcon variant="filled" color="indigo" onClick={() => {
                            setSelectedItemId(item.id_requerimiento_almacen_detalle);
                            setSelectedItemName(item.producto);
                            setSelectedItemSolicitado(item.cantidad_solicitada || 0);
                            setSelectedItemAtendido(item.cantidad_entregada || 0);
                            openEntrega();
                          }} className="shadow-lg shadow-indigo-900/20">
                            <TruckIcon className="w-4 h-4 text-white" />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      <ModalEstandar opened={openedTrace} close={closeTrace} title="Seguimiento del requerimiento" size="md">
        {selectedItemId && <ReqDetalleTrazabilidad eventos={eventos} productoNombre={selectedItemName} loading={loadingTrazabilidad} />}
      </ModalEstandar>

      <ModalEstandar opened={openedRechazo} close={closeRechazo} title="Rechazar ítem" size="md">
        <Stack gap="md">
          <Paper p="md" className="bg-red-500/10 border border-red-900/50 rounded-xl flex items-start gap-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mt-1" />
            <Text size="sm" className="text-red-100 italic">Esta acción marcará el producto como rechazado.</Text>
          </Paper>
          <Textarea label="Motivo del rechazo" placeholder="Escriba aquí..." minRows={4} value={rechazoMotivo} onChange={(e) => setRechazoMotivo(e.currentTarget.value)} />
          <Group justify="end">
            <Button variant="subtle" color="zinc" onClick={closeRechazo}>Cancelar</Button>
            <Button color="red" disabled={!rechazoMotivo.trim() || isProcessing !== null} loading={isProcessing !== null} onClick={handleRechazar}>Rechazar</Button>
          </Group>
        </Stack>
      </ModalEstandar>

      <ModalEstandar opened={openedEntrega} close={closeEntrega} title="Registrar Entrega de Material" size="80%">
        {selectedItemId && (
          <RegistrarEntrega
            idRequerimiento={requerimiento.id_requerimiento}
            idRequerimientoDetalle={selectedItemId}
            idProducto={detalle.detalles.find((d) => d.id_requerimiento_almacen_detalle === selectedItemId)?.id_producto || 0}
            idAlmacen={idAlmacen}
            productoNombre={selectedItemName}
            cantidadSolicitada={selectedItemSolicitado}
            cantidadAtendida={selectedItemAtendido}
            onSuccess={() => { closeEntrega(); loadData(true); onSuccess(); }}
            onCancel={closeEntrega}
          />
        )}
      </ModalEstandar>
    </Stack>
  );
};

interface HeaderCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "indigo" | "violet" | "amber" | "emerald";
}

const colorMap: Record<HeaderCardProps["color"], { bg: string; border: string; hover: string; icon: string; text: string; subText: string }> = {
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    hover: "hover:bg-indigo-500/20",
    icon: "text-indigo-400",
    text: "text-indigo-400/20",
    subText: "indigo.3"
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    hover: "hover:bg-violet-500/20",
    icon: "text-violet-400",
    text: "text-violet-400/20",
    subText: "violet.3"
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    hover: "hover:bg-amber-500/20",
    icon: "text-amber-400",
    text: "text-amber-400/20",
    subText: "amber.5"
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    hover: "hover:bg-emerald-500/20",
    icon: "text-emerald-400",
    text: "text-emerald-400/20",
    subText: "emerald.5"
  }
};

const HeaderCard = ({ icon: Icon, label, value, color }: HeaderCardProps) => {
  const styles = colorMap[color];
  return (
    <Paper p="md" radius="lg" className={`${styles.bg} ${styles.border} relative overflow-hidden group ${styles.hover} transition-all`}>
      <Icon className={`absolute -right-2 -bottom-2 w-16 h-16 ${styles.text} rotate-12 group-hover:scale-110 transition-transform`} />
      <Stack gap={2} className="relative z-10">
        <Group gap={6}>
          <Icon className={`w-4 h-4 ${styles.icon}`} />
          <Text size="xs" c={styles.subText} fw={800} className="uppercase tracking-widest">{label}</Text>
        </Group>
        <Text size="md" fw={900} className="text-white tracking-tight">{value}</Text>
      </Stack>
    </Paper>
  );
};

interface InfoItemProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ElementType;
  iconColor?: string; // Tailwind class name
  isMono?: boolean;
}

const InfoItem = ({ label, value, color, icon: Icon, iconColor, isMono }: InfoItemProps) => (
  <Stack gap={4}>
    <div className="flex items-center gap-1.5 font-bold">
      {Icon && <Icon className={`w-3.5 h-3.5 ${iconColor || 'text-zinc-500'}`} />}
      <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">{label}</Text>
    </div>
    {color ? (
      <Badge color={color} variant="light" size="sm" radius="sm" className="font-bold">{value}</Badge>
    ) : (
      <Text size="sm" fw={isMono ? 400 : 800} className={`${isMono ? 'font-mono text-zinc-400' : 'text-zinc-100 italic'}`}>{value}</Text>
    )}
  </Stack>
);
