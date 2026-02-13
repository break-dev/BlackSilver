import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";

interface SelectUsuarioEmpresaProps extends Omit<SelectProps, "data"> {
    idEmpresa?: number | null;
    value?: string | null;
    onChange?: (value: string | null) => void;
}

// Temporary Interface until Service is finalized
interface RES_UsuarioEmpresa {
    id_usuario_empresa: number;
    nombre_completo: string;
    dni?: string;
}

export const SelectUsuarioEmpresa = ({
    idEmpresa,
    value,
    onChange,
    ...props
}: SelectUsuarioEmpresaProps) => {
    const [data, setData] = useState<RES_UsuarioEmpresa[]>([]);
    const [isLoading] = useState(false); // mock loading

    useEffect(() => {
        // MOCK DATA for now so UI works
        setData([
            { id_usuario_empresa: 45, nombre_completo: "Juan Pérez (Jefe Guardia)", dni: "45879632" },
            { id_usuario_empresa: 46, nombre_completo: "Carlos Gomez (Supervisor)", dni: "12345678" }
        ]);
    }, [idEmpresa]);

    return (
        <Select
            label="Responsable / Jefe"
            placeholder="Seleccione empleado"
            data={data.map((u) => ({
                value: u.id_usuario_empresa.toString(),
                label: u.nombre_completo,
            }))}
            value={value}
            onChange={onChange}
            disabled={isLoading || props.disabled}
            searchable
            nothingFoundMessage="No se encontraron empleados"
            withCheckIcon={false}
            radius="lg"
            size="sm"
            classNames={{
                input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 
        focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
                dropdown: "bg-zinc-900 border-zinc-800",
                option: `hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 
        data-[selected]:text-zinc-900 rounded-md my-1`,
                label: "text-zinc-300 mb-1 font-medium",
            }}
            {...props}
        />
    );
};
