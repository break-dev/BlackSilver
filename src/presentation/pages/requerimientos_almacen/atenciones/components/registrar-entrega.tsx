import { Button, Group, Loader, NumberInput, Paper, Stack, Table, Text, Textarea } from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import {
    CalendarIcon,
    CheckCircleIcon,
    CubeIcon,
    ExclamationCircleIcon,
    BarsArrowDownIcon
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

import { useEntregas } from "../../../../../services/requerimientos_almacen/atenciones/useEntregas";
import type { RES_LoteDisponible } from "../../../../../services/requerimientos_almacen/atenciones/dtos/responses";

interface RegistrarEntregaProps {
    idRequerimiento: number;
    idRequerimientoDetalle: number;
    idProducto: number;
    idAlmacen: number;
    productoNombre: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const RegistrarEntrega = ({
    idRequerimiento,
    idRequerimientoDetalle,
    idProducto,
    idAlmacen,
    productoNombre,
    onSuccess,
    onCancel
}: RegistrarEntregaProps) => {
    const [loading, setLoading] = useState(true);
    const [lotes, setLotes] = useState<RES_LoteDisponible[]>([]);
    const [entregaCantidades, setEntregaCantidades] = useState<Record<number, number>>({});
    const [observacion, setObservacion] = useState("");
    const [error, setError] = useState("");

    const { obtenerLotesDisponibles, registrarEntrega } = useEntregas({ setError });

    useEffect(() => {
        const loadLotes = async () => {
            setLoading(true);
            try {
                const res = await obtenerLotesDisponibles(idProducto, idAlmacen);
                // Nota: Según el endpoint 4 enviamos id_producto, pero como tenemos el detalle podemos sacarlo o el back lo resuelve por id_requerimiento_detalle
                // Lo enviamos como 0 y que el back use el de la sesión o el del detalle si lo ajustamos.
                // En el mundo real, aquí sacaríamos el id_producto del objeto 'detalle' anterior.
                // Para efectos de este componente, asumiremos que el back usa lo necesario de la sesión o enviamos el id_producto si lo tuviéramos.
                setLotes(res || []);
            } finally {
                setLoading(false);
            }
        };
        loadLotes();
    }, [idRequerimientoDetalle, idAlmacen]);

    const totalEntrega = useMemo(() => {
        return Object.values(entregaCantidades).reduce((sum, val) => sum + (val || 0), 0);
    }, [entregaCantidades]);

    const handleConfirmar = async () => {
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
            {/* Resumen del Producto */}
            <Paper p="lg" radius="lg" bg="zinc.9/30" className="border border-zinc-800">
                <Group justify="space-between" align="start">
                    <Stack gap={4}>
                        <Group gap="xs">
                            <CubeIcon className="w-5 h-5 text-indigo-400" />
                            <Text size="sm" c="zinc.5" fw={700} className="uppercase tracking-widest">Producto a Entregar</Text>
                        </Group>
                        <Text size="xl" fw={900} className="text-white tracking-tight">{productoNombre}</Text>
                    </Stack>
                    <div className="text-right">
                        <Text size="xs" c="zinc.5" fw={700} className="uppercase mb-1">Total a Despachar</Text>
                        <Text size="2xl" fw={900} className={totalEntrega > 0 ? "text-emerald-400" : "text-zinc-600"}>
                            {totalEntrega.toFixed(2)}
                        </Text>
                    </div>
                </Group>
            </Paper>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Panel de Lotes */}
                <div className="lg:col-span-8 space-y-4">
                    <Group gap="xs" px={4}>
                        <BarsArrowDownIcon className="w-5 h-5 text-indigo-400" />
                        <Text fw={800} className="text-zinc-100 italic text-lg">Lotes Disponibles para Entrega</Text>
                    </Group>

                    <div className="overflow-hidden border border-zinc-800 rounded-2xl bg-zinc-950/20">
                        <Table verticalSpacing="sm" horizontalSpacing="md">
                            <thead className="bg-zinc-900/80 text-zinc-500 text-xs font-bold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Lote / Vencimiento</th>
                                    <th className="px-4 py-3 text-right">Stock Lote</th>
                                    <th className="px-4 py-3 text-center w-32">Cant. Despachar</th>
                                    <th className="px-4 py-3 text-right">Nuevo Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {lotes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center text-zinc-600 italic">
                                            No hay lotes con stock disponible en este almacén.
                                        </td>
                                    </tr>
                                ) : (
                                    lotes.map((lote) => {
                                        const cantDespacho = Number(entregaCantidades[lote.id_lote] || 0);
                                        const stockActual = Number(lote.stock_actual || 0);
                                        const nuevoSaldo = stockActual - cantDespacho;

                                        return (
                                            <tr key={lote.id_lote} className="hover:bg-zinc-900/30 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <Stack gap={2}>
                                                        <Text size="sm" fw={700} className="text-zinc-100">{lote.codigo_lote}</Text>
                                                        <Group gap={4}>
                                                            <CalendarIcon className="w-3 h-3 text-zinc-500" />
                                                            <Text size="10px" c={lote.dias_para_vencer && lote.dias_para_vencer < 0 ? "red.4" : "zinc.5"}>
                                                                Vence: {lote.fecha_vencimiento ? dayjs(lote.fecha_vencimiento).format("DD/MM/YYYY") : "No vence"}
                                                            </Text>
                                                        </Group>
                                                    </Stack>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Text size="sm" fw={800} className="text-zinc-300">{Number(lote.stock_actual || 0).toFixed(2)}</Text>
                                                    <Text size="10px" c="zinc.5" className="uppercase">{lote.unidad_medida}</Text>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <NumberInput
                                                        size="xs"
                                                        radius="md"
                                                        min={0}
                                                        max={lote.stock_actual}
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
                                                <td className="px-4 py-3 text-right">
                                                    <Text size="sm" fw={800} c={nuevoSaldo === 0 ? "amber.5" : "zinc.4"}>
                                                        {nuevoSaldo.toFixed(2)}
                                                    </Text>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>

                {/* Panel lateral: Observaciones y Confirmación */}
                <div className="lg:col-span-4 space-y-4">
                    <Stack gap="md" className="h-full">
                        <Textarea
                            label="Observaciones de la Entrega"
                            placeholder="Ej: Se entrega a cuadrilla B, guía de salida #..."
                            minRows={6}
                            value={observacion}
                            onChange={(e) => setObservacion(e.currentTarget.value)}
                            radius="xl"
                            classNames={{
                                input: "bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 transition-colors text-white text-sm",
                                label: "text-zinc-500 font-bold mb-1 ml-2 text-xs uppercase"
                            }}
                        />

                        <Paper p="md" radius="xl" bg="amber.9/10" className="border border-amber-900/30">
                            <Group gap="xs" wrap="nowrap" align="start">
                                <ExclamationCircleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <Text size="xs" className="text-amber-100 italic leading-relaxed">
                                    Al confirmar, se descontará el stock de los lotes seleccionados y se registrará el movimiento en el Kardex.
                                </Text>
                            </Group>
                        </Paper>

                        <div className="flex-1" />

                        <Stack gap="xs">
                            <Button
                                fullWidth
                                size="lg"
                                radius="xl"
                                color="indigo"
                                leftSection={<CheckCircleIcon className="w-6 h-6" />}
                                disabled={totalEntrega <= 0}
                                onClick={handleConfirmar}
                                className="shadow-2xl shadow-indigo-900/40 border-0"
                            >
                                Confirmar Entrega
                            </Button>
                            <Button
                                fullWidth
                                variant="subtle"
                                color="zinc"
                                onClick={onCancel}
                            >
                                Cancelar
                            </Button>
                        </Stack>
                    </Stack>
                </div>
            </div>

            {error && <Text c="red" size="sm" className="text-center bg-red-500/10 p-2 rounded-lg border border-red-900/30 font-medium">{error}</Text>}
        </Stack>
    );
};
