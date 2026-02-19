import { Badge, Button, Select, Text, Timeline } from "@mantine/core";
import { useEffect, useState } from "react";
import { UserCircleIcon, ArrowLeftIcon, PlusIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";

// Services
import { useLabores } from "../../../../../services/empresas/labores/useLabores";
import { useEmpleados } from "../../../../../services/personal/useEmpleados";
import type { RES_Empleado } from "../../../../../services/personal/dtos/responses";
import type { RES_HistorialResponsableLabor } from "../../../../../services/empresas/labores/dtos/responses";

interface AsignarResponsableLaborProps {
    idLabor: number;
    nombreLabor: string;
    onSuccess?: () => void;
}

export const AsignarResponsableLabor = ({ idLabor, nombreLabor, onSuccess }: AsignarResponsableLaborProps) => {
    // States
    const [historial, setHistorial] = useState<RES_HistorialResponsableLabor[]>([]);
    const [empleados, setEmpleados] = useState<RES_Empleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [, setError] = useState("");

    // Services
    const { asignar_responsable, historial_responsables } = useLabores({ setError });
    const { listar: listarEmpleados } = useEmpleados({ setError });

    // Load Data
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [hist, emps] = await Promise.all([
                historial_responsables(idLabor),
                listarEmpleados() // Esto trae todos los empleados. Backend validará si cumple contrato.
            ]);

            if (hist) setHistorial(hist);
            // @ts-ignore
            if (emps) setEmpleados(emps);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idLabor]);

    // Form
    const form = useForm({
        initialValues: {
            id_usuario: "", // Usaremos id_empleado como valor
            fecha_inicio: dayjs().format("YYYY-MM-DD")
        },

        validate: {
            id_usuario: (val) => !val ? "Seleccione un responsable" : null,
            fecha_inicio: (val) => !val ? "Fecha requerida" : null
        }
    });

    const handleSubmit = async (values: typeof form.values) => {
        setSaving(true);

        const success = await asignar_responsable({
            id_labor: idLabor,
            id_usuario: Number(values.id_usuario),
            fecha_inicio: values.fecha_inicio
        });

        if (success) {
            notifications.show({ title: "Asignación Exitosa", message: "Nuevo responsable asignado.", color: "green" });
            setShowForm(false);
            form.reset();
            cargarDatos();
            if (onSuccess) onSuccess();
        }
        setSaving(false);
    };

    // Render
    if (showForm) {
        return (
            <div className="space-y-4 animate-fade-in">
                <Button variant="subtle" size="xs" onClick={() => setShowForm(false)} leftSection={<ArrowLeftIcon className="w-3 h-3" />} className="text-zinc-400 hover:text-white">
                    Volver al historial
                </Button>

                <div className="p-4 border border-zinc-800 bg-zinc-900/40 rounded-xl">
                    <h3 className="text-white font-bold mb-4">Nueva Asignación</h3>
                    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                        <Select
                            label="Responsable"
                            placeholder="Buscar empleado..."
                            data={empleados.map(e => ({
                                value: String(e.id_empleado),
                                label: `${e.nombre} ${e.apellido}`
                            }))}
                            searchable
                            nothingFoundMessage="No hay empleados"
                            {...form.getInputProps("id_usuario")}
                            radius="md"
                            classNames={{
                                input: "bg-zinc-800 border-zinc-700 text-white",
                                dropdown: "bg-zinc-800 border-zinc-700",
                                label: "text-zinc-300 mb-1"
                            }}
                        />

                        <div className="flex justify-end gap-2 mt-6">
                            <Button size="sm" variant="default" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button size="sm" type="submit" loading={saving}>Asignar</Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <Text className="text-zinc-400 text-sm">Historial de Responsables</Text>
                    <Text className="text-white font-bold md:text-lg">{nombreLabor}</Text>
                </div>
                <Button size="xs" leftSection={<PlusIcon className="w-4 h-4" />} onClick={() => setShowForm(true)}>
                    Asignar Nuevo
                </Button>
            </div>

            <Timeline active={0} bulletSize={24} lineWidth={2} color="indigo" className="mt-4">
                {historial.map((item, index) => (
                    <Timeline.Item
                        key={item.id_responsable_labor}
                        bullet={index === 0 && item.estado === 'Activo' ? <CheckCircleIcon className="w-4 h-4" /> : <UserCircleIcon className="w-4 h-4" />}
                        title={item.usuario_nombre}
                        lineVariant={index === 0 ? 'solid' : 'dashed'}
                        className="text-zinc-300"
                    >
                        <Text c="dimmed" size="xs">
                            Desde: {dayjs(item.fecha_inicio).format("DD/MM/YYYY")}
                            {item.fecha_fin ? ` - Hasta: ${dayjs(item.fecha_fin).format("DD/MM/YYYY")}` : " (Actual)"}
                        </Text>
                        <Badge size="xs" variant="light" color={item.estado === 'Activo' ? 'green' : 'gray'} mt={4}>
                            {item.estado}
                        </Badge>
                    </Timeline.Item>
                ))}
            </Timeline>

            {historial.length === 0 && !loading && (
                <Text size="sm" c="dimmed" ta="center" py="xl">No hay historial registrado.</Text>
            )}
        </div>
    );
};
