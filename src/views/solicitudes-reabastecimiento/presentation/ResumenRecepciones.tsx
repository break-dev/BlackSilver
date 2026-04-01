import { useState, useEffect } from "react";
import { Stack, Group, Text, Badge, ActionIcon, Paper, Tooltip, Loader, Modal, Divider, Button } from "@mantine/core";
import { 
    ClockIcon, 
    UserIcon, 
    ExclamationTriangleIcon, 
    InformationCircleIcon, 
    ChatBubbleBottomCenterTextIcon,
    ArchiveBoxArrowDownIcon
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import { formatNumber } from "../../../presentation/functions/formatNumber";
import { ArchivoCard } from "../../../presentation/utils/archivo-card";
import type { RecepcionEvento, RecepcionDetalle } from "../service/reabastecimiento.responses";
import type { IArchivo } from "../../../shared/interfaces";

interface Props {
    idEntrega: number;
}

export const ResumenRecepciones = ({ idEntrega }: Props) => {
    const [loading, setLoading] = useState(true);
    const [recepciones, setRecepciones] = useState<RecepcionEvento[]>([]);
    const [selectedIncidencia, setSelectedIncidencia] = useState<RecepcionEvento | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await ReabastecimientoService.getHistorialRecepcionesEntrega(idEntrega);
                if (res.success && res.data) {
                    setRecepciones(res.data);
                }
            } catch (error) {
                console.error("Error al cargar recepciones", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [idEntrega]);

    if (loading) return (
        <Group justify="center" p="md">
            <Loader size="xs" color="indigo" variant="dots" />
            <Text size="xs" c="indigo.4" fw={700} className="uppercase tracking-widest animate-pulse">Consultando Eventos...</Text>
        </Group>
    );

    if (recepciones.length === 0) return null;

    return (
        <div className="mt-4 px-4 pb-4 animate-in fade-in duration-500">
             <Group gap="xs" mb="sm">
                <ArchiveBoxArrowDownIcon className="w-4 h-4 text-emerald-400/80" />
                <Text
                    size="xs"
                    fw={800}
                    c="zinc.4"
                    className="uppercase tracking-widest"
                >
                    Trazabilidad de Recepción ({recepciones.length})
                </Text>
            </Group>

            <Stack gap="xs">
                {recepciones.map((rec, idx) => (
                    <Paper 
                        key={rec.id_recepcion} 
                        p="xs" 
                        radius="md" 
                        className={`bg-zinc-950/40 border ${rec.con_incidencia ? 'border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.05)]' : 'border-zinc-800/40'} transition-all hover:bg-zinc-900/60`}
                    >
                        <Group justify="space-between" wrap="nowrap">
                            <Group gap="md">
                                <Stack gap={0} align="center" className="min-w-fit pr-2 border-r border-zinc-800/50">
                                    <Text size="10px" fw={900} className="text-zinc-500 uppercase">Recepción</Text>
                                    <Text size="xs" fw={900} className="text-white">#{recepciones.length - idx}</Text>
                                </Stack>

                                <Stack gap={1}>
                                    <Group gap="xs">
                                        <ClockIcon className="w-3 h-3 text-indigo-400/70" />
                                        <Text size="xs" fw={700}>{dayjs(rec.fecha_hora_recepcion).format("DD/MM - HH:mm")}</Text>
                                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                        <UserIcon className="w-3 h-3 text-indigo-400/70" />
                                        <Text size="xs" c="dimmed">{rec.empleado_registro}</Text>
                                    </Group>
                                    
                                    <Group gap={4} wrap="wrap">
                                        {rec.detalles.map((det: RecepcionDetalle) => (
                                            <Badge 
                                                key={det.id_detalle} 
                                                variant="outline" 
                                                size="xs" 
                                                color="zinc.4" 
                                                className="border-zinc-800/40 text-zinc-400 lowercase font-medium"
                                            >
                                                {det.producto}: <span className="text-white font-black ml-1">{formatNumber(det.cantidad_recepcionada_base)}</span>
                                            </Badge>
                                        ))}
                                    </Group>
                                </Stack>
                            </Group>

                            <Group gap="xs">
                                {rec.con_incidencia && (
                                    <Badge 
                                        color="indigo" 
                                        variant="light" 
                                        size="sm" 
                                        leftSection={<ExclamationTriangleIcon className="w-3 h-3" />}
                                        className="animate-pulse shadow-sm shadow-indigo-500/20 cursor-help"
                                        onClick={() => setSelectedIncidencia(rec)}
                                    >
                                        Incidencia
                                    </Badge>
                                )}
                                <Tooltip label="Ver detalles del evento" position="left" withArrow>
                                    <ActionIcon 
                                        variant="light" 
                                        color={rec.con_incidencia ? "indigo" : "indigo"} 
                                        size="sm" 
                                        radius="md"
                                        onClick={() => setSelectedIncidencia(rec)}
                                    >
                                        <InformationCircleIcon className="w-4 h-4" />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Group>
                    </Paper>
                ))}
            </Stack>

            {/* Modal de Detalle de Recepción / Incidencia */}
            <Modal
                opened={!!selectedIncidencia}
                onClose={() => setSelectedIncidencia(null)}
                title={
                    <Group gap="xs">
                         <div className={`p-2 rounded-lg ${selectedIncidencia?.con_incidencia ? 'bg-orange-500/10' : 'bg-indigo-500/10'}`}>
                            {selectedIncidencia?.con_incidencia ? <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" /> : <InformationCircleIcon className="w-5 h-5 text-indigo-400" />}
                        </div>
                        <Stack gap={0}>
                            <Text fw={900} size="sm">Detalle de Recepción</Text>
                            <Text size="10px" c="dimmed" className="uppercase tracking-widest">{dayjs(selectedIncidencia?.fecha_hora_recepcion).format("DD [de] MMMM, YYYY - HH:mm")}</Text>
                        </Stack>
                    </Group>
                }
                radius="xl"
                size="lg"
                classNames={{
                    content: "bg-zinc-950 border border-zinc-800",
                    header: "bg-zinc-950 border-b border-zinc-900 pb-3",
                    title: "text-white w-full"
                }}
            >
                <Stack gap="md" py="md">
                    <div>
                         <Text size="xs" fw={800} c="zinc.5" mb={8} className="uppercase tracking-widest">Observación {selectedIncidencia?.con_incidencia ? 'de Incidencia' : 'del Evento'}</Text>
                         <Paper p="md" radius="md" className="bg-zinc-900/40 border border-zinc-800 shadow-inner">
                            <Group align="flex-start" wrap="nowrap" gap="md">
                                <ChatBubbleBottomCenterTextIcon className={`w-5 h-5 mt-0.5 ${selectedIncidencia?.con_incidencia ? 'text-orange-400' : 'text-indigo-400'}`} />
                                <Text size="sm" className="italic leading-relaxed whitespace-pre-wrap">
                                    {selectedIncidencia?.observacion || "Sin observaciones registradas."}
                                </Text>
                            </Group>
                         </Paper>
                    </div>

                    {selectedIncidencia?.evidencias && selectedIncidencia.evidencias.length > 0 && (
                        <div>
                            <Text size="xs" fw={800} c="zinc.5" mb={8} className="uppercase tracking-widest">Evidencias Adjuntas ({selectedIncidencia.evidencias.length})</Text>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {selectedIncidencia.evidencias.map((ev: IArchivo, idx: number) => (
                                    <ArchivoCard key={idx} archivo={ev} />
                                ))}
                            </div>
                        </div>
                    )}

                    <Divider color="zinc.8" variant="dashed" />

                    <div>
                        <Text size="xs" fw={800} c="zinc.5" mb={8} className="uppercase tracking-widest">Detalle de Productos Recibidos</Text>
                        <Stack gap={5}>
                             {selectedIncidencia?.detalles.map((det: RecepcionDetalle) => (
                                 <Group key={det.id_detalle} justify="space-between" className="bg-zinc-900/20 p-2 px-3 rounded-lg border border-zinc-800/30">
                                     <Text size="xs" fw={700}>{det.producto}</Text>
                                     <Text size="xs" fw={900} className="text-emerald-400 font-mono">+{formatNumber(det.cantidad_recepcionada_base)} {det.unidad_base_abv}</Text>
                                 </Group>
                             ))}
                        </Stack>
                    </div>

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" color="zinc" onClick={() => setSelectedIncidencia(null)} radius="md" size="xs">Cerrar</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
};
