import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import { useMinas } from "../../services/empresas/minas/useMinas";
import type { RES_Empresa } from "../../services/empresas/empresas/dtos/responses";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

interface SelectEmpresaMinaProps extends Omit<SelectProps, "data"> {
    idMina: number;
    value?: string | null;
    onChange?: (value: string | null) => void;
}

export const SelectEmpresaMina = ({ idMina, value, onChange, className, ...props }: SelectEmpresaMinaProps) => {
    const [loading, setLoading] = useState(!!idMina);
    const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
    // @ts-ignore
    const { listarEmpresasAsignadas } = useMinas({ setError: () => { } });

    useEffect(() => {
        if (idMina) {
            setLoading(true);
            // @ts-ignore
            listarEmpresasAsignadas(idMina)
                .then((data: any) => { if (data) setEmpresas(data); })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idMina]);

    const noEmpresas = !loading && empresas.length === 0;

    return (
        <Select
            label="Empresa"
            placeholder={props.placeholder || "Seleccione Empresa"}
            description={noEmpresas ? "No hay empresas asignadas a esta mina" : props.description}
            leftSection={<BriefcaseIcon className="w-4 h-4 text-zinc-400" />}
            data={empresas.map(e => ({
                value: String(e.id_empresa),
                label: e.nombre_comercial || e.razon_social
            }))}
            value={value}
            onChange={onChange}
            searchable
            clearable
            nothingFoundMessage="No se encontraron empresas asignadas"
            radius="lg"
            size="sm"
            maxDropdownHeight={300}
            disabled={loading || props.disabled || noEmpresas}
            className={className}
            classNames={{
                input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
                label: "text-zinc-300 mb-1 font-medium"
            }}
            {...props}
        />
    );
};
