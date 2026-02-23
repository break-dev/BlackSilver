import { ActionIcon, Badge, Button, Group, Menu, TextInput, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    EllipsisVerticalIcon,
    BuildingStorefrontIcon,
    UserCircleIcon,
    RectangleStackIcon
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";

// Components
import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";
import { RegistroAlmacen } from "./components/registro-almacen";
import { GestionResponsables } from "./components/gestion-responsables";
import { AsignarMinaAlmacen } from "./components/asignar-mina-almacen";

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
    // Removed filtroEmpresa since new logic does not filter by initial company strongly here, but we can keep search.

    // Hooks
    const { listar } = useAlmacenes({ setError });

    // Load Data
    const cargarDatos = async () => {
        setLoading(true);
        setError("");

        // @ts-ignore
        const data = await listar(); // Listar all

        if (data) setAlmacenes(data);
        else setAlmacenes([]);

        setLoading(false);
    };

    // Initial Load & Create Title
    useEffect(() => {
        setTitle("Almacenes de Abastecimiento");
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Derived Filters (Local Search)
    const filteredRecords = useMemo(() => {
        return almacenes.filter((alm) => {
            const matchSearch = !busqueda ||
                alm.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
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
        setAlmacenes((prev) => [nuevoAlmacen, ...prev]);
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
        // Removed Code Column
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
                            <Badge size="xs" variant="light" color="pink">Principal</Badge>
                        )}
                    </div>
                </Group>
            )
        },
        {
            accessor: "minas_count",
            title: "Minas",
            width: 130,
            textAlign: 'center',
            render: (record) => (
                <Group gap={6} justify="center">
                    <Badge variant="light" color="cyan" size="sm" radius="sm">
                        {record.minas_count || 0} Minas
                    </Badge>

                    <Tooltip label="Ver Minas">
                        <ActionIcon
                            variant="subtle"
                            color="cyan"
                            size="sm"
                            onClick={() => handleOpenAlcance(record)}
                        >
                            <RectangleStackIcon className="w-4 h-4" />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            )
        },
        {
            accessor: "responsable_actual",
            title: "Responsable",
            width: 200,
            render: (record) => (
                <Group gap="xs">
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
        },
        {
            accessor: "actions",
            title: "",
            width: 80,
            textAlign: "right",
            render: () => (
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
            {/* Header / Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-end sm:items-center">
                <div className="flex gap-4 flex-1 w-full sm:w-auto">
                    <TextInput
                        placeholder="Buscar por nombre o responsable..."
                        leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.currentTarget.value)}
                        className="flex-1 min-w-[200px]"
                        radius="lg"
                        classNames={{
                            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500"
                        }}
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

            {/* Table */}
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
                        nombreAlmacen={selectedAlmacen.nombre}
                    />
                )}
            </ModalRegistro>

            {/* Modal: Gestionar Alcance */}
            <ModalRegistro
                opened={openedAlcance}
                close={closeAlcance}
                title="Gestión de Minas"
            >
                {selectedAlmacen && (
                    <AsignarMinaAlmacen
                        idAlmacen={selectedAlmacen.id_almacen}
                        nombreAlmacen={selectedAlmacen.nombre}
                    />
                )}
            </ModalRegistro>
        </div>
    );
};

export default AlmacenesPage;
