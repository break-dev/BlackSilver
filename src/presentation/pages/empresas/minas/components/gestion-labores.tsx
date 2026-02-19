import { ActionIcon, Badge, Button, Group, Menu, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PlusIcon, PencilSquareIcon, TrashIcon, EllipsisVerticalIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";

// Components
import { UIStore } from "../../../../../stores/ui.store";
import { DataTableClassic } from "../../../../utils/datatable-classic";
import { ModalRegistro } from "../../../../utils/modal-registro";
import { RegistroLaborMina } from "./registro-labor-mina";
import { AsignarResponsableLabor } from "./asignar-responsable-labor";

// Services
import { useLabores } from "../../../../../services/empresas/labores/useLabores";
import type { RES_Labor } from "../../../../../services/empresas/labores/dtos/responses";

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
        // Reload list to update responsible column (could be optimized)
        cargarLabores();
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
            width: 120,
            render: (record) => (
                <Badge variant="outline" color="cyan" size="sm">
                    {record.tipo_labor_nombre}
                </Badge>
            )
        },
        {
            accessor: "empresa",
            title: "Empresa Ejecutora",
            width: 180,
            render: (record) => (
                <Text size="sm" className="text-zinc-400">
                    {record.empresa}
                </Text>
            )
        },
        {
            accessor: "tipo_sostenimiento",
            title: "Sostenimiento",
            width: 120,
            render: (record) => (
                <Text size="xs" className="text-zinc-500 italic">
                    {record.tipo_sostenimiento}
                </Text>
            )
        },
        {
            accessor: "responsable",
            title: "Responsable",
            width: 150,
            render: (record) => (
                <Group gap={4} wrap="nowrap">
                    {record.responsable_actual ? (
                        <>
                            <UserCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                            <Text size="xs" className="text-zinc-300 truncate max-w-[100px]" title={record.responsable_actual}>
                                {record.responsable_actual}
                            </Text>
                        </>
                    ) : (
                        <span className="text-zinc-600 text-xs italic">Sin asignar</span>
                    )}

                    <Tooltip label="Gestionar Responsables">
                        <ActionIcon variant="subtle" size="xs" color="indigo" onClick={() => handleOpenResponsable(record)}>
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Text className="text-zinc-400 text-sm">
                    Listado de labores para <span className="text-zinc-200 font-semibold">{nombreMina}</span>
                </Text>
                <Button
                    size="xs"
                    leftSection={<PlusIcon className="w-4 h-4" />}
                    onClick={openCreate}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                >
                    Nueva Labor
                </Button>
            </div>

            <DataTableClassic
                idAccessor="id_labor"
                columns={columns}
                records={labores.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
                totalRecords={labores.length}
                page={page}
                onPageChange={setPage}
                loading={loading}
                minHeight={300}
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
                        nombreLabor={selectedLabor.nombre}
                        onSuccess={handleSuccessAssignment}
                    />
                )}
            </ModalRegistro>
        </div>
    );
};
