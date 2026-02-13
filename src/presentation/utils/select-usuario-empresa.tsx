import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import { useEmpresas } from "../../services/empresas/empresas/useEmpresas";
import type { RES_UsuarioEmpresa } from "../../services/empresas/labores/dtos/responses";

interface SelectUsuarioEmpresaProps extends Omit<SelectProps, "data"> {
    idEmpresa?: number | null;
    value?: string | null;
    onChange?: (value: string | null) => void;
}

export const SelectUsuarioEmpresa = ({
    idEmpresa,
    value,
    onChange,
    ...props
}: SelectUsuarioEmpresaProps) => {
    const [data, setData] = useState<RES_UsuarioEmpresa[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [, setError] = useState("");

    const { get_usuarios_empresa } = useEmpresas({ setError });

    useEffect(() => {
        if (!idEmpresa) {
            setData([]);
            return;
        }

        setIsLoading(true);
        get_usuarios_empresa(idEmpresa)
            .then((res) => {
                if (res) setData(res);
            })
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idEmpresa]);

    return (
        <Select
            label="Responsable / Jefe"
            placeholder={idEmpresa ? "Seleccione empleado" : "Labor sin empresa asignada"}
            data={data.map((u) => ({
                value: u.id_usuario_empresa.toString(),
                label: `${u.nombres} ${u.apellidos}`, // Format: Names Surnames
                // description: u.cargo // Optional subtitle support in Mantine Select? Or use renderOption
            }))}
            value={value}
            onChange={onChange}
            disabled={isLoading || !idEmpresa || props.disabled}
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
