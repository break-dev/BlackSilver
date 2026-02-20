import { Button, Group, TextInput, Textarea, Select, LoadingOverlay } from "@mantine/core";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";

// Services
import { Schema_CrearMina } from "../../../../../services/empresas/minas/dtos/requests";
import type { RES_Mina } from "../../../../../services/empresas/minas/dtos/responses";
import { useMinas } from "../../../../../services/empresas/minas/useMinas";
import { useConcesion } from "../../../../../services/empresas/concesiones/useConcesion";
import type { RES_Concesion } from "../../../../../services/empresas/concesiones/dtos/responses";

interface RegistroMinaProps {
    onSuccess: (mina: RES_Mina) => void;
    onCancel: () => void;
}

export const RegistroMina = ({ onSuccess, onCancel }: RegistroMinaProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [idConcesion, setIdConcesion] = useState<string | null>(null);

    // Data Selects
    const [concesiones, setConcesiones] = useState<RES_Concesion[]>([]);

    // Hooks
    const [loadingConcesiones, setLoadingConcesiones] = useState(true);
    const { crear } = useMinas({ setError });
    const { listar: listarConcesiones } = useConcesion({ setError });

    // Cargar Concesiones
    useEffect(() => {
        let mounted = true;
        setLoadingConcesiones(true);
        listarConcesiones().then(data => {
            if (mounted && data) setConcesiones(data);
            if (mounted) setLoadingConcesiones(false);
        });
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            id_concesion: Number(idConcesion),
            nombre,
            descripcion
        };

        // Validate
        const validation = Schema_CrearMina.safeParse(payload);

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
                title: "Mina Creada",
                message: `La mina ${result.nombre} ha sido registrada.`,
                color: "green"
            });
            onSuccess(result);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="relative space-y-5">
            <Select
                label="Concesión Asociada"
                placeholder={loadingConcesiones ? "Cargando concesiones..." : "Seleccione Concesión"}
                data={concesiones.map(c => ({ value: String(c.id_concesion), label: c.nombre }))}
                value={idConcesion}
                onChange={setIdConcesion}
                searchable
                nothingFoundMessage="No hay concesiones registradas"
                required
                withAsterisk
                disabled={loading || loadingConcesiones}
                radius="lg"
                classNames={inputClasses}
            />

            <TextInput
                label="Nombre de la Mina"
                placeholder="Ej. Mina Esperanza - Nivel 1"
                required
                withAsterisk
                disabled={loading}
                radius="lg"
                classNames={inputClasses}
                value={nombre}
                onChange={(e) => setNombre(e.currentTarget.value)}
            />

            <Textarea
                label="Descripción / Zona"
                placeholder="Ej. Zona Norte, acceso principal..."
                radius="lg"
                minRows={3}
                disabled={loading}
                classNames={inputClasses}
                value={descripcion}
                onChange={(e) => setDescripcion(e.currentTarget.value)}
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
                    Guardar
                </Button>
            </Group>
        </form>
    );
};
