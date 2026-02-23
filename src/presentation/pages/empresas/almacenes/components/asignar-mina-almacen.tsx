import { Badge, Button, Select, Loader, Text, ActionIcon, Tooltip } from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeftIcon, PlusIcon, CubeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

// Services
import { useAlmacenes } from "../../../../../services/empresas/almacenes/useAlmacenes";
import { useMinas } from "../../../../../services/empresas/minas/useMinas";
import type { RES_MinaAsignada } from "../../../../../services/empresas/almacenes/dtos/responses";
import type { RES_Mina } from "../../../../../services/empresas/minas/dtos/responses";

interface AsignarMinaAlmacenProps {
    idAlmacen: number;
    nombreAlmacen?: string;
}

export const AsignarMinaAlmacen = ({ idAlmacen, nombreAlmacen }: AsignarMinaAlmacenProps) => {

    // States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Data List
    const [minasAsignadas, setMinasAsignadas] = useState<RES_MinaAsignada[]>([]);

    // Data Options
    const [minasDisponibles, setMinasDisponibles] = useState<RES_Mina[]>([]);

    const [, setError] = useState("");

    // Services
    const { listarMinas, asignarMina, desasignarMina } = useAlmacenes({ setError });
    const { listar: listarTodasMinas } = useMinas({ setError });

    // Load Data
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [misMinas, poolMinas] = await Promise.all([
                listarMinas(idAlmacen),
                listarTodasMinas()
            ]);

            if (misMinas) setMinasAsignadas(misMinas);
            if (poolMinas) setMinasDisponibles(poolMinas);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idAlmacen]);

    // Form Handler
    const form = useForm({
        initialValues: { id_mina: "" },
        validate: { id_mina: (val) => !val ? "Seleccione una mina" : null }
    });

    const handleSubmit = async (values: typeof form.values) => {
        setSaving(true);
        const success = await asignarMina({
            id_almacen: idAlmacen,
            id_mina: Number(values.id_mina)
        });
        if (success) {
            notifications.show({ title: "Asignación Exitosa", message: "Mina vinculada al almacén", color: "green" });
            setShowForm(false);
            form.reset();
            cargarDatos();
        }
        setSaving(false);
    };

    const handleDesvincular = async (idAsignacion: number) => {
        if (!confirm("¿Está seguro de desvincular esta mina del almacén?")) return;

        const success = await desasignarMina(idAsignacion);
        if (success) {
            notifications.show({ title: "Mina Desvinculada", message: "La mina ha sido retirada del almacén", color: "blue" });
            cargarDatos();
        }
    };

    // Options Logic
    const selectOptions = useMemo(() => {
        if (!minasDisponibles || !Array.isArray(minasDisponibles)) return [];

        const assignedNames = new Set(
            (minasAsignadas || []).map(a => a.mina)
        );

        // 1. Filtramos y preparamos items planos
        const filtered = minasDisponibles
            .filter(m => !assignedNames.has(m.nombre))
            .map(m => ({
                value: String(m.id_mina),
                label: m.nombre,
                concesion: m.concesion || "Sin Concesión"
            }));

        // 2. Agrupamos por concesión
        const groups: Record<string, any[]> = {};
        filtered.forEach(item => {
            if (!groups[item.concesion]) groups[item.concesion] = [];
            groups[item.concesion].push({ value: item.value, label: item.label });
        });

        // 3. Convertimos al formato [{ group, items }, ...]
        return Object.entries(groups).map(([concesion, items]) => ({
            group: concesion,
            items
        }));
    }, [minasDisponibles, minasAsignadas]);

    // Renders
    if (loading) return <div className="flex justify-center p-10"><Loader size="sm" color="gray" /></div>;

    if (showForm) {
        return (
            <div className="space-y-4 animate-fade-in">
                <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={() => setShowForm(false)}
                    leftSection={<ArrowLeftIcon className="w-3 h-3" />}
                    className="hover:text-white text-zinc-400"
                >
                    Volver
                </Button>

                <div className="p-4 border border-zinc-800 bg-zinc-900/40 rounded-xl">
                    <h3 className="text-white font-bold mb-4">Vincular Mina</h3>

                    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                        <Select
                            label="Mina"
                            placeholder="Buscar mina..."
                            data={selectOptions}
                            searchable
                            nothingFoundMessage="No hay minas disponibles"
                            leftSection={<CubeIcon className="w-4 h-4 text-zinc-400" />}
                            {...form.getInputProps("id_mina")}
                            radius="lg"
                            size="sm"
                            classNames={{
                                input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                                dropdown: "bg-zinc-900 border-zinc-800",
                                option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
                                label: "text-zinc-300 mb-1 font-medium",
                                groupLabel: "text-zinc-500 font-bold text-xs uppercase mt-2 mb-1 pl-2"
                            }}
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="default" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button size="sm" type="submit" loading={saving}>Vincular</Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white">Minas asignadas</h3>
                    <p className="text-zinc-500 text-sm">{nombreAlmacen}</p>
                </div>
                <Button
                    size="xs"
                    variant="light"
                    color="indigo"
                    leftSection={<PlusIcon className="w-4 h-4" />}
                    onClick={() => setShowForm(true)}
                    className="hover:bg-indigo-900/30 transition-colors"
                >
                    Asignar Mina
                </Button>
            </div>

            {minasAsignadas.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
                    <CubeIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm">Este almacén no atiende ninguna mina.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {minasAsignadas.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-900/20 text-indigo-500 flex items-center justify-center border border-indigo-900/30">
                                    <CubeIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <Text fw={600} className="text-zinc-200">{item.mina}</Text>
                                    <Badge size="xs" variant="dot" color="gray">{item.concesion}</Badge>
                                </div>
                            </div>
                            <Tooltip label="Desvincular Mina">
                                <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    size="sm"
                                    onClick={() => handleDesvincular(item.id)}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </ActionIcon>
                            </Tooltip>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
