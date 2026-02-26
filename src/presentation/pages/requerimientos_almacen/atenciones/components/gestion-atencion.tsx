import { Badge, Group, Loader, Paper, Stack, Table, Text, ActionIcon, Tooltip, Button, Textarea, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
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
    FlagIcon
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

import { useRequerimientos } from "../../../../../services/requerimientos_almacen/requerimientos/useRequerimientos";
import { useEntregas } from "../../../../../services/requerimientos_almacen/atenciones/useEntregas";
import type { RES_RequerimientoDetalleCompleto } from "../../../../../services/requerimientos_almacen/requerimientos/dtos/responses";
import { EstadoDetalleRequerimiento } from "../../../../../shared/enums";
import { TrazabilidadRequerimiento } from "../../requerimientos/components/trazabilidad-requerimiento";
import { ModalRegistro } from "../../../../utils/modal-registro";
import { RegistrarEntrega } from "./registrar-entrega.tsx";

interface GestionAtencionProps {
    idRequerimiento: number;
    idAlmacen: number;
    onSuccess: () => void;
}

export const GestionAtencion = ({ idRequerimiento, idAlmacen, onSuccess }: GestionAtencionProps) => {
    const [loading, setLoading] = useState(true);
    const [detalle, setDetalle] = useState<RES_RequerimientoDetalleCompleto | null>(null);
    const [, setError] = useState("");

    // Modal Control
    const [openedTrace, { open: openTrace, close: closeTrace }] = useDisclosure(false);
    const [openedEntrega, { open: openEntrega, close: closeEntrega }] = useDisclosure(false);
    const [openedRechazo, { open: openRechazo, close: closeRechazo }] = useDisclosure(false);

    // Selected Data
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [selectedIdProducto, setSelectedIdProducto] = useState<number | null>(null);
    const [selectedItemName, setSelectedItemName] = useState("");
    const [selectedItemSolicitado, setSelectedItemSolicitado] = useState(0);
    const [selectedItemAtendido, setSelectedItemAtendido] = useState(0);
    const [selectedItemStock, setSelectedItemStock] = useState(0);
    const [rechazoMotivo, setRechazoMotivo] = useState("");

    const { obtenerDetalle } = useRequerimientos({ setError });
    const { cambiarEstadoDetalle, finalizarAtencion } = useEntregas({ setError });

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await obtenerDetalle(idRequerimiento);
            if (res) setDetalle(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [idRequerimiento]);

    const handleAprobar = async (idDetalle: number) => {
        const ok = await cambiarEstadoDetalle({
            id_requerimiento_almacen_detalle: idDetalle,
            nuevo_estado: EstadoDetalleRequerimiento.AprobacionLogistica
        });
        if (ok) {
            loadData();
            onSuccess();
        }
    };

    const handleRechazar = async () => {
        if (!selectedItemId) return;
        const ok = await cambiarEstadoDetalle({
            id_requerimiento_almacen_detalle: selectedItemId,
            nuevo_estado: EstadoDetalleRequerimiento.RechazadoLogistica,
            comentario_rechazo: rechazoMotivo
        });
        if (ok) {
            closeRechazo();
            setRechazoMotivo("");
            loadData();
            onSuccess();
        }
    };

    const handleFinalizar = async () => {
        const ok = await finalizarAtencion({ id_requerimiento: idRequerimiento });
        if (ok) {
            onSuccess();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case EstadoDetalleRequerimiento.Pendiente: return "blue";
            case EstadoDetalleRequerimiento.AprobacionLogistica: return "violet";
            case EstadoDetalleRequerimiento.DespachoIniciado: return "orange";
            case EstadoDetalleRequerimiento.Completado: return "teal";
            case EstadoDetalleRequerimiento.RechazadoLogistica: return "red";
            default: return "zinc";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader color="indigo" size="lg" />
            </div>
        );
    }

    if (!detalle) return null;

    const progresoGeneral = detalle.detalles.length > 0
        ? Math.round((detalle.detalles.filter(d => d.estado === EstadoDetalleRequerimiento.Completado).length / detalle.detalles.length) * 100)
        : 0;

    return (
        <Stack gap="xl" className="pb-10">
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
                            <Text size="xs" c="violet.3" fw={800} className="uppercase tracking-widest">Cód. Requerimiento</Text>
                        </Group>
                        <Text size="md" fw={900} className="text-zinc-100 tracking-tight leading-tight">{detalle.codigo_requerimiento}</Text>
                    </Stack>
                </Paper>

                <Paper p="md" radius="lg" className="bg-amber-500/[0.06] border border-amber-500/20 relative overflow-hidden group hover:bg-amber-500/[0.1] transition-all">
                    <MapPinIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-amber-400/10 rotate-12 group-hover:scale-110 transition-transform" />
                    <Stack gap={2} className="relative z-10">
                        <Group gap={6}>
                            <MapPinIcon className="w-4 h-4 text-amber-500" />
                            <Text size="xs" c="amber.5" fw={800} className="uppercase tracking-widest">Mina Destino</Text>
                        </Group>
                        <Text size="md" fw={800} className="text-zinc-100 tracking-tight leading-tight">{detalle.mina}</Text>
                    </Stack>
                </Paper>

                <Paper p="md" radius="lg" className="bg-emerald-500/[0.06] border border-emerald-500/20 relative overflow-hidden group hover:bg-emerald-500/[0.1] transition-all">
                    <BuildingStorefrontIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-emerald-400/10 rotate-12 group-hover:scale-110 transition-transform" />
                    <Stack gap={2} className="relative z-10">
                        <Group gap={6}>
                            <BuildingStorefrontIcon className="w-4 h-4 text-emerald-500" />
                            <Text size="xs" c="emerald.5" fw={800} className="uppercase tracking-widest">Almacén</Text>
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
                        <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">Labores Destino</Text>
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

            {/* Barra de Progreso */}
            <Paper p="md" radius="xl" bg="zinc.9/50" className="border border-zinc-800">
                <Group justify="space-between" mb={8} px={4}>
                    <Text size="xs" fw={800} className="text-zinc-400 tracking-tighter uppercase">Progreso General de Atención</Text>
                    <Text size="sm" fw={900} c="indigo.4">{progresoGeneral}%</Text>
                </Group>
                <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-1000"
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
                        {detalle.detalles.length} {detalle.detalles.length === 1 ? 'Producto' : 'Productos'}
                    </Badge>
                </Group>

                <div className="overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950/20">
                    <Table verticalSpacing="md" horizontalSpacing="xl">
                        <thead className="bg-zinc-900/80 text-zinc-400 text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-center w-12">#</th>
                                <th className="px-6 py-4 text-left">Producto</th>
                                <th className="px-6 py-4 text-center">Indicadores</th>
                                <th className="px-6 py-4 text-right">Cant. Solic.</th>
                                <th className="px-6 py-4 text-center w-40">Progreso</th>
                                <th className="px-6 py-4 text-center">Unidad</th>
                                <th className="px-6 py-4 text-left">Comentario</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-center w-36">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {detalle.detalles.map((item, idx) => {
                                const progresoItem = Math.min(100, Math.round(((item.cantidad_atendida || 0) / (item.cantidad_solicitada || 1)) * 100));

                                return (
                                    <tr key={item.id_requerimiento_detalle} className="hover:bg-zinc-900/40 transition-colors group">
                                        <td className="px-6 py-4 text-center text-xs font-mono text-zinc-500">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <Text size="sm" fw={800} className="text-zinc-100 group-hover:text-indigo-400 transition-colors tracking-tight">
                                                    {item.producto}
                                                </Text>
                                                <Group gap={4}>
                                                    <Text size="10px" fw={700} c="zinc.5" className="tracking-tighter italic">Stock almacén:</Text>
                                                    <Text size="xs" fw={900} c={Number(item.stock_disponible || 0) < Number(item.cantidad_solicitada || 0) ? "red.5" : "emerald.5"}>
                                                        {Number(item.stock_disponible || 0).toFixed(2)}
                                                    </Text>
                                                </Group>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Group gap={6} justify="center">
                                                {!!item.es_fiscalizado && (
                                                    <Badge size="sm" variant="light" color="red" radius="md" className="font-bold px-3 py-2.5 border border-red-900/20">
                                                        FISCALIZADO
                                                    </Badge>
                                                )}
                                                {!!item.es_perecible && (
                                                    <Badge size="sm" variant="light" color="orange" radius="md" className="font-bold px-3 py-2.5 border border-orange-900/20">
                                                        PERECIBLE
                                                    </Badge>
                                                )}
                                                {!item.es_fiscalizado && !item.es_perecible && <Text size="xs" c="zinc.6">-</Text>}
                                            </Group>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Text size="sm" fw={800} className="text-white font-mono">{Number(item.cantidad_solicitada || 0).toFixed(2)}</Text>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col gap-1.5 w-full">
                                                <div className="flex justify-between items-center px-1">
                                                    <Text size="10px" fw={800} c="zinc.5">Atendido: {Number(item.cantidad_atendida || 0).toFixed(2)}</Text>
                                                    <Text size="10px" fw={900} c="indigo.4">{progresoItem}%</Text>
                                                </div>
                                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/30">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-700"
                                                        style={{ width: `${progresoItem}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant="outline" color="zinc.5" size="xs" className="font-bold border-zinc-700">
                                                {item.unidad_medida}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Text size="xs" c="zinc.5" className="max-w-[200px] italic leading-tight">
                                                {item.comentario || <span className="text-zinc-800/50">Sin observaciones</span>}
                                            </Text>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge
                                                variant="light"
                                                color={getStatusColor(item.estado)}
                                                radius="md"
                                                size="sm"
                                                className="font-bold px-3 py-2.5"
                                            >
                                                {item.estado}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Group gap={8} justify="center" wrap="nowrap">
                                                {/* Acción: Trazabilidad */}
                                                <Tooltip label="Ver Seguimiento" position="top" withArrow>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="zinc"
                                                        onClick={() => {
                                                            setSelectedItemId(item.id_requerimiento_detalle);
                                                            setSelectedIdProducto(item.id_producto);
                                                            setSelectedItemName(item.producto);
                                                            openTrace();
                                                        }}
                                                    >
                                                        <ClockIcon className="w-4 h-4" />
                                                    </ActionIcon>
                                                </Tooltip>

                                                {item.estado === EstadoDetalleRequerimiento.Pendiente && (
                                                    <>
                                                        <Tooltip label="Aprobar" position="top" withArrow>
                                                            <ActionIcon
                                                                variant="light"
                                                                color="teal"
                                                                onClick={() => handleAprobar(item.id_requerimiento_detalle)}
                                                            >
                                                                <CheckCircleIcon className="w-4 h-4" />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label="Rechazar" position="top" withArrow>
                                                            <ActionIcon
                                                                variant="light"
                                                                color="red"
                                                                onClick={() => {
                                                                    setSelectedItemId(item.id_requerimiento_detalle);
                                                                    openRechazo();
                                                                }}
                                                            >
                                                                <XCircleIcon className="w-4 h-4" />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </>
                                                )}

                                                {(item.estado === EstadoDetalleRequerimiento.AprobacionLogistica || item.estado === EstadoDetalleRequerimiento.DespachoIniciado) && (
                                                    <Tooltip label="Registrar Entrega" position="top" withArrow>
                                                        <ActionIcon
                                                            variant="filled"
                                                            color="indigo"
                                                            onClick={() => {
                                                                setSelectedItemId(item.id_requerimiento_detalle);
                                                                setSelectedIdProducto(item.id_producto);
                                                                setSelectedItemName(item.producto);
                                                                setSelectedItemSolicitado(item.cantidad_solicitada || 0);
                                                                setSelectedItemAtendido(item.cantidad_atendida || 0);
                                                                setSelectedItemStock(item.stock_disponible || 0);
                                                                openEntrega();
                                                            }}
                                                            className="shadow-lg shadow-indigo-900/20"
                                                        >
                                                            <TruckIcon className="w-4 h-4 text-white" />
                                                        </ActionIcon>
                                                    </Tooltip>
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

            {progresoGeneral < 100 && (
                <Group justify="end" mt="md" px={4}>
                    <Button
                        variant="light"
                        color="red"
                        onClick={async () => {
                            if (confirm("¿Estás seguro de que deseas forzar la finalización de esta atención? Quedarán items sin despachar.")) {
                                handleFinalizar();
                            }
                        }}
                        leftSection={<FlagIcon className="w-4 h-4" />}
                    >
                        Forzar Cierre de Atención
                    </Button>
                </Group>
            )}

            {/* Modal de Trazabilidad */}
            <ModalRegistro
                opened={openedTrace}
                close={closeTrace}
                title="Seguimiento del requerimiento"
                size="md"
            >
                {selectedItemId && (
                    <TrazabilidadRequerimiento
                        idDetalle={selectedItemId}
                        productoNombre={selectedItemName}
                    />
                )}
            </ModalRegistro>

            {/* Modal de Rechazo */}
            <Modal
                opened={openedRechazo}
                onClose={closeRechazo}
                title="Rechazar ítem del requerimiento"
                centered
                radius="lg"
                classNames={{
                    content: "bg-zinc-950 border border-zinc-800",
                    header: "bg-zinc-950 border-b border-zinc-800 text-white",
                    title: "font-bold text-lg"
                }}
            >
                <Stack gap="md">
                    <div className="p-4 bg-red-500/10 border border-red-900/50 rounded-xl flex items-start gap-4">
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mt-1" />
                        <Text size="sm" className="text-red-100 italic">
                            Esta acción marcará el producto como rechazado y no podrá ser entregado.
                        </Text>
                    </div>
                    <Textarea
                        label="Motivo del rechazo"
                        placeholder="Escriba aquí el motivo detallado..."
                        minRows={4}
                        value={rechazoMotivo}
                        onChange={(e) => setRechazoMotivo(e.currentTarget.value)}
                        radius="md"
                        classNames={{
                            input: "bg-zinc-900 border-zinc-800 focus:border-red-500 transition-colors text-white",
                            label: "text-zinc-500 font-bold mb-1"
                        }}
                    />
                    <Group justify="end" mt="lg">
                        <Button variant="subtle" color="zinc" onClick={closeRechazo}>Cancelar</Button>
                        <Button
                            color="red"
                            radius="md"
                            disabled={!rechazoMotivo.trim()}
                            onClick={handleRechazar}
                        >
                            Confirmar Rechazo
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Modal de Entrega */}
            <ModalRegistro
                opened={openedEntrega}
                close={closeEntrega}
                title="Entrega de Producto"
                size="70%"
            >
                {selectedItemId && (
                    <RegistrarEntrega
                        idRequerimiento={idRequerimiento}
                        idRequerimientoDetalle={selectedItemId}
                        idProducto={selectedIdProducto || 0}
                        idAlmacen={idAlmacen}
                        productoNombre={selectedItemName}
                        cantidadSolicitada={selectedItemSolicitado}
                        cantidadAtendida={selectedItemAtendido}
                        onSuccess={() => {
                            closeEntrega();
                            loadData();
                            onSuccess();
                        }}
                        onCancel={closeEntrega}
                    />
                )}
            </ModalRegistro>
        </Stack >
    );
};
