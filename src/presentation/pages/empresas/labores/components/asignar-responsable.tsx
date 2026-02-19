import { Button, Textarea, Text } from "@mantine/core";
import { useState } from "react";
import { CustomDatePicker } from "../../../../utils/date-picker-input";
import { useLabores } from "../../../../../services/empresas/labores/useLabores";
import { SelectUsuarioEmpresa } from "../../../../utils/select-usuario-empresa";
import dayjs from "dayjs";

interface AsignarResponsableProps {
    idLabor: number;
    nombreLabor: string;
    idEmpresa?: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const AsignarResponsable = ({
    idLabor,
    nombreLabor,
    idEmpresa,
    onSuccess,
    onCancel,
}: AsignarResponsableProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [idUsuario, setIdUsuario] = useState<string | null>(null);
    const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
    const [observacion, setObservacion] = useState("");

    // Service
    const { asignar_responsable } = useLabores({ setError });

    const handleSubmit = async () => {
        setError("");

        if (!idUsuario || !fechaInicio) {
            setError("Complete todos los campos obligatorios.");
            return;
        }

        setIsLoading(true);
        try {
            const success = await asignar_responsable({
                id_labor: idLabor,
                id_usuario_empresa: Number(idUsuario),
                fecha_inicio: dayjs(fechaInicio).format("YYYY-MM-DD"),
                observacion,
            });

            if (success) {
                onSuccess?.();
            } else {
                setError("Error al asignar responsable.");
            }
        } catch (e) {
            console.error(e);
            setError("Ocurrió un error inesperado.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <h3 className="text-white font-bold mb-4">Nueva Asignación</h3>

            <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <Text size="xs" className="text-indigo-300 font-medium uppercase tracking-wide">Asignando responsable a:</Text>
                <Text size="md" fw={700} className="text-white mt-1">{nombreLabor}</Text>
            </div>

            <div className="space-y-4">
                <SelectUsuarioEmpresa
                    label="Responsable / Jefe"
                    idEmpresa={idEmpresa}
                    value={idUsuario}
                    onChange={setIdUsuario}
                    withAsterisk
                    error={error && !idUsuario ? "Requerido" : undefined}
                />

                <CustomDatePicker
                    label="Fecha de Inicio"
                    value={fechaInicio}
                    onChange={(val: any) => setFechaInicio(val)}
                    withAsterisk
                    error={error && !fechaInicio ? "Requerido" : undefined}
                />

                <Textarea
                    label="Observación / Nota"
                    placeholder="Opcional..."
                    value={observacion}
                    onChange={(e) => setObservacion(e.currentTarget.value)}
                    autosize
                    minRows={2}
                    radius="lg"
                    classNames={{
                        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                        label: "text-zinc-300 mb-1 font-medium"
                    }}
                />

                {error && <Text size="xs" c="red">{error}</Text>}

                <div className="flex justify-end gap-2 mt-6">
                    {onCancel && (
                        <Button variant="default" onClick={onCancel} disabled={isLoading}>
                            Cancelar
                        </Button>
                    )}
                    <Button variant="filled" color="indigo" onClick={handleSubmit} loading={isLoading}>
                        Guardar
                    </Button>
                </div>
            </div>
        </div>
    );
};
