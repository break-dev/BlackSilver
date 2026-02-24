import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import { useLabores } from "../../services/empresas/labores/useLabores";
import type { RES_Labor } from "../../services/empresas/labores/dtos/responses";
import { WrenchIcon } from "@heroicons/react/24/outline";

interface SelectLaborProps extends Omit<SelectProps, 'data'> {
    idMina?: number | null;
}

export const SelectLabor = ({ idMina, label = "Labor", placeholder = "Seleccione labor", ...props }: SelectLaborProps) => {
    const [data, setData] = useState<RES_Labor[]>([]);
    const [loading, setLoading] = useState(false);
    const [, setError] = useState("");
    const { listar } = useLabores({ setError });

    useEffect(() => {
        if (idMina) {
            setLoading(true);
            listar({ id_mina: idMina })
                .then(res => {
                    if (res) setData(res);
                })
                .finally(() => setLoading(false));
        } else {
            setData([]);
        }
    }, [idMina]);

    const options = data.map(l => ({
        value: String(l.id_labor),
        label: l.nombre
    }));

    return (
        <Select
            label={label}
            placeholder={placeholder}
            leftSection={<WrenchIcon className="w-4 h-4 text-zinc-400" />}
            searchable
            data={options}
            disabled={loading || props.disabled || !idMina}
            radius="lg"
            size="sm"
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
