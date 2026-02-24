import { Badge, Group, Loader, Paper, Stack, Text, Timeline } from "@mantine/core";
import { useEffect, useState } from "react";
import { } from "@heroicons/react/24/outline";
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
                <Timeline active={eventos.length - 1} bulletSize={16} lineWidth={2} color="indigo" className="px-4">
                    {eventos.map((evento) => (
                        <Timeline.Item
                            key={evento.id}
                            bullet={<div className={`w-full h-full rounded-full bg-${getStatusColor(evento.estado)}-500 shadow-sm`} />}
                            title={
                                <Group justify="space-between" align="center" mb={4}>
                                    <Badge
                                        color={getStatusColor(evento.estado)}
                                        variant="light"
                                        radius="xl"
                                        size="xs"
                                        className="font-bold border border-current/20"
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
                    ))}
                </Timeline>
            )}
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

