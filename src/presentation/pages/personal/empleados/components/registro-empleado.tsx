import { Button, Select, TextInput, Group, Stack, LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";

// Services
import { useEmpleados } from "../../../../../services/personal/useEmpleados";
import { useCargos } from "../../../../../services/personal/useCargos";
import { Schema_CrearEmpleado, type DTO_CrearEmpleado } from "../../../../../services/personal/dtos/requests";
import type { RES_Cargo } from "../../../../../services/personal/dtos/responses";

// Components
import { SelectEmpresas } from "../../../../utils/select-empresas";
import { CustomDatePicker } from "../../../../utils/date-picker-input";

interface RegistroEmpleadoProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const RegistroEmpleado = ({ onSuccess, onCancel }: RegistroEmpleadoProps) => {
    const [loading, setLoading] = useState(false);
    const [cargos, setCargos] = useState<RES_Cargo[]>([]);
    const [error, setError] = useState("");

    // Hooks
    const { crear } = useEmpleados({ setError });
    const { listar: listarCargos } = useCargos({ setError });

    // Styles
    const inputClasses = {
        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
        label: "text-zinc-300 mb-1 font-medium",
        dropdown: "bg-zinc-900 border-zinc-800",
        option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1"
    };

    // Cargar cargos al inicio
    useEffect(() => {
        listarCargos().then(data => {
            if (data) setCargos(data);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const form = useForm({
        initialValues: {
            nombre: "",
            apellido: "",
            dni: "",
            ruc: "",
            carnet_extranjeria: "",
            pasaporte: "",
            id_cargo: "", // String para Select
            id_empresa: "", // String para Select
            fecha_nacimiento: "",
            path_foto: "",
            telefono: "",
            email: "",
            direccion: ""
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        setError(""); // Limpiar error global

        // 1. Validación Manual con Zod
        // coerce.number convertirá "" a 0, y min(1) fallará si no se seleccionó nada.
        const validation = Schema_CrearEmpleado.safeParse(values);

        if (!validation.success) {
            // Mapear errores de Zod a Mantine Form
            const outputErrors: Record<string, string> = {};
            validation.error.issues.forEach((issue) => {
                const path = String(issue.path[0]); // Convert to string for keys
                outputErrors[path] = issue.message;
            });
            form.setErrors(outputErrors);

            notifications.show({
                title: "Error de validación",
                message: "Por favor complete los campos requeridos correctamente.",
                color: "red"
            });
            setLoading(false);
            return;
        }

        // 2. Enviar datos validados (validation.data ya tiene los números convertidos)
        const empleado = await crear(validation.data as DTO_CrearEmpleado);

        if (empleado) {
            notifications.show({
                title: "Empleado registrado",
                message: `${empleado.nombre} ha sido registrado correctamente.`,
                color: "green",
            });
            onSuccess();
        } else {
            // El error del hook ya se setea en 'setError', lo mostramos aquí si existe
            if (error) {
                notifications.show({
                    title: "Error al registrar",
                    message: "Hubo un problema al guardar el empleado.",
                    color: "red"
                });
            }
        }
        setLoading(false);
    };

    // Opciones de cargos para Select
    const cargosOptions = useMemo(() => {
        return cargos.map(c => ({ value: String(c.id), label: c.nombre }));
    }, [cargos]);

    return (
        <form onSubmit={form.onSubmit(handleSubmit)} className="relative space-y-5">
            <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />

            <Stack gap="md">
                {/* Datos Personales */}
                <Group grow align="start">
                    <TextInput
                        label="Nombres"
                        placeholder="Juan Carlos"
                        radius="lg"
                        withAsterisk
                        classNames={inputClasses}
                        {...form.getInputProps("nombre")}
                    />
                    <TextInput
                        label="Apellidos"
                        placeholder="Pérez Loza"
                        radius="lg"
                        withAsterisk
                        classNames={inputClasses}
                        {...form.getInputProps("apellido")}
                    />
                </Group>

                <Group grow align="start">
                    <TextInput
                        label="DNI"
                        placeholder="12345678"
                        maxLength={8}
                        radius="lg"
                        classNames={inputClasses}
                        {...form.getInputProps("dni")}
                    />
                    <TextInput
                        label="RUC (Opcional)"
                        placeholder="10123456789"
                        maxLength={11}
                        radius="lg"
                        classNames={inputClasses}
                        {...form.getInputProps("ruc")}
                    />
                </Group>

                <Group grow align="start">
                    <TextInput
                        label="Carnet Ext. (Opcional)"
                        placeholder="C.E."
                        maxLength={64}
                        radius="lg"
                        classNames={inputClasses}
                        {...form.getInputProps("carnet_extranjeria")}
                    />
                    <TextInput
                        label="Pasaporte (Opcional)"
                        placeholder="Pasaporte"
                        maxLength={64}
                        radius="lg"
                        classNames={inputClasses}
                        {...form.getInputProps("pasaporte")}
                    />
                </Group>

                <Group grow align="start">
                    <Select
                        label="Cargo"
                        placeholder="Seleccione cargo"
                        data={cargosOptions}
                        searchable
                        nothingFoundMessage="No hay cargos registrados"
                        radius="lg"
                        withAsterisk
                        classNames={inputClasses}
                        {...form.getInputProps("id_cargo")}
                        // Asegurar que recibimos string
                        onChange={(val) => form.setFieldValue("id_cargo", val || "")}
                    />
                    <SelectEmpresas
                        label="Empresa"
                        radius="lg"
                        withAsterisk
                        classNames={inputClasses}
                        {...form.getInputProps("id_empresa")}
                        // Asegurar que recibimos string
                        onChange={(val) => form.setFieldValue("id_empresa", val || "")}
                    />
                </Group>

                <Group grow align="start">
                    <CustomDatePicker
                        label="Fecha de Nacimiento"
                        placeholder="Seleccione fecha"
                        radius="lg"
                        // Handle date manually with dayjs
                        onChange={(date: any) => form.setFieldValue("fecha_nacimiento", date ? dayjs(date).format("YYYY-MM-DD") : "")}
                        value={form.values.fecha_nacimiento ? dayjs(form.values.fecha_nacimiento).toDate() : null}
                        error={form.errors.fecha_nacimiento as string}
                    />
                    <TextInput
                        label="Foto (URL)"
                        placeholder="Pegar enlace de imagen"
                        radius="lg"
                        classNames={inputClasses}
                        {...form.getInputProps("path_foto")}
                    />
                </Group>

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
                        Registrar
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
