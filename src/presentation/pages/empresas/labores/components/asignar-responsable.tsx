import { Button, Group, Textarea } from "@mantine/core";
import { useState } from "react";
import { CustomDatePicker } from "../../../../utils/date-picker-input";
import { Schema_AsignarResponsable } from "../../../../../services/empresas/labores/dtos/requests";
import { useLabores } from "../../../../../services/empresas/labores/useLabores";
import { SelectUsuarioEmpresa } from "../../../../utils/select-usuario-empresa";

interface AsignarResponsableProps {
    idLabor: number;
    nombreLabor: string;
    idEmpresa?: number; // Optional: used to filter users if available
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

    const inputClasses = {
        input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
    focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
        label: "text-zinc-300 mb-1 font-medium",
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const payload = {
                id_labor: idLabor,
                id_usuario_empresa: Number(idUsuario),
                fecha_inicio: fechaInicio ? new Date(fechaInicio).toISOString().split('T')[0] : "",
                observacion,
            };
            const validation = Schema_AsignarResponsable.safeParse(payload);

            if (!validation.success) {
                const firstError = validation.error.issues[0]?.message;
                setError(firstError || "Complete todos los campos.");
                return;
            }

            setIsLoading(true);
            const success = await asignar_responsable(validation.data);

            if (success) {
                onSuccess?.();
            }
        } catch (e) {
            console.error(e);
            setError("Error al asignar.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-yellow-900/20 p-3 rounded-md border border-yellow-700/50 mb-4">
                <p className="text-yellow-200 text-sm font-medium">Asignando responsable a:</p>
                <p className="text-white font-bold text-lg">{nombreLabor}</p>
            </div>

            <SelectUsuarioEmpresa
                required
                withAsterisk
                idEmpresa={idEmpresa}
                value={idUsuario}
                onChange={setIdUsuario}
            />

            <CustomDatePicker
                label="Fecha de Inicio"
                placeholder="Seleccione fecha"
                withAsterisk
                required
                value={fechaInicio}
                onChange={(val: any) => setFechaInicio(val)}
            />

            <Textarea
                label="Observación / Nota"
                placeholder="Opcional..."
                radius="lg"
                size="sm"
                minRows={2}
                classNames={inputClasses}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
            />

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

            <Group justify="flex-end" gap="md" mt="xl">
                {onCancel && (
                    <Button
                        variant="subtle"
                        onClick={onCancel}
                        disabled={isLoading}
                        radius="lg"
                        size="sm"
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    loading={isLoading}
                    radius="lg"
                    size="sm"
                    className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
                >
                    Asignar Responsable
                </Button>
            </Group>
        </form>
    );
};
