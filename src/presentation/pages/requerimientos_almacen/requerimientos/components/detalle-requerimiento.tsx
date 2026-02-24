import { Badge, Group, Loader, Paper, Stack, Table, Text, ActionIcon, Tooltip } from "@mantine/core";
import { useEffect, useState } from "react";
import { ClockIcon, CubeIcon, ShieldCheckIcon, ListBulletIcon, UserIcon, MapPinIcon, BuildingStorefrontIcon, CalendarDaysIcon, CheckBadgeIcon, BoltIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";

import { useRequerimientos } from "../../../../../services/requerimientos_almacen/requerimientos/useRequerimientos";
import type { RES_RequerimientoDetalleCompleto } from "../../../../../services/requerimientos_almacen/requerimientos/dtos/responses";
import { EstadoDetalleRequerimiento } from "../../../../../shared/enums";

interface DetalleRequerimientoProps {
    idRequerimiento: number;
    onOpenTrazabilidad: (idDetalle: number, productoNombre: string) => void;
}

export const DetalleRequerimiento = ({ idRequerimiento, onOpenTrazabilidad }: DetalleRequerimientoProps) => {
    const [loading, setLoading] = useState(true);
    const [detalle, setDetalle] = useState<RES_RequerimientoDetalleCompleto | null>(null);
    const [, setError] = useState("");

    const { obtenerDetalle } = useRequerimientos({ setError });

    useEffect(() => {
        if (idRequerimiento) {
            setLoading(true);
            obtenerDetalle(idRequerimiento)
                .then(res => setDetalle(res))
                .finally(() => setLoading(false));
        }
    }, [idRequerimiento]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader color="violet" size="lg" />
            </div>
        );
    }

    if (!detalle) {
        return (
            <div className="text-center py-20">
                <Text c="dimmed">No se pudo cargar la información del requerimiento.</Text>
            </div>
        );
    }

    return (
        <Stack gap="xl" className="animate-fade-in">
            {/* Cabecera Informativa Multisección */}
            <Paper p="lg" radius="xl" bg="zinc.9" className="border border-zinc-800 shadow-2xl relative overflow-hidden">
                {/* Branding sutil de fondo */}
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                    <ShieldCheckIcon className="w-48 h-48 text-white rotate-12" />
                </div>

                <div className="space-y-6 relative z-10">
                    {/* Fila 1: Datos Principales */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-zinc-800/50">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-1">
                                <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                                <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-wider">Solicitante</Text>
                            </div>
                            <Text size="lg" fw={900} className="text-white tracking-tighter leading-tight">
                                {detalle.solicitante}
                            </Text>
                        </div>

                        <div className="space-y-1">
                            <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-wider mb-1">Correlativo</Text>
                            <Text size="lg" fw={900} className="text-indigo-500 tracking-tighter leading-tight">
                                {detalle.codigo_requerimiento}
                            </Text>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-1">
                                <MapPinIcon className="w-3.5 h-3.5 text-zinc-500" />
                                <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-wider">Origen / Mina</Text>
                            </div>
                            <Text size="sm" fw={700} className="text-white">{detalle.mina}</Text>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-1">
                                <BuildingStorefrontIcon className="w-3.5 h-3.5 text-zinc-500" />
                                <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-wider">Almacén Destino</Text>
                            </div>
                            <Text size="sm" fw={700} className="text-zinc-200 italic">{detalle.almacen_destino}</Text>
                        </div>
                    </div>

                    {/* Fila 2: Fechas y Estados */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2 pb-2">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-1">
                                <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-500" />
                                <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-wider">Fecha Requerida</Text>
                            </div>
                            <Text size="sm" fw={600} className="text-zinc-100">
                                {detalle.fecha_entrega_requerida ? dayjs(detalle.fecha_entrega_requerida).format("DD/MM/YYYY") : "No especificada"}
                            </Text>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-1">
                                <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-400" />
                                <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-wider">Fecha Registro</Text>
                            </div>
                            <Text size="sm" fw={500} className="text-zinc-400 font-mono">
                                {dayjs(detalle.created_at).format("DD/MM/YYYY HH:mm")}
                            </Text>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-1">
                                <CheckBadgeIcon className="w-3.5 h-3.5 text-zinc-500" />
                                <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-wider">Estado Actual</Text>
                            </div>
                            <Badge color="green" variant="light" radius="sm" size="sm" className="font-bold border border-green-900/40">
                                {detalle.estado}
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-1">
                                <BoltIcon className="w-3.5 h-3.5 text-zinc-500" />
                                <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-wider">Prioridad</Text>
                            </div>
                            <Badge color="orange" variant="light" radius="sm" size="sm" className="font-bold border border-orange-900/40">
                                {detalle.premura}
                            </Badge>
                        </div>
                    </div>

                    {/* Fila 3: Labores */}
                    <div className="pt-6 border-t border-zinc-800/50">
                        <div className="space-y-2">
                            <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-wider">Labores Destino Asignadas</Text>
                            <Group gap={6}>
                                {detalle.labores.length > 0 ? (
                                    detalle.labores.map(l => (
                                        <Badge key={l.id} variant="light" color="indigo" size="xs" radius="md" className="py-2.5 px-3">
                                            {l.nombre}
                                        </Badge>
                                    ))
                                ) : (
                                    <Text size="xs" c="zinc.5" fs="italic">Sin asignar</Text>
                                )}
                            </Group>
                        </div>
                    </div>
                </div>
            </Paper>

            {/* Tabla de Items Solicitados */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ListBulletIcon className="w-5 h-5 text-indigo-500" />
                        <Text fw={700} size="sm" c="white" className="tracking-tight uppercase">Items solicitados</Text>
                    </div>
                    <Badge variant="light" color="pink" size="xs" radius="sm" className="font-bold py-2.5 px-3 uppercase tracking-wider">
                        {detalle.detalles.length} {detalle.detalles.length === 1 ? 'Item' : 'Items'}
                    </Badge>
                </div>

                <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/40">
                    <Table variant="unstyled" verticalSpacing="md" className="w-full">
                        <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-center w-12 text-[10px]">#</th>
                                <th className="px-6 py-4 text-left">Producto</th>
                                <th className="px-6 py-4 text-center">Indicadores</th>
                                <th className="px-6 py-4 text-right">Cant. Solic.</th>
                                <th className="px-6 py-4 text-right">Cant. Atend.</th>
                                <th className="px-6 py-4 text-center">Unidad</th>
                                <th className="px-6 py-4 text-left">Comentario</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-center w-20">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 bg-zinc-900/20">
                            {detalle.detalles.map((item, index) => (
                                <tr key={item.id_requerimiento_detalle} className="hover:bg-indigo-500/5 transition-colors group">
                                    <td className="px-6 py-4 text-center text-zinc-500 text-xs font-mono">{String(index + 1).padStart(2, '0')}</td>
                                    <td className="px-6 py-4">
                                        <Group gap="sm">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-sm group-hover:border-indigo-500/50 transition-colors">
                                                <CubeIcon className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400" />
                                            </div>
                                            <Text size="sm" fw={700} c="white" className="tracking-tight">{item.producto}</Text>
                                        </Group>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Group gap={6} justify="center">
                                            {!!item.es_fiscalizado && (
                                                <Badge
                                                    size="xs"
                                                    variant="light"
                                                    color="red"
                                                    radius="sm"
                                                    className="font-bold tracking-wider"
                                                >
                                                    FISCALIZADO
                                                </Badge>
                                            )}
                                            {!!item.es_perecible && (
                                                <Badge
                                                    size="xs"
                                                    variant="light"
                                                    color="orange"
                                                    radius="sm"
                                                    className="font-bold tracking-wider"
                                                >
                                                    PERECIBLE
                                                </Badge>
                                            )}
                                            {!item.es_fiscalizado && !item.es_perecible && (
                                                <Text size="xs" c="zinc.6">-</Text>
                                            )}
                                        </Group>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Text size="sm" fw={800} className="text-white font-mono">{item.cantidad_solicitada.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Text size="sm" fw={800} className="text-cyan-500 font-mono">{item.cantidad_atendida.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant="outline" color="zinc.5" size="xs" className="font-bold">{item.unidad_medida}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Text size="xs" c="zinc.4" className="max-w-[200px] italic">
                                            {item.comentario || <span className="text-zinc-700">Sin comentario</span>}
                                        </Text>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge
                                            color={getStatusColor(item.estado)}
                                            variant="light"
                                            size="sm"
                                            radius="sm"
                                        >
                                            {item.estado}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Tooltip label="Ver seguimiento" position="top" withArrow radius="md">
                                            <ActionIcon
                                                variant="filled"
                                                color="indigo"
                                                radius="md"
                                                onClick={() => onOpenTrazabilidad(item.id_requerimiento_detalle, item.producto)}
                                                className="shadow-md hover:scale-105 transition-transform"
                                            >
                                                <ClockIcon className="w-4 h-4 text-white" />
                                            </ActionIcon>
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </section>
        </Stack>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case EstadoDetalleRequerimiento.Pendiente: return "blue";
        case EstadoDetalleRequerimiento.AprobacionLogistica: return "violet";
        case EstadoDetalleRequerimiento.DespachoIniciado: return "orange";
        case EstadoDetalleRequerimiento.NuevaEntrega: return "green";
        case EstadoDetalleRequerimiento.RechazadoLogistica: return "red";
        case EstadoDetalleRequerimiento.Completado: return "cyan";
        case EstadoDetalleRequerimiento.Cerrado: return "dark";
        default: return "gray";
    }
};
