import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import { useLote } from "../../services/inventario/lote/useLote";
import type { RES_ProductoDisponible } from "../../services/inventario/lote/dtos/responses";

interface SelectProductoProps extends Omit<SelectProps, 'data'> {
    // any extra props if needed
}

export const SelectProducto = ({ label = "Producto", placeholder = "Seleccione producto", ...props }: SelectProductoProps) => {
    const [data, setData] = useState<RES_ProductoDisponible[]>([]);
    const [loading, setLoading] = useState(false);
    const [, setError] = useState("");
    const { listarProductosDisponibles } = useLote({ setError });

    useEffect(() => {
        setLoading(true);
        listarProductosDisponibles()
            .then(res => {
                if (res) setData(res);
            })
            .finally(() => setLoading(false));
    }, []);

    const options = data.map(p => ({
        value: String(p.id_producto),
        label: p.nombre,
        es_perecible: p.es_perecible
    }));

    return (
        <Select
            label={label}
            placeholder={placeholder}
            searchable
            nothingFoundMessage="No se encontraron productos"
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
