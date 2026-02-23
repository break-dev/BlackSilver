import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";

// Services
import { useEmpleados } from "../../services/personal/useEmpleados";
import type { RES_Empleado } from "../../services/personal/dtos/responses";

interface SelectEmpleadoProps extends Omit<SelectProps, "data"> {
    value?: string | null;
    onChange?: (value: string | null) => void;
    /** If true, triggers data loading on mount autonomously. Default: true */
    autoLoad?: boolean;
    idEmpresa?: number;
}

export const SelectEmpleado = ({
    value,
    onChange,
    autoLoad = true,
    idEmpresa,
    className,
    ...props
}: SelectEmpleadoProps) => {
    const [loading, setLoading] = useState(false);
    const [empleados, setEmpleados] = useState<RES_Empleado[]>([]);
    const { listar } = useEmpleados({ setError: () => { } });

    useEffect(() => {
        let mounted = true;
        if (autoLoad) {
            setLoading(true);
            listar(idEmpresa ? { id_empresa: idEmpresa } : undefined)
                .then((data) => {
                    if (mounted && data) setEmpleados(data);
                })
                .finally(() => {
                    if (mounted) setLoading(false);
                });
        }
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoLoad, idEmpresa]);

    return (
        <Select
            label="Empleado / Responsable"
            placeholder={props.placeholder || "Seleccione un empleado"}
            leftSection={<UserIcon className="w-4 h-4 text-zinc-400" />}
            data={empleados.map(e => ({
                value: String(e.id_empleado),
                label: `${e.apellido} ${e.nombre}`.trim(),
                description: e.cargo || e.empresa || undefined
            }))}
            value={value}
            onChange={onChange}
            searchable
            clearable
            nothingFoundMessage="No se encontraron empleados"
            radius="lg"
            size="sm"
            maxDropdownHeight={300}
            disabled={loading || props.disabled}
            className={className}
            classNames={{
                input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
                label: "text-zinc-300 mb-1 font-medium",
                description: "text-zinc-500 text-xs"
            }}
            {...props}
        />
    );
};
