import { Badge, Button, Loader, Text, Select, ActionIcon, Tooltip } from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeftIcon, PlusIcon, BuildingOfficeIcon, CalendarIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useConcesion } from "../../../../../services/empresas/concesiones/useConcesion";
import { useEmpresas } from "../../../../../services/empresas/empresas/useEmpresas";
import type { RES_Concesion, RES_Asignacion } from "../../../../../services/empresas/concesiones/dtos/responses";
import type { RES_Empresa } from "../../../../../services/empresas/empresas/dtos/responses";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CustomDatePicker } from "../../../../utils/date-picker-input";

interface GestionEmpresasProps {
    concesion: RES_Concesion;
    onClose?: () => void;
}

export const GestionEmpresas = ({ concesion }: GestionEmpresasProps) => {
    // Hooks
    const [loading, setLoading] = useState(true);
    const [asignaciones, setAsignaciones] = useState<RES_Asignacion[]>([]);
    const [empresasDisponibles, setEmpresasDisponibles] = useState<RES_Empresa[]>([]);
    const [, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Services
    const { listar_asignaciones, asignar_empresa, desasignar_empresa } = useConcesion({ setError });
    const { listar: listarEmpresas } = useEmpresas({ setError });

    // Load Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel fetch
            const [dataAsignaciones, dataEmpresas] = await Promise.all([
                listar_asignaciones(concesion.id_concesion),
                listarEmpresas()
            ]);

            if (dataAsignaciones) {
                // Sort by active first, then date desc
                setAsignaciones(dataAsignaciones.sort((a, b) => {
                    if (a.estado === 'Activo' && b.estado !== 'Activo') return -1;
                    if (a.estado !== 'Activo' && b.estado === 'Activo') return 1;
                    return new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime();
                }));
            }
            if (dataEmpresas) {
                setEmpresasDisponibles(dataEmpresas);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!showForm) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showForm]);

    // Form
    const form = useForm({
        initialValues: {
            id_empresa: "",
            fecha_inicio: new Date(), // Date object
        },
        validate: {
            id_empresa: (value) => !value ? "Seleccione una empresa" : null,
            fecha_inicio: (value) => !value ? "Fecha requerida" : null
        }
    });

    // Handlers
    const handleSubmit = async (values: typeof form.values) => {
        setSaving(true);
        const success = await asignar_empresa({
            id_concesion: concesion.id_concesion,
            id_empresa: Number(values.id_empresa),
            fecha_inicio: values.fecha_inicio ? values.fecha_inicio.toISOString().split('T')[0] : "",
            fecha_fin: null
        });

        if (success) {
            notifications.show({
                title: "Empresa Asignada",
                message: "La empresa se ha asignado correctamente a la concesión.",
                color: "green"
            });
            setShowForm(false);
            form.reset();
        }
        setSaving(false);
    };

    const handleDesasignar = async (id_asignacion: number, nombre: string) => {
        if (!confirm(`¿Estás seguro de finalizar la asignación de ${nombre}?`)) return;

        setLoading(true);
        const success = await desasignar_empresa(id_asignacion);
        if (success) {
            notifications.show({
                title: "Asignación Finalizada",
                message: "La empresa ha sido desasignada correctamente.",
                color: "blue"
            });
            fetchData(); // Reload list
        } else {
            setLoading(false);
        }
    };

    // Filter companies already assigned and active? 
    // Backend says multiasignment is allowed, so we show all companies except maybe the ones currently active?
    // Let's just show all for now, maybe mark already attached ones.
    const empresasOptions = useMemo(() => {
        const activosIds = asignaciones
            .filter(a => a.estado === 'Activo')
            .map(a => a.id_empresa);

        return empresasDisponibles.map(e => ({
            value: String(e.id_empresa),
            label: e.nombre_comercial || e.razon_social,
            disabled: activosIds.includes(e.id_empresa) // Disable if already active
        }));
    }, [empresasDisponibles, asignaciones]);


    if (showForm) {
        return (
            <div className="animate-fade-in space-y-4">
                <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    leftSection={<ArrowLeftIcon className="w-3 h-3" />}
                    onClick={() => setShowForm(false)}
                    className="hover:text-white text-zinc-400"
                >
                    Volver a la lista
                </Button>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
                    <h3 className="text-white font-bold mb-4">Nueva Asignación</h3>
                    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                        <Select
                            label="Empresa"
                            placeholder="Buscar empresa..."
                            data={empresasOptions}
                            searchable
                            nothingFoundMessage="No se encontraron empresas"
                            radius="lg"
                            size="sm"
                            classNames={{
                                input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 
                                focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
                                dropdown: "bg-zinc-900 border-zinc-800",
                                option: `hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 
                                data-[selected]:text-zinc-900 rounded-md my-1`,
                                label: "text-zinc-300 mb-1 font-medium",
                            }}
                            {...form.getInputProps("id_empresa")}
                        />

                        <CustomDatePicker
                            label="Fecha de Inicio"
                            placeholder="Seleccione fecha"
                            {...form.getInputProps("fecha_inicio")}
                        />

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="default" onClick={() => setShowForm(false)} disabled={saving}>
                                Cancelar
                            </Button>
                            <Button type="submit" color="indigo" loading={saving}>
                                Asignar Empresa
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Empresas Asignadas</h3>
                    <p className="text-zinc-500 text-sm">{concesion.nombre}</p>
                </div>
                <Button
                    size="xs"
                    variant="light"
                    color="indigo"
                    leftSection={<PlusIcon className="w-4 h-4" />}
                    onClick={() => setShowForm(true)}
                    className="hover:bg-indigo-900/30 transition-colors"
                >
                    Asignar Empresa
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader size="sm" color="gray" />
                </div>
            ) : asignaciones.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                    <BuildingOfficeIcon className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm">No hay empresas asignadas.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {asignaciones.map((item) => {
                        const isActive = item.estado === 'Activo';
                        return (
                            <div
                                key={item.id || item.id_asignacion} // Fallback just in case
                                className={`
                                    relative p-4 rounded-xl border flex items-start gap-4 transition-all
                                    border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60
                                `}
                            >
                                {/* Left: Avatar / Logo */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center shrink-0 border overflow-hidden
                                    ${isActive
                                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                        : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'
                                    }
                                `}>
                                    {item.path_logo ? (
                                        <img src={item.path_logo} alt={item.nombre_comercial} className="w-full h-full object-cover" />
                                    ) : (
                                        <BuildingOfficeIcon className="w-6 h-6" />
                                    )}
                                </div>

                                {/* Right: Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <Text className="text-base font-bold text-white truncate">
                                            {item.nombre_comercial || item.razon_social}
                                        </Text>
                                        {isActive ? (
                                            <Badge color="indigo" size="sm" variant="light" className="tracking-wide">
                                                ACTIVO
                                            </Badge>
                                        ) : (
                                            <Badge color="gray" size="sm" variant="outline">
                                                INACTIVO
                                            </Badge>
                                        )}
                                    </div>
                                    <Text size="xs" c="dimmed" className="mb-1">{item.ruc}</Text>

                                    <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                        <CalendarIcon className="w-4 h-4 shrink-0" />
                                        <span>
                                            {item.fecha_inicio}
                                            <span className="mx-1.5 opacity-40">|</span>
                                            {item.fecha_fin || 'Presente'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions (Delete/Unassign) if active */}
                                {isActive && (
                                    <Tooltip label="Finalizar Asignación" withArrow>
                                        <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            onClick={() => handleDesasignar(item.id || item.id_asignacion!, item.nombre_comercial || item.razon_social)}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
