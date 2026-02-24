import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import { useLote } from "../../services/inventario/lote/useLote";
import type { RES_UnidadMedida } from "../../services/inventario/lote/dtos/responses";

interface SelectUnidadMedidaProps extends Omit<SelectProps, 'data'> {
}

export const SelectUnidadMedida = ({ label = "Unidad de Medida", placeholder = "Seleccione unidad", ...props }: SelectUnidadMedidaProps) => {
    const [data, setData] = useState<RES_UnidadMedida[]>([]);
    const [loading, setLoading] = useState(false);
    const [, setError] = useState("");
    const { listarUnidadesMedida } = useLote({ setError });

    useEffect(() => {
        setLoading(true);
        listarUnidadesMedida()
            .then(res => {
                if (res) setData(res);
            })
            .finally(() => setLoading(false));
    }, []);

    const options = data.map(u => ({
        value: String(u.id_unidad_medida),
        label: `${u.nombre} (${u.abreviatura})`
    }));

    return (
        <Select
            label={label}
            placeholder={placeholder}
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
