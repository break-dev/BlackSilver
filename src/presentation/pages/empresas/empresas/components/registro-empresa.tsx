import { Button, Group, TextInput } from "@mantine/core";
import { useState } from "react";
import type { RES_Empresa } from "../../../../../services/empresas/empresas/dtos/responses";
import { useEmpresas } from "../../../../../services/empresas/empresas/useEmpresas";
import { Schema_CrearEmpresa } from "../../../../../services/empresas/empresas/dtos/requests";

interface RegistroEmpresaProps {
    onSuccess?: (empresa: RES_Empresa) => void;
    onCancel?: () => void;
}

export const RegistroEmpresa = ({
    onSuccess,
    onCancel,
}: RegistroEmpresaProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [ruc, setRuc] = useState("");
    const [razon_social, setRazonSocial] = useState("");
    const [nombre_comercial, setNombreComercial] = useState("");
    const [abreviatura, setAbreviatura] = useState("");
    const [path_logo, setPathLogo] = useState("");

    // Service
    // Note: useEmpresas might need to return created object or promise
    const { crear_empresa } = useEmpresas({ setError });

    const inputClasses = {
        input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
    focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
        label: "text-zinc-300 mb-1 font-medium",
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const validation = Schema_CrearEmpresa.safeParse({
                ruc,
                razon_social,
                nombre_comercial,
                abreviatura,
                path_logo,
            });

            if (!validation.success) {
                // Simple error handling for validation
                const firstError = validation.error.issues[0]?.message;
                setError(firstError || "Por favor complete todos los campos requeridos correctamente.");
                return;
            }

            setIsLoading(true);
            const response = await crear_empresa(validation.data);

            if (response) {
                onSuccess?.(response);
            }
        } catch (e) {
            console.error(e);
            setError("Ocurrió un error al intentar guardar.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
                label="RUC"
                placeholder="Ej. 20123456789"
                withAsterisk
                required
                maxLength={11}
                radius="lg"
                size="sm"
                classNames={inputClasses}
                value={ruc}
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Numbers only
                    setRuc(val);
                }}
            />

            <TextInput
                label="Razón Social"
                placeholder="Ej. MINERA SANTA ROSA S.A.C."
                withAsterisk
                required
                radius="lg"
                size="sm"
                classNames={inputClasses}
                value={razon_social}
                onChange={(e) => setRazonSocial(e.target.value)}
            />

            <TextInput
                label="Nombre Comercial"
                placeholder="Ej. Santa Rosa"
                withAsterisk
                required
                radius="lg"
                size="sm"
                classNames={inputClasses}
                value={nombre_comercial}
                onChange={(e) => setNombreComercial(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                    label="Abreviatura"
                    placeholder="Ej. MSR"
                    withAsterisk
                    required
                    radius="lg"
                    size="sm"
                    classNames={inputClasses}
                    value={abreviatura}
                    onChange={(e) => setAbreviatura(e.target.value)}
                />

                <TextInput
                    label="Logo URL (Path)"
                    placeholder="Ej. /assets/logos/msr.png"
                    withAsterisk
                    required
                    radius="lg"
                    size="sm"
                    classNames={inputClasses}
                    value={path_logo}
                    onChange={(e) => setPathLogo(e.target.value)}
                />
            </div>

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

            <Group justify="flex-end" gap="md" mt="xl">
                {onCancel && (
                    <Button
                        variant="subtle"
                        onClick={onCancel}
                        disabled={isLoading}
                        radius="lg"
                        size="sm"
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 
            transition-colors"
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    loading={isLoading}
                    radius="lg"
                    size="sm"
                    className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 
          font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
                >
                    Guardar
                </Button>
            </Group>
        </form>
    );
};
