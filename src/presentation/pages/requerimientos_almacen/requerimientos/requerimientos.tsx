import { Badge, Button, Stack, Text, TextInput, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState, useMemo } from "react";
import { PlusIcon, MagnifyingGlassIcon, CubeIcon, UserCircleIcon, MapPinIcon, CalendarDaysIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { type DataTableColumn } from "mantine-datatable";

import { useRequerimientos } from "../../../../services/requerimientos_almacen/requerimientos/useRequerimientos";
import type { RES_RequerimientoAlmacen } from "../../../../services/requerimientos_almacen/requerimientos/dtos/responses";
import { Premura, EstadoRequerimiento } from "../../../../shared/enums";
import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";
import { SelectMina } from "../../../utils/select-mina";
import { RegistroRequerimiento } from "./components/registro-requerimiento";

const PAGE_SIZE = 35;

export const RequerimientosPage = () => {
    // 1. Store Hook (Siempre primero si el módulo lo usa)
    const setTitle = UIStore((state) => state.setTitle);

    // 2. State Hooks
    const [data, setData] = useState<RES_RequerimientoAlmacen[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState("");
    const [idMina, setIdMina] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");

    // 3. UI Hooks
    const [opened, { open, close }] = useDisclosure(false);

    // 4. Servicio Hook
    const { listar } = useRequerimientos({ setError });

    // 5. Título (Efecto independiente)
    useEffect(() => {
        setTitle("Requerimientos de Almacén");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 6. Carga de datos (Siguiendo el flujo de Lotes/Categorías)
    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            if (!idMina) {
                setData([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await listar({ id_mina: Number(idMina) });
                if (!isCancelled && res) {
                    setData(res);
                }
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        load();

        return () => {
            isCancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idMina]);

    // 7. Filtrado Difererido
    const filteredRecords = useMemo(() => {
        const q = busqueda.toLowerCase().trim();
        const source = Array.isArray(data) ? data : [];
        if (!q) return source;

        return source.filter(item =>
            (item.codigo_requerimiento || "").toLowerCase().includes(q) ||
            (item.solicitante || "").toLowerCase().includes(q)
        );
    }, [data, busqueda]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * PAGE_SIZE;
        return filteredRecords.slice(from, from + PAGE_SIZE);
    }, [filteredRecords, page]);

    // 8. Columnas
    const columns: DataTableColumn<RES_RequerimientoAlmacen>[] = useMemo(() => [
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
                <Badge variant="light" color="violet" radius="sm">
                    {item.codigo_requerimiento}
                </Badge>
            ),
        },
        {
            accessor: "premura",
            title: "Prioridad",
            width: 130,
            render: (item) => {
                const colors = {
                    [Premura.Normal]: "cyan",
                    [Premura.Urgente]: "orange",
                    [Premura.Emergencia]: "red",
                };
                const color = (item.premura && colors[item.premura]) ? colors[item.premura] : "gray";
                return <Badge color={color} variant="light" radius="sm" size="sm" className="font-semibold uppercase tracking-wider">{item.premura}</Badge>;
            },
        },
        {
            accessor: "solicitante",
            title: "Solicitante",
            width: 200,
            render: (item) => (
                <Group gap="xs" wrap="nowrap">
                    <UserCircleIcon className="w-5 h-5 text-zinc-500 shrink-0" />
                    <Text size="sm" fw={500} className="text-zinc-100 truncate">
                        {item.solicitante}
                    </Text>
                </Group>
            ),
        },
        {
            accessor: "mina",
            title: "Origen",
            width: 180,
            render: (item) => (
                <Group gap="xs" wrap="nowrap">
                    <MapPinIcon className="w-5 h-5 text-zinc-500 shrink-0" />
                    <Stack gap={0}>
                        <Text size="sm" fw={500} className="text-zinc-100">{item.mina}</Text>
                        {item.labor && (
                            <Text size="xs" className="text-zinc-500 italic">
                                {item.labor}
                            </Text>
                        )}
                    </Stack>
                </Group>
            ),
        },
        {
            accessor: "almacen_destino",
            title: "Destino",
            width: 180,
            render: (item) => (
                <Group gap="xs" wrap="nowrap">
                    <BuildingStorefrontIcon className="w-5 h-5 text-zinc-500 shrink-0" />
                    <Text size="sm" fw={500} className="text-zinc-100 italic">
                        {item.almacen_destino}
                    </Text>
                </Group>
            ),
        },
        {
            accessor: "fecha_entrega_requerida",
            title: "Programación",
            width: 180,
            render: (item) => (
                <Group gap="xs" wrap="nowrap">
                    <CalendarDaysIcon className="w-5 h-5 text-zinc-500 shrink-0" />
                    <Stack gap={0}>
                        <Text size="sm" fw={600} className="text-zinc-200">
                            {dayjs(item.fecha_entrega_requerida).format("DD/MM/YYYY")}
                        </Text>
                        <Text size="xs" className="text-zinc-500">
                            Solicitado el {item.created_at ? dayjs(item.created_at).format("DD/MM/YYYY") : '-'}
                        </Text>
                    </Stack>
                </Group>
            ),
        },
        {
            accessor: "estado",
            title: "Estado",
            width: 130,
            render: (item) => {
                const colors = {
                    [EstadoRequerimiento.Generada]: "green",
                    [EstadoRequerimiento.Pendiente]: "blue",
                    [EstadoRequerimiento.Aprobado]: "green",
                    [EstadoRequerimiento.Atendido]: "violet",
                    [EstadoRequerimiento.Rechazado]: "red",
                    [EstadoRequerimiento.Anulado]: "dark",
                };
                const color = (item.estado && colors[item.estado]) ? colors[item.estado] : "gray";
                return <Badge color={color} variant="light" radius="sm" size="sm" className="font-semibold uppercase tracking-wider">{item.estado}</Badge>;
            },
        },
    ], []);

    return (
        <div className="space-y-6 animate-fade-in text-zinc-100">
            {/* Filtros */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 items-end lg:items-center">
                <div className="flex flex-wrap gap-4 flex-1 w-full lg:w-auto">
                    <div className="w-full sm:w-64">
                        <SelectMina
                            label={null}
                            placeholder="Seleccione Mina"
                            value={idMina}
                            onChange={(val) => setIdMina(val)}
                        />
                    </div>

                    <TextInput
                        placeholder="Buscar código o solicitante..."
                        leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />}
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.currentTarget.value);
                            setPage(1);
                        }}
                        disabled={!idMina}
                        className="flex-1 min-w-[200px]"
                        radius="lg"
                        classNames={{
                            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500"
                        }}
                    />
                </div>

                <Button
                    leftSection={<PlusIcon className="w-5 h-5" />}
                    onClick={open}
                    disabled={!idMina}
                    radius="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 border-0 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-full lg:w-auto"
                >
                    Nuevo Requerimiento
                </Button>
            </div>

            {/* Listado */}
            {!idMina ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <CubeIcon className="w-12 h-12 text-zinc-600 mb-4" />
                    <Text className="text-zinc-400 font-medium text-center">
                        Seleccione una mina para visualizar sus requerimientos de almacén.
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

            {/* Modal Registro */}
            <ModalRegistro
                opened={opened}
                close={close}
                title="Nuevo Requerimiento de Material"
                size="75%"
            >
                <RegistroRequerimiento
                    initialMinaId={idMina ? Number(idMina) : null}
                    onSuccess={() => {
                        close();
                        if (idMina) {
                            listar({ id_mina: Number(idMina) }).then(res => {
                                if (res) setData(res);
                            });
                        }
                    }}
                    onCancel={close}
                />
            </ModalRegistro>

            {error && <Text c="red" size="sm" mt="md">{error}</Text>}
        </div>
    );
};
