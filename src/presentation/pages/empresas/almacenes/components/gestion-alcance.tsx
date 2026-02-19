import { Badge, Button, Select, Loader, Text } from "@mantine/core";
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
    nombreAlmacen?: string;
}

export const GestionAlcance = ({ idAlmacen, nombreAlmacen }: GestionAlcanceProps) => {

    // States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Data List
    const [laboresAsignadas, setLaboresAsignadas] = useState<RES_LaborAsignada[]>([]);

    // Data Options
    const [laboresDisponibles, setLaboresDisponibles] = useState<RES_Labor[]>([]);

    const [, setError] = useState("");

    // Services
    const { listarLabores, asignarLabor } = useAlmacenes({ setError });
    const { listar: listarTodasLabores } = useLabores({ setError });

    // Load Data
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [misLabores, poolLabores] = await Promise.all([
                listarLabores(idAlmacen),
                // @ts-ignore
                listarTodasLabores() // Trae todas las labores del sistema (filtros vacios)
            ]);

            if (misLabores) setLaboresAsignadas(misLabores);
            if (poolLabores) setLaboresDisponibles(poolLabores);

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
        initialValues: { id_labor: "" },
        validate: { id_labor: (val) => !val ? "Seleccione una labor" : null }
    });

    const handleSubmit = async (values: typeof form.values) => {
        setSaving(true);
        const success = await asignarLabor({
            id_almacen: idAlmacen,
            id_labor: Number(values.id_labor)
        });
        if (success) {
            notifications.show({ title: "Asignación Exitosa", message: "Labor vinculada al almacén", color: "green" });
            setShowForm(false);
            form.reset();
            cargarDatos();
        }
        setSaving(false);
    };

    // Options Logic (Filtrar las ya asignadas)
    const selectOptions = useMemo(() => {
        // Asumiendo que 'id' en RES_LaborAsignada es el id_labor o id de relacion...
        // Si el backend devuelve 'id' como PK de la relacion, no puedo filtrar por ID exacto facilmente sin saber id_labor original.
        // Pero RES_LaborAsignada tiene 'labor' (nombre). Puedo filtrar por nombre + mina si es unico, o asumir que ids coinciden.
        // Mejor filtro por nombre para estar seguro visualmente.

        const assignedNames = new Set(laboresAsignadas.map(a => `${a.labor}-${a.mina}`));

        return laboresDisponibles
            .filter(l => !assignedNames.has(`${l.nombre}-${l.mina}`))
            .map(l => ({
                value: String(l.id_labor),
                label: `${l.nombre} (${l.mina})`, // Mostrar Labor + Mina
                group: l.mina // Agrupar visualmente por Mina en el Select
            }));
    }, [laboresDisponibles, laboresAsignadas]);

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
                    <h3 className="text-white font-bold mb-4">Vincular Labor Minera</h3>

                    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                        <Select
                            placeholder="Buscar labor..."
                            data={selectOptions}
                            searchable
                            nothingFoundMessage="No hay labores disponibles"
                            {...form.getInputProps("id_labor")}
                            radius="md"
                            classNames={{
                                input: "bg-zinc-800 border-zinc-700 text-white",
                                dropdown: "bg-zinc-800 border-zinc-700",
                                groupLabel: "text-zinc-400 font-bold text-xs uppercase"
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
                    <h3 className="text-lg font-bold text-white">Labores asignadas</h3>
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
                    Asignar Labor
                </Button>
            </div>

            {laboresAsignadas.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
                    <CubeIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm">Este almacén no atiende ninguna labor.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {laboresAsignadas.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-900/20 text-cyan-500 flex items-center justify-center border border-cyan-900/30">
                                    <CubeIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <Text fw={600} className="text-zinc-200">{item.labor}</Text>
                                    <div className="flex items-center gap-2">
                                        <Badge size="xs" variant="dot" color="gray">{item.mina}</Badge>
                                        <Text size="xs" c="dimmed">({item.tipo_labor})</Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
