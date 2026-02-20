import { ActionIcon, Badge, Button, Group, Text, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PlusIcon, PencilSquareIcon, UserCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";

// Components
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";
import { RegistroLaborMina } from "./components/registro-labor-mina";
import { AsignarResponsableLabor } from "./components/asignar-responsable-labor"; // Ajuste path si necesario

// Services
import { useLabores } from "../../../../services/empresas/labores/useLabores";
import type { RES_Labor } from "../../../../services/empresas/labores/dtos/responses";

interface GestionLaboresProps {
    idMina: number;
    nombreMina: string;
}

const PAGE_SIZE = 10;

export const GestionLabores = ({ idMina, nombreMina }: GestionLaboresProps) => {
    // Data
    const [labores, setLabores] = useState<RES_Labor[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState("");
    const [page, setPage] = useState(1);
    const [busqueda, setBusqueda] = useState("");

    // Selected Labor for assigning responsible
    const [selectedLabor, setSelectedLabor] = useState<RES_Labor | null>(null);

    // Modals
    const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    const [openedResponsable, { open: openResponsable, close: closeResponsable }] = useDisclosure(false);

    // Hooks
    const { listar } = useLabores({ setError });

    // Load Data
    const cargarLabores = async () => {
        setLoading(true);
        // @ts-ignore
        const data = await listar({ id_mina: idMina });
        if (data) setLabores(data);
        else setLabores([]);
        setLoading(false);
    };

    useEffect(() => {
        cargarLabores();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idMina]);

    // Filters
    const filteredRecords = useMemo(() => {
        const term = busqueda.toLowerCase().trim();
        if (!term) return labores;
        return labores.filter(l =>
            l.nombre.toLowerCase().includes(term) ||
            l.codigo_correlativo?.toLowerCase().includes(term) ||
            l.empresa?.toLowerCase().includes(term) ||
            l.responsable_actual?.toLowerCase().includes(term)
        );
    }, [labores, busqueda]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * PAGE_SIZE;
        return filteredRecords.slice(from, from + PAGE_SIZE);
    }, [filteredRecords, page]);

    // Handlers
    const handleSuccessCreate = (nuevaLabor: RES_Labor) => {
        closeCreate();
        setLabores((prev) => [nuevaLabor, ...prev]);
    };

    const handleOpenResponsable = (labor: RES_Labor) => {
        setSelectedLabor(labor);
        openResponsable();
    };

    const handleSuccessAssignment = () => {
        cargarLabores();
        closeResponsable();
    };

    // Columns
    const columns: DataTableColumn<RES_Labor>[] = [
        {
            accessor: "index",
            title: "#",
            textAlign: "center",
            width: 50,
            render: (_record, index) => ((page - 1) * PAGE_SIZE) + index + 1
        },
        {
            accessor: "nombre",
            title: "Labor",
            width: 200,
            render: (record) => (
                <div className="flex flex-col">
                    <Text size="sm" fw={600} className="text-zinc-200">
                        {record.nombre}
                    </Text>
                    <Text size="xs" c="dimmed" className="font-mono">
                        {record.codigo_correlativo}
                    </Text>
                </div>
            )
        },
        {
            accessor: "tipo_labor_nombre",
            title: "Tipo",
            width: 160,
            render: (record) => (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" color="cyan" size="sm">
                        {record.tipo_labor_nombre}
                    </Badge>
                    {(record.is_produccion === 1 || record.is_produccion === true) && (
                        <Badge color="pink" size="xs" variant="light" title="Labor de Producción">
                            Producción
                        </Badge>
                    )}
                </div>
            )
        },
        {
            accessor: "empresa",
            title: "Empresa",
            width: 180,
            render: (record) => (
                <Text size="sm" className="text-zinc-400">
                    {record.empresa || "Sin asignar"}
                </Text>
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
                        onClick={() => handleOpenResponsable(record)}
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
        }
    ];

    return (
        <div className="space-y-5">
            {/* Header Moderno con Badges */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-4 border-b border-zinc-800 pb-4">
                <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Labores Asignadas</h3>
                    <p className="text-zinc-500 text-sm">{nombreMina}</p>
                </div>

                <div className="flex w-full sm:w-auto items-center gap-3">
                    <TextInput
                        placeholder="Buscar labor..."
                        leftSection={<MagnifyingGlassIcon className="w-3.5 h-3.5 text-zinc-500" />}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.currentTarget.value)}
                        className="flex-1 sm:w-64"
                        radius="md"
                        size="sm"
                        classNames={{
                            input: "bg-zinc-900 border-zinc-800 focus:border-indigo-500/50 text-white placeholder:text-zinc-600"
                        }}
                    />
                    <Button
                        size="sm"
                        variant="light"
                        color="indigo"
                        leftSection={<PlusIcon className="w-4 h-4" />}
                        onClick={openCreate}
                        radius="md"
                        className="hover:bg-indigo-900/30 transition-colors shrink-0"
                    >
                        Nueva Labor
                    </Button>
                </div>
            </div>

            {/* Tabla */}
            <DataTableClassic
                idAccessor="id_labor"
                columns={columns}
                records={paginatedRecords}
                totalRecords={filteredRecords.length}
                page={page}
                onPageChange={setPage}
                loading={loading}
            />

            {/* Modal Registro Labor */}
            <ModalRegistro opened={openedCreate} close={closeCreate} title="Nueva Labor">
                <RegistroLaborMina
                    idMina={idMina}
                    onSuccess={handleSuccessCreate}
                    onCancel={closeCreate}
                />
            </ModalRegistro>

            {/* Modal Asignar Responsable */}
            <ModalRegistro opened={openedResponsable} close={closeResponsable} title="Gestión de Responsables">
                {selectedLabor && (
                    <AsignarResponsableLabor
                        idLabor={selectedLabor.id_labor}
                        idEmpresa={selectedLabor.id_empresa}
                        nombreLabor={selectedLabor.nombre}
                        onSuccess={handleSuccessAssignment}
                    />
                )}
            </ModalRegistro>
        </div>
    );
};
