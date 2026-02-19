import { Badge, Text, TextInput, Select } from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import { ArrowDownIcon, ArrowUpIcon, CubeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";

import { useKardex } from "../../../../services/inventario/kardex/useKardex";
import type { RES_MovimientoKardex } from "../../../../services/inventario/kardex/dtos/responses";

import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { SelectAlmacen } from "../../../utils/select-almacen";

const PAGE_SIZE = 20;

export const KardexPage = () => {
    const setTitle = UIStore((state) => state.setTitle);

    // Estado del Filtro Principal
    const [idAlmacen, setIdAlmacen] = useState<string | null>(null);

    // Estados de Filtros Locales
    const [busqueda, setBusqueda] = useState("");
    const [filtroProducto, setFiltroProducto] = useState<string | null>(null);
    const [filtroLote, setFiltroLote] = useState<string | null>(null);

    // Estado de Datos
    const [movimientos, setMovimientos] = useState<RES_MovimientoKardex[]>([]);

    // Estado de UI
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    // Hooks
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const { listarPorAlmacen } = useKardex({ setError: () => { } });

    // Title
    useEffect(() => {
        setTitle("Kardex");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cargar Movimientos al cambiar Almacén
    useEffect(() => {
        const loadMovimientos = async () => {
            setMovimientos([]);
            setPage(1);
            setFiltroProducto(null);
            setFiltroLote(null);
            setBusqueda("");

            if (!idAlmacen) return;

            setLoading(true);
            const data = await listarPorAlmacen(Number(idAlmacen));
            if (data) setMovimientos(data);
            setLoading(false);
        };
        loadMovimientos();
    }, [idAlmacen]);

    // Opciones de Filtros Dinámicos
    const productosUnicos = useMemo(() => {
        const unique = new Set(movimientos.map(m => m.producto).filter(Boolean));
        return Array.from(unique).sort().map(p => ({ value: String(p), label: String(p) }));
    }, [movimientos]);

    const lotesUnicos = useMemo(() => {
        // Filtrar lote según producto seleccionado
        const source = filtroProducto
            ? movimientos.filter(m => m.producto === filtroProducto)
            : movimientos;

        const unique = new Set(source.map(m => m.codigo_lote).filter(Boolean));
        return Array.from(unique).sort().map(l => ({ value: String(l), label: String(l) }));
    }, [movimientos, filtroProducto]);

    // Filtros Locales
    const filteredRecords = useMemo(() => {
        return movimientos.filter((m) => {
            const matchProducto = !filtroProducto || m.producto === filtroProducto;
            const matchLote = !filtroLote || m.codigo_lote === filtroLote;

            const q = busqueda.toLowerCase();
            const matchBusqueda = !busqueda ||
                m.codigo_movimiento.toLowerCase().includes(q) ||
                (m.glosa || "").toLowerCase().includes(q) ||
                (m.producto || "").toLowerCase().includes(q) ||
                (m.codigo_lote || "").toLowerCase().includes(q);

            return matchProducto && matchLote && matchBusqueda;
        });
    }, [movimientos, busqueda, filtroProducto, filtroLote]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * PAGE_SIZE;
        return filteredRecords.slice(from, from + PAGE_SIZE);
    }, [filteredRecords, page]);

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
            accessor: "producto",
            title: "Producto",
            width: 200,
            render: (record) => (
                <div className="flex flex-col">
                    <Text size="sm" fw={600} className="text-white">{record.producto || "-"}</Text>
                    {record.codigo_lote && <Text size="xs" c="dimmed" className="font-mono">{record.codigo_lote}</Text>}
                </div>
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
            title: "Saldo",
            textAlign: "right",
            width: 120,
            render: (record) => (
                <Text fw={600} className="text-zinc-200">{record.cantidad_resultante}</Text>
            )
        },
        {
            accessor: "glosa",
            title: "Ref.",
            width: 150,
            render: (record) => (
                <Text size="xs" className="text-zinc-400 italic truncate" title={record.glosa}>
                    {record.glosa || "-"}
                </Text>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Filtros y Acciones */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 w-full">

                    {/* 1. Almacén (Filtro Principal) */}
                    <div className="w-full sm:w-64">
                        <SelectAlmacen
                            label={null}
                            placeholder="Almacén"
                            value={idAlmacen}
                            onChange={(val) => {
                                setIdAlmacen(val);
                                setFiltroProducto(null);
                                setFiltroLote(null);
                                setBusqueda("");
                            }}
                            className="w-full"
                        />
                    </div>

                    {/* 2. Buscador Textual (Siempre visible) */}
                    <TextInput
                        placeholder="Buscar movimiento, glosa..."
                        leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />}
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.currentTarget.value);
                            setPage(1);
                        }}
                        disabled={!idAlmacen}
                        className="flex-1 min-w-[200px]"
                        radius="lg"
                        classNames={{
                            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500"
                        }}
                    />

                    {/* 3. Filtros Dinámicos (Producto y Lote) */}
                    {movimientos.length > 0 && (
                        <>
                            <Select
                                placeholder="Producto"
                                data={productosUnicos}
                                value={filtroProducto}
                                onChange={(val) => {
                                    setFiltroProducto(val);
                                    setFiltroLote(null);
                                    setPage(1);
                                }}
                                searchable
                                clearable
                                className="w-full sm:w-48"
                                radius="lg"
                                classNames={{
                                    input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
                                    dropdown: "bg-zinc-900 border-zinc-800",
                                    option: "text-zinc-300 hover:bg-zinc-800"
                                }}
                            />
                            <Select
                                placeholder="Lote"
                                data={lotesUnicos}
                                value={filtroLote}
                                onChange={(val) => {
                                    setFiltroLote(val);
                                    setPage(1);
                                }}
                                searchable
                                clearable
                                disabled={!filtroProducto && lotesUnicos.length > 50}
                                className="w-full sm:w-40"
                                radius="lg"
                                classNames={{
                                    input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
                                    dropdown: "bg-zinc-900 border-zinc-800",
                                    option: "text-zinc-300 hover:bg-zinc-800"
                                }}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Tabla o Estado Vacío */}
            {!idAlmacen ? (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <CubeIcon className="w-16 h-16 text-zinc-700 mb-4" />
                    <Text className="text-zinc-500 font-medium text-lg">Seleccione un Almacén</Text>
                    <Text className="text-zinc-600 text-sm">Se mostrará la bitácora completa de movimientos.</Text>
                </div>
            ) : (
                <DataTableClassic
                    idAccessor="id_kardex"
                    columns={columns}
                    records={paginatedRecords}
                    totalRecords={filteredRecords.length}
                    page={page}
                    onPageChange={setPage}
                    loading={loading}
                />
            )}
        </div>
    );
};
