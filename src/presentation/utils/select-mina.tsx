import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import { useMinas } from "../../services/empresas/minas/useMinas";
import type { RES_Mina } from "../../services/empresas/minas/dtos/responses";
import { CubeIcon } from "@heroicons/react/24/outline";

interface SelectMinaProps extends Omit<SelectProps, 'data'> {
}

export const SelectMina = ({ label = "Mina", placeholder = "Seleccione mina", ...props }: SelectMinaProps) => {
    const [data, setData] = useState<RES_Mina[]>([]);
    const [loading, setLoading] = useState(false);
    const [, setError] = useState("");
    const { listar } = useMinas({ setError });

    useEffect(() => {
        setLoading(true);
        listar()
            .then(res => {
                if (res) setData(res);
            })
            .finally(() => setLoading(false));
    }, []);

    const options = data.map(m => ({
        value: String(m.id_mina),
        label: m.nombre
    }));

    return (
        <Select
            label={label}
            placeholder={placeholder}
            leftSection={<CubeIcon className="w-4 h-4 text-zinc-400" />}
            searchable
            data={options}
            disabled={loading || props.disabled}
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
