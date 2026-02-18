import { Button, Select, TextInput, Group, Stack, LoadingOverlay } from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";

// Services
import { useEmpleados } from "../../../../../services/personal/useEmpleados";
import { useCargos } from "../../../../../services/personal/useCargos";
import { Schema_CrearEmpleado } from "../../../../../services/personal/dtos/requests";
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

    // Form State (Manual - Consistente con otros módulos)
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [dni, setDni] = useState("");
    const [ruc, setRuc] = useState("");
    const [carnetExtranjeria, setCarnetExtranjeria] = useState("");
    const [pasaporte, setPasaporte] = useState("");
    const [idCargo, setIdCargo] = useState<string | null>(null);
    const [idEmpresa, setIdEmpresa] = useState<string | null>(null);
    const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
    const [pathFoto, setPathFoto] = useState("");

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Construir objeto para validación manual
        const dataToValidate = {
            id_cargo: Number(idCargo),
            id_empresa: Number(idEmpresa),
            nombre,
            apellido,
            dni,
            ruc: ruc || undefined,
            carnet_extranjeria: carnetExtranjeria || undefined,
            pasaporte: pasaporte || undefined,
            fecha_nacimiento: fechaNacimiento ? dayjs(fechaNacimiento).format("YYYY-MM-DD") : undefined,
            path_foto: pathFoto || undefined
        };

        // Zod Safe Parse
        const validation = Schema_CrearEmpleado.safeParse(dataToValidate);

        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message;
            setError(firstError || "Por favor complete todos los campos requeridos correctamente.");

            notifications.show({
                title: "Error de validación",
                message: firstError || "Revise los campos requeridos.",
                color: "red"
            });
            setLoading(false);
            return;
        }

        // Enviar datos
        // @ts-ignore
        const empleado = await crear(validation.data);

        if (empleado) {
            notifications.show({
                title: "Empleado registrado",
                message: `${empleado.nombre} ha sido registrado correctamente.`,
                color: "green",
            });
            onSuccess();
        } else {
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
        return cargos.map(c => ({ value: String(c.id_cargo), label: c.nombre }));
    }, [cargos]);

    return (
        <form onSubmit={handleSubmit} className="relative space-y-5">
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
                        value={nombre}
                        onChange={(e) => setNombre(e.currentTarget.value)}
                    />
                    <TextInput
                        label="Apellidos"
                        placeholder="Pérez Loza"
                        radius="lg"
                        withAsterisk
                        classNames={inputClasses}
                        value={apellido}
                        onChange={(e) => setApellido(e.currentTarget.value)}
                    />
                </Group>

                <Group grow align="start">
                    <TextInput
                        label="DNI"
                        placeholder="12345678"
                        maxLength={8}
                        radius="lg"
                        classNames={inputClasses}
                        value={dni}
                        onChange={(e) => setDni(e.currentTarget.value)}
                    />
                    <TextInput
                        label="RUC (Opcional)"
                        placeholder="10123456789"
                        maxLength={11}
                        radius="lg"
                        classNames={inputClasses}
                        value={ruc}
                        onChange={(e) => setRuc(e.currentTarget.value)}
                    />
                </Group>

                <Group grow align="start">
                    <TextInput
                        label="Carnet Ext. (Opcional)"
                        placeholder="C.E."
                        maxLength={64}
                        radius="lg"
                        classNames={inputClasses}
                        value={carnetExtranjeria}
                        onChange={(e) => setCarnetExtranjeria(e.currentTarget.value)}
                    />
                    <TextInput
                        label="Pasaporte (Opcional)"
                        placeholder="Pasaporte"
                        maxLength={64}
                        radius="lg"
                        classNames={inputClasses}
                        value={pasaporte}
                        onChange={(e) => setPasaporte(e.currentTarget.value)}
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
                        value={idCargo}
                        onChange={setIdCargo}
                    />
                    <SelectEmpresas
                        label="Empresa"
                        radius="lg"
                        withAsterisk
                        classNames={inputClasses}
                        value={idEmpresa}
                        onChange={setIdEmpresa}
                    />
                </Group>

                <Group grow align="start">
                    <CustomDatePicker
                        label="Fecha de Nacimiento"
                        placeholder="Seleccione fecha"
                        radius="lg"
                        value={fechaNacimiento}
                        onChange={(val: any) => setFechaNacimiento(val)}
                    />
                    <TextInput
                        label="Foto (URL)"
                        placeholder="Pegar enlace de imagen"
                        radius="lg"
                        classNames={inputClasses}
                        value={pathFoto}
                        onChange={(e) => setPathFoto(e.currentTarget.value)}
                    />
                </Group>

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
                        Registrar
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
