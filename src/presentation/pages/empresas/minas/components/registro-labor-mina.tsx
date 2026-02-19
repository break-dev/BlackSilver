import { Button, Group, TextInput, Textarea, Select } from "@mantine/core";
import { useState, useEffect, useMemo } from "react";
import { notifications } from "@mantine/notifications";

// Services
import { Schema_CrearLabor } from "../../../../../services/empresas/labores/dtos/requests";
import type { RES_Labor, RES_TipoLabor } from "../../../../../services/empresas/labores/dtos/responses";
import { useLabores } from "../../../../../services/empresas/labores/useLabores";
import { useMinas } from "../../../../../services/empresas/minas/useMinas";
import type { RES_Empresa } from "../../../../../services/empresas/empresas/dtos/responses";

interface RegistroLaborMinaProps {
    idMina: number;
    onSuccess: (labor: RES_Labor) => void;
    onCancel: () => void;
}

export const RegistroLaborMina = ({ idMina, onSuccess, onCancel }: RegistroLaborMinaProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [nombre, setNombre] = useState("");
    const [codigoCorrelativo, setCodigoCorrelativo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [idTipoLabor, setIdTipoLabor] = useState<string | null>(null);
    const [idEmpresa, setIdEmpresa] = useState<string | null>(null);
    const [tipoSostenimiento, setTipoSostenimiento] = useState("");

    // Data Selects
    const [tiposLabor, setTiposLabor] = useState<RES_TipoLabor[]>([]);
    const [empresasAsignadas, setEmpresasAsignadas] = useState<RES_Empresa[]>([]);

    // Hooks
    const { crear_labor, listarTipos } = useLabores({ setError });
    // @ts-ignore
    const { listarEmpresasAsignadas } = useMinas({ setError }); // Now we fetch companies assigned to THIS mine

    // Load Data
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [tipos, emps] = await Promise.all([
                    listarTipos(),
                    listarEmpresasAsignadas ? listarEmpresasAsignadas(idMina) : Promise.resolve([])
                ]);

                if (tipos) setTiposLabor(tipos);
                if (emps) setEmpresasAsignadas(emps);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idMina]);

    // Styles
    const inputClasses = {
        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
        label: "text-zinc-300 mb-1 font-medium",
        dropdown: "bg-zinc-900 border-zinc-800",
        option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1"
    };

    // Render Option for Type
    const tiposOptions = useMemo(() => {
        return tiposLabor.map(t => ({
            value: String(t.id_tipo_labor),
            label: `${t.nombre} (${t.codigo})`
        }));
    }, [tiposLabor]);

    const empresasOptions = useMemo(() => {
        return empresasAsignadas.map(e => ({
            value: String(e.id_empresa),
            label: e.nombre_comercial || e.razon_social
        }));
    }, [empresasAsignadas]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Build Payload
        const payload = {
            id_mina: Number(idMina),
            id_empresa: Number(idEmpresa),
            id_tipo_labor: Number(idTipoLabor),
            codigo_correlativo: codigoCorrelativo,
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
            setLoading(false);
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
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                    label="Tipo de Labor"
                    placeholder="Seleccione..."
                    data={tiposOptions}
                    value={idTipoLabor}
                    onChange={setIdTipoLabor}
                    required
                    withAsterisk
                    disabled={loading}
                    radius="lg"
                    classNames={inputClasses}
                />

                <TextInput
                    label="Código Correlativo"
                    placeholder="Ej. TJ-001"
                    required
                    withAsterisk
                    disabled={loading}
                    radius="lg"
                    classNames={inputClasses}
                    value={codigoCorrelativo}
                    onChange={(e) => setCodigoCorrelativo(e.currentTarget.value)}
                />
            </div>

            <Select
                label="Empresa Ejecutora"
                description={empresasAsignadas.length === 0 ? "⚠️ No hay empresas asignadas a esta mina" : null}
                placeholder={empresasAsignadas.length === 0 ? "Debe asignar empresas (pestaña Empresas)" : "Seleccione Empresa"}
                data={empresasOptions}
                value={idEmpresa}
                onChange={setIdEmpresa}
                searchable
                required
                withAsterisk
                disabled={loading || empresasAsignadas.length === 0}
                radius="lg"
                classNames={inputClasses}
            />

            <TextInput
                label="Nombre de la Labor"
                placeholder="Ej. Tajo Esperanza Nivel 1"
                required
                withAsterisk
                disabled={loading}
                radius="lg"
                classNames={inputClasses}
                value={nombre}
                onChange={(e) => setNombre(e.currentTarget.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                    label="Tipo Sostenimiento"
                    placeholder="Ej. Pernos, Malla, Madera"
                    required
                    withAsterisk
                    disabled={loading}
                    radius="lg"
                    classNames={inputClasses}
                    value={tipoSostenimiento}
                    onChange={(e) => setTipoSostenimiento(e.currentTarget.value)}
                />
            </div>

            <Textarea
                label="Descripción / Detalles"
                placeholder="Ubicación exacta, referencias..."
                radius="lg"
                minRows={2}
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
                    disabled={empresasAsignadas.length === 0}
                >
                    Guardar Labor
                </Button>
            </Group>
        </form>
    );
};
