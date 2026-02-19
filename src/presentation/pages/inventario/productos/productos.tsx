import { Badge, Button, Group, Select, TextInput, Text, Chip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon, PlusIcon, CubeIcon, ExclamationTriangleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";

import { useProductos } from "../../../../services/inventario/productos/useProductos";
import { useCategoria } from "../../../../services/inventario/categorias/useCategoria";
import type { RES_Producto } from "../../../../services/inventario/productos/dtos/responses";

import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";
import { RegistroProducto } from "./components/registro-producto";

const PAGE_SIZE = 20;

export const InventarioProductos = () => {
    const setTitle = UIStore((state) => state.setTitle);

    // Estado de Datos
    const [productos, setProductos] = useState<RES_Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);

    // Estado de Filtros
    const [busqueda, setBusqueda] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
    const [verFiscalizados, setVerFiscalizados] = useState(false);
    const [verPerecibles, setVerPerecibles] = useState(false);

    // Datos de Contexto
    const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([]);

    // Modal
    const [opened, { open, close }] = useDisclosure(false);

    // Hooks
    const { listar } = useProductos({ setError });
    const { listar: listarCategorias } = useCategoria({ setError });

    // Cargar Datos
    const cargarProductos = async () => {
        setLoading(true);
        const data = await listar();
        if (data) setProductos(data);
        setLoading(false);
    };

    const cargarCategorias = async () => {
        const data = await listarCategorias();
        if (data) {
            setCategorias(data.map(c => ({ value: String(c.id_categoria), label: c.nombre })));
        }
    };

    useEffect(() => {
        setTitle("Catálogo de Productos");
        Promise.all([cargarProductos(), cargarCategorias()]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredRecords = useMemo(() => {
        return productos.filter((prod) => {
            const term = busqueda.toLowerCase();
            const matchNombre = prod.nombre.toLowerCase().includes(term);
            const matchCategoria = !filtroCategoria || String(prod.id_categoria) === filtroCategoria;

            // Si el chip esta activo, SOLO mostramos los que son true.
            // Si esta inactivo, mostramos todos (no filtramos).
            const matchFiscalizado = !verFiscalizados || prod.es_fiscalizado;
            const matchPerecible = !verPerecibles || prod.es_perecible;

            return matchNombre && matchCategoria && matchFiscalizado && matchPerecible;
        });
    }, [productos, busqueda, filtroCategoria, verFiscalizados, verPerecibles]);

    // Paginación
    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        return filteredRecords.slice(from, to);
    }, [filteredRecords, page]);

    // Columnas
    const columns: DataTableColumn<RES_Producto>[] = [
        {
            accessor: "index",
            title: "#",
            textAlign: "center",
            width: 60,
            render: (_record, index) => ((page - 1) * PAGE_SIZE) + index + 1
        },
        {
            accessor: "nombre",
            title: "Producto",
            width: 250,
            render: (record) => (
                <Group gap="xs">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <CubeIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <Text size="sm" fw={600} className="text-white">{record.nombre}</Text>
                        <Text size="xs" c="dimmed">{record.categoria}</Text>
                    </div>
                </Group>
            )
        },
        {
            accessor: "categoria",
            title: "Categoría",
            width: 150,
            render: (record) => (
                <Text size="sm" className="text-zinc-300 font-medium">{record.categoria}</Text>
            )
        },
        {
            accessor: "indicadores",
            title: "Indicadores",
            width: 200,
            render: (record) => (
                <Group gap={6}>
                    {record.es_fiscalizado && (
                        <Badge
                            leftSection={<ExclamationTriangleIcon className="w-3 h-3" />}
                            color="red"
                            variant="light"
                        >
                            Fiscalizado
                        </Badge>
                    )}
                    {record.es_perecible && (
                        <Badge
                            leftSection={<ClockIcon className="w-3 h-3" />}
                            color="orange"
                            variant="light"
                        >
                            Perecible
                        </Badge>
                    )}
                    {!record.es_fiscalizado && !record.es_perecible && (
                        <Text size="xs" c="dimmed">-</Text>
                    )}
                </Group>
            )
        },
        {
            accessor: "estado",
            title: "Estado",
            textAlign: "center",
            width: 100,
            render: (record) => (
                <Badge
                    color={record.estado === "Activo" ? "green" : "red"}
                    variant="light"
                    size="sm"
                >
                    {record.estado}
                </Badge>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Cabecera y Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-4 flex-1">
                    <TextInput
                        placeholder="Buscar producto..."
                        leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />}
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.currentTarget.value);
                            setPage(1);
                        }}
                        className="flex-1 min-w-[200px]"
                        radius="lg"
                        classNames={{
                            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500"
                        }}
                    />

                    <Select
                        placeholder="Categoría"
                        data={categorias}
                        value={filtroCategoria}
                        onChange={(val) => {
                            setFiltroCategoria(val);
                            setPage(1);
                        }}
                        clearable
                        searchable
                        radius="lg"
                        classNames={{
                            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500 min-w-[140px]",
                            dropdown: "bg-zinc-900 border-zinc-800",
                            option: "hover:bg-zinc-800 text-zinc-300",
                        }}
                    />

                    <Group gap="xs">
                        <Chip
                            checked={verFiscalizados}
                            onChange={setVerFiscalizados}
                            color="red"
                            variant="light"
                        >
                            Fiscalizados
                        </Chip>
                        <Chip
                            checked={verPerecibles}
                            onChange={setVerPerecibles}
                            color="orange"
                            variant="light"
                        >
                            Perecibles
                        </Chip>
                    </Group>
                </div>

                <Button
                    leftSection={<PlusIcon className="w-5 h-5" />}
                    onClick={open}
                    radius="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shrink-0"
                >
                    Nuevo Producto
                </Button>
            </div>

            {/* Tabla */}
            <DataTableClassic
                idAccessor="id"
                columns={columns}
                records={paginatedRecords}
                totalRecords={filteredRecords.length}
                page={page}
                onPageChange={setPage}
                loading={loading}
            />

            {error && <Text c="red" size="sm">{error}</Text>}

            {/* Modal de Registro */}
            <ModalRegistro
                opened={opened}
                close={close}
                title="Nuevo Producto"
            >
                <RegistroProducto
                    onSuccess={(nuevoProducto) => {
                        close();
                        setProductos(prev => [nuevoProducto, ...prev]);
                    }}
                    onCancel={close}
                />
            </ModalRegistro>
        </div>
    );
};
