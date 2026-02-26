import { Badge, Group, Loader, Paper, Stack, Text, Timeline, ThemeIcon } from "@mantine/core";
import { useEffect, useState } from "react";
import {
    ClipboardDocumentListIcon,
    CheckBadgeIcon,
    TruckIcon,
    ArchiveBoxArrowDownIcon,
    XCircleIcon,
    CheckCircleIcon,
    CubeIcon
} from "@heroicons/react/24/solid";
import dayjs from "dayjs";

import { useRequerimientos } from "../../../../../services/requerimientos_almacen/requerimientos/useRequerimientos";
import type { RES_TrazabilidadEvento } from "../../../../../services/requerimientos_almacen/requerimientos/dtos/responses";
import { EstadoDetalleRequerimiento } from "../../../../../shared/enums";

interface TrazabilidadRequerimientoProps {
    idDetalle: number;
    productoNombre: string;
}

export const TrazabilidadRequerimiento = ({ idDetalle, productoNombre }: TrazabilidadRequerimientoProps) => {
    const [loading, setLoading] = useState(true);
    const [eventos, setEventos] = useState<RES_TrazabilidadEvento[]>([]);
    const [, setError] = useState("");

    const { obtenerTrazabilidad } = useRequerimientos({ setError });

    useEffect(() => {
        if (idDetalle) {
            setLoading(true);
            obtenerTrazabilidad(idDetalle)
                .then(res => setEventos(res || []))
                .finally(() => setLoading(false));
        }
    }, [idDetalle]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader color="violet" size="lg" />
            </div>
        );
    }

    return (
        <Stack gap="xl" className="animate-fade-in p-2">
            <div className="px-4 py-2 border-l-4 border-indigo-500 bg-zinc-900/50 rounded-r-xl">
                <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-widest mb-0.5">Producto:</Text>
                <Text size="lg" fw={800} className="text-white tracking-tight">{productoNombre}</Text>
            </div>

            {eventos.length === 0 ? (
                <div className="text-center py-10 italic">
                    <Text c="dimmed">No hay eventos registrados para este producto.</Text>
                </div>
            ) : (
                <Timeline active={eventos.length + 1} bulletSize={28} lineWidth={2} className="px-4">
                    {[...eventos].reverse().map((evento) => {
                        const style = getStatusStyles(evento.estado);

                        return (
                            <Timeline.Item
                                key={evento.id}
                                color={style.color}
                                bullet={
                                    <ThemeIcon size={28} radius="xl" color={style.color} variant="filled" className="shadow-md">
                                        {getStatusIcon(evento.estado)}
                                    </ThemeIcon>
                                }
                                title={
                                    <Group justify="space-between" align="center" mb={4}>
                                        <Badge
                                            color={style.color}
                                            variant={style.variant}
                                            radius="xl"
                                            size="sm"
                                            className={`font-bold border ${style.variant === 'light' ? 'border-current/20' : 'border-transparent'}`}
                                        >
                                            {evento.estado}
                                        </Badge>
                                        <Text size="10px" c="zinc.5" fw={600} className="font-mono">
                                            {dayjs(evento.created_at).format("DD/MM/YYYY HH:mm")}
                                        </Text>
                                    </Group>
                                }
                            >
                                <Paper p="sm" radius="md" bg="zinc.9/30" className="border border-zinc-800 shadow-sm">
                                    <Text size="sm" fw={500} c="zinc.2" className="leading-relaxed">{evento.glosa}</Text>
                                    <div className="mt-2 flex items-center gap-1.5 opacity-60">
                                        <Text size="xs" c="zinc.5" fw={500}>Por:</Text>
                                        <Text size="xs" fw={700} c="zinc.4" className="italic">{evento.usuario}</Text>
                                    </div>
                                </Paper>
                            </Timeline.Item>
                        )
                    })}
                </Timeline>
            )}
        </Stack>
    );
};

const getStatusStyles = (status: string) => {
    switch (status) {
        case EstadoDetalleRequerimiento.Pendiente: return { color: "blue", variant: "light" as const };
        case EstadoDetalleRequerimiento.AprobacionLogistica: return { color: "violet", variant: "light" as const };
        case EstadoDetalleRequerimiento.DespachoIniciado: return { color: "orange", variant: "light" as const };
        case EstadoDetalleRequerimiento.NuevaEntrega: return { color: "green", variant: "light" as const };
        case EstadoDetalleRequerimiento.RechazadoLogistica: return { color: "red", variant: "filled" as const };
        case EstadoDetalleRequerimiento.Completado: return { color: "cyan", variant: "light" as const };
        case EstadoDetalleRequerimiento.Cerrado: return { color: "zinc", variant: "filled" as const };
        default: return { color: "gray", variant: "light" as const };
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case EstadoDetalleRequerimiento.Pendiente: return <ClipboardDocumentListIcon className="w-4 h-4 text-white" />;
        case EstadoDetalleRequerimiento.AprobacionLogistica: return <CheckBadgeIcon className="w-4 h-4 text-white" />;
        case EstadoDetalleRequerimiento.DespachoIniciado: return <TruckIcon className="w-4 h-4 text-white" />;
        case EstadoDetalleRequerimiento.NuevaEntrega: return <ArchiveBoxArrowDownIcon className="w-4 h-4 text-white" />;
        case EstadoDetalleRequerimiento.RechazadoLogistica: return <XCircleIcon className="w-4 h-4 text-white" />;
        case EstadoDetalleRequerimiento.Completado: return <CheckCircleIcon className="w-4 h-4 text-white" />;
        case EstadoDetalleRequerimiento.Cerrado: return <CubeIcon className="w-4 h-4 text-white" />;
        default: return <div className="w-2 h-2 rounded-full bg-white" />;
    }
};

