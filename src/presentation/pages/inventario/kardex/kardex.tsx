import { Badge, Select, Text, LoadingOverlay } from "@mantine/core";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ArrowDownIcon, ArrowUpIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";

import { useKardex } from "../../../../services/inventario/kardex/useKardex";
import { useLote } from "../../../../services/inventario/lote/useLote";
import type { RES_MovimientoKardex } from "../../../../services/inventario/kardex/dtos/responses";
import type { RES_Lote } from "../../../../services/inventario/lote/dtos/responses";

import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { SelectAlmacen } from "../../../utils/select-almacen";

const PAGE_SIZE = 20;

export const KardexPage = () => {
    const setTitle = UIStore((state) => state.setTitle);

    // Filter State
    const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
    const [idLote, setIdLote] = useState<string | null>(null);

    // Data State
    const [lotes, setLotes] = useState<RES_Lote[]>([]);
    const [movimientos, setMovimientos] = useState<RES_MovimientoKardex[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [loadingLotes, setLoadingLotes] = useState(false);
    const [page, setPage] = useState(1);

    // Hooks
    const { listarPorAlmacen } = useLote({ setError: () => { } });
    const { listarPorLote } = useKardex({ setError: () => { } });

    // Title
    useEffect(() => {
        setTitle("Kardex Físico y Valorado");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Cargar Lotes
    useEffect(() => {
        const loadLotes = async () => {
            setLotes([]);
            setIdLote(null);
            setMovimientos([]);

            if (!idAlmacen) return;

            setLoadingLotes(true);
            const data = await listarPorAlmacen(Number(idAlmacen));
            if (data) setLotes(data);
            setLoadingLotes(false);
        };
        loadLotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idAlmacen]);

    // 3. Cargar Movimientos
    useEffect(() => {
        const loadMovimientos = async () => {
            setMovimientos([]);
            if (!idLote) return;

            setLoading(true);
            const data = await listarPorLote(Number(idLote));
            if (data) setMovimientos(data);
            setLoading(false);
        };
        loadMovimientos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idLote]);


    // Columns
    const columns: DataTableColumn<RES_MovimientoKardex>[] = [
        {
            accessor: "index",
            title: "#",
            textAlign: "center",
            width: 60,
            render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
        {
            accessor: "created_at",
            title: "Fecha",
            width: 140,
            render: (record) => (
                <Text size="sm" className="text-zinc-300">
                    {dayjs(record.created_at).format("DD/MM/YYYY HH:mm")}
                </Text>
            )
        },
        {
            accessor: "tipo_movimiento",
            title: "Movimiento",
            width: 130,
            render: (record) => {
                const isIngreso = record.tipo_movimiento.toLowerCase().includes("ingreso");
                return (
                    <Badge
                        color={isIngreso ? "teal" : "orange"}
                        variant="light"
                        leftSection={isIngreso ? <ArrowDownIcon className="w-3 h-3" /> : <ArrowUpIcon className="w-3 h-3" />}
                    >
                        {record.tipo_movimiento}
                    </Badge>
                );
            }
        },
        {
            accessor: "codigo_movimiento",
            title: "Concepto",
            width: 160,
            render: (record) => (
                <Text size="sm" className="text-white font-medium">
                    {record.codigo_movimiento}
                </Text>
            )
        },
        {
            accessor: "cantidad_movimiento",
            title: "Cantidad",
            textAlign: "right",
            width: 120,
            render: (record) => {
                const isIngreso = record.tipo_movimiento.toLowerCase().includes("ingreso");
                return (
                    <Text fw={700} c={isIngreso ? "green" : "red"}>
                        {isIngreso ? "+" : "-"} {record.cantidad_movimiento}
                    </Text>
                );
            }
        },
        {
            accessor: "cantidad_resultante",
            title: "Saldo Final",
            textAlign: "right",
            width: 120,
            render: (record) => (
                <Text fw={600} className="text-zinc-200">{record.cantidad_resultante}</Text>
            )
        },
        {
            accessor: "glosa",
            title: "Referencia",
            render: (record) => (
                <Text size="xs" className="text-zinc-400 italic truncate" title={record.glosa}>
                    {record.glosa || "-"}
                </Text>
            )
        }
    ];

    const paginatedRecords = movimientos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="space-y-6">
            {/* Header Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* 1. Almacén */}
                <div className="flex-1 min-w-[250px]">
                    <SelectAlmacen
                        label="1. Almacén"
                        placeholder="Seleccione Almacén..."
                        value={idAlmacen}
                        onChange={(val) => {
                            setIdAlmacen(val);
                            setPage(1);
                        }}
                    />
                </div>

                {/* 2. Lote */}
                <div className="flex-[2] min-w-[300px] relative">
                    <LoadingOverlay visible={loadingLotes} zIndex={10} overlayProps={{ radius: "lg", blur: 1 }} loaderProps={{ size: 'xs' }} />
                    <Select
                        label="2. Producto / Lote"
                        placeholder={!idAlmacen ? "Primero seleccione almacén" : "Escriba para buscar producto..."}
                        disabled={!idAlmacen}
                        data={lotes.map(l => ({
                            value: String(l.id_lote),
                            label: `${l.producto} | ${l.codigo_lote} (Saldo: ${l.stock_actual})`
                        }))}
                        value={idLote}
                        onChange={(val) => {
                            setIdLote(val);
                            setPage(1);
                        }}
                        searchable
                        clearable
                        radius="lg"
                        size="sm"
                        classNames={{
                            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
                            dropdown: "bg-zinc-900 border-zinc-800",
                            option: "text-zinc-300 hover:bg-zinc-800",
                        }}
                        leftSection={<ListBulletIcon className="w-4 h-4 text-zinc-400" />}
                    />
                </div>
            </div>

            {/* Empty State or Table */}
            {!idLote ? (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <ListBulletIcon className="w-16 h-16 text-zinc-700 mb-4" />
                    <Text className="text-zinc-500 font-medium text-lg">Seleccione un Lote para ver su Kardex</Text>
                    <Text className="text-zinc-600 text-sm">El historial de movimientos aparecerá aquí.</Text>
                </div>
            ) : (
                <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 overflow-hidden">
                    <DataTableClassic
                        idAccessor="id"
                        columns={columns}
                        records={paginatedRecords}
                        totalRecords={movimientos.length}
                        page={page}
                        onPageChange={setPage}
                        loading={loading}
                    />
                </div>
            )}
        </div>
    );
};
