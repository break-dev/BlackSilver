import { Badge, Button, Loader, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { ArrowLeftIcon, PlusIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import 'dayjs/locale/es';

// Services & Hooks
import { useAlmacenes } from "../../../../../services/empresas/almacenes/useAlmacenes";
import type { RES_ResponsableAlmacen } from "../../../../../services/empresas/almacenes/dtos/responses";
import { Schema_AsignarResponsableAlmacen } from "../../../../../services/empresas/almacenes/dtos/requests";

// Utils
import { CustomDatePicker } from "../../../../utils/date-picker-input";
import { SelectEmpleado } from "../../../../utils/select-empleado";

interface GestionResponsablesProps {
    idAlmacen: number;
    nombreAlmacen?: string;
    // idEmpresa removed as it is no longer relevant for warehouse responsibility
}

export const GestionResponsables = ({ idAlmacen, nombreAlmacen }: GestionResponsablesProps) => {
    // Data State
    const [responsables, setResponsables] = useState<RES_ResponsableAlmacen[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // UI State
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [nuevoResponsable, setNuevoResponsable] = useState<string | null>(null);
    const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
    const [assignError, setAssignError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { listarResponsables, asignarResponsable } = useAlmacenes({ setError });


    // Cargar historial
    const cargarHistorial = async () => {
        setLoading(true);
        const data = await listarResponsables(idAlmacen);
        if (data) {
            // Sort by start date descending
            setResponsables(data.sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!showForm) {
            cargarHistorial();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idAlmacen, showForm]);

    // Handle Assign
    const handleAsignar = async () => {
        setAssignError("");
        if (!nuevoResponsable || !fechaInicio) {
            setAssignError("Seleccione responsable y fecha de inicio.");
            return;
        }

        // Validate DTO
        const payload = {
            id_almacen: idAlmacen,
            id_usuario: Number(nuevoResponsable), // Use id_usuario from form (mapped to id_empleado)
            fecha_inicio: dayjs(fechaInicio).format("YYYY-MM-DD")
        };

        const validation = Schema_AsignarResponsableAlmacen.safeParse(payload);
        if (!validation.success) {
            setAssignError("Datos inválidos.");
            return;
        }

        setSubmitting(true);
        const ok = await asignarResponsable(validation.data);
        if (ok) {
            notifications.show({ title: "Asignado", message: "Nuevo responsable registrado.", color: "green" });
            setShowForm(false);
            setNuevoResponsable(null);
            setFechaInicio(new Date());
        } else {
            setAssignError(error || "Error al asignar.");
        }
        setSubmitting(false);
    };

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
                        <Text size="md" fw={700} className="text-white mt-1">{nombreAlmacen}</Text>
                    </div>

                    <div className="space-y-4">
                        <SelectEmpleado
                            label="Responsable / Jefe"
                            placeholder="Buscar empleado..."
                            value={nuevoResponsable}
                            onChange={(val) => setNuevoResponsable(val)}
                            withAsterisk
                            error={assignError && !nuevoResponsable ? "Requerido" : undefined}
                        />

                        <CustomDatePicker
                            label="Fecha de Inicio"
                            value={fechaInicio}
                            onChange={(val: any) => setFechaInicio(val)}
                            error={assignError && !fechaInicio ? "Requerido" : undefined}
                            withAsterisk
                        />

                        {assignError && <Text size="xs" c="red">{assignError}</Text>}

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="default" onClick={() => setShowForm(false)} disabled={submitting}>
                                Cancelar
                            </Button>
                            <Button variant="filled" color="indigo" onClick={handleAsignar} loading={submitting}>
                                Guardar Asignación
                            </Button>
                        </div>
                    </div>
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
                    <p className="text-zinc-500 text-sm">{nombreAlmacen || "Registro histórico"}</p>
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
            ) : responsables.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                    <UserIcon className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm">No hay responsables asignados aún.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {responsables.map((item, idx) => {
                        const isActive = item.estado === 'Activo';
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
                                            {item.nombres} {item.apellidos}
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
