import { Badge, Group, Loader, Paper, Stack, Table, Text, ActionIcon, Tooltip } from "@mantine/core";
import { useEffect, useState } from "react";
import { ClockIcon, CubeIcon, ListBulletIcon, UserIcon, MapPinIcon, BuildingStorefrontIcon, CalendarDaysIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
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
            {/* Header: Datos Principales (Diseño Integrado) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                <Paper p="md" radius="lg" className="bg-indigo-500/[0.06] border border-indigo-500/20 relative overflow-hidden group hover:bg-indigo-500/[0.1] transition-all">
                    <UserIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-indigo-400/10 rotate-12 group-hover:scale-110 transition-transform" />
                    <Stack gap={2} className="relative z-10">
                        <Group gap={6}>
                            <UserIcon className="w-4 h-4 text-indigo-400" />
                            <Text size="xs" c="indigo.3" fw={800} className="uppercase tracking-widest">Solicitante</Text>
                        </Group>
                        <Text size="md" fw={900} className="text-white tracking-tight leading-tight">{detalle.solicitante}</Text>
                    </Stack>
                </Paper>

                <Paper p="md" radius="lg" className="bg-violet-500/[0.06] border border-violet-500/20 relative overflow-hidden group hover:bg-violet-500/[0.1] transition-all">
                    <CheckBadgeIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-violet-400/10 rotate-12 group-hover:scale-110 transition-transform" />
                    <Stack gap={2} className="relative z-10">
                        <Group gap={6}>
                            <CheckBadgeIcon className="w-4 h-4 text-violet-400" />
                            <Text size="xs" c="violet.3" fw={800} className="uppercase tracking-widest">Correlativo</Text>
                        </Group>
                        <Text size="md" fw={900} className="text-zinc-100 tracking-tight leading-tight">{detalle.codigo_requerimiento}</Text>
                    </Stack>
                </Paper>

                <Paper p="md" radius="lg" className="bg-amber-500/[0.06] border border-amber-500/20 relative overflow-hidden group hover:bg-amber-500/[0.1] transition-all">
                    <MapPinIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-amber-400/10 rotate-12 group-hover:scale-110 transition-transform" />
                    <Stack gap={2} className="relative z-10">
                        <Group gap={6}>
                            <MapPinIcon className="w-4 h-4 text-amber-500" />
                            <Text size="xs" c="amber.5" fw={800} className="uppercase tracking-widest">Origen / Mina</Text>
                        </Group>
                        <Text size="md" fw={800} className="text-zinc-100 tracking-tight leading-tight">{detalle.mina}</Text>
                    </Stack>
                </Paper>

                <Paper p="md" radius="lg" className="bg-emerald-500/[0.06] border border-emerald-500/20 relative overflow-hidden group hover:bg-emerald-500/[0.1] transition-all">
                    <BuildingStorefrontIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-emerald-400/10 rotate-12 group-hover:scale-110 transition-transform" />
                    <Stack gap={2} className="relative z-10">
                        <Group gap={6}>
                            <BuildingStorefrontIcon className="w-4 h-4 text-emerald-500" />
                            <Text size="xs" c="emerald.5" fw={800} className="uppercase tracking-widest">Almacén Destino</Text>
                        </Group>
                        <Text size="md" fw={800} className="text-zinc-100 tracking-tight leading-tight italic">{detalle.almacen_destino}</Text>
                    </Stack>
                </Paper>
            </div>

            {/* Sub-header: Estados, Fechas y Labores */}
            <Paper p="md" radius="lg" bg="transparent" className="border border-zinc-800/50 mx-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Prioridad */}
                    <Stack gap={4}>
                        <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">Prioridad</Text>
                        <Badge color="orange" variant="light" size="sm" radius="sm" className="border border-orange-900/30 font-bold">
                            {detalle.premura}
                        </Badge>
                    </Stack>

                    {/* Estado */}
                    <Stack gap={4}>
                        <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">Estado</Text>
                        <Badge color="green" variant="light" size="sm" radius="sm" className="border border-green-900/30 font-bold">
                            {detalle.estado}
                        </Badge>
                    </Stack>

                    {/* Labores */}
                    <Stack gap={4} className="lg:col-span-1">
                        <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">Labores Destino Asignadas</Text>
                        <Group gap={4}>
                            {detalle.labores && detalle.labores.length > 0 ? (
                                detalle.labores.map(l => (
                                    <Badge key={l.id} variant="outline" color="indigo" size="xs" className="text-[10px]">
                                        {l.nombre}
                                    </Badge>
                                ))
                            ) : (
                                <Text size="xs" c="zinc.6" fs="italic">Sin labores asignadas</Text>
                            )}
                        </Group>
                    </Stack>

                    {/* Fecha Requerida */}
                    <Stack gap={4}>
                        <div className="flex items-center gap-1.5 font-bold">
                            <CalendarDaysIcon className="w-3.5 h-3.5 text-rose-500" />
                            <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">Fecha Requerida</Text>
                        </div>
                        <Text size="sm" fw={800} className="text-zinc-100 italic">
                            {detalle.fecha_entrega_requerida ? dayjs(detalle.fecha_entrega_requerida).format("DD/MM/YYYY") : "No especificada"}
                        </Text>
                    </Stack>

                    {/* Fecha Registro */}
                    <Stack gap={4}>
                        <div className="flex items-center gap-1.5 font-bold">
                            <ClockIcon className="w-3.5 h-3.5 text-zinc-500" />
                            <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">Fecha de Registro</Text>
                        </div>
                        <Text size="sm" fw={400} className="text-zinc-400 font-mono">
                            {dayjs(detalle.created_at).format("DD/MM/YYYY HH:mm")}
                        </Text>
                    </Stack>
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
