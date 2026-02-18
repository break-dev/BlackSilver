import { Badge, Button, Group, Text, TextInput, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState, useMemo } from "react";
import { PlusIcon, CubeIcon, ClockIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import dayjs from "dayjs";

import { useLote } from "../../../../services/inventario/lote/useLote";
import type { RES_Lote } from "../../../../services/inventario/lote/dtos/responses";

import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";
import { RegistroLote } from "./components/registro-lote";
import { SelectAlmacen } from "../../../utils/select-almacen";

const PAGE_SIZE = 20;

export const LotesPage = () => {
    const setTitle = UIStore((state) => state.setTitle);

    // Data State
    const [lotes, setLotes] = useState<RES_Lote[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    // Filters
    const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
    const [filtroProducto, setFiltroProducto] = useState<string | null>(null);

    // Modals
    const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);

    // Hooks
    const { listarPorAlmacen } = useLote({ setError: () => { } });

    // Title
    useEffect(() => {
        setTitle("Gestión de Lotes");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load Lotes when Almacen changes
    useEffect(() => {
        const loadLotes = async () => {
            setLotes([]);
            setPage(1);
            setBusqueda("");
            setFiltroCategoria(null);
            setFiltroProducto(null);

            if (!idAlmacen) return;

            setLoading(true);
            const data = await listarPorAlmacen(Number(idAlmacen));
            if (data) setLotes(data);
            setLoading(false);
        };
        loadLotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idAlmacen]);


    // Derived Filters
    const categoriasUnicas = useMemo(() => {
        const unique = new Set(lotes.map(l => l.categoria).filter(Boolean));
        return Array.from(unique).sort().map(c => ({ value: String(c), label: String(c) }));
    }, [lotes]);

    const productosUnicos = useMemo(() => {
        const source = filtroCategoria
            ? lotes.filter(l => l.categoria === filtroCategoria)
            : lotes;
        const unique = new Set(source.map(l => l.producto).filter(Boolean));
        return Array.from(unique).sort().map(p => ({ value: String(p), label: String(p) }));
    }, [lotes, filtroCategoria]);

    const filteredRecords = useMemo(() => {
        return lotes.filter(l => {
            const matchCategoria = !filtroCategoria || l.categoria === filtroCategoria;
            const matchProducto = !filtroProducto || l.producto === filtroProducto;

            const q = busqueda.toLowerCase();
            const matchBusqueda = !busqueda ||
                l.producto.toLowerCase().includes(q) ||
                l.codigo_lote.toLowerCase().includes(q) ||
                (l.categoria || "").toLowerCase().includes(q);

            return matchCategoria && matchProducto && matchBusqueda;
        });
    }, [lotes, busqueda, filtroCategoria, filtroProducto]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * PAGE_SIZE;
        return filteredRecords.slice(from, from + PAGE_SIZE);
    }, [filteredRecords, page]);


    // Columns
    const columns: DataTableColumn<RES_Lote>[] = [
        {
            accessor: "index",
            title: "#",
            textAlign: "center",
            width: 60,
            render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
        {
            accessor: "codigo_lote",
            title: "Cód. Lote",
            width: 120,
            render: (record) => (
                <Badge variant="light" color="violet" radius="sm">
                    {record.codigo_lote}
                </Badge>
            )
        },
        {
            accessor: "producto",
            title: "Producto",
            // width removed to auto-expand
            render: (record) => (
                <Group gap="xs">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <CubeIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <Text size="sm" fw={600} className="text-white">{record.producto}</Text>
                        <Text size="xs" c="dimmed">{record.categoria}</Text>
                    </div>
                </Group>
            )
        },
        {
            accessor: "stock_actual",
            title: "Stock",
            textAlign: "right",
            width: 120,
            render: (record) => (
                <Text fw={700} c={record.stock_actual > 0 ? "green" : "red"}>
                    {record.stock_actual} {record.unidad_medida}
                </Text>
            )
        },
        {
            accessor: "fecha_vencimiento",
            title: "Vencimiento",
            width: 140,
            render: (record) => {
                if (!record.fecha_vencimiento) return <Text size="xs" c="dimmed">-</Text>;
                return (
                    <Group gap={4}>
                        <ClockIcon className="w-3 h-3 text-zinc-500" />
                        <Text size="sm" className="text-zinc-300">
                            {dayjs(record.fecha_vencimiento).format("DD/MM/YYYY")}
                        </Text>
                    </Group>
                );
            }
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Filter */}
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">

                <div className="flex flex-wrap gap-4 w-full xl:w-auto flex-1">
                    {/* 1. Almacén */}
                    <div className="w-full sm:w-64">
                        <SelectAlmacen
                            label={null}
                            placeholder="Almacén"
                            value={idAlmacen}
                            onChange={(val) => {
                                setIdAlmacen(val);
                            }}
                            className="w-full"
                        />
                    </div>

                    {/* 2. Buscador */}
                    <TextInput
                        placeholder="Buscar lote, producto..."
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

                    {/* 3. Filtros Dinámicos */}
                    {lotes.length > 0 && (
                        <>
                            <Select
                                placeholder="Categoría"
                                data={categoriasUnicas}
                                value={filtroCategoria}
                                onChange={(val) => {
                                    setFiltroCategoria(val);
                                    setFiltroProducto(null);
                                    setPage(1);
                                }}
                                searchable
                                clearable
                                className="w-full sm:w-40"
                                radius="lg"
                                classNames={{
                                    input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
                                    dropdown: "bg-zinc-900 border-zinc-800",
                                    option: "text-zinc-300 hover:bg-zinc-800"
                                }}
                            />
                            <Select
                                placeholder="Producto"
                                data={productosUnicos}
                                value={filtroProducto}
                                onChange={(val) => {
                                    setFiltroProducto(val);
                                    setPage(1);
                                }}
                                searchable
                                clearable
                                disabled={!filtroCategoria && productosUnicos.length > 50}
                                className="w-full sm:w-48"
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

                <Button
                    leftSection={<PlusIcon className="w-5 h-5" />}
                    onClick={openCreate}
                    disabled={!idAlmacen}
                    radius="lg"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 border-0 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                    Nuevo Lote
                </Button>
            </div>

            {/* Empty State or Table */}
            {!idAlmacen ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <CubeIcon className="w-12 h-12 text-zinc-600 mb-4" />
                    <Text className="text-zinc-400 font-medium">Seleccione un almacén para consultar sus lotes disponibles.</Text>
                </div>
            ) : (
                <DataTableClassic
                    idAccessor="id_lote"
                    columns={columns}
                    records={paginatedRecords}
                    totalRecords={filteredRecords.length}
                    page={page}
                    onPageChange={setPage}
                    loading={loading}
                />
            )}

            {/* Modal Create */}
            <ModalRegistro
                opened={openedCreate}
                close={closeCreate}
                title="Registro de Nuevo Lote"
            >
                <RegistroLote
                    initialAlmacenId={idAlmacen ? Number(idAlmacen) : null}
                    onSuccess={() => {
                        closeCreate();
                        // Reload current list if warehouse matches
                        if (idAlmacen) {
                            listarPorAlmacen(Number(idAlmacen)).then(data => data && setLotes(data));
                        }
                    }}
                    onCancel={closeCreate}
                />
            </ModalRegistro>
        </div>
    );
};
