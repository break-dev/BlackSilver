import { Button, Group, TextInput, Textarea, Switch, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

// Services
import { Schema_CrearAlmacen } from "../../../../../services/empresas/almacenes/dtos/requests";
import type { RES_Almacen } from "../../../../../services/empresas/almacenes/dtos/responses";
import { useAlmacenes } from "../../../../../services/empresas/almacenes/useAlmacenes";

interface RegistroAlmacenProps {
    onSuccess: (almacen: RES_Almacen) => void;
    onCancel: () => void;
}

export const RegistroAlmacen = ({ onSuccess, onCancel }: RegistroAlmacenProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");

    // es_principal (boolean, default false en schema)
    const [esPrincipal, setEsPrincipal] = useState(false);

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
                    label="Descripción"
                    placeholder="Detalles adicionales..."
                    radius="lg"
                    minRows={3}
                    disabled={loading}
                    classNames={inputClasses}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.currentTarget.value)}
                />

                <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg flex items-center justify-between">
                    <div className="flex flex-col gap-1 pr-4">
                        <Text size="sm" fw={600} className="text-pink-200">¿Es Almacén Principal?</Text>
                        <Text size="xs" className="text-pink-100/70 leading-snug">
                            Si lo activa, será el punto de recepción principal.
                        </Text>
                    </div>
                    <Switch
                        checked={esPrincipal}
                        disabled={loading}
                        onChange={(e) => setEsPrincipal(e.currentTarget.checked)}
                        color="pink"
                        size="md"
                        classNames={{
                            track: "cursor-pointer",
                            thumb: "cursor-pointer"
                        }}
                    />
                </div>

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
                        Guardar
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
