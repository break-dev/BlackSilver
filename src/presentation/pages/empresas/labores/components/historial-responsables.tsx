import { Badge, Button, Loader, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { ArrowLeftIcon, PlusIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useLabores } from "../../../../../services/empresas/labores/useLabores";
import type { RES_HistorialResponsable, RES_Labor } from "../../../../../services/empresas/labores/dtos/responses";
import { AsignarResponsable } from "./asignar-responsable";

interface HistorialResponsablesProps {
    labor: RES_Labor;
    onClose: () => void;
}

export const HistorialResponsables = ({ labor }: HistorialResponsablesProps) => {
    const [loading, setLoading] = useState(true);
    const [historial, setHistorial] = useState<RES_HistorialResponsable[]>([]);
    const [, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    const { historial_responsables } = useLabores({ setError });

    const fetchHistorial = async () => {
        setLoading(true);
        console.log("DEBUG: Solicitando historial para labor:", labor.id_labor);
        const data = await historial_responsables(labor.id_labor, labor.id_empresa);
        console.log("DEBUG: Respuesta historial:", data);

        if (data) {
            // Sort by date desc (most recent first)
            setHistorial(data.sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!showForm) {
            fetchHistorial();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showForm]);

    if (showForm) {
        return (
            <div className="animate-fade-in">
                <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    leftSection={<ArrowLeftIcon className="w-3 h-3" />}
                    onClick={() => setShowForm(false)}
                    className="mb-4 hover:text-white text-zinc-400"
                >
                    Volver al historial
                </Button>
                <AsignarResponsable
                    idLabor={labor.id_labor}
                    nombreLabor={labor.nombre}
                    idEmpresa={labor.id_empresa}
                    onSuccess={() => {
                        setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Historial de Responsables</h3>
                    <p className="text-zinc-500 text-sm">{labor.nombre}</p>
                </div>
                <Button
                    size="xs"
                    variant="light"
                    color="indigo"
                    leftSection={<PlusIcon className="w-4 h-4" />}
                    onClick={() => setShowForm(true)}
                    className="hover:bg-indigo-900/30 transition-colors"
                >
                    Nuevo / Relevo
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
                    {historial.map((item) => {
                        const isActive = item.estado === 'Activo' || !item.fecha_fin;
                        return (
                            <div
                                key={item.id_asignacion}
                                className={`
                                    relative p-4 rounded-xl border flex items-start gap-4 transition-all
                                    border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60
                                `}
                            >
                                {/* Left: Avatar / Icon */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center shrink-0 border
                                    ${isActive
                                        ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
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
                                        {isActive && (
                                            <Badge color="teal" size="sm" variant="light" className="tracking-wide">
                                                ACTUAL
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                        <ClockIcon className="w-4 h-4 shrink-0" />
                                        <span>
                                            {item.fecha_inicio}
                                            <span className="mx-1.5 opacity-40">|</span>
                                            {item.fecha_fin || 'Presente'}
                                        </span>
                                    </div>

                                    {item.observacion && (
                                        <div className="mt-3 pt-2 border-t border-white/5">
                                            <Text size="xs" c="dimmed" fs="italic">
                                                "{item.observacion}"
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
