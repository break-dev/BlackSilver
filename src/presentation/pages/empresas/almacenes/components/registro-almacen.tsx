import { Button, Group, TextInput, Textarea, Switch, Stack } from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

// Services
import { Schema_CrearAlmacen } from "../../../../../services/empresas/almacenes/dtos/requests";
import type { RES_Almacen } from "../../../../../services/empresas/almacenes/dtos/responses";
import { useAlmacenes } from "../../../../../services/empresas/almacenes/useAlmacenes";

// Components
import { SelectEmpresas } from "../../../../utils/select-empresas";

interface RegistroAlmacenProps {
    onSuccess: (almacen: RES_Almacen) => void;
    onCancel: () => void;
}

export const RegistroAlmacen = ({ onSuccess, onCancel }: RegistroAlmacenProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State (Manual)
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [esPrincipal, setEsPrincipal] = useState(false);
    const [idEmpresa, setIdEmpresa] = useState<string | null>(null);

    // Hooks
    const { crear } = useAlmacenes({ setError });

    // Styles
    const inputClasses = {
        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
        label: "text-zinc-300 mb-1 font-medium",
        dropdown: "bg-zinc-900 border-zinc-800",
        option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1"
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Build Payload
        const payload = {
            id_empresa: Number(idEmpresa),
            nombre,
            descripcion,
            es_principal: esPrincipal
        };

        // Validate
        const validation = Schema_CrearAlmacen.safeParse(payload);

        if (!validation.success) {
            const msg = validation.error.issues[0]?.message || "Complete los campos requeridos.";
            setError(msg);
            notifications.show({ title: "Error", message: msg, color: "red" });
            setLoading(false);
            return;
        }

        // Send
        // @ts-ignore
        const result = await crear(validation.data);

        if (result) {
            notifications.show({
                title: "Almacén Creado",
                message: `El almacén ${result.nombre} ha sido registrado.`,
                color: "green"
            });
            onSuccess(result);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="relative space-y-5">

            <Stack gap="md">
                <SelectEmpresas
                    label="Empresa Propietaria"
                    placeholder="Seleccione Empresa"
                    required
                    withAsterisk
                    disabled={loading}
                    radius="lg"
                    classNames={inputClasses}
                    value={idEmpresa}
                    onChange={setIdEmpresa}
                />

                <TextInput
                    label="Nombre del Almacén"
                    placeholder="Ej. Almacén Central - Mina A"
                    required
                    withAsterisk
                    disabled={loading}
                    radius="lg"
                    classNames={inputClasses}
                    value={nombre}
                    onChange={(e) => setNombre(e.currentTarget.value)}
                />

                <Textarea
                    label="Descripción / Ubicación"
                    placeholder="Detalles adicionales..."
                    radius="lg"
                    minRows={3}
                    disabled={loading}
                    classNames={inputClasses}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.currentTarget.value)}
                />

                <Switch
                    label="¿Es Almacén Principal?"
                    description="Si lo activa, será el punto de recepción principal."
                    checked={esPrincipal}
                    disabled={loading}
                    onChange={(e) => setEsPrincipal(e.currentTarget.checked)}
                    color="green"
                    size="md"
                    classNames={{
                        label: "text-zinc-300 font-medium",
                        description: "text-zinc-500 text-xs"
                    }}
                />

                {error && <div className="text-red-500 text-sm font-medium px-1">{error}</div>}

                <Group justify="flex-end" gap="md" mt="xl">
                    <Button
                        variant="subtle"
                        onClick={onCancel}
                        disabled={loading}
                        radius="lg"
                        size="sm"
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        radius="lg"
                        size="sm"
                        className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
                    >
                        Registrar Almacén
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
