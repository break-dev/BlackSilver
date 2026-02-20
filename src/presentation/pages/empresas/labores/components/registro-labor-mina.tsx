import { Button, Group, TextInput, Textarea, Select } from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { TipoSostenimiento } from "../../../../../shared/enums";

// Services
import { Schema_CrearLabor } from "../../../../../services/empresas/labores/dtos/requests";
import type { RES_Labor } from "../../../../../services/empresas/labores/dtos/responses";
import { useLabores } from "../../../../../services/empresas/labores/useLabores";

// Utils
import { SelectTipoLabor } from "../../../../utils/select-tipo-labor";
import { SelectEmpresaMina } from "../../../../utils/select-empresa-mina";

interface RegistroLaborMinaProps {
    idMina: number;
    onSuccess: (labor: RES_Labor) => void;
    onCancel: () => void;
}

export const RegistroLaborMina = ({ idMina, onSuccess, onCancel }: RegistroLaborMinaProps) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Form Fields
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [idTipoLabor, setIdTipoLabor] = useState<string | null>(null);
    const [idEmpresa, setIdEmpresa] = useState<string | null>(null);
    const [tipoSostenimiento, setTipoSostenimiento] = useState("");

    const { crear_labor } = useLabores({ setError });

    // Styles
    const inputClasses = {
        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
        label: "text-zinc-300 mb-1 font-medium"
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        // Build Payload
        const payload = {
            id_mina: Number(idMina),
            id_empresa: Number(idEmpresa),
            id_tipo_labor: Number(idTipoLabor),
            nombre,
            descripcion,
            tipo_sostenimiento: tipoSostenimiento
        };

        // Validate
        const validation = Schema_CrearLabor.safeParse(payload);

        if (!validation.success) {
            const msg = validation.error.issues[0]?.message || "Complete los campos requeridos.";
            setError(msg);
            notifications.show({ title: "Error", message: msg, color: "red" });
            setSubmitting(false);
            return;
        }

        // Send
        // @ts-ignore
        const result = await crear_labor(validation.data);

        if (result) {
            notifications.show({
                title: "Labor Registrada",
                message: `La labor ${result.nombre} ha sido creada correctamente.`,
                color: "green"
            });
            onSuccess(result);
        }
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">

            <div className="mb-4">
                <SelectTipoLabor
                    value={idTipoLabor}
                    onChange={setIdTipoLabor}
                    required
                    withAsterisk
                    disabled={submitting}
                />
            </div>

            <SelectEmpresaMina
                idMina={idMina}
                value={idEmpresa}
                onChange={setIdEmpresa}
                required
                withAsterisk
                disabled={submitting}
            />

            <TextInput
                label="Nombre de la Labor"
                placeholder="Ej. Tajo Esperanza Nivel 1"
                required
                withAsterisk
                disabled={submitting}
                radius="lg"
                classNames={inputClasses}
                value={nombre}
                onChange={(e) => setNombre(e.currentTarget.value)}
            />

            <Select
                label="Tipo Sostenimiento"
                placeholder="Seleccione..."
                required
                withAsterisk
                disabled={submitting}
                radius="lg"
                size="sm"
                data={[
                    { value: TipoSostenimiento.Convencional, label: 'Convencional' },
                    { value: TipoSostenimiento.Mecanizada, label: 'Mecanizada' }
                ]}
                classNames={{
                    input: inputClasses.input,
                    label: inputClasses.label,
                    dropdown: "bg-zinc-900 border-zinc-800",
                    option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1"
                }}
                value={tipoSostenimiento}
                onChange={(val) => setTipoSostenimiento(val || "")}
            />

            <Textarea
                label="Descripción / Detalles"
                placeholder="Ubicación exacta, referencias..."
                radius="lg"
                minRows={2}
                disabled={submitting}
                classNames={{
                    input: inputClasses.input,
                    label: inputClasses.label
                }}
                value={descripcion}
                onChange={(e) => setDescripcion(e.currentTarget.value)}
            />

            {error && <div className="text-red-500 text-sm font-medium px-1">{error}</div>}

            <Group justify="flex-end" gap="md" mt="xl">
                <Button
                    variant="subtle"
                    onClick={onCancel}
                    disabled={submitting}
                    radius="lg"
                    size="sm"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    loading={submitting}
                    radius="lg"
                    size="sm"
                    className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
                >
                    Guardar
                </Button>
            </Group>
        </form>
    );
};
