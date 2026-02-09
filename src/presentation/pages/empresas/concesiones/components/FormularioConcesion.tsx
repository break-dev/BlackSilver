import { useEffect, useState } from "react";
import { Button, Group, TextInput, Select } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form"; // Asegúrate de tener instalado @mantine/form
import { notifications } from "@mantine/notifications";
import { z } from "zod";
import { useConcesion } from "../../../../../services/empresa/concesiones/useConcesion";
import { EstadoBase } from "../../../../../shared/enums";
import type { RES_Concesion } from "../../../../../services/empresa/concesiones/dtos/concesion.dto";
import type { RES_Empresa } from "../../../../../services/empresa/dtos/empresa.dto";

// 1. Definimos el schema
const schema = z.object({
    id_empresa: z.string().min(1, "Seleccione una empresa"),
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
});

interface FormularioConcesionProps {
    concesion?: RES_Concesion | null;
    empresas: RES_Empresa[];
    onSuccess: () => void;
    onCancel: () => void;
}

export const FormularioConcesion = ({
    concesion,
    empresas,
    onSuccess,
    onCancel,
}: FormularioConcesionProps) => {
    const [loading, setLoading] = useState(false);
    const [errorStr, setErrorStr] = useState("");

    const { crear: crearConcesion } = useConcesion({
        setIsLoading: setLoading,
        setError: setErrorStr,
    });

    const form = useForm({
        initialValues: {
            id: concesion?.id || 0,
            id_empresa: concesion?.id_empresa ? String(concesion.id_empresa) : "",
            nombre: concesion?.nombre || "",
        },
        // SOLUCIÓN AL ERROR DE TIPO: Forzamos el tipado para que acepte el schema de Zod moderno
        validate: zodResolver(schema as any),
    });

    useEffect(() => {
        if (concesion) {
            form.setValues({
                id: concesion.id,
                id_empresa: String(concesion.id_empresa),
                nombre: concesion.nombre,
            });
        } else {
            form.reset();
        }
    }, [concesion]);

    const handleSubmit = async (values: typeof form.values) => {
        const payload = {
            id_empresa: Number(values.id_empresa),
            nombre: values.nombre,
            estado: concesion ? concesion.estado : EstadoBase.Activo,
        };

        let exito;
        if (concesion) {
            console.log("Editando...", payload);
            exito = false;
        } else {
            const nuevaConcesion = await crearConcesion(payload);
            exito = !!nuevaConcesion;
        }

        if (exito) {
            notifications.show({
                title: "Éxito",
                message: concesion ? "Actualizada correctamente" : "Creada correctamente",
                color: "green",
            });
            onSuccess();
        } else {
            notifications.show({
                title: "Error",
                message: errorStr || "Ocurrió un error al guardar",
                color: "red",
            });
        }
    };

    const empresasOptions = empresas.map((e) => ({
        value: String(e.id),
        label: `${e.nombre_comercial} (${e.ruc})`,
    }));

    return (
        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6 mt-4">
            <Select
                label="Empresa"
                placeholder="Seleccione empresa"
                data={empresasOptions}
                searchable
                nothingFoundMessage="No se encontraron empresas"
                required
                withCheckIcon={false}
                comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                radius="lg"
                size="sm"
                classNames={{
                    input: "focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 data-[focused]:border-zinc-300 data-[focused]:ring-zinc-300",
                    dropdown: "bg-zinc-900 border-zinc-800",
                    option: "hover:bg-zinc-800 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900",
                }}
                {...form.getInputProps("id_empresa")}
            />

            <TextInput
                label="Nombre de Concesión"
                placeholder="Ej. Concesión Alfa 1"
                required
                radius="lg"
                size="sm"
                classNames={{
                    input: "focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300",
                }}
                {...form.getInputProps("nombre")}
            />

            <Group justify="flex-end" mt="xl">
                <Button
                    variant="subtle"
                    onClick={onCancel}
                    disabled={loading}
                    radius="lg"
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