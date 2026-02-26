import { Button, Group, Loader, NumberInput, Paper, Stack, Table, Text, Badge, ActionIcon, Tooltip, Textarea } from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import {
    CalendarIcon,
    BarsArrowDownIcon,
    ClipboardDocumentCheckIcon,
    InformationCircleIcon,
    ClockIcon,
    PrinterIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

import { useEntregas } from "../../../../../services/requerimientos_almacen/atenciones/useEntregas";
import type { RES_LoteDisponible } from "../../../../../services/requerimientos_almacen/atenciones/dtos/responses";
import type { RES_HistorialEntrega } from "../../../../../services/requerimientos_almacen/requerimientos/dtos/responses";

interface RegistrarEntregaProps {
    idRequerimiento: number;
    idRequerimientoDetalle: number;
    idProducto: number;
    idAlmacen: number;
    productoNombre: string;
    cantidadSolicitada: number;
    cantidadAtendida: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export const RegistrarEntrega = ({
    idRequerimiento,
    idRequerimientoDetalle,
    idProducto,
    idAlmacen,
    productoNombre,
    cantidadSolicitada,
    cantidadAtendida,
    onSuccess,
    onCancel
}: RegistrarEntregaProps) => {
    const [loading, setLoading] = useState(true);
    const [lotes, setLotes] = useState<RES_LoteDisponible[]>([]);
    const [historial, setHistorial] = useState<RES_HistorialEntrega[]>([]);
    const [entregaCantidades, setEntregaCantidades] = useState<Record<number, number>>({});
    const [observacion, setObservacion] = useState("");
    const [error, setError] = useState("");

    const { obtenerLotesDisponibles, registrarEntrega, obtenerHistorialEntregas } = useEntregas({ setError });

    const pendiente = Math.max(0, cantidadSolicitada - cantidadAtendida);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [resLotes, resHistorial] = await Promise.all([
                    obtenerLotesDisponibles(idProducto, idAlmacen),
                    obtenerHistorialEntregas(idRequerimientoDetalle)
                ]);
                setLotes(resLotes || []);
                setHistorial(resHistorial || []);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [idRequerimientoDetalle, idAlmacen, idProducto]);

    const totalEntrega = useMemo(() => {
        return Object.values(entregaCantidades).reduce((sum, val) => sum + (val || 0), 0);
    }, [entregaCantidades]);

    const handleConfirmar = async () => {
        if (totalEntrega > pendiente) {
            setError(`No se puede entregar más de lo pendiente (${pendiente.toFixed(2)})`);
            return;
        }

        const detalles = Object.entries(entregaCantidades)
            .filter(([_, cant]) => cant > 0)
            .map(([idLote, cant]) => ({
                id_requerimiento_almacen_detalle: idRequerimientoDetalle,
                id_lote: Number(idLote),
                cantidad: cant
            }));

        if (detalles.length === 0) return;

        const ok = await registrarEntrega({
            id_requerimiento: idRequerimiento,
            fecha_entrega: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            observacion,
            detalles
        });

        if (ok) onSuccess();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader color="indigo" size="lg" />
            </div>
        );
    }

    return (
        <Stack gap="xl">
            {/* Header: Resumen del Producto (Premium Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Paper p="md" radius="lg" className="bg-zinc-900/40 border border-zinc-800 flex flex-col justify-center gap-1">
                    <Text size="xs" c="zinc.5" fw={800} className="uppercase tracking-widest">Producto</Text>
                    <Text size="md" fw={900} className="text-white truncate">{productoNombre}</Text>
                </Paper>
                <Paper p="md" radius="lg" className="bg-zinc-900/40 border border-zinc-800 flex flex-col justify-center gap-1">
                    <Text size="xs" c="emerald.5" fw={800} className="uppercase tracking-widest">Total Despachar</Text>
                    <Text size="md" fw={900} className="text-emerald-400 font-mono">{totalEntrega.toFixed(2)}</Text>
                </Paper>
                <Paper p="md" radius="lg" className="bg-zinc-900/40 border border-zinc-800 flex flex-col justify-center gap-1">
                    <Text size="xs" c="indigo.5" fw={800} className="uppercase tracking-widest">Solicitado</Text>
                    <Text size="md" fw={900} className="text-indigo-400 font-mono">{Number(cantidadSolicitada).toFixed(2)}</Text>
                </Paper>
                <Paper p="md" radius="lg" className="bg-zinc-900/40 border border-zinc-800 flex flex-col justify-center gap-1">
                    <Text size="xs" c="amber.5" fw={800} className="uppercase tracking-widest">Pendiente</Text>
                    <Text size="md" fw={900} className="text-amber-400 font-mono">{pendiente.toFixed(2)}</Text>
                </Paper>
            </div>

            {/* Formulario Superior */}
            <div className="mb-2">
                <Textarea
                    label="Observación"
                    placeholder="Puede dejar un comentario opcional sobre esta entrega..."
                    value={observacion}
                    onChange={(e) => setObservacion(e.currentTarget.value)}
                    radius="md"
                    minRows={2}
                    classNames={{
                        input: "bg-zinc-900 border-zinc-800 focus:border-indigo-500 text-white transition-colors",
                        label: "text-zinc-500 font-bold mb-1 ml-1 text-xs"
                    }}
                />
            </div>

            {/* Aviso de Atención */}
            <Paper p="sm" radius="md" className="bg-indigo-900/10 border border-indigo-900/30 shadow-sm shadow-indigo-900/10">
                <Group gap="sm" wrap="nowrap" align="start">
                    <div className="p-2 rounded-lg bg-indigo-500/20">
                        <InformationCircleIcon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <Stack gap={2}>
                        <Text size="sm" fw={800} className="text-indigo-200">¡Atención!</Text>
                        <Text size="xs" className="text-indigo-200/70 italic leading-snug">
                            Aquí se mostrarán los lotes disponibles para la entrega del producto, además de las entregas que ya se realizaron.
                        </Text>
                    </Stack>
                </Group>
            </Paper>

            <div className="space-y-8">
                {/* Lotes Disponibles */}
                <div className="space-y-4">
                    <Group gap="xs" px={4}>
                        <BarsArrowDownIcon className="w-4 h-4 text-indigo-400" />
                        <Text fw={800} size="sm" className="text-zinc-100 italic">Lotes Disponibles para Entrega</Text>
                    </Group>

                    <div className="overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950/20">
                        <Table verticalSpacing="md" horizontalSpacing="xl">
                            <thead className="bg-zinc-900/80 text-zinc-400 text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left">Lote / Vencimiento</th>
                                    <th className="px-6 py-4 text-right">Stock Lote</th>
                                    <th className="px-6 py-4 text-center w-36">Cant. a Despachar</th>
                                    <th className="px-6 py-4 text-right">Nuevo Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {lotes.map((lote) => {
                                    const cantDespacho = Number(entregaCantidades[lote.id_lote] || 0);
                                    const stockActual = Number(lote.stock_actual || 0);
                                    const nuevoSaldo = stockActual - cantDespacho;
                                    const diasVence = lote.dias_para_vencer ?? 999;

                                    let vencimientoColor = "zinc.5";
                                    let vencimientoIconColor = "text-zinc-500";
                                    if (diasVence <= 0) {
                                        vencimientoColor = "red.5";
                                        vencimientoIconColor = "text-red-500";
                                    } else if (diasVence < 7) {
                                        vencimientoColor = "amber.5";
                                        vencimientoIconColor = "text-amber-500";
                                    }

                                    return (
                                        <tr key={lote.id_lote} className="hover:bg-zinc-900/40 transition-colors group">
                                            <td className="px-6 py-4">
                                                <Stack gap={2}>
                                                    <Text size="sm" fw={800} className="text-zinc-100">{lote.codigo_lote}</Text>
                                                    <Group gap={4}>
                                                        <CalendarIcon className={`w-3 h-3 ${vencimientoIconColor}`} />
                                                        <Text size="10px" fw={700} c={vencimientoColor}>
                                                            Vence: {lote.fecha_vencimiento ? dayjs(lote.fecha_vencimiento).format("DD/MM/YYYY") : "No vence"}
                                                            {diasVence < 7 && ` (${diasVence <= 0 ? 'Vencido' : `${diasVence} días`})`}
                                                        </Text>
                                                    </Group>
                                                </Stack>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Text size="sm" fw={800} className="text-zinc-100 font-mono">{stockActual.toFixed(2)}</Text>
                                            </td>
                                            <td className="px-6 py-4">
                                                <NumberInput
                                                    size="xs"
                                                    radius="md"
                                                    min={0}
                                                    max={stockActual}
                                                    decimalScale={2}
                                                    value={cantDespacho}
                                                    onChange={(val) => setEntregaCantidades(prev => ({
                                                        ...prev,
                                                        [lote.id_lote]: Number(val) || 0
                                                    }))}
                                                    classNames={{
                                                        input: "bg-zinc-900 border-zinc-800 focus:border-indigo-500 text-white text-center font-bold"
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Text size="sm" fw={800} className="text-indigo-400 font-mono">{nuevoSaldo.toFixed(2)}</Text>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                </div>

                {/* Historial de Entregas */}
                <div className="space-y-4">
                    <Group gap="xs" px={4}>
                        <ClockIcon className="w-4 h-4 text-emerald-400" />
                        <Text fw={800} size="sm" className="text-zinc-100 italic">Entregas Realizadas</Text>
                    </Group>

                    <div className="overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950/20 max-h-[400px] overflow-y-auto">
                        <Table verticalSpacing="md" horizontalSpacing="xl">
                            <thead className="bg-zinc-900/80 text-zinc-400 text-xs font-bold tracking-wider sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-4 text-center w-12">#</th>
                                    <th className="px-6 py-4 text-left">Código</th>
                                    <th className="px-6 py-4 text-left">Fecha de Entrega</th>
                                    <th className="px-6 py-4 text-center">Responsable de Almacén</th>
                                    <th className="px-6 py-4 text-right">Cantidad</th>
                                    <th className="px-6 py-4 text-center w-24">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {historial.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-zinc-600 italic text-xs">
                                            No hay entregas previas registradas
                                        </td>
                                    </tr>
                                ) : (
                                    historial.map((h, idx) => (
                                        <tr key={h.id_entrega} className="hover:bg-zinc-900/40 transition-colors group">
                                            <td className="px-6 py-4 text-center text-xs font-mono text-zinc-500">
                                                {idx + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="light" color="indigo" radius="sm">{h.codigo_entrega}</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Text size="sm" fw={700} c="zinc.4">{dayjs(h.fecha_entrega).format("DD/MM/YYYY HH:mm")}</Text>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Text size="sm" c="zinc.3" fw={700}>{h.usuario_entrega}</Text>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Text size="md" c="emerald.4" fw={900} className="font-mono">{Number(h.cantidad).toFixed(2)}</Text>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Tooltip label="Imprimir Comprobante" position="top" withArrow>
                                                    <ActionIcon variant="light" color="zinc" onClick={() => { }} className="hover:bg-indigo-500/20 hover:text-indigo-400 mx-auto transition-colors">
                                                        <PrinterIcon className="w-4 h-4" />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Footer: Acciones y Validación */}
            <Stack gap="sm">
                {pendiente > 0 && totalEntrega > pendiente && (
                    <Text c="red.4" size="xs" fw={700} className="text-center bg-red-500/10 p-2 rounded-lg border border-red-900/20 uppercase tracking-tighter">
                        ¡Error! La cantidad total ({totalEntrega.toFixed(2)}) supera el pendiente ({pendiente.toFixed(2)})
                    </Text>
                )}

                <div className="flex justify-end items-center bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 shadow-inner">
                    <Group gap="sm">
                        <Button variant="subtle" color="zinc" radius="xl" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button
                            size="md"
                            radius="xl"
                            color="indigo"
                            leftSection={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
                            disabled={totalEntrega <= 0 || totalEntrega > pendiente}
                            onClick={handleConfirmar}
                            className="px-8 shadow-xl shadow-indigo-900/30"
                        >
                            Confirmar Entrega
                        </Button>
                    </Group>
                </div>
            </Stack>

            {error && <Text c="red" size="xs" className="text-center italic">{error}</Text>}
        </Stack>
    );
};
