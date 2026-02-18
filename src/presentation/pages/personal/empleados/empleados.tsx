import { ActionIcon, Badge, Button, Group, Menu, TextInput, Avatar, Text, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    EllipsisVerticalIcon
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";

// Components
import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";
import { RegistroEmpleado } from "./components/registro-empleado";
import { SelectEmpresas } from "../../../utils/select-empresas";

// Services
import { useEmpleados } from "../../../../services/personal/useEmpleados";
import { useCargos } from "../../../../services/personal/useCargos";
import type { RES_Empleado, RES_Cargo } from "../../../../services/personal/dtos/responses";

const PAGE_SIZE = 20;

export const EmpleadosPage = () => {
    const setTitle = UIStore((state) => state.setTitle);
    const [opened, { open, close }] = useDisclosure(false);

    // Data
    const [empleados, setEmpleados] = useState<RES_Empleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState("");
    const [page, setPage] = useState(1);

    // Filter States
    const [busqueda, setBusqueda] = useState("");
    const [filtroEmpresa, setFiltroEmpresa] = useState<string | null>(null);
    const [filtroCargo, setFiltroCargo] = useState<string | null>(null);
    const [cargos, setCargos] = useState<RES_Cargo[]>([]);

    // Hooks
    const { listar, eliminar } = useEmpleados({ setError });
    const { listar: listarCargos } = useCargos({ setError });

    // Load Data
    const fetchData = async () => {
        setLoading(true);
        const [dataEmpleados, dataCargos] = await Promise.all([
            listar(),
            listarCargos()
        ]);
        if (dataEmpleados) setEmpleados(dataEmpleados);
        if (dataCargos) setCargos(dataCargos);
        setLoading(false);
    };

    useEffect(() => {
        setTitle("Personal / Empleados");
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Derived Filters
    const filteredRecords = useMemo(() => {
        return empleados.filter((emp) => {
            const matchSearch = !busqueda ||
                emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                emp.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
                emp.dni.includes(busqueda);

            const matchEmpresa = !filtroEmpresa || String(emp.id_empresa) === filtroEmpresa;
            const matchCargo = !filtroCargo || emp.cargo === filtroCargo;

            return matchSearch && matchEmpresa && matchCargo;
        });
    }, [empleados, busqueda, filtroEmpresa, filtroCargo]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * PAGE_SIZE;
        return filteredRecords.slice(from, from + PAGE_SIZE);
    }, [filteredRecords, page]);

    // Handlers
    const handleSuccess = () => {
        close();
        fetchData(); // Reload list
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (!confirm(`¿Eliminar al empleado ${nombre}?`)) return;

        const success = await eliminar(id);
        if (success) {
            notifications.show({ title: "Eliminado", message: "Empleado eliminado correctamente", color: "blue" });
            fetchData();
        }
    };

    // Columns
    const columns: DataTableColumn<RES_Empleado>[] = [
        {
            accessor: "id_empleado",
            title: "#",
            width: 60,
            textAlign: "center",
            render: (_, index) => ((page - 1) * PAGE_SIZE) + index + 1
        },
        {
            accessor: "nombre",
            title: "Empleado",
            width: 250,
            render: (record) => (
                <Group gap="sm">
                    <Avatar src={record.path_foto} radius="xl" color="indigo" size="sm">
                        {(record.nombre?.[0] || "").toUpperCase()}{(record.apellido?.[0] || "").toUpperCase()}
                    </Avatar>
                    <div>
                        <Text size="sm" fw={500} className="text-white">
                            {record.nombre} {record.apellido}
                        </Text>
                        <Text size="xs" c="dimmed">{record.dni}</Text>
                    </div>
                </Group>
            )
        },
        {
            accessor: "cargo",
            title: "Cargo",
            width: 150,
            render: (record) => <Badge variant="light" color="pink" size="sm" className="normal-case">{record.cargo}</Badge>
        },
        {
            accessor: "empresa",
            title: "Empresa",
            width: 200,
            render: (record) => <Text size="sm" className="text-zinc-300">{record.empresa}</Text>
        },
        {
            accessor: "estado",
            title: "Estado",
            textAlign: "center",
            width: 100,
            render: (record) => (
                <Badge color={record.estado === "Activo" ? "green" : "red"} variant="light" size="sm">
                    {record.estado}
                </Badge>
            )
        },
        {
            accessor: "actions",
            title: "",
            width: 80,
            textAlign: "right",
            render: (record) => (
                <Group gap={4} justify="flex-end">
                    <Menu shadow="md" width={150} position="left">
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray"><EllipsisVerticalIcon className="w-5 h-5" /></ActionIcon>
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
                                onClick={() => handleDelete(record.id_empleado, record.nombre)}
                            >
                                Eliminar
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-end sm:items-center">
                <div className="flex gap-4 flex-1 w-full sm:w-auto">
                    <TextInput
                        placeholder="Buscar por nombre o DNI..."
                        leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.currentTarget.value)}
                        className="flex-1 min-w-[200px]"
                        radius="lg"
                        classNames={{
                            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500"
                        }}
                    />
                    <Select
                        placeholder="Filtrar por Cargo"
                        data={cargos.map(c => ({ value: c.nombre, label: c.nombre }))}
                        value={filtroCargo}
                        onChange={setFiltroCargo}
                        clearable
                        searchable
                        className="w-full sm:w-48"
                        radius="lg"
                        classNames={{
                            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                            dropdown: "bg-zinc-900 border-zinc-800",
                            option: "text-zinc-300 hover:bg-zinc-800 hover:text-white"
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
                    onClick={open}
                    radius="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
                >
                    Nuevo Empleado
                </Button>
            </div>

            {/* Table */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden p-1">
                <DataTableClassic
                    columns={columns}
                    records={paginatedRecords}
                    totalRecords={filteredRecords.length}
                    page={page}
                    onPageChange={setPage}
                    loading={loading}
                    idAccessor="id_empleado"
                />
            </div>

            {/* Modal Registro */}
            <ModalRegistro opened={opened} close={close} title="Nuevo Empleado">
                <RegistroEmpleado onSuccess={handleSuccess} onCancel={close} />
            </ModalRegistro>
        </div>
    );
};
