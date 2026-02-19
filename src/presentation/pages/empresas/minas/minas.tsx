import { ActionIcon, Badge, Button, Group, Menu, TextInput, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    EllipsisVerticalIcon,
    MapPinIcon,
    BriefcaseIcon,
    RectangleStackIcon
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";

// Components
import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";
import { RegistroMina } from "./components/registro-mina";
import { GestionLabores } from "./components/gestion-labores";
import { GestionEmpresasMina } from "./components/gestion-empresas-mina";

// Services
import { useMinas } from "../../../../services/empresas/minas/useMinas";
import type { RES_Mina } from "../../../../services/empresas/minas/dtos/responses";

const PAGE_SIZE = 20;

export const MinasPage = () => {
    const setTitle = UIStore((state) => state.setTitle);

    // Modals
    const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);

    // Gestión Labores Modal
    const [openedLabores, { open: openLabores, close: closeLabores }] = useDisclosure(false);

    // Gestión Empresas Modal
    const [openedEmpresas, { open: openEmpresas, close: closeEmpresas }] = useDisclosure(false);

    const [selectedMina, setSelectedMina] = useState<RES_Mina | null>(null);

    // Data
    const [minas, setMinas] = useState<RES_Mina[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState("");
    const [page, setPage] = useState(1);

    // Filter States
    const [busqueda, setBusqueda] = useState("");

    // Hooks
    const { listar } = useMinas({ setError });

    // Load Data
    const cargarDatos = async () => {
        setLoading(true);
        // @ts-ignore
        const data = await listar();
        if (data) setMinas(data);
        setLoading(false);
    };

    // Initial Load
    useEffect(() => {
        setTitle("Gestión de Unidades Mineras");
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Derived Filters
    const filteredRecords = useMemo(() => {
        return minas.filter((m) => {
            const term = busqueda.toLowerCase();
            return !busqueda ||
                m.nombre.toLowerCase().includes(term) ||
                (m.concesion || "").toLowerCase().includes(term);
        });
    }, [minas, busqueda]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * PAGE_SIZE;
        return filteredRecords.slice(from, from + PAGE_SIZE);
    }, [filteredRecords, page]);

    // Handlers
    const handleSuccessCreate = (nuevaMina: RES_Mina) => {
        closeCreate();
        setMinas((prev) => [nuevaMina, ...prev]);
        // Opcional: Abrir modal de empresas inmediatamente
        // setSelectedMina(nuevaMina);
        // openEmpresas();
    };

    const handleOpenLabores = (mina: RES_Mina) => {
        setSelectedMina(mina);
        openLabores();
    };

    const handleOpenEmpresas = (mina: RES_Mina) => {
        setSelectedMina(mina);
        openEmpresas();
    };

    // Columns
    const columns: DataTableColumn<RES_Mina>[] = [
        {
            accessor: "index",
            title: "#",
            textAlign: "center",
            width: 50,
            render: (_, index) => ((page - 1) * PAGE_SIZE) + index + 1
        },
        {
            accessor: "nombre",
            title: "Unidad Minera",
            width: 250,
            render: (record) => (
                <div className="flex flex-col">
                    <Text size="sm" fw={600} className="text-white">
                        {record.nombre}
                    </Text>
                    <div className="flex items-center gap-1 text-zinc-500 text-xs mt-0.5">
                        <MapPinIcon className="w-3 h-3" />
                        <span>{record.concesion || "Sin Concesión"}</span>
                    </div>
                </div>
            )
        },
        {
            accessor: "labores_count",
            title: "Labores",
            width: 120,
            textAlign: "center",
            render: (record) => (
                <Group gap={4} justify="center">
                    <Badge variant="light" color="cyan" size="sm" radius="sm">
                        {record.labores_count || 0}
                    </Badge>
                    <Tooltip label="Ver Labores">
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="cyan"
                            onClick={() => handleOpenLabores(record)}
                        >
                            <RectangleStackIcon className="w-4 h-4" />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            )
        },
        {
            accessor: "empresas_count",
            title: "Empresas",
            width: 120,
            textAlign: "center",
            render: (record) => (
                <Group gap={4} justify="center">
                    <Badge variant="light" color="indigo" size="sm" radius="sm">
                        {record.empresas_count || 0}
                    </Badge>
                    <Tooltip label="Gestionar Empresas">
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="indigo"
                            onClick={() => handleOpenEmpresas(record)}
                        >
                            <BriefcaseIcon className="w-4 h-4" />
                        </ActionIcon>
                    </Tooltip>
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
            render: (_record) => (
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
            {/* Cabecera y Filtros */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-end sm:items-center">
                <div className="flex gap-4 flex-1 w-full sm:w-auto">
                    <TextInput
                        placeholder="Buscar por nombre o concesión..."
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
                    Nueva Mina
                </Button>
            </div>

            {/* Tabla */}
            <DataTableClassic
                idAccessor="id_mina"
                columns={columns}
                records={paginatedRecords}
                totalRecords={filteredRecords.length}
                page={page}
                onPageChange={setPage}
                loading={loading}
            />

            {/* Modal: Crear Mina */}
            <ModalRegistro opened={openedCreate} close={closeCreate} title="Nueva Unidad Minera">
                <RegistroMina
                    onSuccess={handleSuccessCreate}
                    onCancel={closeCreate}
                />
            </ModalRegistro>

            {/* Modal: Gestión de Labores */}
            <ModalRegistro
                opened={openedLabores}
                close={closeLabores}
                title={`Labores: ${selectedMina ? selectedMina.nombre : ''}`}
                size="xl"
            >
                {selectedMina ? (
                    <GestionLabores
                        idMina={selectedMina.id_mina}
                        nombreMina={selectedMina.nombre}
                    />
                ) : null}
            </ModalRegistro>

            {/* Modal: Gestión de Empresas */}
            <ModalRegistro
                opened={openedEmpresas}
                close={closeEmpresas}
                title={`Empresas: ${selectedMina ? selectedMina.nombre : ''}`}
            >
                {selectedMina ? (
                    <GestionEmpresasMina
                        idMina={selectedMina.id_mina}
                        idConcesion={selectedMina.id_concesion} // Required for filtering valid contracts
                        nombreMina={selectedMina.nombre}
                    />
                ) : null}
            </ModalRegistro>
        </div>
    );
};

export default MinasPage;
