import { Badge, Group, Stack, Text, TextInput, ActionIcon, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState, useMemo } from "react";
import { MagnifyingGlassIcon, UserCircleIcon, MapPinIcon, CalendarDaysIcon, PlayCircleIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { type DataTableColumn } from "mantine-datatable";

import { useEntregas } from "../../../../services/requerimientos_almacen/atenciones/useEntregas";
import type { RES_RequerimientoAtencionPendiente } from "../../../../services/requerimientos_almacen/atenciones/dtos/responses";
import { Premura } from "../../../../shared/enums";
import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";
import { SelectAlmacen } from "../../../utils/select-almacen";
import { GestionAtencion } from "./components/gestion-atencion";

const PAGE_SIZE = 15;

export const AtencionesPage = () => {
    const setTitle = UIStore((state) => state.setTitle);

    const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
    const [data, setData] = useState<RES_RequerimientoAtencionPendiente[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const [openedGestion, { open: openGestion, close: closeGestion }] = useDisclosure(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { obtenerAtencionesPendientes } = useEntregas({ setError });

    useEffect(() => {
        setTitle("Atención de Requerimientos");
    }, []);

    const loadData = async () => {
        if (!idAlmacen) return;
        setLoading(true);
        try {
            const res = await obtenerAtencionesPendientes(Number(idAlmacen));
            setData(res || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [idAlmacen]);

    const filteredRecords = useMemo(() => {
        const q = busqueda.toLowerCase().trim();
        if (!q) return data;
        return data.filter(item =>
            item.codigo_requerimiento.toLowerCase().includes(q) ||
            item.solicitante.toLowerCase().includes(q) ||
            item.mina.toLowerCase().includes(q)
        );
    }, [data, busqueda]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * PAGE_SIZE;
        return filteredRecords.slice(from, from + PAGE_SIZE);
    }, [filteredRecords, page]);

    const columns: DataTableColumn<RES_RequerimientoAtencionPendiente>[] = useMemo(() => [
        {
            accessor: "index",
            title: "#",
            textAlign: "center",
            width: 60,
            render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
        {
            accessor: "codigo_requerimiento",
            title: "Código",
            width: 140,
            render: (item) => (
                <Badge variant="light" color="indigo" radius="sm">
                    {item.codigo_requerimiento}
                </Badge>
            ),
        },
        {
            accessor: "solicitante",
            title: "Solicitante",
            width: 180,
            render: (item) => (
                <Group gap="xs" wrap="nowrap">
                    <UserCircleIcon className="w-5 h-5 text-emerald-500" />
                    <Text size="sm" className="text-zinc-200">{item.solicitante}</Text>
                </Group>
            ),
        },
        {
            accessor: "mina",
            title: "Mina Destino",
            width: 180,
            render: (item) => (
                <Group gap="xs" wrap="nowrap">
                    <MapPinIcon className="w-5 h-5 text-zinc-500 shrink-0" />
                    <Text size="sm" className="text-zinc-200">{item.mina}</Text>
                </Group>
            ),
        },
        {
            accessor: "fechas",
            title: "Programación",
            width: 180,
            render: (item) => {
                const fechaReq = item.fecha_entrega_requerida && dayjs(item.fecha_entrega_requerida).isValid()
                    ? dayjs(item.fecha_entrega_requerida).format("DD/MM/YYYY")
                    : "No especificada";

                return (
                    <Stack gap={2}>
                        <Group gap={6}>
                            <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
                            <Text size="xs" fw={600} className="text-zinc-200">
                                Entrega: {fechaReq}
                            </Text>
                        </Group>
                        <Text size="10px" c="zinc.5" ml={22}>
                            Creado: {dayjs(item.created_at).format("DD/MM/YYYY HH:mm")}
                        </Text>
                    </Stack>
                );
            },
        },
        {
            accessor: "premura",
            title: "Prioridad",
            width: 120,
            render: (item) => {
                const colors = {
                    [Premura.Normal]: "cyan",
                    [Premura.Urgente]: "orange",
                    [Premura.Emergencia]: "red",
                };
                const color = colors[item.premura as Premura] || "gray";
                return <Badge color={color} variant="light" size="sm" className="uppercase">{item.premura}</Badge>;
            },
        },
        {
            accessor: "acciones",
            title: "Acciones",
            textAlign: "center",
            width: 80,
            render: (item) => (
                <Tooltip label="Gestionar Atención" position="top" withArrow>
                    <ActionIcon
                        variant="filled"
                        color="indigo"
                        radius="md"
                        onClick={() => {
                            setSelectedId(item.id_requerimiento);
                            openGestion();
                        }}
                        className="shadow-md hover:scale-105 transition-transform"
                    >
                        <PlayCircleIcon className="w-5 h-5 text-white" />
                    </ActionIcon>
                </Tooltip>
            ),
        },
    ], [page]);

    return (
        <div className="space-y-6 animate-fade-in text-zinc-100">
            <div className="flex flex-col lg:flex-row justify-between gap-4 items-end lg:items-center">
                <div className="flex flex-wrap gap-4 flex-1 w-full lg:w-auto">
                    <div className="w-full sm:w-72">
                        <SelectAlmacen
                            label={null}
                            placeholder="Seleccione Almacén a Atender"
                            value={idAlmacen}
                            onChange={(val) => setIdAlmacen(val)}
                        />
                    </div>

                    <TextInput
                        placeholder="Buscar por código, solicitante o mina..."
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
                </div>
            </div>

            {!idAlmacen ? (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
                    <div className="p-4 rounded-full bg-zinc-900/50 mb-4">
                        <CheckBadgeIcon className="w-12 h-12 text-zinc-600" />
                    </div>
                    <Text size="lg" fw={600} className="text-zinc-400">Panel de Gestión de Almacén</Text>
                    <Text className="text-zinc-500 text-center max-w-sm mt-1">
                        Seleccione el almacén que desea gestionar para visualizar las solicitudes pendientes de atención.
                    </Text>
                </div>
            ) : (
                <DataTableClassic
                    idAccessor="id_requerimiento"
                    columns={columns}
                    records={paginatedRecords}
                    totalRecords={filteredRecords.length}
                    page={page}
                    onPageChange={setPage}
                    loading={loading}
                />
            )}

            <ModalRegistro
                opened={openedGestion}
                close={closeGestion}
                title="Atender Solicitud de Materiales"
                size="95%"
            >
                {selectedId && (
                    <GestionAtencion
                        idRequerimiento={selectedId}
                        idAlmacen={Number(idAlmacen)}
                        onSuccess={() => {
                            closeGestion();
                            loadData();
                        }}
                    />
                )}
            </ModalRegistro>

            {error && <Text c="red" size="sm" mt="md">{error}</Text>}
        </div>
    );
};
