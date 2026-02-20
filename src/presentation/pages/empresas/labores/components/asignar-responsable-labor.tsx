import { Badge, Button, Text, Loader } from "@mantine/core";
import { useEffect, useState } from "react";
import { ArrowLeftIcon, PlusIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";

// Components
import { SelectEmpleado } from "../../../../utils/select-empleado";
import { CustomDatePicker as DatePickerInput } from "../../../../utils/date-picker-input";

// Services
import { useLabores } from "../../../../../services/empresas/labores/useLabores";
import type { RES_HistorialResponsableLabor } from "../../../../../services/empresas/labores/dtos/responses";

interface AsignarResponsableLaborProps {
    idLabor: number;
    idEmpresa: number;
    nombreLabor: string;
    onSuccess?: () => void;
}

export const AsignarResponsableLabor = ({ idLabor, idEmpresa, nombreLabor, onSuccess }: AsignarResponsableLaborProps) => {
    // States
    const [historial, setHistorial] = useState<RES_HistorialResponsableLabor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [, setError] = useState("");

    // Services
    const { asignar_responsable, historial_responsables } = useLabores({ setError });

    // Load Data
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const hist = await historial_responsables(idLabor);
            if (hist) {
                console.log("Datos historial Labores:", hist);
                // Ensure the list is sorted descending by fecha_inicio and then by ID
                const sorted = [...hist].sort((a, b) => {
                    const dateDiff = new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime();
                    if (dateDiff !== 0) return dateDiff;
                    return b.id_asignacion - a.id_asignacion;
                });
                setHistorial(sorted);
            }
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
            id_usuario: "",
            fecha_inicio: new Date()
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
            fecha_inicio: dayjs(values.fecha_inicio).format("YYYY-MM-DD")
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

    // UI Rendering helpers removed as we use inline map

    // VISTA: FORMULARIO
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
                    Volver al historial
                </Button>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
                    <h3 className="text-white font-bold mb-4">Nueva Asignación</h3>

                    <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                        <Text size="xs" className="text-indigo-300 font-medium uppercase tracking-wide">Asignando responsable a:</Text>
                        <Text size="md" fw={700} className="text-white mt-1">{nombreLabor}</Text>
                    </div>

                    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                        <SelectEmpleado
                            label="Responsable / Jefe"
                            placeholder="Buscar empleado de esta empresa..."
                            idEmpresa={idEmpresa}
                            {...form.getInputProps("id_usuario")}
                            withAsterisk
                        />

                        <DatePickerInput
                            label="Fecha de Inicio"
                            placeholder="Seleccione fecha"
                            {...form.getInputProps("fecha_inicio")}
                            withAsterisk
                        />

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="default" onClick={() => setShowForm(false)} disabled={saving}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="filled" color="indigo" loading={saving}>
                                Guardar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // VISTA: HISTORIAL (LISTA)
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Historial de Responsables</h3>
                    <p className="text-zinc-500 text-sm">{nombreLabor || "Registro histórico"}</p>
                </div>
                <Button
                    size="xs"
                    variant="light"
                    color="indigo"
                    leftSection={<PlusIcon className="w-4 h-4" />}
                    onClick={() => setShowForm(true)}
                    className="hover:bg-indigo-900/30 transition-colors"
                >
                    Asignar Nuevo
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader size="sm" color="gray" />
                </div>
            ) : historial.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                    <UserIcon className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm">No hay responsables asignados aún.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {historial.map((item, idx) => {
                        const isActive = item.estado?.toUpperCase() === 'ACTIVO';
                        const fullName = (item.nombres && item.apellidos)
                            ? `${item.apellidos} ${item.nombres}`
                            : (item.usuario_nombre || 'Sin nombre');

                        return (
                            <div
                                key={item.id_asignacion || idx}
                                className={`
                                    relative p-4 rounded-xl border flex items-start gap-4 transition-all
                                    border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60
                                `}
                            >
                                {/* Left: Avatar / Icon */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center shrink-0 border
                                    ${isActive
                                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                        : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'
                                    }
                                `}>
                                    <UserIcon className="w-6 h-6" />
                                </div>

                                {/* Right: Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <Text className="text-base font-bold text-white truncate">
                                            {fullName}
                                        </Text>
                                        {isActive ? (
                                            <Badge color="indigo" size="sm" variant="light" className="tracking-wide">
                                                ACTUAL
                                            </Badge>
                                        ) : (
                                            <Badge color="gray" size="sm" variant="outline">
                                                HISTÓRICO
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                        <ClockIcon className="w-4 h-4 shrink-0" />
                                        <span>
                                            {dayjs(item.fecha_inicio).format("YYYY-MM-DD")}
                                            <span className="mx-1.5 opacity-40">|</span>
                                            {item.fecha_fin ? dayjs(item.fecha_fin).format("YYYY-MM-DD") : 'Presente'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
