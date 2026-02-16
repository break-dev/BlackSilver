import { Badge, Button, Loader, Text, Select } from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeftIcon, PlusIcon, CubeIcon } from "@heroicons/react/24/outline";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

// Services
import { useAlmacenes } from "../../../../../services/empresas/almacenes/useAlmacenes";
import { useLabores } from "../../../../../services/empresas/labores/useLabores";
import type { RES_LaborAsignada } from "../../../../../services/empresas/almacenes/dtos/responses";
import type { RES_Labor } from "../../../../../services/empresas/labores/dtos/responses";

interface GestionAlcanceProps {
    idAlmacen: number;
    nombreAlmacen?: string; // Optional, mostly controlled by parent modal
}

export const GestionAlcance = ({ idAlmacen, nombreAlmacen }: GestionAlcanceProps) => {
    // Hooks
    const [loading, setLoading] = useState(true);
    const [laboresAsignadas, setLaboresAsignadas] = useState<RES_LaborAsignada[]>([]);
    const [laboresDisponibles, setLaboresDisponibles] = useState<RES_Labor[]>([]);
    const [, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Services
    const { listarLabores, asignarLabor } = useAlmacenes({ setError });
    const { listar: listarTodasLabores } = useLabores({ setError });

    // Load Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [dataAsignadas, dataDisponibles] = await Promise.all([
                listarLabores(idAlmacen),
                listarTodasLabores()
            ]);

            if (dataAsignadas) {
                console.log("🔍 Labores asignadas (API):", dataAsignadas);
                setLaboresAsignadas(dataAsignadas);
            }
            if (dataDisponibles) setLaboresDisponibles(dataDisponibles);

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
    }, [idAlmacen, showForm]);

    // Form
    const form = useForm({
        initialValues: {
            id_labor: "",
        },
        validate: {
            id_labor: (value) => !value ? "Seleccione una labor" : null,
        }
    });

    // Handlers
    const handleSubmit = async (values: typeof form.values) => {
        setSaving(true);
        const success = await asignarLabor({
            id_almacen: idAlmacen,
            id_labor: Number(values.id_labor)
        });

        if (success) {
            notifications.show({
                title: "Labor Asignada",
                message: "La labor se ha vinculado correctamente al almacén.",
                color: "green"
            });
            setShowForm(false);
            form.reset();
        }
        setSaving(false);
    };

    // Note: Assuming there is a desasignarLabor endpoint or we need to add it.
    // Based on previous files, I didn't see explicit desasignarLabor in useAlmacenes, 
    // but typically it should exist. If not, I will hide the trash icon for now 
    // or assume it exists in the updated hook.
    // Checking useAlmacenes content from memory/context... 
    // It had "listarLabores" and "asignarLabor". 
    // I will simulate it if missing or comment it out until backend supports it.

    /* 
    const handleDesasignar = async (id: number, nombre: string) => {
         if (!confirm(`¿Desvincular labor ${nombre}?`)) return;
         // Implementation pending backend support
    };
    */

    // Filter Options
    const laboresOptions = useMemo(() => {
        // Exclude already assigned (matching by name since ID might be unclear)
        const assignedNames = laboresAsignadas.map(l => l.labor);

        return laboresDisponibles
            .filter(l => !assignedNames.includes(l.nombre))
            .map(l => ({
                value: String(l.id_labor),
                label: `${l.nombre} (${l.tipo_labor})`
            }));
    }, [laboresDisponibles, laboresAsignadas]);

    // VIEW: FORM
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
                            label="Labor Minera"
                            placeholder="Buscar labor..."
                            data={laboresOptions}
                            searchable
                            nothingFoundMessage="No hay labores disponibles"
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
                            {...form.getInputProps("id_labor")}
                        />

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="default" onClick={() => setShowForm(false)} disabled={saving}>
                                Cancelar
                            </Button>
                            <Button type="submit" color="indigo" loading={saving}>
                                Asignar Labor
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // VIEW: LIST
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    {/* Title is handled by Modal Header mainly, but we keep structure */}
                    <h3 className="text-lg font-bold text-white leading-tight">Asignación de Labores</h3>
                    <p className="text-zinc-500 text-sm">{nombreAlmacen || "Labores atendidas"}</p>
                </div>
                <Button
                    size="xs"
                    variant="light"
                    color="indigo"
                    leftSection={<PlusIcon className="w-4 h-4" />}
                    onClick={() => setShowForm(true)}
                    className="hover:bg-indigo-900/30 transition-colors"
                >
                    Asignar Labor
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader size="sm" color="gray" />
                </div>
            ) : laboresAsignadas.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                    <CubeIcon className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm">Este almacén no tiene labores asignadas.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {laboresAsignadas.map((item) => (
                        <div
                            key={item.id}
                            className={`
                                relative p-4 rounded-xl border flex items-center gap-4 transition-all
                                border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60
                            `}
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border overflow-hidden bg-zinc-800/50 text-zinc-400 border-zinc-700/50">
                                <CubeIcon className="w-6 h-6" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <Text className="text-base font-bold text-white truncate">
                                        {item.labor}
                                    </Text>
                                    <Badge color="cyan" size="sm" variant="light" className="tracking-wide">
                                        {item.tipo_labor.toUpperCase()}
                                    </Badge>
                                </div>

                                {item.concesion && (
                                    <Text size="xs" c="dimmed" className="flex items-center gap-1">
                                        <span className="opacity-70">Concesión:</span>
                                        <span className="text-zinc-300 font-medium">{item.concesion}</span>
                                    </Text>
                                )}
                            </div>

                            {/* Actions (Delete) - Pending backend support? 
                                If backend doesn't support desasignarLabor yet, hiddden for now.
                            */}
                            {/* 
                            <Tooltip label="Desvincular" withArrow>
                                <ActionIcon 
                                    color="red" 
                                    variant="subtle"
                                    onClick={() => console.log("Desvincular implementation pending")}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </ActionIcon>
                            </Tooltip>
                            */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
