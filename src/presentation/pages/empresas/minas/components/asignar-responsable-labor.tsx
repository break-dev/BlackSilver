import { Badge, Button, Text, Loader } from "@mantine/core";
import { useEffect, useState } from "react";
import { UserCircleIcon, ArrowLeftIcon, PlusIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
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
    nombreLabor: string;
    onSuccess?: () => void;
}

export const AsignarResponsableLabor = ({ idLabor, nombreLabor, onSuccess }: AsignarResponsableLaborProps) => {
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
            if (hist) setHistorial(hist);
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

    // UI Rendering helpers
    const renderCard = (item: RES_HistorialResponsableLabor, isCurrent: boolean) => (
        <div key={item.id_responsable_labor} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isCurrent
            ? "bg-indigo-500/10 border-indigo-500/30"
            : "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40"
            }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${isCurrent
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                : "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
                }`}>
                <UserCircleIcon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <Text className={`font-semibold ${isCurrent ? "text-indigo-100" : "text-zinc-300"}`}>
                        {item.usuario_nombre}
                    </Text>
                    {isCurrent && (
                        <Badge size="sm" variant="filled" color="indigo" radius="sm">ACTUAL</Badge>
                    )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs">
                    <div className={`flex items-center gap-1.5 ${isCurrent ? "text-indigo-300" : "text-zinc-500"}`}>
                        <CalendarDaysIcon className="w-3.5 h-3.5" />
                        <span>{dayjs(item.fecha_inicio).format("DD/MM/YYYY")}</span>
                    </div>

                    {!isCurrent && item.fecha_fin && (
                        <span className="text-zinc-600">
                            Hasta: {dayjs(item.fecha_fin).format("DD/MM/YYYY")}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    // Render Form
    if (showForm) {
        return (
            <div className="space-y-4 animate-fade-in">
                <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={() => setShowForm(false)}
                    leftSection={<ArrowLeftIcon className="w-3 h-3" />}
                    className="hover:text-white text-zinc-400 mb-2"
                >
                    Volver al historial
                </Button>

                <div className="p-5 border border-zinc-800 bg-zinc-900/40 rounded-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <UserCircleIcon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Asignar Nuevo Responsable</h3>
                            <p className="text-xs text-zinc-500">Seleccione el empleado que estará a cargo.</p>
                        </div>
                    </div>

                    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-5">
                        <SelectEmpleado
                            label="Responsable"
                            placeholder="Buscar empleado..."
                            {...form.getInputProps("id_usuario")}
                            required
                        />

                        <DatePickerInput
                            label="Fecha de Inicio"
                            placeholder="Seleccione fecha"
                            {...form.getInputProps("fecha_inicio")}
                            required
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/50">
                            <Button size="sm" variant="default" onClick={() => setShowForm(false)} className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                                Cancelar
                            </Button>
                            <Button
                                size="sm"
                                type="submit"
                                loading={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
                            >
                                Guardar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Render List
    const currentResponsible = historial.find(h => h.estado === 'Activo');
    const pastResponsibles = historial.filter(h => h.estado !== 'Activo');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                <div className="flex flex-col gap-1">
                    <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider">
                        Historial de Responsables
                    </Text>
                    <div className="flex items-center gap-2">
                        <Text size="lg" fw={700} className="text-white">
                            {nombreLabor}
                        </Text>
                    </div>
                </div>
                <Button
                    size="xs"
                    leftSection={<PlusIcon className="w-3.5 h-3.5" />}
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
                >
                    Asignar Nuevo
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><Loader size="sm" color="gray" /></div>
            ) : historial.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                    <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                        <UserCircleIcon className="w-6 h-6 text-zinc-600" />
                    </div>
                    <Text size="sm" className="text-zinc-500 font-medium">No hay historial registrado</Text>
                    <Text size="xs" className="text-zinc-600 mt-1">Asigne un responsable para comenzar.</Text>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {/* Current Responsible */}
                    {currentResponsible && (
                        <div className="space-y-2">
                            <Text className="text-zinc-500 text-xs font-medium uppercase px-1">Responsable Actual</Text>
                            {renderCard(currentResponsible, true)}
                        </div>
                    )}

                    {/* Past History */}
                    {pastResponsibles.length > 0 && (
                        <div className="space-y-3">
                            <Text className="text-zinc-500 text-xs font-medium uppercase px-1 mt-6">Historial Anterior</Text>
                            <div className="grid gap-3">
                                {pastResponsibles.map(h => renderCard(h, false))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
