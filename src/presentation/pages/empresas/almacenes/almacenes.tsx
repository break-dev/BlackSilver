import { ActionIcon, Badge, Button, Group, Menu, TextInput, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    EllipsisVerticalIcon,
    BuildingStorefrontIcon,
    UserCircleIcon,
    EyeIcon,
    ArchiveBoxIcon
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";

// Components
import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";
import { RegistroAlmacen } from "./components/registro-almacen";
import { SelectEmpresas } from "../../../utils/select-empresas";
import { GestionResponsables } from "./components/gestion-responsables";
import { GestionAlcance } from "./components/gestion-alcance";

// Services
import { useAlmacenes } from "../../../../services/empresas/almacenes/useAlmacenes";
import type { RES_Almacen } from "../../../../services/empresas/almacenes/dtos/responses";

const PAGE_SIZE = 20;

export const AlmacenesPage = () => {
    const setTitle = UIStore((state) => state.setTitle);

    // Modals
    const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    const [openedResponsables, { open: openResponsables, close: closeResponsables }] = useDisclosure(false);
    const [openedAlcance, { open: openAlcance, close: closeAlcance }] = useDisclosure(false);

    // Data
    const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState("");
    const [page, setPage] = useState(1);
    const [selectedAlmacen, setSelectedAlmacen] = useState<RES_Almacen | null>(null);

    // Filter States
    const [busqueda, setBusqueda] = useState("");
    const [filtroEmpresa, setFiltroEmpresa] = useState<string | null>(null);

    // Hooks
    const { listar } = useAlmacenes({ setError });

    // Load Data
    const cargarDatos = async () => {
        setLoading(true);
        setError("");

        // Backend now supports optional filter. If null, returns all.
        const filters = filtroEmpresa ? { id_empresa: Number(filtroEmpresa) } : undefined;

        // @ts-ignore
        const data = await listar(filters);

        if (data) setAlmacenes(data);
        else setAlmacenes([]);

        setLoading(false);
    };

    // Initial Load & Create Title
    useEffect(() => {
        setTitle("Gestión de Almacenes");
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reload when filter changes
    useEffect(() => {
        cargarDatos();
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroEmpresa]);

    // Derived Filters (Local Search)
    const filteredRecords = useMemo(() => {
        return almacenes.filter((alm) => {
            const matchSearch = !busqueda ||
                alm.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                (alm.codigo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
                (alm.responsable_actual || "").toLowerCase().includes(busqueda.toLowerCase());

            return matchSearch;
        });
    }, [almacenes, busqueda]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * PAGE_SIZE;
        return filteredRecords.slice(from, from + PAGE_SIZE);
    }, [filteredRecords, page]);

    // Handlers
    const handleSuccess = (nuevoAlmacen: RES_Almacen) => {
        closeCreate();
        if (!filtroEmpresa || String(nuevoAlmacen.id_empresa) === filtroEmpresa) {
            setAlmacenes((prev) => [nuevoAlmacen, ...prev]);
        }
    };

    const handleOpenResponsables = (record: RES_Almacen) => {
        setSelectedAlmacen(record);
        openResponsables();
    };

    const handleOpenAlcance = (record: RES_Almacen) => {
        setSelectedAlmacen(record);
        openAlcance();
    };

    const isPrincipal = (val: boolean | number) => val === true || val === 1;

    // Columns
    const columns: DataTableColumn<RES_Almacen>[] = [
        {
            accessor: "index",
            title: "#",
            textAlign: "center",
            width: 50,
            render: (_, index) => ((page - 1) * PAGE_SIZE) + index + 1
        },
        {
            accessor: "codigo",
            title: "Código",
            width: 100,
            render: (record) => (
                <Badge variant="light" color="violet" radius="sm" className="font-mono">
                    {record.codigo || "-"}
                </Badge>
            )
        },
        {
            accessor: "nombre",
            title: "Almacén",
            width: 250,
            render: (record) => (
                <Group gap="xs">
                    <BuildingStorefrontIcon className="w-5 h-5 text-zinc-500" />
                    <div>
                        <Text size="sm" fw={500} className="text-zinc-200">
                            {record.nombre}
                        </Text>
                        {isPrincipal(record.es_principal) && (
                            <Badge size="xs" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>Principal</Badge>
                        )}
                    </div>
                </Group>
            )
        },
        {
            accessor: "labores_count",
            title: "Labores",
            width: 140,
            textAlign: 'center',
            render: (record) => (
                <Group gap="xs" justify="center">
                    <Badge
                        leftSection={<ArchiveBoxIcon className="w-3 h-3" />}
                        color={record.labores_count > 0 ? "indigo" : "zinc"}
                        variant="light"
                        radius="sm"
                    >
                        {record.labores_count} Asign.
                    </Badge>

                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={() => handleOpenAlcance(record)}
                        title="Ver Alcance"
                    >
                        <EyeIcon className="w-4 h-4" />
                    </ActionIcon>
                </Group>
            )
        },
        {
            accessor: "responsable_actual",
            title: "Responsable",
            width: 200,
            render: (record) => (
                <Group gap="xs"> {/* Reduced gap and removed justify-between/ml-auto */}
                    {record.responsable_actual ? (
                        <>
                            <UserCircleIcon className="w-5 h-5 text-emerald-500" />
                            <Text size="sm" className="text-zinc-200">{record.responsable_actual}</Text>
                        </>
                    ) : (
                        <Badge variant="outline" color="gray" size="sm">
                            Sin Asignar
                        </Badge>
                    )}

                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={() => handleOpenResponsables(record)}
                        title="Gestionar Responsable"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </ActionIcon>
                </Group>
            )
        },
        {
            accessor: "actions",
            title: "",
            width: 80,
            textAlign: "right",
            render: (record) => (
                <Menu shadow="md" width={150} position="left">
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                            <EllipsisVerticalIcon className="w-5 h-5" />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown className="bg-zinc-900 border-zinc-800">
                        <Menu.Label className="text-zinc-500">Acciones</Menu.Label>
                        <Menu.Item
                            leftSection={<PencilSquareIcon className="w-4 h-4" />}
                            className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        >
                            Editar
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<TrashIcon className="w-4 h-4" />}
                            color="red"
                            className="hover:bg-red-900/20"
                        >
                            Eliminar
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Filters (Estilo Empleados) */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-end sm:items-center">
                <div className="flex gap-4 flex-1 w-full sm:w-auto">
                    <TextInput
                        placeholder="Buscar por nombre o código..."
                        leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.currentTarget.value)}
                        className="flex-1 min-w-[200px]"
                        radius="lg"
                        classNames={{
                            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500"
                        }}
                    />

                    <SelectEmpresas
                        label={null}
                        placeholder="Filtrar por Empresa"
                        value={filtroEmpresa}
                        onChange={setFiltroEmpresa}
                        clearable
                        className="w-full sm:w-64"
                    />
                </div>

                <Button
                    leftSection={<PlusIcon className="w-5 h-5" />}
                    onClick={openCreate}
                    radius="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
                >
                    Nuevo Almacén
                </Button>
            </div>

            {/* Table (Estilo Empleados Wrapper) */}
            <DataTableClassic
                idAccessor="id_almacen"
                columns={columns}
                records={paginatedRecords}
                totalRecords={filteredRecords.length}
                page={page}
                onPageChange={setPage}
                loading={loading}
            />

            {/* Modal: Crear Almacén */}
            <ModalRegistro opened={openedCreate} close={closeCreate} title="Nuevo Almacén">
                <RegistroAlmacen
                    onSuccess={handleSuccess}
                    onCancel={closeCreate}
                />
            </ModalRegistro>

            {/* Modal: Gestionar Responsables */}
            <ModalRegistro
                opened={openedResponsables}
                close={closeResponsables}
                title="Gestión de Responsables"
            >
                {selectedAlmacen && (
                    <GestionResponsables
                        idAlmacen={selectedAlmacen.id_almacen}
                        idEmpresa={selectedAlmacen.id_empresa}
                        nombreAlmacen={selectedAlmacen.nombre}
                    />
                )}
            </ModalRegistro>

            {/* Modal: Gestionar Alcance */}
            <ModalRegistro
                opened={openedAlcance}
                close={closeAlcance}
                title="Gestión de Labores"
            >
                {selectedAlmacen && (
                    <GestionAlcance
                        idAlmacen={selectedAlmacen.id_almacen}
                        nombreAlmacen={selectedAlmacen.nombre}
                    />
                )}
            </ModalRegistro>
        </div>
    );
};

export default AlmacenesPage;
